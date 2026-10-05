# 🕊️ Love Dove - Where Hearts Connect 💕

A beautiful platform for couples to create birthday websites, play games together, and track their journey. Built with Next.js 14, Supabase, and Tailwind CSS.

## ✨ Features

- **Sign Up / Login** - Secure authentication
- **Birthday Websites** - Create stunning birthday pages with photos, messages, and 6 beautiful themes
- **Public Links** - Share birthday sites with anyone
- **2-Player Couple Games**:
  - ⭕❌ Tic-Tac-Toe
  - 🎴 Memory Match
  - 💡 Couple Quiz
  - 🤔 Would You Rather
  - 🔤 Word Chain
- **Add Friends** - Connect with your partner
- **Profile with Game History** - See time played per game
- **Badges & Achievements** - Earn badges for milestones (10 hours, 50 hours, 100 hours)

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- A Supabase account ([Sign up free](https://supabase.com/))

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

## 📦 Project Structure

```
lovedove/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Login & Signup pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── games/             # Game pages
│   │   ├── friends/           # Friends management
│   │   ├── profile/           # User profile
│   │   └── birthday/          # Birthday sites
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Supabase client & types
│   └── stores/                # State management
├── supabase-schema.sql        # Database schema
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                 # Your API keys (DO NOT commit!)
```

## 🎮 How to Play Games

1. Go to **Dashboard** → Click any game card
2. The game opens with your turn (X)
3. Play against the system (simulated partner)
4. Your stats are tracked automatically
5. Earn badges as you play more!

## 🎂 How to Create Birthday Site

1. Go to **Dashboard** → Click "Birthday Site"
2. Enter the person's name
3. Write a birthday message
4. Choose a theme (Pink, Purple, Blue, Green, Gold, Dark)
5. Upload photos
6. Click "Create Birthday Site"
7. Share the link with everyone!

## 🔧 Deploy to Vercel (Make it Online)

When you're ready to share the website with the world:

### Option A: Using GitHub + Vercel (Recommended)

**Connecting GitHub to Claude/Vercel:**

1. Go to https://vercel.com and sign up with your **GitHub account** (use `rudarsalaria12345@gmail.com`)
2. Click **Add New Project**
3. Select **Import Git Repository**
4. Find your GitHub username: `Rudar-teach`
5. If you don't see your repo, click **Configure GitHub App** and authorize Vercel

**Upload the project to GitHub first:**

```bash
# In the lovedove folder
git init
git add .
git commit -m "Initial commit: Love Dove website"
git remote add origin https://github.com/Rudar-teach/lovedove.git
git branch -M main
git push -u origin main
```

6. In Vercel, after importing:
   - Click **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**
8. Wait ~2 minutes
9. Your site is now live! 🎉

### Option B: Manual Upload

1. Create a new repository at https://github.com/new
   - Repository name: `lovedove`
   - Make it **Public**
   - Click **Create repository**
2. Follow the commands shown (git init, git add, git commit, git push)
3. Go to Vercel and import from GitHub

## 📝 How to Update Your Website

After making changes to the code:

```bash
cd C:/Users/hp\ omen/Downloads/project/lovedove
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically detect the changes and update your live site within minutes.

## 🔒 Security

- All user data is stored securely in Supabase
- Row Level Security (RLS) ensures users can only access their own data
- Password authentication via Supabase Auth
- Environment variables are never exposed to the client (except public keys)

## 🎯 Future Enhancements

- Real-time multiplayer with WebSockets
- Video/voice calling between couples
- More game types (Chess, 4-in-a-Row)
- Push notifications
- Mobile app (React Native)
- Dark mode support

## 💡 Tips

- You can customize colors in `tailwind.config.ts`
- Add more games in `src/app/games/`
- Modify the theme in `src/app/birthday/[slug]/page.tsx`

## 🐛 Troubleshooting

**"Module not found" errors?**
→ Run `npm install` again

**"Authentication failed"?**
→ Check your `.env.local` file has correct Supabase keys

**Photos not uploading?**
→ Make sure the `photos` storage bucket is created and public

**Database errors?**
→ Re-run the SQL schema from `supabase-schema.sql`

## 📞 Support

If you have questions, feel free to open an issue on GitHub!

---

Made with 💕 by Rudar Salaria
