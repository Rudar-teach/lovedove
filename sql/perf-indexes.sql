-- ═══════════════════════════════════════════════════════════════════
-- Love Dove — performance indexes
-- Every index is guarded so the file is safe to run on any schema
-- (missing ad-hoc tables/columns are skipped, never fatal).
-- Run: node scripts/supabase-db-setup.mjs sql/perf-indexes.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── Friend requests: the hottest social query is
--    "sender_id = me OR receiver_id = me". The receiver side has an
--    index; the sender side was a seq scan. ──────────────────────────
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_friend_requests_sender
    ON friend_requests(sender_id, status);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Friend messages: directional ORs (chat threads + the ranking poll)
--    don't use the LEAST/GREATEST expression index. ─────────────────
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_friend_messages_sender_recipient
    ON friend_messages(sender_id, recipient_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_friend_messages_recipient_sender
    ON friend_messages(recipient_id, sender_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Matches: partner resolution orders by created_at DESC ───────────
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_matches_user1_created
    ON matches(user1_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_matches_user2_created
    ON matches(user2_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Profiles: exact username lookups (signup check, add-by-username)
--    aren't served by the lower(username) expression index ───────────
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_username
    ON profiles(username);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Find-partner: the candidate pool filters search_visible=true ────
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_search_visible
    ON profiles(search_visible) WHERE search_visible = true;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Ad-hoc tables/columns: create only when they exist ─────────────
DO $$ BEGIN
  IF to_regclass('public.messages') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM pg_attribute
       WHERE attrelid = 'public.messages'::regclass
         AND attname = 'conversation_id'
         AND NOT attisdropped
     ) THEN
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id, created_at);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF to_regclass('public.user_achievements') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user
      ON user_achievements(user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Notification reads: unread filtering on /notifications ──────────
DO $$ BEGIN
  IF to_regclass('public.notifications') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
      ON notifications(user_id, created_at DESC);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
