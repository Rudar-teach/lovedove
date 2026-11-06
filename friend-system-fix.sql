-- ═══════════════════════════════════════════════════════════════
-- Love Dove — Friend system fix (RUN IN SUPABASE DASHBOARD)
-- Dashboard → SQL Editor → New query → paste ALL of this → Run
--
-- Fixes: username search "No users found", friend add/accept,
--        online/offline status, play invites.
-- SAFE: idempotent — every statement is guarded (IF NOT EXISTS /
--       DROP IF EXISTS / exception catches), so re-running is fine.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Presence columns on profiles ─────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- ── 2. Backfill missing usernames, then enforce case-insensitive uniqueness
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

DROP INDEX IF EXISTS idx_profiles_username_ci;
DO $$ BEGIN
  CREATE UNIQUE INDEX idx_profiles_username_ci ON profiles(lower(username));
EXCEPTION WHEN duplicate_key THEN RAISE NOTICE 'Duplicate usernames exist — dedupe manually in Authentication → Users'; END $$;

-- Force lowercase username on write
CREATE OR REPLACE FUNCTION lowercase_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN NEW.username := lower(NEW.username); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lowercase_username ON profiles;
CREATE TRIGGER trg_lowercase_username
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW EXECUTE FUNCTION lowercase_username();

-- ── 3. Presence RPCs (client heartbeat calls these every ~25s) ──
CREATE OR REPLACE FUNCTION heartbeat_presence(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET is_online = true, last_seen = NOW() WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_stale_presence()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET is_online = false
  WHERE is_online = true AND last_seen < NOW() - INTERVAL '45 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. Friend requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_pair
  ON friend_requests(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));

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
DO $$ BEGIN
  CREATE POLICY "Users can delete own friend requests" ON friend_requests
    FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notify receiver of a new friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id, 'friend_request', 'New friend request 💕',
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

-- ── 5. Play invites (real-time "want to play?" requests) ───────
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

CREATE OR REPLACE FUNCTION notify_play_invite()
RETURNS TRIGGER AS $$
DECLARE sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name FROM profiles WHERE id = NEW.from_user_id;
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.to_user_id, 'game_invite', 'Game invite 🎮',
    sender_name || ' wants to play ' || NEW.game_slug || ' with you!',
    jsonb_build_object('invite_id', NEW.id, 'from_user_id', NEW.from_user_id,
      'game_slug', NEW.game_slug, 'session_code', NEW.session_code)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_play_invite ON play_invites;
CREATE TRIGGER trg_notify_play_invite
  AFTER INSERT ON play_invites
  FOR EACH ROW EXECUTE FUNCTION notify_play_invite();

-- ── 6. Realtime: push friend requests + invites to open tabs ───
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE play_invites;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ═══ DONE. Reload the site — username search now works. ═══
