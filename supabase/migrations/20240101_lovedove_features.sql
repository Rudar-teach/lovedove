-- Love Dove Database Migration
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================
-- 1. LOGIN TRACKING (for admin analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS login_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_tracking_user ON login_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tracking_date ON login_tracking(logged_in_at);

-- ============================================
-- 2. MATCH PREFERENCES (Find a Partner)
-- ============================================
CREATE TABLE IF NOT EXISTS match_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  my_gender TEXT NOT NULL CHECK (my_gender IN ('male', 'female', 'other')),
  looking_for TEXT NOT NULL CHECK (looking_for IN ('male', 'female', 'other')),
  partner_gender TEXT NOT NULL CHECK (partner_gender IN ('male', 'female', 'other', 'any')),
  preferred_age_min INTEGER DEFAULT 18,
  preferred_age_max INTEGER DEFAULT 60,
  partner_type TEXT NOT NULL,
  partner_type_emoji TEXT DEFAULT '💑',
  description TEXT,
  interests TEXT[] DEFAULT '{}',
  location TEXT,
  looking_for_relationship TEXT DEFAULT 'serious',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MATCHES (successful pairings)
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_preference JSONB,
  user2_preference JSONB,
  match_score INTEGER DEFAULT 0,
  match_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'connected')),
  notified_user1 BOOLEAN DEFAULT false,
  notified_user2 BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================
-- 4. MESSAGES (WhatsApp-style chat)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji', 'system')),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- ============================================
-- 5. CHATBOT CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Relationship Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CHATBOT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ============================================
-- 8. ACTIVE USERS TRACKING (for real-time count)
-- ============================================
CREATE TABLE IF NOT EXISTS active_users (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  is_online BOOLEAN DEFAULT true
);

-- ============================================
-- ENABLE REALTIME FOR MESSAGES AND NOTIFICATIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Login tracking
ALTER TABLE login_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own login tracking" ON login_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert login tracking" ON login_tracking
  FOR INSERT WITH CHECK (true);

-- Match preferences
ALTER TABLE match_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON match_preferences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view others preferences for matching" ON match_preferences
  FOR SELECT USING (true);

-- Matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create matches" ON matches
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM matches WHERE id = messages.match_id AND (user1_id = auth.uid() OR user2_id = auth.uid()))
  );
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Chatbot
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON chatbot_conversations
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations" ON chatbot_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chatbot_conversations WHERE id = chatbot_messages.conversation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can add messages to own conversations" ON chatbot_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chatbot_conversations WHERE id = chatbot_messages.conversation_id AND user_id = auth.uid())
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Active users
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active users" ON active_users
  FOR SELECT USING (true);
CREATE POLICY "Users can update own active status" ON active_users
  FOR ALL USING (auth.uid() = user_id);
