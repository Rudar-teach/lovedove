-- ============================================
-- LOVE DOVE - SEED DATA (badges, tips, games_catalog)
-- Consolidated from earlier root-level schema files.
-- Run this AFTER the base + feature + birthday_sites + social_presence
-- migrations so that the tables it inserts into already exist.
-- Safe to re-run: every insert uses ON CONFLICT DO NOTHING.
-- ============================================

-- ---------- relationship_tips ----------
CREATE TABLE IF NOT EXISTS relationship_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  tip TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE relationship_tips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relationship tips readable by all" ON relationship_tips;
CREATE POLICY "Relationship tips readable by all"
  ON relationship_tips FOR SELECT
  USING (true);

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
  ('growth', 'Celebrate each other wins, no matter how small they seem.', ARRAY['celebration','win']),
  -- The chatbot keeps its tips in a hardcoded object in src/components/Chatbot.tsx,
  -- so nothing currently reads this table. These two rows add the categories the
  -- existing insert is missing, so a future query gets real data for love/together.
  ('love', 'Say one specific thing you noticed today that you like about them. Specificity beats grandness.', ARRAY['love','appreciate','notices']),
  ('love', 'Write down three things you love about them while they are asleep and share them at breakfast.', ARRAY['love','appreciate','gratitude']),
  ('together', 'Pick a shared side project neither of you is good at, and do it badly on purpose.', ARRAY['together','project','shared']),
  ('together', 'Set a recurring two-hour block where both phones charge outside the room.', ARRAY['together','time','quality'])
ON CONFLICT DO NOTHING;

-- ---------- badges ----------
-- Make sure badge_key exists even if an older run created the table without it.
ALTER TABLE badges ADD COLUMN IF NOT EXISTS badge_key TEXT UNIQUE;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

-- ---------- games_catalog ----------
CREATE TABLE IF NOT EXISTS games_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'fun',
  emoji TEXT DEFAULT '🎮',
  icon TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'easy',
  min_players INT DEFAULT 1,
  max_players INT DEFAULT 2,
  is_multiplayer BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  route_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE games_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Games catalog readable by all" ON games_catalog;
CREATE POLICY "Games catalog readable by all"
  ON games_catalog FOR SELECT
  USING (true);

INSERT INTO games_catalog (slug, name, description, category, emoji, difficulty, min_players, max_players, is_multiplayer, route_path) VALUES
  ('tictactoe', 'Tic-Tac-Toe', 'Classic tic-tac-toe for two', 'puzzle', '⭕', 'easy', 2, 2, true, '/games/tictactoe'),
  ('memory', 'Memory Match', 'Match pairs of cards together', 'puzzle', '🎴', 'easy', 2, 2, true, '/games/memory'),
  ('quiz', 'Couple Quiz', 'Test how well you know each other', 'quiz', '💡', 'medium', 2, 2, true, '/games/quiz'),
  ('wouldyourather', 'Would You Rather', 'Fun couple questions game', 'quiz', '🤔', 'easy', 2, 2, true, '/games/would-your-rather'),
  ('wordchain', 'Word Chain', 'Take turns saying words that start with the last letter', 'puzzle', '🔤', 'easy', 2, 2, true, '/games/word-chain')
ON CONFLICT (slug) DO NOTHING;

-- ---------- storage buckets ----------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('birthday-photos', 'birthday-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;
