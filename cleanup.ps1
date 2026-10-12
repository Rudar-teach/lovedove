Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item check-file.ps1 -ErrorAction SilentlyContinue
Remove-Item clean-start.ps1 -ErrorAction SilentlyContinue
Write-Host "All temp files cleaned!"
