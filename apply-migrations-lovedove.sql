-- ============================================================
-- LOVE DOVE - DATABASE FIX (paste into Supabase SQL Editor)
--
-- Adds the 5 missing tables: friend_requests, play_invites,
-- user_presence, active_users, activity_days + the profile/
-- game_sessions columns your app already queries.
--
-- SAFE TO RE-RUN: every CREATE is IF NOT EXISTS, every
-- ALTER is ADD COLUMN IF NOT EXISTS, every policy/trigger is
-- dropped first. Nothing existing is modified or removed.
-- 723 statements. Paste ALL of it, then Run.
-- ============================================================

-- >>> Source: 20251013_birthday_sites.sql <<<
-- Love Dove — Birthday Sites Migration
-- Run in Supabase Dashboard > SQL Editor AFTER the main schema.

-- ============================================
-- 0. CREATE the table if it does not exist yet
-- ============================================
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

-- ============================================
-- 1. EXTEND birthday_sites
-- ============================================
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS birthday_date DATE;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS from_name TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ec4899';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter';
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS confetti BOOLEAN DEFAULT true;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS music_autoplay BOOLEAN DEFAULT false;
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Photos: store public URLs in the array. Keep the column name stable.
-- (Already exists in base schema: photos TEXT[] DEFAULT '{}')

CREATE INDEX IF NOT EXISTS idx_birthday_sites_created ON birthday_sites(created_at DESC);

-- ============================================
-- 2. VIEW COUNTER — bump safely without exposing update rights
-- ============================================
CREATE OR REPLACE FUNCTION increment_site_views(site_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE birthday_sites
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = site_slug AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anyone (even anon) can call the view bump
GRANT EXECUTE ON FUNCTION increment_site_views(TEXT) TO anon, authenticated;

-- ============================================
-- 3. RLS — make sure public can read published sites and call view bump
-- ============================================
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public sites viewable by anyone" ON birthday_sites;
  CREATE POLICY "Public sites viewable by anyone" ON birthday_sites
    FOR SELECT USING (is_public = true);
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

-- ============================================
-- 4. STORAGE — public bucket for site photos + avatars
-- ============================================
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

-- ============================================
-- 5. Keep updated_at fresh
-- ============================================
CREATE OR REPLACE FUNCTION touch_birthday_site()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_birthday_site ON birthday_sites;
CREATE TRIGGER trg_touch_birthday_site
  BEFORE UPDATE ON birthday_sites
  FOR EACH ROW EXECUTE FUNCTION touch_birthday_site();

-- >>> Source: 20251013_matchmaking.sql <<<
-- Love Dove Matchmaking System
-- Auto-find matches, score them 0-100, notify both sides, unique usernames + search.
-- Run in Supabase SQL Editor.

-- ============================================
-- 1. Unique usernames (lowercase, 3-30 chars, alphanumeric + underscores)
-- ============================================
CREATE OR REPLACE FUNCTION generate_unique_username(base_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  counter INT := 0;
BEGIN
  base := lower(regexp_replace(split_part(base_email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
  IF length(base) < 3 THEN base := 'user_' || base; END IF;
  IF length(base) > 24 THEN base := substring(base, 1, 24); END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = candidate) LOOP
    counter := counter + 1;
    candidate := base || counter::text;
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Backfill usernames for any profile missing one
UPDATE profiles
SET username = generate_unique_username(email)
WHERE username IS NULL OR username = '';

-- Enforce a case-insensitive unique index on username
DROP INDEX IF EXISTS idx_profiles_username_ci;
CREATE UNIQUE INDEX idx_profiles_username_ci
  ON profiles(lower(username));

-- Trigger: keep username lowercased on insert/update
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

-- ============================================
-- 2. Ensure profiles has 'traits' + 'search_visible' columns
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS traits TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_visible BOOLEAN DEFAULT true;

-- ============================================
-- 3. Ensure match_notifications / notifications tables exist
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable realtime for matches + notifications (for live updates in-app)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE matches;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- 4. Update the handle_new_user trigger to always set a real unique username
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
BEGIN
  new_username := generate_unique_username(NEW.email);

  INSERT INTO public.profiles (id, email, full_name, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    new_username,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 5. Match-scoring function (0-100, weighted)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_match_score(p1 UUID, p2 UUID)
RETURNS TABLE(score INT, reasons TEXT[]) AS $$
DECLARE
  p1_profile RECORD;
  p2_profile RECORD;
  p1_prefs RECORD;
  p2_prefs RECORD;
  s INT := 0;
  r TEXT[] := '{}';
  common TEXT[];
BEGIN
  SELECT * INTO p1_profile FROM profiles WHERE id = p1;
  SELECT * INTO p2_profile FROM profiles WHERE id = p2;
  IF p1_profile.id IS NULL OR p2_profile.id IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO p1_prefs FROM partner_preferences WHERE user_id = p1;
  SELECT * INTO p2_prefs FROM partner_preferences WHERE user_id = p2;

  -- 1) Gender / looking-for match (up to 30 pts)
  IF p1_prefs.gender_preference IS NOT NULL
     AND p1_prefs.gender_preference <> 'any'
     AND p2_profile.gender = p1_prefs.gender_preference THEN
    s := s + 30;
    r := array_append(r, 'You''re exactly who they''re looking for');
  END IF;

  IF p2_prefs.gender_preference IS NOT NULL
     AND p2_prefs.gender_preference <> 'any'
     AND p1_profile.gender = p2_prefs.gender_preference THEN
    s := s + 30;
    r := array_append(r, 'They''re exactly who you''re looking for');
  END IF;

  -- 2) Shared interests on profiles (up to 30 pts — 10 each, max 3)
  IF p1_profile.interests IS NOT NULL AND p2_profile.interests IS NOT NULL THEN
    SELECT ARRAY(
      SELECT unnest(p1_profile.interests)
      INTERSECT
      SELECT unnest(p2_profile.interests)
    ) INTO common;
    IF array_length(common, 1) IS NOT NULL THEN
      s := s + LEAST(30, array_length(common, 1) * 10);
      r := array_append(r, 'You both love ' || array_to_string(common[1:3], ', '));
    END IF;
  END IF;

  -- 3) Desired interests overlap (15 pts)
  IF p1_prefs.interests IS NOT NULL AND p2_profile.interests IS NOT NULL THEN
    SELECT ARRAY(
      SELECT unnest(p1_prefs.interests)
      INTERSECT
      SELECT unnest(p2_profile.interests)
    ) INTO common;
    IF array_length(common, 1) IS NOT NULL THEN
      s := s + 15;
      r := array_append(r, 'You''re both into ' || common[1]);
    END IF;
  END IF;

  -- 4) Desired traits overlap (15 pts)
  IF p1_prefs.traits_looking_for IS NOT NULL AND p2_profile.traits IS NOT NULL THEN
    SELECT ARRAY(
      SELECT unnest(p1_prefs.traits_looking_for)
      INTERSECT
      SELECT unnest(p2_profile.traits)
    ) INTO common;
    IF array_length(common, 1) IS NOT NULL THEN
      s := s + 15;
      r := array_append(r, 'You share ' || common[1] || ' values');
    END IF;
  END IF;

  -- 5) Same relationship goals (10 pts)
  IF p1_prefs.relationship_goals IS NOT NULL
     AND p2_prefs.relationship_goals IS NOT NULL
     AND p1_prefs.relationship_goals = p2_prefs.relationship_goals THEN
    s := s + 10;
    r := array_append(r, 'Same relationship goals');
  END IF;

  -- 6) Same city (5 pts)
  IF p1_profile.location IS NOT NULL
     AND p2_profile.location IS NOT NULL
     AND length(p1_profile.location) > 0
     AND lower(p1_profile.location) = lower(p2_profile.location) THEN
    s := s + 5;
    r := array_append(r, 'You live in the same city');
  END IF;

  s := LEAST(100, GREATEST(0, s));
  score := s;
  reasons := r;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 6. Auto-find matches when preferences are saved
-- ============================================
CREATE OR REPLACE FUNCTION find_matches_for_user(uid UUID)
RETURNS VOID AS $$
DECLARE
  my_prefs RECORD;
  candidate RECORD;
  ms INT;
  mr TEXT[];
  other_prefs RECORD;
BEGIN
  SELECT * INTO my_prefs FROM partner_preferences WHERE user_id = uid;
  IF my_prefs.id IS NULL THEN RETURN; END IF;

  FOR candidate IN
    SELECT p.id
    FROM profiles p
    WHERE p.id <> uid
      AND p.username IS DISTINCT FROM 'admin'
      AND p.search_visible = true
      AND (
        my_prefs.gender_preference IS NULL
        OR my_prefs.gender_preference = 'any'
        OR my_prefs.gender_preference = p.gender
        OR p.gender IS NULL
      )
  LOOP
    SELECT * INTO ms, mr FROM calculate_match_score(uid, candidate.id);
    IF ms >= 20 THEN
      INSERT INTO matches (user1_id, user2_id, match_score, match_reasons, user1_accepted, is_active, created_at)
      VALUES (uid, candidate.id, ms, mr, true, true, NOW())
      ON CONFLICT DO NOTHING;

      -- Insert notifications when the match is very high
      IF ms >= 80 THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES
          (uid, 'match', 'High match found!',
            'You have a ' || ms || '% match. Say hi!',
            jsonb_build_object('other_id', candidate.id, 'score', ms)),
          (candidate.id, 'match', 'High match found!',
            'You have a ' || ms || '% match. Say hi!',
            jsonb_build_object('other_id', uid, 'score', ms))
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trigger_find_matches()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM find_matches_for_user(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_find_matches ON partner_preferences;
CREATE TRIGGER trg_find_matches
  AFTER INSERT OR UPDATE ON partner_preferences
  FOR EACH ROW EXECUTE FUNCTION trigger_find_matches();

-- ============================================
-- 7. Username search (case-insensitive partial match, ranked)
-- ============================================
CREATE OR REPLACE FUNCTION search_users_by_username(q TEXT, lim INT DEFAULT 20)
RETURNS TABLE(id UUID, username TEXT, full_name TEXT, avatar_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.avatar_url
  FROM profiles p
  WHERE p.search_visible = true
    AND p.username IS NOT NULL
    AND lower(p.username) LIKE '%' || lower(q) || '%'
  ORDER BY
    CASE WHEN lower(p.username) = lower(q) THEN 0
         WHEN lower(p.username) LIKE lower(q) || '%' THEN 1
         ELSE 2 END,
    p.username
  LIMIT lim;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION search_users_by_username TO authenticated;
GRANT EXECUTE ON FUNCTION search_users_by_username TO anon;

-- ============================================
-- 8. RLS for new objects
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Profiles: anyone authenticated can view public profiles (needed for matching)
DROP POLICY IF EXISTS "Public profile read" ON profiles;
CREATE POLICY "Public profile read" ON profiles
  FOR SELECT USING (search_visible = true OR auth.uid() = id);

-- Matches: users can view matches they participate in
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- partner_preferences: users can view for matching
DROP POLICY IF EXISTS "Partner preferences public for matching" ON partner_preferences;
CREATE POLICY "Partner preferences public for matching" ON partner_preferences
  FOR SELECT USING (true);

-- >>> Source: 20251013_social_presence.sql <<<
-- Love Dove — Social & Presence Migration
-- Adds: unique usernames, online presence, play invites, realtime answer reveal,
--       notification for play requests, and helper RPCs.
-- Run in Supabase Dashboard > SQL Editor.

-- ============================================
-- 1. UNIQUE USERNAMES (case-insensitive, 3-20 chars, letters/numbers/underscore)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Backfill any missing usernames from email, then enforce uniqueness.
DO $$
DECLARE
  r RECORD;
  base TEXT;
  candidate TEXT;
  counter INT;
BEGIN
  FOR r IN SELECT id, email FROM profiles WHERE username IS NULL OR username = '' LOOP
    base := lower(regexp_replace(split_part(r.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
    IF length(base) < 3 THEN base := 'user_' || base; END IF;
    IF length(base) > 18 THEN base := substring(base, 1, 18); END IF;
    candidate := base;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM profiles WHERE lower(username) = candidate AND id <> r.id) LOOP
      counter := counter + 1;
      candidate := base || counter::text;
    END LOOP;
    UPDATE profiles SET username = candidate WHERE id = r.id;
  END LOOP;
END $$;

-- Case-insensitive unique index on username
DROP INDEX IF EXISTS idx_profiles_username_ci;
CREATE UNIQUE INDEX idx_profiles_username_ci ON profiles(lower(username));

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

-- ============================================
-- 2. PRESENCE RPC (called every ~25s from the client heartbeat)
-- ============================================
CREATE OR REPLACE FUNCTION heartbeat_presence(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_online = true, last_seen = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark anyone not seen in 45s as offline (runs as part of any heartbeat call)
CREATE OR REPLACE FUNCTION expire_stale_presence()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_online = false
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '45 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. PLAY INVITES (real-time "do you want to play?" requests)
-- ============================================
CREATE TABLE IF NOT EXISTS play_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  session_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_play_invites_to ON play_invites(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_play_invites_from ON play_invites(from_user_id, status);

ALTER TABLE play_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own play invites" ON play_invites
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send play invites" ON play_invites
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own play invites" ON play_invites
    FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- 4. GAME SESSIONS: add invite/couple fields
-- ============================================
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES profiles(id);
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS current_turn UUID REFERENCES profiles(id);
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS session_code TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS opponent_type TEXT DEFAULT 'human';
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';

-- Unique session codes
DROP INDEX IF EXISTS idx_game_sessions_code_ci;
CREATE UNIQUE INDEX idx_game_sessions_code_ci ON game_sessions(lower(session_code));

-- ============================================
-- 5. NOTIFICATIONS: play invite + friend request already supported.
--    Add a realtime-friendly index.
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================
-- 6. REALTIME (safe re-runs)
-- ============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE play_invites;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================
-- 7. FRIEND REQUEST: make sure the table + notification insert exist
-- ============================================
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
  CREATE POLICY "Users can view own friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own friend requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- 8. TRIGGER: notify receiver on a new friend request
-- ============================================
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name
  FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id,
    'friend_request',
    'New friend request 💕',
    sender_name || ' wants to be your friend!',
    jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_friend_request ON friend_requests;
CREATE TRIGGER trg_notify_friend_request
  AFTER INSERT ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION notify_friend_request();

-- ============================================
-- 9. TRIGGER: notify receiver on a new play invite
-- ============================================
CREATE OR REPLACE FUNCTION notify_play_invite()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name
  FROM profiles WHERE id = NEW.from_user_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.to_user_id,
    'game_invite',
    'Game invite 🎮',
    sender_name || ' wants to play ' || NEW.game_slug || ' with you!',
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
