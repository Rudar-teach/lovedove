-- Love Dove: combined pending migrations (refreshed 2026-11-06, adapted to live schema)
-- = 20261102_performance_indexes.sql
-- Performance indexes for Love Dove's hot query paths.
-- Idempotent: every CREATE INDEX IF NOT EXISTS is safe to re-run.
-- Apply via the Supabase SQL editor or `supabase db push`.
--
-- APPLIED TO THE LIVE PRODUCTION DATABASE on 2026-11-06, adapted to the
-- actual live schema (verified with information_schema before running):
--   * friend_requests does not exist (friend flow uses `friends`) - skipped
--   * games_catalog has no is_featured/play_count columns - indexed on
--     (category, route_path) instead
--   * ad-hoc tables (conversations, game_stats, user_badges) are indexed
--     here directly - they exist in the live project

-- Friend graph: lookups by user (match pages, friend lists)
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches (user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches (user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status);

-- Notifications: unread inbox per user, most-recent-first
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read = false;

-- Game session history: per-player, most-recent-first
CREATE INDEX IF NOT EXISTS idx_game_sessions_p1 ON game_sessions (player1_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_p2 ON game_sessions (player2_id, started_at DESC);

-- Presence scans used by admin analytics
CREATE INDEX IF NOT EXISTS idx_active_users_seen ON active_users (last_active DESC);

-- Games catalog: browsing by category / route lookups
CREATE INDEX IF NOT EXISTS idx_games_catalog_browse ON games_catalog (category, route_path);

-- Birthday sites: public lookups by slug + per-owner listing
CREATE INDEX IF NOT EXISTS idx_birthday_sites_slug ON birthday_sites (slug);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites (user_id, created_at DESC);

-- Messages: date-range scans (admin analytics)
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);

-- Ad-hoc tables that exist in the live project
CREATE INDEX IF NOT EXISTS idx_conversations_u1 ON conversations (user1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_u2 ON conversations (user2_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats (user_id, last_played DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges (user_id, earned_at DESC);

-- = 20261102_performance_indexes_extra.sql (superseded - keep for history)
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

-- = 20261105_missed_you_entries.sql
-- "Missed You" feature: private notes between a couple, revealed on the
-- partner's next visit. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS missed_you_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revealed_at TIMESTAMPTZ,
  CHECK (sender_id <> partner_id)
);

CREATE INDEX IF NOT EXISTS idx_missed_you_partner_unread
  ON missed_you_entries (partner_id, created_at DESC)
  WHERE revealed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_missed_you_sender
  ON missed_you_entries (sender_id, created_at DESC);

ALTER TABLE missed_you_entries ENABLE ROW LEVEL SECURITY;

-- Only the two people involved may see these.
DO $$ BEGIN
  CREATE POLICY "Missed-you entries visible to the couple"
    ON missed_you_entries FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = partner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Missed-you entries writable by the sender"
    ON missed_you_entries FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Receivers mark entries revealed"
    ON missed_you_entries FOR UPDATE
    USING (auth.uid() = partner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
