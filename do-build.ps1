Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force final-clean.ps1 -ErrorAction SilentlyContinue
npm run build
