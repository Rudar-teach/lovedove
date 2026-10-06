Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
foreach ($f in @('check-missing.js','analyze_games.py','count_lines.ps1','push.ps1','generate-games.js','make_games.js')) {
  if (Test-Path $f) {
    git rm --cached $f 2>$null
    Remove-Item -Force $f
  }
}
git add -A
$dirty = git status --short
if ($dirty.Count -gt 0) {
  git commit -m "chore: remove dev helper scripts from repo root"
  git push origin main
  Write-Host "Cleanup commit pushed."
} else {
  Write-Host "Nothing to commit."
}
