Set-Location "C:\Users\hp omen\Downloads\project\lovedove"
$lines = Get-Content 'src\app\games\couple_goals\page.tsx'
Write-Host "Line count: $($lines.Count)"
Write-Host "Last 3 lines:"
for ($i = $lines.Count - 3; $i -lt $lines.Count; $i++) { Write-Host $lines[$i] }
