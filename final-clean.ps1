Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force check-file.ps1,clean-start.ps1,cleanup.ps1,restart.ps1,build-check.ps1,rebuild.ps1,restore-git.ps1 -ErrorAction SilentlyContinue
Write-Host "Temp files cleaned! Dev server is ready on port 3000"
