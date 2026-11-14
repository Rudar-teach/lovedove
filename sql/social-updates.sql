-- ═══════════════════════════════════════════════════════════════════
-- Love Dove — social updates
--   1. stories           → shareable story wall (partner or community,
--                          optional anonymous authorship)
--   2. friend_messages   → friend chat (powers the "Miss Meter ranking")
--      + trigger that drops a notifications row for the recipient,
--                          so it shows the moment they open the site
--   3. presence          → faster "online now": backgrounded tabs throttle
--                          the 25s heartbeat to ~60s, which the old 45s
--                          expire window kept flipping to offline
-- Idempotent. Run via:  node scripts/supabase-db-setup.mjs sql/social-updates.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── 0. Presence: keep throttled-but-open tabs "online" ──────────────
-- A backgrounded tab pings at most every 60s (browser timer throttle).
-- The old 45s window marked those users offline. 3min is safe: a truly
-- closed tab stops pinging and flips offline within 3 minutes.
CREATE OR REPLACE FUNCTION expire_stale_presence()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET is_online = false
  WHERE is_online = true AND last_seen < NOW() - INTERVAL '3 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Instant offline on tab close (client calls this on `pagehide`), so the
-- other side doesn't have to wait for the 3min stale sweep.
CREATE OR REPLACE FUNCTION mark_presence_offline(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET is_online = false WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 1. Stories (shared story wall, optional anonymity) ──────────────
CREATE TABLE IF NOT EXISTS stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_username TEXT,                 -- denormalized for display
  is_anonymous  BOOLEAN NOT NULL DEFAULT false,
  title         TEXT,
  body          TEXT NOT NULL,
  emoji         TEXT,
  audience      TEXT NOT NULL DEFAULT 'community'
                 CHECK (audience IN ('partner', 'community')),
  partner_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  likes_count   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stories_audience_created ON stories(audience, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id, created_at DESC);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Story readers" ON stories FOR SELECT USING (
    audience = 'community'
    OR author_id = auth.uid()
    OR (audience = 'partner' AND partner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authors can post their own story" ON stories FOR INSERT
    WITH CHECK (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authors can edit their own story" ON stories FOR UPDATE
    USING (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Likes: keep likes_count in sync via a separate table + trigger, so
-- anyone can like a community story without being able to edit text.
CREATE TABLE IF NOT EXISTS story_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, user_id)
);
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "See your own likes" ON story_likes FOR SELECT
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Add a like" ON story_likes FOR INSERT
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Remove your like" ON story_likes FOR DELETE
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION bump_story_likes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_story_likes ON story_likes;
CREATE TRIGGER trg_story_likes
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW EXECUTE FUNCTION bump_story_likes();

-- ── 2. Friend messages (chat + ranking) ──────────────────────────────
CREATE TABLE IF NOT EXISTS friend_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_friend_messages_pair
  ON friend_messages (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_messages_recipient_unread
  ON friend_messages (recipient_id) WHERE read_at IS NULL;

ALTER TABLE friend_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Friends read their own messages" ON friend_messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Send a friend message" ON friend_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Mark your messages read" ON friend_messages FOR UPDATE
    USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Delete your own messages" ON friend_messages FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop a notification row for the recipient so it surfaces the moment
-- they open the site (the notifications page + banner both read it).
-- Some schemas put a CHECK on notifications.type; drop a common name so
-- the new 'friend_message' type is always accepted.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

CREATE OR REPLACE FUNCTION notify_friend_message() RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name
  FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.recipient_id,
    'friend_message',
    '💬 New message',
    sender_name || ': ' || LEFT(NEW.body, 80),
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id',  NEW.sender_id,
      'slug',       (SELECT username FROM profiles WHERE id = NEW.sender_id)
    )
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_friend_message ON friend_messages;
CREATE TRIGGER trg_notify_friend_message
  AFTER INSERT ON friend_messages
  FOR EACH ROW EXECUTE FUNCTION notify_friend_message();

-- Safety net: make sure the recipient can actually see + read their own
-- notifications (no-ops if the policies already exist).
DO $$ BEGIN
  CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. Realtime: push new stories + messages + presence changes ──────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE stories;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE story_likes;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friend_messages;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
