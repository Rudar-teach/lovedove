Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
git rm --cached .claude/skills/ui-ux-pro-max-skill 2>$null
if (-not (Test-Path .gitignore)) { "" | Out-File .gitignore }
Add-Content .gitignore ".next`nnode_modules`n.env*"
git add .gitignore
git commit -m "feat: Love Dove - 101 couple games, auth, premium UI, dynamic game pages - Auth pages: login and signup - 101 games with dynamic routing - Premium UI: CanvasBackground, GlassCard, Cursor - Search, filter, badges, FAQ - MongoDB integration - Responsive design"
git push -u origin main
