-- ═══════════════════════════════════════════════════════════════
-- Love Dove — Relationship features, round 2
--  · birthday_sites.birthday_date (countdown + unlock-on-day)
--  · weekly_couple_leaderboard() — "Couple of the Week" RPC
--    (SECURITY DEFINER so the leaderboard can read completed
--     two-player sessions across all users; returns anonymized,
--     non-sensitive stats only: usernames, game counts, wins)
-- Idempotent. Run via the same browser setup runner.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE birthday_sites ADD COLUMN IF NOT EXISTS birthday_date DATE;

CREATE OR REPLACE FUNCTION weekly_couple_leaderboard()
RETURNS TABLE (
  player1_username TEXT,
  player2_username TEXT,
  games_played     INT,
  wins             INT,
  first_seen       TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    p1.username,
    p2.username,
    COUNT(*)::INT                                          AS games_played,
    COUNT(*) FILTER (WHERE s.winner_id IS NOT NULL)::INT  AS wins,
    MIN(s.started_at)                                      AS first_seen
  FROM game_sessions s
  JOIN profiles p1 ON p1.id = s.player1_id
  JOIN profiles p2 ON p2.id = s.player2_id
  WHERE s.player2_id IS NOT NULL            -- two-player only
    AND s.status = 'completed'
    AND s.started_at >= date_trunc('week', NOW())
  GROUP BY p1.username, p2.username, s.player1_id, s.player2_id
  ORDER BY games_played DESC, wins DESC
  LIMIT 25;
END;
$$;

-- Anyone authenticated may read the leaderboard (public stats only).
GRANT EXECUTE ON FUNCTION weekly_couple_leaderboard() TO anon, authenticated;
