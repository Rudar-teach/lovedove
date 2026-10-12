-- ============================================
-- LOVE DOVE - MISSING TABLES MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Game stats (per user per game)
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL DEFAULT 'unknown',
  games_played INT DEFAULT 0,
  total_time_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- Badges catalog
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  requirement_type TEXT NOT NULL,
  requirement_value INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Game sessions (for multiplayer games)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL,
  player1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_turn UUID REFERENCES profiles(id),
  game_state JSONB DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  winner_id UUID REFERENCES profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('proposal_received','proposal_accepted','proposal_declined','friend_request','game_invite','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends / Friend requests
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Birthday websites
CREATE TABLE IF NOT EXISTS birthday_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'romantic',
  slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT true,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (alternative to user_badges for some game logic)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Login tracking
CREATE TABLE IF NOT EXISTS login_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(badge_key);
CREATE INDEX IF NOT EXISTS idx_game_sessions_players ON game_sessions(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at);
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id, friend_id);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tracking_user ON login_tracking(user_id, logged_in_at);

-- Seed badges
INSERT INTO badges (badge_key, name, description, icon, requirement_type, requirement_value) VALUES
  ('first_game', 'First Game', 'Played your first game', '🎮', 'games_played', 1),
  ('first_win', 'First Victory', 'Won your first game', '🏆', 'wins', 1),
  ('hour_1', '1 Hour Together', 'Played for 1 hour', '⏱️', 'total_time', 3600),
  ('hour_5', '5 Hours Together', 'Played for 5 hours', '⭐', 'total_time', 18000),
  ('hour_10', '10 Hours Together', 'Played for 10 hours! Amazing!', '💎', 'total_time', 36000),
  ('hour_24', '24 Hour Lovers', 'Played for 24 hours together!', '👑', 'total_time', 86400),
  ('game_5', 'Game Explorer', 'Played 5 different games', '🎯', 'games_played', 5),
  ('streak_3', '3 Day Streak', 'Played 3 days in a row', '🔥', 'streak_days', 3),
  ('couple_connected', 'Connected Hearts', 'Found and connected with a partner', '💕', 'partner_connected', 1)
ON CONFLICT (badge_key) DO NOTHING;

-- RLS on new tables
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own game stats" ON game_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Badges are readable by all" ON badges FOR SELECT USING (true);
CREATE POLICY "Users manage own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Players manage their sessions" ON game_sessions FOR ALL USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users manage own birthday sites" ON birthday_sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public birthday sites viewable" ON birthday_sites FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own login tracking" ON login_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own login tracking" ON login_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
