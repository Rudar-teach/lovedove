@echo off
cd /d C:\Users\hp omen\Downloads\project\lovedove

:: Stage deletion of Vite files
git rm --cached src/App.jsx src/components/Layout.jsx src/components/Navbar.jsx src/components/ProtectedRoute.jsx src/contexts/AuthContext.jsx src/index.css src/lib/supabase.js src/pages/BirthdayDetail.jsx src/pages/Dashboard.jsx src/pages/Friends.jsx src/pages/Games.jsx src/pages/Login.jsx src/pages/Profile.jsx src/pages/Stats.jsx src/pages/games/CoupleQuiz.jsx src/pages/games/MemoryMatch.jsx src/pages/games/TicTacToe.jsx src/pages/games/WordChain.jsx src/pages/games/WouldYouRather.jsx supabase-complete-setup.sql supabase-setup.sql vite.config.js 2>nul

:: Add remaining files
git add -A

:: Commit and push
git commit -m "chore: remove old Vite/MongoDB files from git tracking

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
echo.
echo === Done! ===
pause
