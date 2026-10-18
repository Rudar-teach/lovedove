-- Love Dove — Guestbook Migration
-- Run in Supabase Dashboard > SQL Editor AFTER 20251013_birthday_sites.sql.
--
-- Lets the birthday person's guests leave wishes without a Love Dove account.
-- Anonymous writes are gated by:
--   1. the site must be public AND published — checked inside add_guest_entry
--   2. a per-IP rate limit so one bot behind one address can't flood a wall
--   3. a hard cap on wishes per site, to keep the wall readable
--
-- Privacy note: client_ip is stored ONLY so (2) can work. Nothing else reads
-- it and no table other than this one touches it.

-- ============================================
-- 1. TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_guest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES birthday_sites(id) ON DELETE CASCADE,
  -- null for guests who write without an account
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL CHECK (char_length(guest_name) BETWEEN 1 AND 60),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  -- Guests paste a public URL rather than uploading: the photos bucket
  -- requires auth.uid(), and guests have none.
  photo_url TEXT CHECK (photo_url IS NULL OR photo_url ~ '^https?://'),
  hearts INTEGER NOT NULL DEFAULT 0 CHECK (hearts >= 0),
  -- Client-generated token, so one browser hearts an entry once.
  heart_token TEXT CHECK (heart_token IS NULL OR heart_token ~ '^[0-9a-fA-F]{16,64}$'),
  -- Throttling only; retained for the 10-minute window, then irrelevant.
  -- TEXT rather than INET: the raw value may be a header list, not an address.
  client_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_entries_site
  ON birthday_guest_entries(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_entries_heart_token
  ON birthday_guest_entries(heart_token);
CREATE INDEX IF NOT EXISTS idx_guest_entries_throttle
  ON birthday_guest_entries(site_id, client_ip, created_at DESC);

-- Several visitors heart the same entry, so uniqueness must be keyed by
-- token alongside the entry, not on the entry alone.
CREATE TABLE IF NOT EXISTS guest_heart_tokens (
  entry_id UUID NOT NULL REFERENCES birthday_guest_entries(id) ON DELETE CASCADE,
  heart_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entry_id, heart_token)
);

-- ============================================
-- 2. updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION touch_guest_entry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_guest_entry ON birthday_guest_entries;
CREATE TRIGGER trg_touch_guest_entry
  BEFORE UPDATE ON birthday_guest_entries
  FOR EACH ROW EXECUTE FUNCTION touch_guest_entry();

-- ============================================
-- 3. WRITE — anonymous, but checked
-- ============================================
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
  v_ip TEXT;
  v_recent INTEGER;
  v_total INTEGER;
  v_entry UUID;
BEGIN
  SELECT * INTO v_site
    FROM birthday_sites
   WHERE slug = p_site_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Site not found';
  END IF;

  -- Refuse quietly rather than erroring, so a guesser learns nothing about
  -- private slugs. is_published is null on pre-migration rows, so only an
  -- explicit false hides a site.
  IF NOT v_site.is_public OR v_site.is_published = false THEN
    RAISE EXCEPTION 'This site is not accepting wishes';
  END IF;

  v_heart_token := NULLIF(TRIM(COALESCE(p_heart_token, '')), '');
  IF v_heart_token IS NOT NULL AND char_length(v_heart_token) < 16 THEN
    RAISE EXCEPTION 'Invalid heart token';
  END IF;

  -- Anonymous writers have no auth identity. Clients lie about identity, so
  -- trust only auth.uid(): match it if provided, drop it otherwise.
  IF auth.uid() IS NULL THEN
    p_user_id := NULL;
  ELSE
    p_user_id := auth.uid();
  END IF;

  -- Throttle to 5 wishes per 10 minutes per site per address. Kept as TEXT:
  -- x-forwarded-for is a comma-separated list, not a single address, so it
  -- would not cast cleanly to INET. The whole value is still a fine bucket.
  v_ip := COALESCE(
    current_setting('request.headers', true)::json ->> 'x-forwarded-for',
    current_setting('request.headers', true)::json ->> 'x-real-ip'
  );

  IF v_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO v_recent
      FROM birthday_guest_entries
     WHERE site_id = v_site.id
       AND client_ip = v_ip
       AND created_at > NOW() - INTERVAL '10 minutes';
    IF v_recent >= 5 THEN
      RAISE EXCEPTION 'Too many wishes right now. Try again in a few minutes.';
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_total FROM birthday_guest_entries WHERE site_id = v_site.id;
  IF v_total >= 500 THEN
    RAISE EXCEPTION 'This wish wall is full';
  END IF;

  INSERT INTO birthday_guest_entries
    (site_id, user_id, guest_name, message, photo_url, heart_token, client_ip)
  VALUES
    (v_site.id, p_user_id, TRIM(p_guest_name), TRIM(p_message), p_photo_url, v_heart_token, v_ip)
  RETURNING id INTO v_entry;

  IF v_heart_token IS NOT NULL THEN
    INSERT INTO guest_heart_tokens (entry_id, heart_token)
    VALUES (v_entry, v_heart_token)
    ON CONFLICT (entry_id, heart_token) DO NOTHING;
  END IF;

  RETURN v_entry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_guest_entry(TEXT, TEXT, TEXT, TEXT, TEXT, UUID)
  TO anon, authenticated;

-- ============================================
-- 4. HEARTS — idempotent toggle
-- ============================================
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
    SELECT 1
      FROM birthday_guest_entries e
      JOIN birthday_sites s ON s.id = e.site_id
     WHERE e.id = p_entry_id
       AND s.is_public = true
       AND (s.is_published = true OR s.is_published IS NULL)
  ) INTO v_found;

  IF NOT v_found THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM guest_heart_tokens
     WHERE entry_id = p_entry_id AND heart_token = p_heart_token
  ) THEN
    INSERT INTO guest_heart_tokens (entry_id, heart_token)
    VALUES (p_entry_id, p_heart_token)
    ON CONFLICT (entry_id, heart_token) DO NOTHING;
    -- Only count the heart if THIS call actually added the token. Two
    -- concurrent taps for the same (entry, token) both pass the NOT EXISTS
    -- check above; ON CONFLICT makes one insert no-op, and ROW_COUNT is
    -- the only way to tell them apart.
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows = 1 THEN
      UPDATE birthday_guest_entries
         SET hearts = COALESCE(hearts, 0) + 1
       WHERE id = p_entry_id;
    END IF;
  ELSE
    DELETE FROM guest_heart_tokens
     WHERE entry_id = p_entry_id AND heart_token = p_heart_token;
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    UPDATE birthday_guest_entries
       SET hearts = GREATEST(0, COALESCE(hearts, 0) - 1)
     WHERE id = p_entry_id AND v_rows = 1;
  END IF;

  RETURN (SELECT COALESCE(hearts, 0) FROM birthday_guest_entries WHERE id = p_entry_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION toggle_guest_entry_heart(UUID, TEXT)
  TO anon, authenticated;

-- ============================================
-- 5. RLS
-- ============================================
-- Everything above is SECURITY DEFINER, so it runs as the table owner and
-- bypasses these policies. That is deliberate: the functions own the
-- authorization, and direct writes from the client are denied.
ALTER TABLE birthday_guest_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public entries on published sites" ON birthday_guest_entries;
  CREATE POLICY "Public entries on published sites" ON birthday_guest_entries
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM birthday_sites s
         WHERE s.id = site_id
           AND s.is_public = true
           AND (s.is_published = true OR s.is_published IS NULL)
      )
    );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "No direct writes" ON birthday_guest_entries;
  CREATE POLICY "No direct writes" ON birthday_guest_entries
    FOR INSERT WITH CHECK (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "No direct updates" ON birthday_guest_entries;
  CREATE POLICY "No direct updates" ON birthday_guest_entries
    FOR UPDATE USING (false) WITH CHECK (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Site owners can remove abusive wishes from their own site.
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

ALTER TABLE guest_heart_tokens ENABLE ROW LEVEL SECURITY;

-- Deny everything: the token table is an internal ledger, touched only by
-- the SECURITY DEFINER functions.
DO $$ BEGIN
  DROP POLICY IF EXISTS "No read heart tokens" ON guest_heart_tokens;
  CREATE POLICY "No read heart tokens" ON guest_heart_tokens
    FOR SELECT USING (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "No insert heart tokens" ON guest_heart_tokens;
  CREATE POLICY "No insert heart tokens" ON guest_heart_tokens
    FOR INSERT WITH CHECK (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "No update heart tokens" ON guest_heart_tokens;
  CREATE POLICY "No update heart tokens" ON guest_heart_tokens
    FOR UPDATE USING (false) WITH CHECK (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "No delete heart tokens" ON guest_heart_tokens;
  CREATE POLICY "No delete heart tokens" ON guest_heart_tokens
    FOR DELETE USING (false);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- 6. STATS — for the birthday person's wall
-- ============================================
CREATE OR REPLACE FUNCTION guestbook_totals(p_site_slug TEXT)
RETURNS TABLE (
  entries BIGINT,
  total_hearts BIGINT,
  last_entry_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(e.hearts), 0)::BIGINT,
    MAX(e.created_at)
      FROM birthday_guest_entries e
      JOIN birthday_sites s ON s.id = e.site_id
     WHERE s.slug = p_site_slug
       AND s.is_public = true
       AND (s.is_published = true OR s.is_published IS NULL);
$$;

GRANT EXECUTE ON FUNCTION guestbook_totals(TEXT) TO anon, authenticated;
