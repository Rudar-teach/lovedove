Write-Host "Fetching home page..."
$response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content length: $($response.Content.Length)"
Write-Host "First 500 chars:"
Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length))
