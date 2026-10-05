# 🕊️ Love Dove - Where Hearts Connect 💕

> A premium couple platform for creating beautiful birthday websites, sending proposals, playing 26 online games together, and tracking your love story.

**Live GitHub Repo:** https://github.com/Rudar-teach/lovedove
**Built for:** rudarsalaria12345@gmail.com

---

## ✨ What's Inside

### 💝 Birthday Websites
- Sign up, login
- Create unlimited birthday sites with photos, message, and 6 stunning themes
- Public shareable links
- View counter, hearts, comments

### 💌 Proposal System (NEW!)
- 12 proposal categories: Romantic Date, Marriage Proposal, Late Night Chat, Movie Night, Adventure Together, etc.
- Send a proposal to any user by username
- Receiver gets a notification + link to respond with **Yes** 💕 or **No** 💔
- Sender gets a notification when responded
- Beautiful response animation

### 🎮 26 Couple Games (All 2-Player / Solo)
- **Quick Play:** Tic-Tac-Toe, Rock-Paper-Scissors, Pong, Memory Match, Number Guess
- **Word Games:** Hangman, Word Chain, Couple Scramble, Trivia Battle, Love Song Quiz
- **Creative:** Drawing Challenge, Couple Pictionary, Love Trivia, Relationship Bingo
- **Quiz:** Truth or Dare, Would You Rather, Compatibility Test, Compatibility Test
- **Arcade:** Snake, Flappy Heart, 2048, Heart Catcher, Kissing Game, Cupids Arrow, Love Maze, Hearts
- **Typing:** Typing Race, Emoji Story

### 👫 Friends System
- Add friends by username
- Send / accept / reject friend requests
- See friends list and online status
- Friends can play games together

### 🏆 Profile & Stats
- Click your profile icon → see game history
- Total time played per game
- Recent activity
- **Badges:** 1h, 10h, 50h, 100h milestones
- Couple streaks and shared time

### 🔔 Notifications
- Proposal responses
- Friend requests
- Game invites
- Mark as read / delete

---

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- A Supabase account ([Sign up free](https://supabase.com/))
- A GitHub account (already have: Rudar-teach)

---

## 🚀 Step-by-Step Setup Guide (Beginner Friendly)

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS** version
3. Run the installer (keep all defaults)
4. Open Command Prompt and type: `node -v` and `npm -v`
5. Both should show version numbers (if yes, you're good!)

### Step 2: Create a Supabase Project

1. Go to https://supabase.com/ and click **Start your project**
2. Sign up with **Google** or **GitHub** (easiest)
3. Click **New Project**
4. Choose an **Organization** (or create one)
5. Fill in:
   - **Project Name**: `lovedove`
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Pick the closest to you (e.g., `Asia Pacific`)
6. Click **Create new project** (takes ~2 minutes)

### Step 3: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this project
4. Copy ALL the SQL code and paste it into the SQL editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned" for all queries

### Step 4: Set Up Storage

1. In Supabase, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `photos`
4. Set it as **Public** (toggle the switch)
5. Click **Create bucket**
6. Click on the `photos` bucket → **Configuration** tab → **Policies**
7. Add a policy:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
8. Add another policy:
   - **Policy name**: `Allow public view`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `true`

### Step 5: Get Your API Keys

1. In Supabase, go to **Settings** → **API** (bottom left)
2. You'll see:
   - **Project URL**: Copy this
   - **anon public** key: Click to reveal and copy this

### Step 6: Configure Environment Variables

1. Create a file named `.env.local` in the root of this project (same folder as package.json)
2. Paste this:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. Replace the values with your actual keys from Step 5

### Step 7: Install Dependencies and Run

Open Command Prompt in the project folder and run:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The website will open at **http://localhost:3000**

### Step 8: Test the Website

1. Go to http://localhost:3000
2. Click **Get Started Free**
3. Create an account with your name, username, email, and password
4. You'll be taken to the Dashboard!
5. Try creating a birthday site, playing games, and adding friends!
6. Create a second account (in a different browser) to test friend requests and proposals

---

## 🔌 Connect Your GitHub to Claude (Auto-Sync)

Want Claude to automatically read and update your project on GitHub?

### Step 1: Install GitHub CLI (already done in your setup)

```bash
# Check if installed
gh --version
```

### Step 2: Authenticate GitHub

```bash
gh auth login
```

Follow the prompts:
1. Choose **GitHub.com**
2. Choose **HTTPS**
3. Choose **Login with a web browser**
4. Copy the one-time code, press Enter, paste it in browser
5. Sign in with `rudarsalaria12345@gmail.com`

### Step 3: Verify the Connection

```bash
gh repo view Rudar-teach/lovedove
```

You should see your repo details. If yes — Claude can now read and push to it!

### Step 4: Push Updates from Claude

Every time you ask Claude to make changes, it will:

```bash
git add -A
git commit -m "Your message here"
git push origin main
```

You can verify anytime at: https://github.com/Rudar-teach/lovedove

---

## 🌐 Connect GitHub to Vercel (Deploy Online)

When you're ready to share the website with the world:

### Option A: Auto-Deploy via Vercel + GitHub

1. Go to https://vercel.com and sign up with your **GitHub account** (use `rudarsalaria12345@gmail.com`)
2. Click **Add New Project**
3. Find your repo: `Rudar-teach/lovedove`
4. Click **Import**
5. Add environment variables (same as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

**Every time you push to GitHub, Vercel auto-deploys!**

---

## 📦 Project Structure

```
lovedove/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (Toaster, fonts, providers)
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Login & Signup
│   │   ├── dashboard/         # Main dashboard
│   │   ├── games/             # 26 game pages
│   │   ├── friends/           # Friends management
│   │   ├── profile/           # User profile (game history, badges)
│   │   ├── proposals/         # Proposal system (list, new, respond)
│   │   ├── notifications/     # Notifications center
│   │   └── birthday/          # Birthday sites
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Button, Input, Card, etc.
│   │   └── 3d/               # 3D effects (TiltCard, etc.)
│   ├── lib/                   # Supabase client, types, helpers
│   └── stores/                # Zustand state (useAuthStore)
├── supabase-schema.sql        # Database schema (run once)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                 # Your API keys (DO NOT commit!)
```

---

## 🎮 How to Play Games

1. Go to **Dashboard** → Click any game card
2. The game opens — play immediately
3. Your stats (games played, time, wins) are tracked
4. Invite a friend by sharing the link
5. Both of you play, and your combined time builds your **"X hours spent together"** badge!

## 🎂 How to Create a Birthday Site

1. Go to **Dashboard** → Click "Birthday Site"
2. Enter the person's name
3. Write a birthday message
4. Choose a theme (Pink, Purple, Blue, Green, Gold, Dark)
5. Upload photos
6. Click "Create Birthday Site"
7. Share the link with everyone!

## 💌 How to Send a Proposal

1. Go to **Dashboard** → Click "Proposals" → "New Proposal"
2. Choose a category (Romantic Date, Marriage Proposal, etc.)
3. Fill in the title and message
4. Enter the receiver's username
5. Click **Send Proposal 💕**
6. The receiver gets a notification and can respond Yes/No
7. You get notified of their answer

## 👫 How to Add Friends

1. Go to **Friends** (top nav)
2. Search for a username
3. Click **Add Friend** — they get a request
4. Once accepted, you can play games together and see each other's profiles

---

## 🏆 Badges Earned

- **1 Hour Together** — Play games for 1 hour total
- **10 Hours Together** — Play for 10 hours
- **50 Hours Together** — Play for 50 hours
- **100 Hours Together** — Play for 100 hours
- **First Proposal** — Send your first proposal
- **Soulmates** — Compatibility test 90%+

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **3D Effects:** Custom 3D card tilt, glassmorphism
- **State:** Zustand
- **Deployment:** Vercel (auto-deploy from GitHub)

---

## 🆘 Troubleshooting

**Server won't start?**
- Delete `.next` folder, run `npm install` again, then `npm run dev`

**Database errors?**
- Make sure you ran `supabase-schema.sql` in Supabase SQL Editor
- Check that `.env.local` has correct values

**Photos not uploading?**
- Check the `photos` storage bucket is set to **Public** in Supabase
- Verify the storage policies allow authenticated uploads

**Want to reset everything?**
- In Supabase: Settings → Database → Reset database, then re-run the schema

---

## 📞 Support

- **GitHub:** https://github.com/Rudar-teach/lovedove
- **Email:** rudarsalaria12345@gmail.com

---

Made with 💕 for couples everywhere.
