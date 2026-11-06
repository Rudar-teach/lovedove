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
