-- Performance indexes for Love Dove's hot query paths.
-- Idempotent: every CREATE INDEX IF NOT EXISTS is safe to re-run.
-- Apply via the Supabase SQL editor or `supabase db push`.
--
-- This file only indexes tables that are defined in the migrations dir.
-- Tables that were created ad-hoc (conversations, proposals, game_stats,
-- active_sessions, analytics_daily, user_badges) live in
-- 20261102_performance_indexes_extra.sql so a missing one there can't
-- abort these.

-- Friend graph: lookups by user (match pages, friend lists)
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches (user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches (user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status);

-- Friend requests: one-side fetches + accepted lookups
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests (status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests (from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests (to_user_id);

-- Notifications: unread inbox per user, most-recent-first
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read = false;

-- Game session history: per-player, most-recent-first
CREATE INDEX IF NOT EXISTS idx_game_sessions_p1 ON game_sessions (player1_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_p2 ON game_sessions (player2_id, started_at DESC);

-- Presence scans used by admin analytics
CREATE INDEX IF NOT EXISTS idx_active_users_seen ON active_users (last_active DESC);

-- Games catalog: featured + popularity ordering (games page hero + top lists)
CREATE INDEX IF NOT EXISTS idx_games_catalog_featured ON games_catalog (is_featured DESC, play_count DESC);

-- Birthday sites: public lookups by slug + per-owner listing
CREATE INDEX IF NOT EXISTS idx_birthday_sites_slug ON birthday_sites (slug);
CREATE INDEX IF NOT EXISTS idx_birthday_sites_user ON birthday_sites (user_id, created_at DESC);

-- Messages: date-range scans (admin analytics)
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
