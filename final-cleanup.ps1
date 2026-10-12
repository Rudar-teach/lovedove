cd "C:\Users\hp omen\Downloads\project\lovedove"

# Add .gitignore entries for Vite files
$gitignore = ".gitignore"
$entries = @("src/pages/", "src/App.jsx", "src/index.css", "src/contexts/", "src/lib/supabase.js", "vite.config.js", "supabase-setup.sql", "supabase-complete-setup.sql", "fix-*.ps1", "push-*.ps1", "*.ps1")
foreach ($e in $entries) {
    if (-not (Select-String -Path $gitignore -Pattern [regex]::Escape($e) -Quiet)) {
        Add-Content -Path $gitignore -Value $e
    }
}

# Commit deletion of old Vite files + cleanup
git add -A
git status
git commit -m "chore: remove old Vite/MongoDB files, add .gitignore entries

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"

# Push
git push
