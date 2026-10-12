cd "C:\Users\hp omen\Downloads\project\lovedove"
$ErrorActionPreference = 'SilentlyContinue'

# 1. Remove Vite files from git tracking (keep locally)
git rm --cached src/App.jsx
git rm --cached src/components/Layout.jsx
git rm --cached src/components/Navbar.jsx
git rm --cached src/components/ProtectedRoute.jsx
git rm --cached src/contexts/AuthContext.jsx
git rm --cached src/index.css
git rm --cached src/lib/supabase.js
git rm --cached src/pages/BirthdayDetail.jsx
git rm --cached src/pages/Dashboard.jsx
git rm --cached src/pages/Friends.jsx
git rm --cached src/pages/Games.jsx
git rm --cached src/pages/Login.jsx
git rm --cached src/pages/Profile.jsx
git rm --cached src/pages/Stats.jsx
git rm --cached src/pages/games/CoupleQuiz.jsx
git rm --cached src/pages/games/MemoryMatch.jsx
git rm --cached src/pages/games/TicTacToe.jsx
git rm --cached src/pages/games/WordChain.jsx
git rm --cached src/pages/games/WouldYouRather.jsx
git rm --cached supabase-complete-setup.sql
git rm --cached supabase-setup.sql
git rm --cached vite.config.js

# 2. Add Vite files to .gitignore
$gitignore = ".gitignore"
$viteEntries = @(
    "src/App.jsx",
    "src/components/Layout.jsx",
    "src/components/Navbar.jsx",
    "src/components/ProtectedRoute.jsx",
    "src/contexts/AuthContext.jsx",
    "src/index.css",
    "src/lib/supabase.js",
    "src/pages/",
    "vite.config.js",
    "supabase-setup.sql",
    "supabase-complete-setup.sql"
)
foreach ($entry in $viteEntries) {
    if (-not (Select-String -Path $gitignore -Pattern [regex]::Escape($entry) -Quiet)) {
        Add-Content -Path $gitignore -Value $entry
    }
}

# 3. Commit the removal
git add -A
git status
git commit -m "chore: remove old Vite files, keep only Next.js project

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"

# 4. Force push
git push --force

Write-Host "Done!" -ForegroundColor Green
