-- ============================================
-- LOVE DOVE - FINAL SAFE MIGRATION
-- This is IDEMPOTENT - safe to run multiple times
-- Copy ALL of this and paste into Supabase SQL Editor
-- ============================================

-- ============ ADD MISSING COLUMNS TO EXISTING TABLES ============

-- Fix profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'pink';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix matches (add columns that might be missing)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_reasons TEXT[];
ALTER TABLE matches ADD COLUMN IF NOT EXISTS user1_accepted BOOLEAN DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS user2_accepted BOOLEAN DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix messages (add columns that might be missing)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============ CREATE MISSING TABLES ============

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

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

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

CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

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

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

CREATE TABLE IF NOT EXISTS login_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ ENABLE RLS ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_tracking ENABLE ROW LEVEL SECURITY;

-- ============ DROP OLD POLICIES ============
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users view matches" ON matches;
  DROP POLICY IF EXISTS "Users create matches" ON matches;
  DROP POLICY IF EXISTS "Users update matches" ON matches;
  DROP POLICY IF EXISTS "Users view messages" ON messages;
  DROP POLICY IF EXISTS "Users send messages" ON messages;
  DROP POLICY IF EXISTS "Users view conversations" ON conversations;
  DROP POLICY IF EXISTS "Users create conversations" ON conversations;
  DROP POLICY IF EXISTS "Users manage preferences" ON partner_preferences;
  DROP POLICY IF EXISTS "Users manage whatsapp" ON whatsapp_numbers;
  DROP POLICY IF EXISTS "Users manage chatbot" ON chatbot_conversations;
  DROP POLICY IF EXISTS "Users manage game stats" ON game_stats;
  DROP POLICY IF EXISTS "Badges readable by all" ON badges;
  DROP POLICY IF EXISTS "Users manage own badges" ON user_badges;
  DROP POLICY IF EXISTS "Players manage sessions" ON game_sessions;
  DROP POLICY IF EXISTS "Users manage notifications" ON notifications;
  DROP POLICY IF EXISTS "Users manage friends" ON friends;
  DROP POLICY IF EXISTS "Users manage birthday sites" ON birthday_sites;
  DROP POLICY IF EXISTS "Public birthday sites viewable" ON birthday_sites;
  DROP POLICY IF EXISTS "Users manage achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Users view login tracking" ON login_tracking;
  DROP POLICY IF EXISTS "Users insert login tracking" ON login_tracking;
END $$;

-- ============ CREATE POLICIES ============
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin = true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users view matches" ON matches FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users create matches" ON matches FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users update matches" ON matches FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users view messages" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR
  conversation_id IN (SELECT id FROM conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid())
);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users view conversations" ON conversations FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "Users create conversations" ON conversations FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users manage preferences" ON partner_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage whatsapp" ON whatsapp_numbers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage chatbot" ON chatbot_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage game stats" ON game_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Badges readable by all" ON badges FOR SELECT USING (true);
CREATE POLICY "Users manage own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Players manage sessions" ON game_sessions FOR ALL USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Users manage notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users manage birthday sites" ON birthday_sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public birthday sites viewable" ON birthday_sites FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view login tracking" ON login_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert login tracking" ON login_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(badge_key);
CREATE INDEX IF NOT EXISTS idx_game_sessions_players ON game_sessions(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at);
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id, friend_id);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tracking_user ON login_tracking(user_id, logged_in_at);

-- ============ SEED DATA ============
INSERT INTO relationship_tips (category, tip, keywords) VALUES
  ('communication', 'Try the 20-minute rule: sit together and talk without phones for 20 minutes every day.', ARRAY['talk','communication']),
  ('communication', 'Use "I feel" statements instead of "You always" accusations.', ARRAY['feel','argument','fight']),
  ('date_ideas', 'Cook a meal together that neither of you has ever made before.', ARRAY['date','dinner','cook']),
  ('date_ideas', 'Have a picnic indoors under a blanket fort with fairy lights.', ARRAY['date','romantic','fun']),
  ('trust', 'Small acts of reliability build trust faster than grand gestures.', ARRAY['trust','honest']),
  ('conflict', 'Take a 10-minute break before continuing a heated discussion.', ARRAY['fight','argument','angry']),
  ('intimacy', 'Write love notes and hide them in places your partner will find them.', ARRAY['love','romantic','note']),
  ('fun', 'Have a game night where the loser does the dishes or gives a massage.', ARRAY['game','fun','play']),
  ('growth', 'Share one personal goal with your partner and ask for their support.', ARRAY['goal','dream','future']),
  ('growth', 'Celebrate each other wins, no matter how small they seem.', ARRAY['celebration','win'])
ON CONFLICT DO NOTHING;

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

INSERT INTO games_catalog (slug, name, description, category, emoji, difficulty, min_players, max_players, is_multiplayer, route_path) VALUES
  ('tictactoe', 'Tic-Tac-Toe', 'Classic tic-tac-toe for two', 'puzzle', '⭕', 'easy', 2, 2, true, '/games/tictactoe'),
  ('memory', 'Memory Match', 'Match pairs of cards together', 'puzzle', '🎴', 'easy', 2, 2, true, '/games/memory'),
  ('quiz', 'Couple Quiz', 'Test how well you know each other', 'quiz', '💡', 'medium', 2, 2, true, '/games/quiz'),
  ('wouldyourather', 'Would You Rather', 'Fun couple questions game', 'quiz', '🤔', 'easy', 2, 2, true, '/games/would-your-rather'),
  ('wordchain', 'Word Chain', 'Take turns saying words that start with the last letter', 'puzzle', '🔤', 'easy', 2, 2, true, '/games/word-chain')
ON CONFLICT (slug) DO NOTHING;
