-- LOVE DOVE DATABASE SETUP
-- Run this entire SQL script in Supabase SQL Editor to set up all tables
-- Go to: Supabase Dashboard > SQL Editor > Paste this > Run

-- ============================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  bio TEXT,
  avatar_url TEXT,
  partner_id UUID REFERENCES profiles(id),
  theme_color TEXT DEFAULT 'pink',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMES CATALOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS games_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  route_path TEXT NOT NULL,
  min_players INTEGER DEFAULT 2,
  max_players INTEGER DEFAULT 2,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_type TEXT NOT NULL,
  player1_id UUID REFERENCES auth.users(id) NOT NULL,
  player2_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  game_state JSONB,
  winner_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- GAME STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_type TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0,
  last_played TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- ============================================
-- FRIENDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  friend_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) NOT NULL,
  user2_id UUID REFERENCES auth.users(id) NOT NULL,
  game_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  match_score JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT CHECK (requirement_type IN ('wins', 'total_time', 'games_played', 'streak')),
  requirement_value INTEGER,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- BIRTHDAY SITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  message TEXT,
  theme TEXT DEFAULT 'romantic',
  slug TEXT UNIQUE NOT NULL,
  photos TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP TIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS relationship_tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tip TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT GAMES
-- ============================================
INSERT INTO games_catalog (name, slug, description, icon, route_path, min_players, max_players, difficulty) VALUES
  ('Tic-Tac-Toe', 'tictactoe', 'Classic game of X and O. Take turns with your partner!', '⭕', '/games/tictactoe', 2, 2, 'easy'),
  ('Memory Match', 'memory', 'Match pairs of romantic icons together!', '🎴', '/games/memory', 2, 2, 'easy'),
  ('Couple Quiz', 'quiz', 'Test how well you know each other!', '💡', '/games/quiz', 2, 2, 'medium'),
  ('Would You Rather', 'wouldyourather', 'Choose between fun options together!', '🤔', '/games/would-your-rather', 2, 2, 'easy'),
  ('Word Chain', 'wordchain', 'Take turns saying words that start with the last letter!', '🔤', '/games/word-chain', 2, 2, 'medium')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INSERT DEFAULT BADGES
-- ============================================
INSERT INTO badges (name, description, icon, requirement_type, requirement_value, rarity) VALUES
  ('First Steps', 'Play your first game together', '🌱', 'games_played', 1, 'common'),
  ('Game Master', 'Win 5 games', '🏆', 'wins', 5, 'rare'),
  ('Dedicated Players', 'Play 10 games', '💪', 'games_played', 10, 'rare'),
  ('Time Together', 'Play for 1 hour total', '⏱️', 'total_time', 3600, 'common'),
  ('Champion', 'Win 20 games', '👑', 'wins', 20, 'epic'),
  ('Veteran', 'Play 50 games', '⭐', 'games_played', 50, 'epic'),
  ('Legendary', 'Play for 10 hours together', '🌟', 'total_time', 36000, 'legendary'),
  ('Perfect Match', 'Win 50 games', '💎', 'wins', 50, 'legendary')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT RELATIONSHIP TIPS
-- ============================================
INSERT INTO relationship_tips (tip, category) VALUES
  ('The best relationships are built on trust, communication, and laughter.', 'communication'),
  ('Small gestures of love create the biggest memories.', 'love'),
  ('Listening is the best way to show someone you care.', 'communication'),
  ('Every day is a new chance to make your partner smile.', 'happiness'),
  ('Quality time is the best gift you can give.', 'quality-time'),
  ('Laugh together, stay together!', 'fun'),
  ('A healthy relationship requires two people who choose each other every day.', 'commitment'),
  ('Appreciate the little things - they become the big things.', 'gratitude')
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(player1_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user_id ON birthday_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_tips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: Users can read all, edit only their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game sessions
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Users can create game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = player1_id);

-- Game stats
CREATE POLICY "Users can view their own stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON game_stats
  FOR ALL USING (auth.uid() = user_id);

-- Friends
CREATE POLICY "Users can view their own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Badges
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Birthday sites
CREATE POLICY "Public sites are viewable by everyone" ON birthday_sites
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create their own sites" ON birthday_sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sites" ON birthday_sites
  FOR UPDATE USING (auth.uid() = user_id);

-- Relationship tips
CREATE POLICY "Tips are viewable by everyone" ON relationship_tips
  FOR SELECT USING (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('birthday-photos', 'birthday-photos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Birthday photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'birthday-photos');
CREATE POLICY "Users can upload birthday photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'birthday-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION increment_view(site_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE birthday_sites SET view_count = view_count + 1 WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DONE! 🎉
-- ============================================
-- Now enable Email auth in Supabase Dashboard:
-- Authentication > Providers > Email > Enable
-- Then your app is ready!
