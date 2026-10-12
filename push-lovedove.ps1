# Reset everything to HEAD (clean slate)
git reset --hard HEAD

# Now stage ONLY the Next.js project files
git add src/app/ src/components/ src/hooks/ src/lib/ package.json package-lock.json next.config.js tsconfig.json postcss.config.js tailwind.config.ts .env.example public/ README.md supabase-schema-updated.sql supabase/migrations/

# Show what's staged
Write-Host "`n=== Staged Next.js files ===" -ForegroundColor Green
git diff --cached --name-only

# Commit
git commit -m "feat: Love Dove - Supabase auth, 60+ couple games, chat, badges, admin

- Supabase auth + PostgreSQL database
- 60+ couple online games with realtime
- Find Partner, chat, badges, playtime tracking
- Admin panel, profile, birthday builder
- Email notifications via Resend
- Premium Tailwind + ShadCN UI

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"

# Push
git remote remove origin 2>$null
git remote add origin https://github.com/Rudar-teach/LoveDove.git
git branch -M main
git push -u origin main --force
