-- ============================================
-- Love Dove Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (User profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  cover_image_url TEXT,
  partner_id UUID REFERENCES profiles(id),
  bio TEXT,
  date_of_birth DATE,
  anniversary_date DATE,
  theme_color TEXT DEFAULT 'pink',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_partner ON profiles(partner_id);

-- ============================================
-- BIRTHDAY SITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT,
  photos TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'pink',
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_birthday_sites_slug ON birthday_sites(slug);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites(user_id);

-- ============================================
-- FRIEND REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type TEXT NOT NULL CHECK (game_type IN ('tictactoe', 'memory', 'quiz', 'wouldyourather', 'wordchain')),
  player1 UUID NOT NULL REFERENCES profiles(id),
  player2 UUID REFERENCES profiles(id),
  current_turn UUID,
  game_state JSONB DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  winner_id UUID REFERENCES profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_players ON game_sessions(player1, player2);

-- ============================================
-- GAME STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username, theme_color)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'pink'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  total_playtime INTEGER;
  total_wins INTEGER;
  badge_record RECORD;
BEGIN
  -- Calculate total playtime
  SELECT SUM(total_time_played) INTO total_playtime FROM game_stats WHERE user_id = NEW.user_id;

  -- Check time-based badges
  FOR badge_record IN SELECT * FROM badges WHERE requirement_type = 'playtime_hours' LOOP
    IF total_playtime >= (badge_record.requirement_value * 3600) THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE BADGES
-- ============================================
INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
VALUES
  ('First Game', 'Play your first game together', '🎮', 'games_played', 1),
  ('10 Hours Together', 'Spend 10 hours playing games', '⏰', 'playtime_hours', 10),
  ('50 Hours Together', 'Spend 50 hours playing games', '🔥', 'playtime_hours', 50),
  ('100 Hours Together', 'Spend 100 hours playing games', '💫', 'playtime_hours', 100),
  ('First Win', 'Win your first game', '🏆', 'wins', 1),
  ('10 Wins', 'Win 10 games', '👑', 'wins', 10),
  ('Perfect Match', 'Get 100% match on couple quiz', '💕', 'quiz_perfect', 1),
  ('Memory Master', 'Win a memory match game', '🧠', 'memory_wins', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- STORAGE SETUP (Run in Supabase Storage section)
-- Create bucket: photos (public)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);

CREATE POLICY "Birthday sites are viewable by everyone if public" ON birthday_sites FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create birthday sites" ON birthday_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own birthday sites" ON birthday_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own birthday sites" ON birthday_sites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their friend requests" ON friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send friend requests" ON friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their friend requests" ON friend_requests FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Users can view game sessions they are in" ON game_sessions FOR SELECT USING (auth.uid() = player1 OR auth.uid() = player2);
CREATE POLICY "Users can create game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = player1);
CREATE POLICY "Users can update their game sessions" ON game_sessions FOR UPDATE USING (auth.uid() = player1 OR auth.uid() = player2);

CREATE POLICY "Users can view their game stats" ON game_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their game stats" ON game_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their game stats" ON game_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Badges are viewable by all" ON badges FOR SELECT USING (true);
CREATE POLICY "Users can view their badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can receive badges" ON user_badges FOR INSERT WITH CHECK (true);
