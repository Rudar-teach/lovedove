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
- Create a Supabase project
- Run the SQL migrations in `supabase/migrations/`
- Enable Email auth in Supabase Dashboard

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

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
