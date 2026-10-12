# How to Connect Love Dove to GitHub

## Step-by-Step Guide

### Step 1: Install Git
Download and install Git from: https://git-scm.com/downloads
- During installation, keep all default options
- This gives you the `git` command in your terminal

### Step 2: Create a GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `lovedove`
   - **Description**: "Where Hearts Connect & Play - Couple Gaming Platform"
   - Choose **Public**
   - Check **Add a README file**
   - Click **Create repository**

### Step 3: Open Your Project Folder

Open your terminal (PowerShell) and navigate to your project:

```powershell
cd "C:\Users\hp omen\Downloads\project\lovedove"
```

### Step 4: Initialize Git (if not already done)

```powershell
git init
```

### Step 5: Add All Files

```powershell
git add .
```

### Step 6: Make Your First Commit

```powershell
git commit -m "Initial commit: Love Dove - Where Hearts Connect & Play"
```

### Step 7: Link to Your GitHub Repo

Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
git remote add origin https://github.com/Rudar-teach/lovedove.git
```

### Step 8: Push Your Code to GitHub

```powershell
git branch -M main
git push -u origin main
```

---

## Alternative: Use GitHub Desktop (Easier)

If terminal commands are confusing:

1. Download **GitHub Desktop** from https://desktop.github.com
2. Sign in with your GitHub account (Rudar-teach)
3. Click **File > Add Local Repository**
4. Browse to: `C:\Users\hp omen\Downloads\project\lovedove`
5. Click **Add Repository**
6. Write a summary: "Initial commit - Love Dove"
7. Click **Commit to main**
8. Click **Publish repository** and name it `lovedove`

---

## Future Updates

Every time you make changes and want to update GitHub:

```powershell
cd "C:\Users\hp omen\Downloads\project\lovedove"
git add .
git commit -m "Description of what you changed"
git push
```

---

## Important Notes

- **NEVER** commit your `.env.local` file — it has secret keys
- The `.gitignore` file already protects sensitive files
- Your Supabase keys stay private — never share them
