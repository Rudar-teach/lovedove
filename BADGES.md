# Badges & Achievements System

Love Dove rewards couples for playing together with a rich badge system.

## How It Works

Every time a couple completes a game session:
- The session is recorded in `game_sessions` table
- A result entry is added in `game_results` for each player
- Activity is logged in `activity_log`
- Any newly-earned badges are awarded

## Available Badges

| Badge | ID | Description | Requirement |
|-------|-----|-------------|-------------|
| First Steps | first_steps | Completed first game together | 1 game completed |
| Game Lovers | game_lovers | Played 10 games together | 10 games completed |
| Masters | masters | Played 50 games together | 50 games completed |
| Legends | legends | Played 100 games together | 100 games completed |
| Early Birds | early_birds | Played 5 morning games | 5 sessions before 9AM |
| Night Owls | night_owls | Played 5 night games | 5 sessions after 11PM |
| Marathon | marathon | 10 hours played together | 36000 seconds total |
| Speedsters | speedsters | 5-hour play streak | 18000 seconds in 7 days |
| Weekend Warriors | weekend_warriors | Played every weekend for a month | 4 weekends |
| Memory Masters | memory_masters | Completed Memory Match 10x | 10 Memory Match wins |
| Tic Tac Pro | tic_tac_pro | Won Tic Tac Toe 5x | 5 wins |
| Hearts Champion | hearts_champion | Won Hearts 10x | 10 Hearts wins |
| Snake Master | snake_master | Score 50+ in Snake | High score >= 50 |
| 2048 Master | 2048_master | Reached 2048 in 2048 | Tile >= 2048 |
| Quiz Whiz | quiz_whiz | Score 100% on Couple Quiz | Perfect score |
| True Love | true_love | 30-day streak playing together | Played 30 consecutive days |
| Soulmates | soulmates | 100 hours played together | 360000 seconds total |

## Database Tables

### `achievements`
- `id` (uuid) — Unique ID
- `name` (text) — Badge name
- `description` (text) — What it means
- `icon` (text) — Emoji icon
- `requirement_type` (text) — games_played, time_played, consecutive_days, etc.
- `requirement_value` (int) — Threshold
- `game_slug` (text, optional) — Game-specific badge
- `rarity` (text) — common, rare, epic, legendary
- `created_at` (timestamp)

### `user_achievements`
- `id` (uuid) — Unique ID
- `user_id` (uuid) — Who earned it
- `achievement_id` (uuid) — Which badge
- `earned_at` (timestamp) — When they got it
- `session_id` (uuid) — Which game session earned it

### `activity_log`
- `id` (uuid) — Unique ID
- `user_id` (uuid) — Who played
- `session_id` (uuid) — Game session
- `game_slug` (text) — Which game
- `game_name` (text) — Display name
- `duration_seconds` (int) — How long they played
- `result` (text) — win, loss, draw
- `score` (int, optional) — Score achieved
- `played_at` (timestamp) — When

### `game_stats`
- `id` (uuid) — Unique ID
- `user_id` (uuid) — Player
- `game_slug` (text) — Game identifier
- `total_sessions` (int) — Games played
- `total_wins` (int) — Games won
- `total_losses` (int) — Games lost
- `total_time_played` (int) — Total seconds
- `best_score` (int) — Best score ever
- `last_played` (timestamp) — Most recent play
