# GitHub Connection Guide for Love Dove

This guide will walk you through connecting your GitHub account to Love Dove and setting up auto-upload.

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
winget install GitHub.cli

# Authenticate
gh auth login
# Follow prompts to login with your GitHub account (Rudar-teach)

# Create new repository
cd C:\Users\hp omen\Downloads\project\lovedove
git init
git add .
git commit -m "Initial commit: Love Dove platform"
git branch -M main
gh repo create lovedove --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website
1. Go to https://github.com/new
2. Repository name: `lovedove`
3. Description: "Love Dove - Where Hearts Connect & Play"
4. Choose Public or Private
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"
7. Run these commands in your project folder:
```bash
cd C:\Users\hp omen\Downloads\project\lovedove
git init
git remote add origin https://github.com/Rudar-teach/lovedove.git
git add .
git commit -m "Initial commit: Love Dove platform"
git branch -M main
git push -u origin main
```

## Step 2: Connect Claude Code to GitHub

Claude Code can automatically commit and push changes to your GitHub repository.

### Auto-Upload Configuration

Create `.claude/settings.json` in your project:

```json
{
  "github": {
    "enabled": true,
    "autoCommit": true,
    "autoPush": true,
    "commitMessage": "chore: update Love Dove platform"
  },
  "project": {
    "name": "Love Dove",
    "description": "Couple games platform with partner matching and birthday websites"
  }
}
```

### Manual Commit & Push Commands

After making changes with Claude Code, run:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to GitHub
git push origin main
```

## Step 3: Set Up GitHub Pages (Optional)

To host your README as a landing page:

1. Go to repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Your README will be available at: `https://rudar-teach.github.io/lovedove/`

## Step 4: Set Up GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Love Dove

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Step 5: Set Up GitHub Secrets

1. Go to your repository Settings > Secrets and variables > Actions
2. Add these secrets:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `VERCEL_TOKEN` - From Vercel account settings
   - `VERCEL_ORG_ID` - From Vercel project settings
   - `VERCEL_PROJECT_ID` - From Vercel project settings

## Step 6: How to Update from Claude Code

Every time Claude Code makes changes:

### Method 1: Ask Claude Code to commit
Simply say after changes are done:
```
"Please commit and push all changes to GitHub"
```

### Method 2: Manual commands
```bash
cd C:\Users\hp omen\Downloads\project\lovedove
git add .
git commit -m "describe your changes"
git push origin main
```

### Method 3: Create a scheduled task
Use the Claude Code scheduled tasks to auto-commit every hour:
```
Task: "Check for any uncommitted changes in the Love Dove project at C:\Users\hp omen\Downloads\project\lovedove and commit and push them to GitHub with a descriptive message"
```

## Troubleshooting

### "Permission denied (publickey)"
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "rudarsalaria12345@gmail.com"
# Add the public key to your GitHub account
cat ~/.ssh/id_ed25519.pub
# Then use SSH URL instead of HTTPS
git remote set-url origin git@github.com:Rudar-teach/lovedove.git
```

### "Repository not found"
Make sure you have the correct repository URL and your GitHub username is `Rudar-teach`.

### "Large files" error
```bash
# If you have files larger than 100MB
git config --global core.bigFileThreshold 100MB
```

## Quick Reference

| Action | Command |
|--------|---------|
| Initialize repo | `git init` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| Pull updates | `git pull origin main` |
| Check status | `git status` |
| View history | `git log --oneline` |
| Create branch | `git checkout -b feature-name` |
| Switch branch | `git checkout branch-name` |
| Merge branch | `git merge branch-name` |

## Your GitHub Profile
- **Username**: Rudar-teach
- **Email**: rudarsalaria12345@gmail.com
- **Repository**: https://github.com/Rudar-teach/lovedove

## Need Help?

If you run into any issues with GitHub:
1. Check the [GitHub Docs](https://docs.github.com)
2. Run `gh auth status` to check your login status
3. Use `gh repo view` to see your repository info
