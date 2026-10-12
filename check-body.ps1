Write-Host "Fetching home page body content..."
$response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
$content = $response.Content
Write-Host "Total length: $($content.Length)"

# Find body content
$bodyStart = $content.IndexOf("<body")
$bodyEnd = $content.IndexOf("</body>")
if ($bodyStart -ge 0 -and $bodyEnd -gt $bodyStart) {
    $bodyContent = $content.Substring($bodyStart, $bodyEnd - $bodyStart)
    Write-Host "Body length: $($bodyContent.Length)"
    Write-Host "Body content (first 1000 chars):"
    Write-Host $bodyContent.Substring(0, [Math]::Min(1000, $bodyContent.Length))
} else {
    Write-Host "Could not find body tag"
}
