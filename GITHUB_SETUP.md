# GitHub Setup Guide for Love Dove

## Step-by-Step Guide to Connect to GitHub

### Step 1: Install Git (if not already installed)

Download from: https://git-scm.com/downloads
- Keep all default settings during installation
- This adds the `git` command to your terminal

### Step 2: Verify Git is Installed

Open PowerShell and run:
```powershell
git --version
```
If you see a version number (e.g., `git version 2.43.0`), you're good!

### Step 3: Configure Git (First Time Only)

```powershell
git config --global user.name "Rudar Salaria"
git config --global user.email rudarsalaria12345@gmail.com
```

### Step 4: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: **lovedove**
3. Description: "Where Hearts Connect & Play - Couple Gaming Platform"
4. Choose **Public**
5. Check **Add a README file**
6. Click **Create repository**

### Step 5: Navigate to Your Project

```powershell
cd "C:\Users\hp omen\Downloads\project\lovedove"
```

### Step 6: Initialize Git (if not done)

```powershell
git init
```

### Step 7: Add All Files to Git

```powershell
git add .
```

### Step 8: Make First Commit

```powershell
git commit -m "Initial commit: Love Dove - Where Hearts Connect & Play

- Full authentication system with Supabase
- Profile management with photo uploads
- 100+ couple games
- Real-time multiplayer gaming
- Friend system
- Achievements and badges
- Birthday website creator
- Activity tracking and statistics
- Beautiful romantic UI with animations"
```

### Step 9: Link to GitHub

```powershell
git remote add origin https://github.com/Rudar-teach/lovedove.git
```

### Step 10: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

You may be asked to sign in to GitHub — use your username `Rudar-teach`.

---

## Easier Alternative: GitHub Desktop

1. Download **GitHub Desktop** from https://desktop.github.com
2. Sign in with `Rudar-teach`
3. Click **File > Add Local Repository**
4. Browse to: `C:\Users\hp omen\Downloads\project\lovedove`
5. Click **Add Repository**
6. Summary: "Initial commit - Love Dove"
7. Click **Commit to main**
8. Click **Publish repository** → name it `lovedove`

---

## Updating GitHub After Making Changes

Every time you make changes:

```powershell
cd "C:\Users\hp omen\Downloads\project\lovedove"
git add .
git commit -m "Description of your changes"
git push
```

---

## Important Security Notes

- Your `.env.local` file has secret keys — it's already in `.gitignore`
- Never share your Supabase keys publicly
- Only push code, never `.env` files or `node_modules`

---

## Troubleshooting

**"fatal: not a git repository"**
→ Run `git init` in the project folder first

**"remote origin already exists"**
→ Run `git remote set-url origin https://github.com/Rudar-teach/lovedove.git`

**"Authentication failed"**
→ You may need to set up a Personal Access Token on GitHub
