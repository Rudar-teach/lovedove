Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
$status = git status --short
if ($status.Count -gt 0) {
  Write-Host "Files changed: $($status.Count)"
  git add -A
  git commit -m "feat: enhance 20 additional game pages (batch 2)"
  git push origin main
  Write-Host "Pushed."
} else {
  Write-Host "Clean, nothing to commit."
}
