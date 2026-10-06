$files = Get-ChildItem 'C:\Users\hp omen\Downloads\project\lovedove\src\app\games' -Filter 'page.tsx' -Recurse
foreach ($f in $files) {
    $lines = (Get-Content $f.FullName | Measure-Object -Line).Lines
    Write-Output "$lines | $($f.FullName)"
}
