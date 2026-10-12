$ErrorActionPreference = "Stop"
Set-Location "C:\Users\hp omen\Downloads\project\lovedove"

# Check if gh CLI is available
$ghAvailable = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)

if ($ghAvailable) {
    Write-Host "Using GitHub CLI (gh) to push..."
    git remote set-url origin (gh repo view --json sshUrl -q .sshUrl)
    git push -u origin main
} else {
    Write-Host "GitHub CLI not found. Please use one of these methods:"
    Write-Host ""
    Write-Host "Method 1: Install GitHub CLI and run: gh auth login"
    Write-Host "  winget install GitHub.cli"
    Write-Host ""
    Write-Host "Method 2: Use a Personal Access Token"
    Write-Host "  1. Go to: https://github.com/settings/tokens"
    Write-Host "  2. Generate new token (classic) with 'repo' scope"
    Write-Host "  3. Run: git remote set-url origin https://YOUR_TOKEN@github.com/Rudar-teach/lovedove.git"
    Write-Host "  4. Run: git push -u origin main"
    Write-Host ""
    Write-Host "Method 3: Use SSH"
    Write-Host "  1. Set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    Write-Host "  2. Run: git remote set-url origin git@github.com:Rudar-teach/lovedove.git"
    Write-Host "  3. Run: git push -u origin main"
}
