Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
git add -A
$stat = git diff --cached --stat
Write-Host $stat
if ($stat -match '\d+ file') {
  git commit -m "feat: enhance 20 additional game pages (batch 2b)"
  git push origin main
  Write-Host "Pushed."
} else {
  Write-Host "Nothing new to commit."
}
