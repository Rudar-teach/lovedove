-- ═══════════════════════════════════════════════════════════════
-- Love Dove — new game catalog entries (5 suggestions)
-- Idempotent (ON CONFLICT DO NOTHING by slug).
-- Run: node scripts/supabase-db-setup.mjs sql/new-games-catalog.sql
--
-- NOTE: games_catalog inserts are service-role only (RLS), so this
-- statement needs the dashboard SQL editor path — the setup runner
-- runs it as the logged-in project, which satisfies that.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO games_catalog
  (slug, name, description, category, emoji, difficulty, min_players, max_players, is_multiplayer, route_path, is_active)
VALUES
  ('love_duo_quiz',  'Love Duo Quiz',    'Co-op chemistry quiz: pick the answer that feels like US. No losing, just a growing meter.', 'romantic', '💞', 'easy', 1, 2, true, '/games/love_duo_quiz', true),
  ('love_poker',     'Love Poker',       'Couple poker with a twist: you play AGAINST each other, but the deck is loaded with relationship hands.', 'party', '♠️', 'medium', 2, 2, true, '/games/love_poker', true),
  ('truth_or_dare_live', 'Truth or Dare Live', 'Real-time turn-based: take turns drawing cards; skip twice and you owe a dare.', 'party', '🎯', 'easy', 2, 2, true, '/games/truth_or_dare_live', true),
  ('emoji_charades', 'Emoji Charades',  'One player types the movie/song in emojis, the other guesses. Alternating rounds, live score.', 'party', '🎭', 'medium', 2, 2, true, '/games/emoji_charades', true),
  ('date_roulette',  'Date Roulette',   'Spin for a random mini-date (budget, duration, vibe). Couples compete to plan the best one.', 'romantic', '🎡', 'easy', 2, 4, true, '/games/date_roulette', true)
ON CONFLICT DO NOTHING;
