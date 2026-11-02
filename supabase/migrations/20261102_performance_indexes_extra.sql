-- Extra performance indexes for tables that are created outside the base
-- migration set (ad-hoc in the live Supabase project). Each statement is
-- guarded with a DO block so a missing table is skipped instead of aborting
-- the whole script.
--
-- Apply this in the same Supabase project where these tables exist.

DO $$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_u1 ON conversations (user1_id, last_message_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_u2 ON conversations (user2_id, last_message_at DESC);
  END IF;

  IF to_regclass('public.proposals') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_proposals_to ON proposals (to_user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals (status);
  END IF;

  IF to_regclass('public.game_stats') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats (user_id, last_played DESC);
  END IF;

  IF to_regclass('public.user_badges') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges (user_id, earned_at DESC);
  END IF;

  IF to_regclass('public.active_sessions') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON active_sessions (last_seen DESC);
  END IF;

  IF to_regclass('public.analytics_daily') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily (date);
  END IF;
END $$;
