Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
# Clean temp files
Remove-Item build-check.ps1 -ErrorAction SilentlyContinue
Remove-Item rebuild.ps1 -ErrorAction SilentlyContinue
Remove-Item restart.ps1 -ErrorAction SilentlyContinue
Remove-Item restore-git.ps1 -ErrorAction SilentlyContinue
Remove-Item check-line.ps1 -ErrorAction SilentlyContinue

# Kill all node processes and restart
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Starting dev server on port 3000..."
npm run dev
