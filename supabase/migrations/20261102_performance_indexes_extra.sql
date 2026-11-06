-- Extra performance indexes for tables that are created outside the base
-- migration set (ad-hoc in the live Supabase project). Each statement is
-- guarded with a DO block so a missing table is skipped instead of aborting
-- the whole script.
--
-- NOTE 2026-11-06: superseded. The ad-hoc tables that exist in the live
-- project (conversations, game_stats, user_badges) are now indexed directly
-- in 20261102_performance_indexes.sql, and `proposals`, `active_sessions`,
-- `analytics_daily` were found NOT to exist in the live project, so this
-- file's remaining work is already done. Keeping the file only for history
-- - it is idempotent and safe to re-run, but a fresh project only needs
-- 20261102_performance_indexes.sql + 20261105_missed_you_entries.sql.

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
