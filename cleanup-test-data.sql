-- ═══════════════════════════════════════════════════════════════
-- Love Dove — ONE-TIME CLEANUP of diagnostic / e2e test accounts.
-- Removes profile rows (+ their dependent rows) for accounts created
-- from throwaway domains used ONLY by the tooling:
--     *@example.com, *@lovedove-selftest.local, *@lovedove-e2e.local
-- A real user's email can never match these.
-- Fault-tolerant: each statement is guarded, so a missing table/column
-- never blocks the important ones.
-- Run via:  node scripts/supabase-db-setup.mjs cleanup-test-data.sql
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  tu RECORD;
  ids UUID[];
BEGIN
  SELECT array_agg(id) INTO ids FROM profiles
  WHERE email LIKE '%@example.com'
     OR email LIKE '%@lovedove-selftest.local'
     OR email LIKE '%@lovedove-e2e.local';
  IF NOT (ids IS NULL OR ids = ARRAY[]::UUID[]) THEN
    BEGIN DELETE FROM play_invites    WHERE from_user_id = ANY (ids) OR to_user_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'play_invites: %', SQLERRM; END;
    BEGIN DELETE FROM friend_requests WHERE sender_id = ANY (ids) OR receiver_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'friend_requests: %', SQLERRM; END;
    BEGIN DELETE FROM notifications   WHERE user_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'notifications: %', SQLERRM; END;
    BEGIN DELETE FROM matches         WHERE user1_id = ANY (ids) OR user2_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'matches: %', SQLERRM; END;
    BEGIN DELETE FROM conversations   WHERE user1_id = ANY (ids) OR user2_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'conversations: %', SQLERRM; END;
    BEGIN DELETE FROM game_sessions   WHERE user_id = ANY (ids) OR player1_id = ANY (ids) OR player2_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'game_sessions: %', SQLERRM; END;
    BEGIN DELETE FROM game_stats      WHERE user_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'game_stats: %', SQLERRM; END;
    BEGIN DELETE FROM user_badges     WHERE user_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'user_badges: %', SQLERRM; END;
    BEGIN DELETE FROM login_tracking  WHERE user_id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'login_tracking: %', SQLERRM; END;
    BEGIN DELETE FROM profiles        WHERE id = ANY (ids); EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'profiles: %', SQLERRM; END;
    RAISE NOTICE 'Cleaned up % test profile(s)', array_length(ids, 1);
  ELSE
    RAISE NOTICE 'No test profiles found — nothing to clean.';
  END IF;
END $$;

SELECT count(*) AS remaining_profiles FROM profiles;
