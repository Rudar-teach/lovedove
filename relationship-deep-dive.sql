-- ═══════════════════════════════════════════════════════════════════
-- Love Dove — Relationship Depth Layer
--  couples / love_reasons / milestones / surprise_pool
-- Idempotent. Run via: node scripts/supabase-db-setup.mjs relationship-deep-dive.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. COUPLES: one row per pair, holds their key dates ─────────────
CREATE TABLE IF NOT EXISTS couples (
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE,
  anniversary_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user1_id, user2_id)
);

DO $$ BEGIN
  CREATE UNIQUE INDEX idx_couples_pair ON couples(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Couple members can read the couple row" ON couples
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Couple members can create the couple row" ON couples
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Couple members can update the couple row" ON couples
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. LOVE REASONS: "reasons I love you", unlocked one at a time ──
CREATE TABLE IF NOT EXISTS love_reasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) BETWEEN 3 AND 280),
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_love_reasons_receiver ON love_reasons(receiver_id, revealed_at);
CREATE INDEX IF NOT EXISTS idx_love_reasons_sender ON love_reasons(sender_id, created_at DESC);

ALTER TABLE love_reasons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Lovers can view their reasons" ON love_reasons
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Sender can add a reason" ON love_reasons
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Receiver reveals reasons" ON love_reasons
    FOR UPDATE USING (auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Either lover can delete" ON love_reasons
    FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION notify_love_reason()
RETURNS TRIGGER AS $$
DECLARE sender_name TEXT;
BEGIN
  SELECT COALESCE(username, full_name, 'Someone') INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id, 'love_reason',
    'New reason they love you 💗',
    sender_name || ' wrote a new reason about you. Open Our Story to unlock it.',
    jsonb_build_object('reason_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_love_reason ON love_reasons;
CREATE TRIGGER trg_notify_love_reason
  AFTER INSERT ON love_reasons
  FOR EACH ROW EXECUTE FUNCTION notify_love_reason();

-- ── 3. MILESTONES: the "Our Story" timeline ─────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'memory',
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  description TEXT,
  emoji TEXT DEFAULT '💕',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones(user_id, created_at DESC);
-- auto-log types fire at most once per user
DO $$ BEGIN
  CREATE UNIQUE INDEX idx_milestones_once ON milestones(user_id, type)
    WHERE type IN ('first_match', 'first_game');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Lovers share their milestones" ON milestones
    FOR SELECT USING (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM couples c
                 WHERE auth.uid() IN (c.user1_id, c.user2_id)
                 AND user_id IN (c.user1_id, c.user2_id))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Lovers add milestones" ON milestones
    FOR INSERT WITH CHECK (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM couples c
                 WHERE auth.uid() IN (c.user1_id, c.user2_id)
                 AND user_id IN (c.user1_id, c.user2_id))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Lovers delete milestones" ON milestones
    FOR DELETE USING (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM couples c
                 WHERE auth.uid() IN (c.user1_id, c.user2_id)
                 AND user_id IN (c.user1_id, c.user2_id))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 4. BIRTHDAY: date column + surprise pool ────────────────────────
ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS birthday_date DATE;

CREATE TABLE IF NOT EXISTS surprise_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES birthday_sites(id) ON DELETE CASCADE,
  contributor TEXT NOT NULL CHECK (char_length(contributor) BETWEEN 1 AND 60),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_surprise_pool_site ON surprise_pool(site_id, created_at);

ALTER TABLE surprise_pool ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can add to a birthday pool" ON surprise_pool
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Anyone can view a birthday pool" ON surprise_pool
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 5. Couple visibility into each other's sessions (activity feed) ─
-- (live game_sessions has player1_id/player2_id — no user_id column)
DO $$ BEGIN
  CREATE POLICY "Lovers can view each other's game sessions" ON game_sessions
    FOR SELECT USING (
      auth.uid() = player1_id OR auth.uid() = player2_id
      OR EXISTS (SELECT 1 FROM couples c
                 WHERE auth.uid() = c.user1_id
                   AND (player1_id = c.user2_id OR player2_id = c.user2_id))
      OR EXISTS (SELECT 1 FROM couples c
                 WHERE auth.uid() = c.user2_id
                   AND (player1_id = c.user1_id OR player2_id = c.user1_id))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 6. Realtime ─────────────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE love_reasons;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE couples;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE surprise_pool;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ═══ DONE ═══
