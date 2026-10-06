Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
Remove-Item -Force check-env.ps1 2>$null
git add -A
git commit -m "feat: fix games page (de-duplicate 143 entries, add search/filter, fix broken links)"
git push origin main
