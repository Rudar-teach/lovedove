# Supabase Schema - Complete (Updated)

Run this in Supabase Dashboard > SQL Editor

-- ============================================
-- ADMIN USER (create this manually in Supabase Auth)
-- Email: manithakur123450@gmail.com
-- Password: Rssalaria@1826
-- After creating in Auth, run:
-- ============================================

-- Insert admin user
INSERT INTO profiles (id, username, full_name, email, bio, is_admin, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'Admin',
  'manithakur123450@gmail.com',
  'Platform Administrator',
  true,
  NOW()
);

-- ============================================
-- EXISTING TABLES (from previous schema)
-- ============================================

-- Profiles (updated with matching fields)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  looking_for TEXT CHECK (looking_for IN ('male', 'female', 'both', 'prefer_not_to_say')),
  relationship_type TEXT CHECK (relationship_type IN ('casual', 'serious', 'marriage', 'friendship', 'any')),
  interests TEXT[],
  location TEXT,
  age_preference_min INT DEFAULT 18,
  age_preference_max INT DEFAULT 100,
  partner_gender TEXT CHECK (partner_gender IN ('male', 'female', 'both', 'any')),
  partner_age_min INT DEFAULT 18,
  partner_age_max INT DEFAULT 100,
  partner_interests TEXT[],
  partner_traits TEXT[],
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats for matching
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  total_time_played INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner preferences
CREATE TABLE IF NOT EXISTS partner_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  gender_preference TEXT CHECK (gender_preference IN ('male', 'female', 'both', 'any')),
  age_min INT DEFAULT 18,
  age_max INT DEFAULT 100,
  interests TEXT[],
  relationship_goals TEXT CHECK (relationship_goals IN ('casual', 'serious', 'marriage', 'friendship', 'any')),
  location_preference TEXT,
  bio_summary TEXT,
  traits_looking_for TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_score INT DEFAULT 0,
  match_reasons TEXT[],
  user1_accepted BOOLEAN DEFAULT false,
  user2_accepted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Match notifications
CREATE TABLE IF NOT EXISTS match_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('email', 'whatsapp', 'in_app')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- WhatsApp numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT NOT NULL,
  country_code TEXT DEFAULT '+91',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji', 'game_invite')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot tips
CREATE TABLE IF NOT EXISTS relationship_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  tip TEXT NOT NULL,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games catalog
CREATE TABLE IF NOT EXISTS games_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('puzzle', 'strategy', 'action', 'quiz', 'romantic', 'multiplayer', 'creative')),
  emoji TEXT DEFAULT '🎮',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  min_players INT DEFAULT 2,
  max_players INT DEFAULT 2,
  is_multiplayer BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  play_count INT DEFAULT 0,
  route_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin analytics (materialized daily)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  games_played INT DEFAULT 0,
  matches_made INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  peak_hour INT,
  peak_users INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions tracking (for real-time active users)
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  page_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin = true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their matches" ON matches FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users can update their matches" ON matches FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR
  conversation_id IN (SELECT id FROM conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users manage own preferences" ON partner_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own whatsapp" ON whatsapp_numbers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chatbot" ON chatbot_conversations FOR ALL USING (auth.uid() = user_id);

-- Insert sample relationship tips
INSERT INTO relationship_tips (category, tip, keywords) VALUES
  ('communication', 'Try the 20-minute rule: sit together and talk without phones for 20 minutes every day.', ARRAY['talk','communication','conversation','speak']),
  ('communication', 'Use "I feel" statements instead of "You always" accusations. It changes everything.', ARRAY['feel','argument','fight','angry']),
  ('communication', 'When your partner is sharing, just listen. Don''t jump to solutions unless asked.', ARRAY['listen','share','talk','problem']),
  ('date_ideas', 'Cook a meal together that neither of you has ever made before.', ARRAY['date','dinner','cook','food','idea']),
  ('date_ideas', 'Have a picnic indoors under a blanket fort with fairy lights.', ARRAY['date','romantic','idea','fun','home']),
  ('date_ideas', 'Take turns picking a movie you both haven''t seen, rate them afterwards.', ARRAY['date','movie','watch','netflix']),
  ('trust', 'Small acts of reliability build trust faster than grand gestures.', ARRAY['trust','honest','secret','lie']),
  ('trust', 'Share one vulnerability with your partner today. It deepens connection.', ARRAY['trust','open','vulnerable','deep']),
  ('conflict', 'Take a 10-minute break before continuing a heated discussion. Cool heads prevail.', ARRAY['fight','argument','angry','conflict','fight']),
  ('conflict', 'Remember: you''re on the same team, not opposing teams.', ARRAY['fight','argument','angry','conflict']),
  ('intimacy', 'Write love notes and hide them in places your partner will find them.', ARRAY['love','romantic','note','surprise']),
  ('intimacy', 'Plan a surprise date night — the effort itself is a gift.', ARRAY['date','surprise','romantic','gift']),
  ('fun', 'Have a game night where the loser does the dishes or gives a massage.', ARRAY['game','fun','play','laugh']),
  ('fun', 'Recreate your first date as closely as possible.', ARRAY['date','memory','first','anniversary']),
  ('growth', 'Share one personal goal with your partner and ask for their support.', ARRAY['goal','dream','future','plan','career']),
  ('growth', 'Celebrate each other''s wins, no matter how small they seem.', ARRAY['celebrate','win','success','proud']);

-- Insert sample games catalog
INSERT INTO games_catalog (slug, name, description, category, emoji, difficulty, min_players, max_players, is_featured, route_path) VALUES
  ('memory-match', 'Memory Match', 'Match pairs of romantic cards! Test your memory together.', 'puzzle', '💕', 'easy', 2, 2, true, '/games/memory'),
  ('tic-tac-toe', 'Tic Tac Toe', 'Classic X and O with a romantic twist!', 'strategy', '❌', 'easy', 2, 2, true, '/games/tictactoe'),
  ('2048', '2048 Love', 'Slide and merge numbers together. Reach 2048!', 'puzzle', '🔢', 'medium', 1, 2, true, '/games/game2048'),
  ('snake', 'Love Snake', 'Guide the snake to collect hearts!', 'action', '🐍', 'easy', 1, 2, true, '/games/snake'),
  ('flappy-heart', 'Flappy Heart', 'Flap through obstacles with your love!', 'action', '💖', 'medium', 1, 2, true, '/games/flappyheart'),
  ('hangman', 'Love Hangman', 'Guess romantic words before the hangman appears!', 'quiz', '💬', 'medium', 2, 2, false, '/games/hangman'),
  ('pong', 'Love Pong', 'Classic paddle game with hearts!', 'action', '🏓', 'medium', 2, 2, true, '/games/pong'),
  ('cupids-arrow', "Cupid's Arrow", 'Shoot arrows and win hearts!', 'action', '🏹', 'medium', 1, 2, false, '/games/cupidsarrow'),
  ('would-you-rather', 'Would You Rather', 'Tough romantic choices for couples!', 'quiz', '🤔', 'easy', 2, 2, true, '/games/wouldyourather'),
  ('truth-or-dare', 'Truth or Dare', 'Spicy questions and fun dares for couples!', 'romantic', '🎯', 'easy', 2, 2, true, '/games/truthordare'),
  ('couple-quiz', 'Couple Quiz', 'How well do you know each other?', 'quiz', '💡', 'easy', 2, 2, true, '/games/couplequiz'),
  ('love-song-quiz', 'Love Song Quiz', 'Guess the romantic song titles!', 'quiz', '🎵', 'medium', 2, 2, false, '/games/lovesongquiz'),
  ('love-calculator', 'Love Calculator', 'Calculate your love compatibility percentage!', 'quiz', '🔢', 'easy', 2, 2, false, '/games/lovecalculator'),
  ('compatibility-test', 'Compatibility Test', 'Deep test of how well you match!', 'quiz', '💘', 'medium', 2, 2, false, '/games/compatibilitytest'),
  ('couple-memory', 'Couple Memory', 'Match your shared memories!', 'puzzle', '📸', 'easy', 2, 2, false, '/games/couplememory'),
  ('emoji-story', 'Emoji Story', 'Tell a love story using only emojis!', 'creative', '📖', 'easy', 2, 2, false, '/games/emojistory'),
  ('love-riddles', 'Love Riddles', 'Solve romantic riddles together!', 'quiz', '🧩', 'easy', 2, 2, false, '/games/loveriddles'),
  ('love-maze', 'Love Maze', 'Navigate through a maze of love!', 'puzzle', '🧩', 'medium', 1, 2, false, '/games/lovemaze'),
  ('love-letters', 'Love Letters', 'Write and guess romantic letters!', 'creative', '💌', 'easy', 2, 2, false, '/games/loveletters'),
  ('hearts', 'Hearts Card Game', 'Classic card game with a romantic theme!', 'strategy', '❤️', 'medium', 2, 4, true, '/games/hearts'),
  ('couple-pictionary', 'Couple Pictionary', 'Draw and guess romantic words!', 'creative', '🎨', 'easy', 2, 2, false, '/games/couplepictionary'),
  ('speed-date', 'Speed Date', 'Quick-fire questions for couples!', 'quiz', '⚡', 'easy', 2, 2, false, '/games/speeddate'),
  ('trivia-battle', 'Trivia Battle', 'Battle it out with love trivia!', 'quiz', '⚔️', 'medium', 2, 2, false, '/games/triviabattle'),
  ('love-typing', 'Love Typing Race', 'Type romantic words as fast as you can!', 'action', '⌨️', 'easy', 1, 2, false, '/games/lovetyping'),
  ('couple-bucketlist', 'Couple Bucket List', 'Share and plan your dreams together!', 'romantic', '🌍', 'easy', 2, 2, false, '/games/couplebucketlist'),
  ('anniversary-planner', 'Anniversary Planner', 'Plan the perfect anniversary!', 'romantic', '💍', 'easy', 2, 2, false, '/games/anniversaryplanner');
