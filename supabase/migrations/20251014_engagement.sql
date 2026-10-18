-- Love Dove — Engagement Migration (guestbook, streaks, daily challenge, couple stats)
-- Run in Supabase Dashboard > SQL Editor AFTER the existing migrations.
--
-- Four things land here:
--   1. birthday_guest_entries   — a guestbook visitors can write to on any birthday site
--   2. activity_days            — one row per user per day, the source of truth for streaks
--   3. streak / couple-stats SQL — pure aggregates over the tables above
--   4. share images             — an og:image endpoint is served by Next, no DB needed

-- ============================================
-- 1. GUESTBOOK
-- ============================================

CREATE TABLE IF NOT EXISTS birthday_guest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES birthday_sites(id) ON DELETE CASCADE,
  -- Null for visitors who aren't logged in. The guestbook is public;
  -- people receive birthday links without having signed up.
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL CHECK (char_length(trim(guest_name)) BETWEEN 1 AND 60),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 2000),
  photo_url TEXT,
  -- A browser-local id so an anonymous visitor can heart a message too.
  heart_token TEXT,
  hearts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_entries_site
  ON birthday_guest_entries(site_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_entries_heart_once
  ON birthday_guest_entries(id, heart_token)
  WHERE heart_token IS NOT NULL;

ALTER TABLE birthday_guest_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Guests can read public site entries" ON birthday_guest_entries;
  CREATE POLICY "Guests can read public site entries" ON birthday_guest_entries
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM birthday_sites s
        WHERE s.id = site_id AND s.is_public = true AND s.is_published = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Anyone may add an entry to a public site. No auth.uid() check on purpose:
-- the whole point is that the birthday person's guests need no account.
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can write to a public site" ON birthday_guest_entries;
  CREATE POLICY "Anyone can write to a public site" ON birthday_guest_entries
    FOR INSERT WITH CHECK (
      guest_name IS NOT NULL
      AND message IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM birthday_sites s
        WHERE s.id = site_id AND s.is_public = true AND s.is_published = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- The site owner can pull entries down (moderation).
DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners delete site entries" ON birthday_guest_entries;
  CREATE POLICY "Owners delete site entries" ON birthday_guest_entries
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM birthday_sites s
        WHERE s.id = site_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Hearts run through a SECURITY DEFINER function below, so no update policy.

-- ============================================
-- 1b. GUEST ENTRY FUNCTIONS
-- ============================================

-- SECURITY DEFINER because plain anon INSERT cannot touch a public table's
-- computed column semantics safely, and because it lets us normalize input
-- in one place rather than trusting the client.
CREATE OR REPLACE FUNCTION add_guest_entry(
  p_site_slug TEXT,
  p_guest_name TEXT,
  p_message TEXT,
  p_photo_url TEXT DEFAULT NULL,
  p_heart_token TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_site birthday_sites;
  v_id UUID;
BEGIN
  SELECT * INTO v_site
    FROM birthday_sites
    WHERE slug = p_site_slug
      AND is_public = true
      AND is_published = true;

  IF v_site.id IS NULL THEN
    RAISE EXCEPTION 'Site not found or not public';
  END IF;

  -- Only persist a user_id that actually belongs to the caller.
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    p_user_id := NULL;
  END IF;

  INSERT INTO birthday_guest_entries (site_id, user_id, guest_name, message, photo_url, heart_token)
  VALUES (
    v_site.id,
    p_user_id,
    regexp_replace(trim(p_guest_name), '\s+', ' ', 'g'),
    trim(p_message),
    p_photo_url,
    NULLIF(trim(p_heart_token), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION add_guest_entry(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated;

-- Toggle a heart for a given browser token. Idempotent per (entry, token) so a
-- visitor can't farm the count by re-pressing.
CREATE OR REPLACE FUNCTION toggle_guest_entry_heart(p_entry_id UUID, p_heart_token TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_entry birthday_guest_entries;
  v_token TEXT := NULLIF(trim(p_heart_token), '');
BEGIN
  IF v_token IS NULL THEN
    RAISE EXCEPTION 'heart_token required';
  END IF;

  SELECT * INTO v_entry
    FROM birthday_guest_entries
    WHERE id = p_entry_id
      AND EXISTS (
        SELECT 1 FROM birthday_sites s
        WHERE s.id = birthday_guest_entries.site_id
          AND s.is_public = true
          AND s.is_published = true
      );

  IF v_entry.id IS NULL THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;

  IF v_entry.heart_token = v_token THEN
    -- Already hearted by this browser: undo it.
    UPDATE birthday_guest_entries
      SET hearts = GREATEST(hearts - 1, 0)
    WHERE id = p_entry_id;
    RETURN v_entry.hearts - 1;
  END IF;

  UPDATE birthday_guest_entries
    SET hearts = hearts + 1, heart_token = v_token
  WHERE id = p_entry_id;
  RETURN v_entry.hearts + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION toggle_guest_entry_heart(UUID, TEXT) TO anon, authenticated;

-- Per-site guestbook totals so a page can show "23 wishes" without fetching rows.
CREATE OR REPLACE FUNCTION guestbook_totals(p_site_slug TEXT)
RETURNS TABLE(entries BIGINT, total_hearts BIGINT, last_entry_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
    SELECT COUNT(*),
           COALESCE(SUM(e.hearts), 0)::BIGINT,
           MAX(e.created_at)
      FROM birthday_guest_entries e
      JOIN birthday_sites s ON s.id = e.site_id
     WHERE s.slug = p_site_slug
       AND s.is_public = true
       AND s.is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION guestbook_totals(TEXT) TO anon, authenticated;

-- ============================================
-- 2. DAILY ACTIVITY (streak source of truth)
-- ============================================
--
-- game_sessions is only written by a couple of games, so it is too sparse to
-- drive a streak from. Instead we mark one row per user per calendar day from
-- the presence heartbeat and on login. Cheap, idempotent, and reflects whether
-- the person actually showed up.

CREATE TABLE IF NOT EXISTS activity_days (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  -- How they showed up. Presence = they opened the app and heartbeated;
  -- game = they played something; guestbook = they wrote to a birthday site.
  activity_type TEXT NOT NULL DEFAULT 'presence',
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_activity_days_day ON activity_days(day DESC);

ALTER TABLE activity_days ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users read own activity" ON activity_days;
  CREATE POLICY "Users read own activity" ON activity_days
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users write own activity" ON activity_days;
  CREATE POLICY "Users write own activity" ON activity_days
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Mark today as active for the caller. Upserts, so hammering the heartbeat is
-- free: it cannot create duplicates or double-count.
CREATE OR REPLACE FUNCTION mark_activity_today(p_type TEXT DEFAULT 'presence')
RETURNS DATE AS $$
BEGIN
  INSERT INTO activity_days (user_id, day, activity_type)
  VALUES (auth.uid(), CURRENT_DATE, COALESCE(NULLIF(trim(p_type), ''), 'presence'))
  ON CONFLICT (user_id, day)
  DO NOTHING;
  RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION mark_activity_today(TEXT) TO authenticated;

-- ============================================
-- 3. STREAK COMPUTATION
-- ============================================

CREATE OR REPLACE FUNCTION get_streak(p_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  last_active_at DATE,
  total_days BIGINT
) AS $$
DECLARE
  v_days DATE[];
  v_run INTEGER := 0;
  v_max INTEGER := 0;
  v_current INTEGER := 0;
  v_last DATE;
BEGIN
  -- Ordered oldest -> newest so the run-length pass is a single scan.
  SELECT ARRAY_AGG(day ORDER BY day) INTO v_days
    FROM activity_days
    WHERE user_id = p_user_id;

  IF v_days IS NULL OR array_length(v_days, 1) = 0 THEN
    RETURN QUERY SELECT 0::INT, 0::INT, NULL::DATE, 0::BIGINT;
    RETURN;
  END IF;

  SELECT t.day INTO STRICT v_last FROM unnest(v_days) AS t(day) ORDER BY t.day DESC LIMIT 1;

  FOR i IN 1..array_length(v_days, 1) LOOP
    -- A new day after exactly one day = continuing streak. Anything more is a break.
    IF i > 1 AND v_days[i] = v_days[i - 1] + 1 THEN
      v_run := v_run + 1;
    ELSE
      v_run := 1;
    END IF;
    v_max := GREATEST(v_max, v_run);
  END LOOP;

  -- Current streak only survives if the last active day is today or yesterday.
  -- A user who left three days ago does not hold a live streak.
  IF v_last >= CURRENT_DATE - 1 THEN
    v_current := v_run;
  ELSE
    v_current := 0;
  END IF;

  RETURN QUERY
    SELECT v_current::INT, v_max::INT, v_last, array_length(v_days, 1)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_streak(UUID) TO anon, authenticated;

-- Streak for a pair of users: days on which BOTH showed up. This is the
-- "12 days you've shown up for each other" number, distinct from either
-- person's personal streak.
CREATE OR REPLACE FUNCTION get_couple_streak(p_a UUID, p_b UUID)
RETURNS TABLE(days_together INTEGER, current_streak INTEGER, last_together_at DATE) AS $$
DECLARE
  v_days DATE[];
  v_run INTEGER := 0;
  v_current INTEGER := 0;
  v_last DATE;
BEGIN
  IF p_a IS NULL OR p_b IS NULL OR p_a = p_b THEN
    RETURN QUERY SELECT 0::INT, 0::INT, NULL::DATE;
    RETURN;
  END IF;

  SELECT ARRAY_AGG(d.day ORDER BY d.day) INTO v_days
    FROM activity_days d
    WHERE d.day IN (
      SELECT day FROM activity_days WHERE user_id = p_a
      INTERSECT
      SELECT day FROM activity_days WHERE user_id = p_b
    );

  IF v_days IS NULL OR array_length(v_days, 1) = 0 THEN
    RETURN QUERY SELECT 0::INT, 0::INT, NULL::DATE;
    RETURN;
  END IF;

  SELECT t.day INTO STRICT v_last FROM unnest(v_days) AS t(day) ORDER BY t.day DESC LIMIT 1;

  FOR i IN 1..array_length(v_days, 1) LOOP
    IF i > 1 AND v_days[i] = v_days[i - 1] + 1 THEN
      v_run := v_run + 1;
    ELSE
      v_run := 1;
    END IF;
  END LOOP;

  IF v_last >= CURRENT_DATE - 1 THEN
    v_current := v_run;
  ELSE
    v_current := 0;
  END IF;

  RETURN QUERY SELECT array_length(v_days, 1)::INT, v_current::INT, v_last;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_couple_streak(UUID, UUID) TO authenticated;

-- ============================================
-- 4. COUPLE STATS
-- ============================================
--
-- Aggregates every game session between two users. Session rows store either
-- side's user_id on user_id and the two players on player1_id / player2_id,
-- so both shapes are joined to catch all of them.

-- ============================================
-- 4b. RECONCILE game_sessions (pre-existing drift)
-- ============================================
--
-- Two game writers disagreed with the base schema, so their inserts failed
-- silently and sessions never landed:
--   components/GameSharePanel.tsx writes { game_type, game_state, status: 'waiting' }
--   app/games/memory/page.tsx       writes { game_type, players, game_state, status: 'waiting' }
-- Neither game_type, game_state, nor 'waiting' existed. Fix the table rather
-- than the writers, so old code stops dropping rows.

ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS game_type TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS game_state JSONB;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS players UUID[] DEFAULT '{}';

ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_status_check;
ALTER TABLE game_sessions
  ADD CONSTRAINT game_sessions_status_check
  CHECK (status IN ('waiting', 'active', 'finished', 'abandoned'));

-- Keep both spellings of the game in sync so aggregations can pick one.
CREATE OR REPLACE FUNCTION normalize_game_type()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.game_slug IS NULL OR NEW.game_slug = '') AND NEW.game_type IS NOT NULL THEN
    NEW.game_slug := NEW.game_type;
  END IF;
  IF (NEW.game_type IS NULL OR NEW.game_type = '') AND NEW.game_slug IS NOT NULL THEN
    NEW.game_type := NEW.game_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_game_sessions_normalize_type ON game_sessions;
CREATE TRIGGER trg_game_sessions_normalize_type
  BEFORE INSERT OR UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION normalize_game_type();

CREATE OR REPLACE FUNCTION get_couple_stats(p_a UUID, p_b UUID)
RETURNS TABLE(
  games_played BIGINT,
  total_minutes INTEGER,
  first_game_at TIMESTAMPTZ,
  last_game_at TIMESTAMPTZ,
  favorite_game TEXT,
  favorite_game_count INTEGER,
  this_week_games BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_a IS NULL OR p_b IS NULL OR p_a = p_b THEN
    RETURN QUERY SELECT 0::BIGINT, 0::INT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ,
                        NULL::TEXT, 0::INT, 0::BIGINT;
    RETURN;
  END IF;

  -- Every session appearing anywhere on this pair, deduplicated.
  CREATE TEMP TABLE IF NOT EXISTS cv_shared_games ON COMMIT DROP AS
    SELECT DISTINCT s.* FROM game_sessions s
    WHERE (s.user_id = p_a AND s.player2_id = p_b)
       OR (s.user_id = p_b AND s.player2_id = p_a)
       OR (s.player1_id = p_a AND s.player2_id = p_b)
       OR (s.player1_id = p_b AND s.player2_id = p_a);

  -- Favorite game first, so the aggregate statement can read it back.
  SELECT game_slug, cnt INTO favorite_game, favorite_game_count FROM (
    SELECT game_slug, COUNT(*) AS cnt
      FROM cv_shared_games
     GROUP BY game_slug
     ORDER BY cnt DESC, game_slug ASC
     LIMIT 1
  ) AS t;

  RETURN QUERY
    SELECT
      COUNT(*)::BIGINT,
      COALESCE(SUM(CASE WHEN duration_seconds IS NOT NULL AND duration_seconds > 0
                        THEN duration_seconds ELSE 0 END), 0) / 60,
      MIN(started_at),
      MAX(started_at),
      COALESCE(favorite_game, '')::TEXT,
      COALESCE(favorite_game_count, 0)::INT,
      COUNT(*) FILTER (WHERE started_at >= CURRENT_DATE - INTERVAL '7 days')
    FROM cv_shared_games;
END;
$$;

GRANT EXECUTE ON FUNCTION get_couple_stats(UUID, UUID) TO authenticated;

-- ============================================
-- 5. REALTIME
-- ============================================
-- New guestbook entries should appear on other open tabs of the same site.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.birthday_guest_entries;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
