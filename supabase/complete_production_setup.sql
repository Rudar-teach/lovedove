-- ============================================================
-- LOVE DOVE - COMPLETE PRODUCTION DATABASE SETUP
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- Safe to re-run:
--  - Every CREATE TABLE is IF NOT EXISTS
--  - Every ALTER TABLE is ADD COLUMN IF NOT EXISTS
--  - Every CREATE INDEX is IF NOT EXISTS
--  - Every policy drops existing before creating
--  - Every function is CREATE OR REPLACE
-- ============================================================

-- ============================================================
-- 1. PROFILES EXTENSIONS
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anniversary_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ec4899';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS traits TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_visible BOOLEAN DEFAULT true;

-- Unique case-insensitive username index
DROP INDEX IF EXISTS idx_profiles_username_ci;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_ci ON profiles(lower(username));

-- Trigger: force lowercase username
CREATE OR REPLACE FUNCTION lowercase_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := lower(NEW.username);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lowercase_username ON profiles;
CREATE TRIGGER trg_lowercase_username
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW EXECUTE FUNCTION lowercase_username();

-- ============================================================
-- 2. PRESENCE FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION heartbeat_presence(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_online = true, last_seen = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_stale_presence()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_online = false
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '45 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION heartbeat_presence(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION expire_stale_presence() TO anon, authenticated;

-- ============================================================
-- 3. BIRTHDAY SITES & STORAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS birthday_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT,
  photos TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'pink',
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS birthday_date DATE;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ec4899';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS confetti BOOLEAN DEFAULT true;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS music_autoplay BOOLEAN DEFAULT false;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_birthday_sites_slug ON birthday_sites(slug);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_created ON birthday_sites(created_at DESC);

ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public sites viewable by anyone" ON birthday_sites;
  CREATE POLICY "Public sites viewable by anyone" ON birthday_sites
    FOR SELECT USING (is_public = true AND COALESCE(is_published, true) = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners view own sites" ON birthday_sites;
  CREATE POLICY "Owners view own sites" ON birthday_sites
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners create own sites" ON birthday_sites;
  CREATE POLICY "Owners create own sites" ON birthday_sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners update own sites" ON birthday_sites;
  CREATE POLICY "Owners update own sites" ON birthday_sites
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners delete own sites" ON birthday_sites;
  CREATE POLICY "Owners delete own sites" ON birthday_sites
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE OR REPLACE FUNCTION increment_site_views(site_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE birthday_sites
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = site_slug AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_site_views(TEXT) TO anon, authenticated;

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
  CREATE POLICY "Public read photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users upload photos" ON storage.objects;
  CREATE POLICY "Auth users upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'photos'
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users update own photos" ON storage.objects;
  CREATE POLICY "Auth users update own photos" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'photos'
      AND auth.uid() = owner
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Auth users delete own photos" ON storage.objects;
  CREATE POLICY "Auth users delete own photos" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'photos'
      AND auth.uid() = owner
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 4. BIRTHDAY GUESTBOOK & HEARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS birthday_guest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES birthday_sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL CHECK (char_length(guest_name) BETWEEN 1 AND 60),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  photo_url TEXT,
  hearts INTEGER NOT NULL DEFAULT 0 CHECK (hearts >= 0),
  heart_token TEXT,
  client_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_entries_site ON birthday_guest_entries(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_entries_heart_token ON birthday_guest_entries(heart_token);

CREATE TABLE IF NOT EXISTS guest_heart_tokens (
  entry_id UUID NOT NULL REFERENCES birthday_guest_entries(id) ON DELETE CASCADE,
  heart_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entry_id, heart_token)
);

ALTER TABLE birthday_guest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_heart_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public entries on published sites" ON birthday_guest_entries;
  CREATE POLICY "Public entries on published sites" ON birthday_guest_entries
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM birthday_sites s
         WHERE s.id = site_id
           AND s.is_public = true
           AND COALESCE(s.is_published, true) = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners delete own site wishes" ON birthday_guest_entries;
  CREATE POLICY "Owners delete own site wishes" ON birthday_guest_entries
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM birthday_sites s
         WHERE s.id = site_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

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
  v_heart_token TEXT;
  v_entry UUID;
BEGIN
  SELECT * INTO v_site FROM birthday_sites WHERE slug = p_site_slug;
  IF NOT FOUND THEN RAISE EXCEPTION 'Site not found'; END IF;

  IF NOT v_site.is_public OR v_site.is_published = false THEN
    RAISE EXCEPTION 'This site is not accepting wishes';
  END IF;

  v_heart_token := NULLIF(TRIM(COALESCE(p_heart_token, '')), '');

  IF auth.uid() IS NULL THEN
    p_user_id := NULL;
  ELSE
    p_user_id := auth.uid();
  END IF;

  INSERT INTO birthday_guest_entries (site_id, user_id, guest_name, message, photo_url, heart_token)
  VALUES (v_site.id, p_user_id, TRIM(p_guest_name), TRIM(p_message), p_photo_url, v_heart_token)
  RETURNING id INTO v_entry;

  IF v_heart_token IS NOT NULL THEN
    INSERT INTO guest_heart_tokens (entry_id, heart_token)
    VALUES (v_entry, v_heart_token)
    ON CONFLICT (entry_id, heart_token) DO NOTHING;
  END IF;

  RETURN v_entry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_guest_entry_heart(
  p_entry_id UUID,
  p_heart_token TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_found BOOLEAN;
  v_rows BIGINT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM birthday_guest_entries e
    JOIN birthday_sites s ON s.id = e.site_id
    WHERE e.id = p_entry_id AND s.is_public = true AND COALESCE(s.is_published, true) = true
  ) INTO v_found;

  IF NOT v_found THEN RAISE EXCEPTION 'Entry not found'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM guest_heart_tokens WHERE entry_id = p_entry_id AND heart_token = p_heart_token
  ) THEN
    INSERT INTO guest_heart_tokens (entry_id, heart_token)
    VALUES (p_entry_id, p_heart_token)
    ON CONFLICT (entry_id, heart_token) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows = 1 THEN
      UPDATE birthday_guest_entries SET hearts = COALESCE(hearts, 0) + 1 WHERE id = p_entry_id;
    END IF;
  ELSE
    DELETE FROM guest_heart_tokens WHERE entry_id = p_entry_id AND heart_token = p_heart_token;
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    UPDATE birthday_guest_entries SET hearts = GREATEST(0, COALESCE(hearts, 0) - 1)
    WHERE id = p_entry_id AND v_rows = 1;
  END IF;

  RETURN (SELECT COALESCE(hearts, 0) FROM birthday_guest_entries WHERE id = p_entry_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION guestbook_totals(p_site_slug TEXT)
RETURNS TABLE (entries BIGINT, total_hearts BIGINT, last_entry_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(e.hearts), 0)::BIGINT,
    MAX(e.created_at)
  FROM birthday_guest_entries e
  JOIN birthday_sites s ON s.id = e.site_id
  WHERE s.slug = p_site_slug AND s.is_public = true AND COALESCE(s.is_published, true) = true;
$$;

GRANT EXECUTE ON FUNCTION add_guest_entry(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION toggle_guest_entry_heart(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION guestbook_totals(TEXT) TO anon, authenticated;

-- ============================================================
-- 5. SOCIAL: FRIEND REQUESTS & PLAY INVITES
-- ============================================================
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_pair
  ON friend_requests(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id)
  );

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own friend requests" ON friend_requests;
  CREATE POLICY "Users can view own friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
  CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own friend requests" ON friend_requests;
  CREATE POLICY "Users can update own friend requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Play invites
CREATE TABLE IF NOT EXISTS play_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  session_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_play_invites_to_pending
  ON play_invites(to_user_id, status)
  WHERE status = 'pending';

ALTER TABLE play_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own play invites" ON play_invites;
  CREATE POLICY "Users can view own play invites" ON play_invites
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send play invites" ON play_invites;
  CREATE POLICY "Users can send play invites" ON play_invites
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update received play invites" ON play_invites;
  CREATE POLICY "Users can update received play invites" ON play_invites
    FOR UPDATE USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 6. NOTIFICATIONS EXTENSIONS & TRIGGERS
-- ============================================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name
  FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, message, link, data)
  VALUES (
    NEW.receiver_id,
    'friend_request',
    'New friend request 💕',
    sender_name || ' wants to be your friend!',
    '/friends',
    jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_friend_request ON friend_requests;
CREATE TRIGGER trg_notify_friend_request
  AFTER INSERT ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION notify_friend_request();

CREATE OR REPLACE FUNCTION notify_play_invite()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name
  FROM profiles WHERE id = NEW.from_user_id;

  INSERT INTO notifications (user_id, type, title, message, link, data)
  VALUES (
    NEW.to_user_id,
    'game_invite',
    'Game invite 🎮',
    sender_name || ' wants to play ' || NEW.game_slug || ' with you!',
    '/games/' || NEW.game_slug,
    jsonb_build_object(
      'invite_id', NEW.id,
      'from_user_id', NEW.from_user_id,
      'game_slug', NEW.game_slug,
      'session_code', NEW.session_code
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_play_invite ON play_invites;
CREATE TRIGGER trg_notify_play_invite
  AFTER INSERT ON play_invites
  FOR EACH ROW EXECUTE FUNCTION notify_play_invite();

-- ============================================================
-- 7. MISSED YOU ENTRIES (LOVE WALL / MISS METER)
-- ============================================================
CREATE TABLE IF NOT EXISTS missed_you_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  revealed_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '';
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE missed_you_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_missed_you_partner_unread
  ON missed_you_entries (partner_id, created_at DESC)
  WHERE revealed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_missed_you_sender
  ON missed_you_entries (COALESCE(sender_id, user_id), created_at DESC);

ALTER TABLE missed_you_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Partners view missed you notes" ON missed_you_entries;
  CREATE POLICY "Partners view missed you notes" ON missed_you_entries
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = user_id OR auth.uid() = partner_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users insert missed you notes" ON missed_you_entries;
  CREATE POLICY "Users insert missed you notes" ON missed_you_entries
    FOR INSERT WITH CHECK (auth.uid() = sender_id OR auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Partners mark notes read" ON missed_you_entries;
  CREATE POLICY "Partners mark notes read" ON missed_you_entries
    FOR UPDATE USING (auth.uid() = partner_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 8. PROPOSALS SYSTEM
-- ============================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  response TEXT,
  responded_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  from_user_id UUID,
  to_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT proposals_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT proposals_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS from_user_id UUID;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS to_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_proposals_sender ON proposals(sender_id);
CREATE INDEX IF NOT EXISTS idx_proposals_receiver ON proposals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own sent or received proposals" ON proposals;
  CREATE POLICY "Users can view own sent or received proposals" ON proposals
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create proposals" ON proposals;
  CREATE POLICY "Users can create proposals" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
  CREATE POLICY "Users can update own proposals" ON proposals
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 9. ACTIVITY DAYS & STREAKS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_days (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
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

CREATE OR REPLACE FUNCTION mark_activity_today(p_type TEXT DEFAULT 'presence')
RETURNS DATE AS $$
BEGIN
  INSERT INTO activity_days (user_id, day, activity_type)
  VALUES (auth.uid(), CURRENT_DATE, COALESCE(NULLIF(trim(p_type), ''), 'presence'))
  ON CONFLICT (user_id, day) DO NOTHING;
  RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION mark_activity_today(TEXT) TO authenticated;

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
  SELECT ARRAY_AGG(day ORDER BY day) INTO v_days
    FROM activity_days
    WHERE user_id = p_user_id;

  IF v_days IS NULL OR array_length(v_days, 1) = 0 THEN
    RETURN QUERY SELECT 0::INT, 0::INT, NULL::DATE, 0::BIGINT;
    RETURN;
  END IF;

  SELECT t.day INTO STRICT v_last FROM unnest(v_days) AS t(day) ORDER BY t.day DESC LIMIT 1;

  FOR i IN 1..array_length(v_days, 1) LOOP
    IF i > 1 AND v_days[i] = v_days[i - 1] + 1 THEN
      v_run := v_run + 1;
    ELSE
      v_run := 1;
    END IF;
    v_max := GREATEST(v_max, v_run);
  END LOOP;

  IF v_last >= CURRENT_DATE - 1 THEN
    v_current := v_run;
  ELSE
    v_current := 0;
  END IF;

  RETURN QUERY SELECT v_current::INT, v_max::INT, v_last, array_length(v_days, 1)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_streak(UUID) TO anon, authenticated;

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

GRANT EXECUTE ON FUNCTION get_couple_streak(UUID, UUID) TO anon, authenticated;

-- ============================================================
-- 10. GAME SESSIONS EXTENSIONS
-- ============================================================
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS game_slug TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS player1_score INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS player2_score INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 11. ADMIN ANALYTICS & ACTIVE SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  games_played INT DEFAULT 0,
  matches_made INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  peak_hour INT,
  peak_users INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date);

CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  page_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON active_sessions(last_seen DESC);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read analytics" ON analytics_daily;
  CREATE POLICY "Public read analytics" ON analytics_daily FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read active_sessions" ON active_sessions;
  CREATE POLICY "Public read active_sessions" ON active_sessions FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 12. REALTIME PUBLICATIONS
-- ============================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE play_invites;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE birthday_guest_entries;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE missed_you_entries;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 13. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches (user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches (user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_active ON matches (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read = false OR is_read = false;
CREATE INDEX IF NOT EXISTS idx_game_sessions_p1 ON game_sessions (player1_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_p2 ON game_sessions (player2_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_users_seen ON active_users (last_active DESC);
CREATE INDEX IF NOT EXISTS idx_games_catalog_featured ON games_catalog (is_featured DESC, play_count DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages (match_id);

DO $$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_u1 ON conversations (user1_id, last_message_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_u2 ON conversations (user2_id, last_message_at DESC);
  END IF;

  IF to_regclass('public.game_stats') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats (user_id, last_played DESC);
  END IF;

  IF to_regclass('public.user_badges') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges (user_id, earned_at DESC);
  END IF;
END $$;

