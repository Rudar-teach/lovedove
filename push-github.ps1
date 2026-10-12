git remote remove origin 2>$null
git remote add origin https://github.com/Rudar-teach/LoveDove.git
git branch -M main
Write-Host "=== Pushing to GitHub ===" -ForegroundColor Green
git push -u origin main --force
Write-Host "=== Done! ===" -ForegroundColor Green
