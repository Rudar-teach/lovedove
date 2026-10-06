Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
git add -A
$status = git status --short
Write-Host "Files staged: $($status.Count)"
git commit -m "feat: add 16 API routes + enhance 125 game pages with playable logic

Backend (16 new API route files):
- auth/callback - Supabase OAuth callback with profile auto-creation
- birthdays (CRUD) - create, view, delete birthday sites
- friends - send/accept/reject friend requests
- game-stats - upsert per-user game statistics
- badges - fetch user and available badges
- notifications - list and mark-read
- upload - multipart file upload to Supabase Storage
- profile - update profile fields
- game-sessions - create and list multiplayer sessions
- proposals - list and create proposals

Game enhancements (125 game pages):
- 60+ quiz games with unique questions and 4-option multiple choice
- 15+ interactive games (tictactoe, memory, snake, pong, 2048, flappy heart, etc.)
- 10+ creative writing games (love letters, poetry, story builder, journal, mad libs)
- 20+ spinner/chance games (truth or dare, dares, horoscope, bingo, wheel)
- 10+ calculator/tool games (love calculator, countdown, bucket list)
- Charades and action challenges with timer mechanics

Each game has unique state machine: idle -> playing -> finished
Includes scoring, timer, and results screen with Play Again / Back to Games."
Write-Host "Commit complete."
git push origin main
Write-Host "Push complete."
