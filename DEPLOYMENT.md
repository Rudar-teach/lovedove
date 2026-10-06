# 🚀 Love Dove — Deployment Guide

## Step-by-Step: How to Connect Your GitHub to Claude

### Option 1: Using Claude Desktop App (RECOMMENDED)
1. Open Claude Desktop app
2. Go to **Settings → Connectors** (or **Code tab → Settings**)
3. Find **GitHub** connector
4. Click **Connect** and sign in with `rudarsalaria12345@gmail.com`
5. Authorize access to your `Rudar-teach/lovedove` repository
6. Now you can ask Claude to commit, push, and update your repo

### Option 2: Connect via the Web App
1. Go to [claude.ai](https://claude.ai)
2. Open **Settings → Integrations → GitHub**
3. Click **Connect GitHub**
4. Sign in with your GitHub account
5. Grant access to the `lovedove` repository

### Option 3: Manual Setup with Git
If you want to do it manually (no Claude needed), use these commands:

```bash
cd lovedove
git init
git remote add origin https://github.com/Rudar-teach/lovedove.git
git add .
git commit -m "Initial commit: Love Dove - 100+ couple games"
git push -u origin main
```

---

## 🔧 Full Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**
3. Name: `lovedove`
4. Database password: (save this somewhere safe)
5. Region: closest to you
6. Click **Create new project**

#### Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned" for each query

#### Get API Keys
1. Go to **Settings → API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon public** key

#### Create Storage Bucket
1. Go to **Storage**
2. Click **New bucket**
3. Name: `photos`
4. Set to **Public bucket**
5. Click **Create bucket**

#### Enable Auth Providers (Optional)
1. Go to **Authentication → Providers**
2. Enable **Email** (default is on)
3. Enable **Google** (optional) - add your OAuth credentials

### 3. Set Up Resend (for emails)

1. Go to [resend.com](https://resend.com) and create account
2. Click **API Keys** → **Create API Key**
3. Name: `lovedove`
4. Copy the key (starts with `re_`)
5. (Optional) Add your own domain under **Domains**

### 4. Configure Environment Variables

Create a file called `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Resend
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=Love Dove <onboarding@resend.dev>
PROPOSAL_NOTIFICATION_EMAIL=rudarsalaria12345@gmail.com
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel (FREE)

1. Push your code to GitHub (see Option 3 above)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click **New Project**
5. Import your `lovedove` repository
6. Add the same environment variables from `.env.local`
7. Click **Deploy**
8. Your app will be live at `your-project.vercel.app` in 2-3 minutes

---

## ✅ Testing Checklist

After setup, test these features:
- [ ] Sign up with a new account
- [ ] Log in / log out
- [ ] Create a birthday site with photos
- [ ] Play 5+ games
- [ ] Check profile shows recent games
- [ ] Add a friend
- [ ] Send a proposal (check email arrives)
- [ ] Respond to a proposal

---

## 🆘 Troubleshooting

### "Supabase connection error"
- Check `.env.local` has correct URL and key
- Make sure SQL schema was run successfully
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)

### "Email not sending"
- Verify Resend API key is correct
- Check `RESEND_FROM_EMAIL` is valid
- Look at Resend dashboard for delivery logs

### "Photos not uploading"
- Make sure `photos` storage bucket exists in Supabase
- Check bucket is set to public

### "Build errors"
- Run `npm install` again
- Delete `.next` folder and rebuild
- Check Node version: `node -v` (should be 18+)

---

## 📚 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Need help? Create an issue at https://github.com/Rudar-teach/lovedove/issues
