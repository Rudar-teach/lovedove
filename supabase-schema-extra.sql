-- ============================================
-- MULTIPLAYER & PROPOSAL SYSTEM
-- ============================================

-- Game sessions for multiplayer
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_state JSONB DEFAULT '{}',
  status TEXT DEFAULT 'waiting',
  current_turn TEXT DEFAULT 'player1',
  winner TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  invite_code TEXT UNIQUE,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'completed', 'abandoned'))
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their game sessions" ON game_sessions FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Users can create game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Users can update their game sessions" ON game_sessions FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE INDEX idx_game_sessions_player1 ON game_sessions(player1_id);
CREATE INDEX idx_game_sessions_player2 ON game_sessions(player2_id);
CREATE INDEX idx_game_sessions_invite ON game_sessions(invite_code);

-- Proposals / Purpose system
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'date',
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  email_sent BOOLEAN DEFAULT FALSE,
  CONSTRAINT valid_response CHECK (response IS NULL OR response IN ('yes', 'no', 'maybe'))
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their proposals" ON proposals FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received proposals" ON proposals FOR UPDATE USING (auth.uid() = receiver_id);

CREATE INDEX idx_proposals_sender ON proposals(sender_id);
CREATE INDEX idx_proposals_receiver ON proposals(receiver_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- Enable realtime for multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
