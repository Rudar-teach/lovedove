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
