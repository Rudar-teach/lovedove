@echo off
cd /d C:\Users\hp omen\Downloads\project\lovedove
git status --short
echo.
echo === Committing... ===
git commit -m "chore: remove old Vite/MongoDB files from git tracking

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
echo.
echo === Pushing to GitHub... ===
git push
echo.
echo === Done! ===
pause
