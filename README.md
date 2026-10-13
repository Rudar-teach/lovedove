# 💕 Love Dove - Birthday & Couple Games Platform

Love Dove is a full-stack web application where users can create beautiful birthday websites, connect with partners, and play 60+ couple online games together in real-time.

## Features

### For Everyone
- **User Authentication** - Secure signup/login with Supabase Auth
- **Find Partner** - Search and connect with your loved one
- **Proposal System** - Send relationship proposals via email
- **Add Friend** - Connect with other couples

### Birthday Websites
- Create beautiful personalized birthday websites
- Upload photos and add names
- Shareable birthday pages
- Customizable themes

### Couple Games (60+ Games)
Play together online in real-time:
- Memory Match
- Tic Tac Toe
- Word Chain
- Would You Rather
- Couple Quiz
- Love Calculator
- Heart Spelling
- Love Hangman
- And 50+ more romantic games!

### Chat & Communication
- Real-time chat between couples
- Message notifications

### Profile & Stats
- Profile icon with recent games
- Playtime tracking
- Session history
- Badges & achievements
- "You played 10 hours together" milestones

### Badges & Achievements
- Earn badges for playing together
- Track hours played together
- Milestone celebrations

### Admin Panel
- User management
- Game statistics
- Platform analytics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Email**: Resend
- **Payments**: Stripe (for premium features)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for emails)
- GitHub account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Rudar-teach/lovedove.git
cd lovedove
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase
- Create a Supabase project at [supabase.com](https://supabase.com)
- Run the SQL migrations in `supabase/migrations/` (use Supabase Dashboard > SQL Editor)
- Enable Email auth in Supabase Dashboard > Authentication > Providers
- Create a Storage bucket named `photos` (Public) for birthday photo uploads

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Connecting to GitHub & Auto-Deploy

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git remote add origin https://github.com/Rudar-teach/lovedove.git
git add .
git commit -m "Initial commit - Love Dove full platform"
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel (Auto-Deploy)
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account (rudarsalaria12345@gmail.com)
2. Click "New Project" and import the `lovedove` repository
3. Add these environment variables:
   - NEXT_PUBLIC_SUPABASE_URL = your Supabase URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = your Supabase anon key
   - SUPABASE_SERVICE_ROLE_KEY = your Supabase service role key
   - RESEND_API_KEY = your Resend API key
   - NEXT_PUBLIC_APP_URL = your Vercel app URL (e.g. https://lovedove.vercel.app)
4. Click "Deploy" — your site will be live in ~2 minutes!

### Step 3: Every push auto-deploys
Every time you push to GitHub, Vercel automatically builds and deploys your changes.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Database Schema

The app uses Supabase PostgreSQL with tables for:
- Users & Profiles
- Friends & Relationships
- Game Sessions & Stats
- Badges & Achievements
- Chat Messages
- Birthday Pages
- Proposals & Notifications

See `supabase-schema-updated.sql` for full schema.

## Contributing

Pull requests are welcome!

## License

MIT
