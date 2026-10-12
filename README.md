# Love Dove 💕

**Where Hearts Connect & Play** - A platform for couples to connect, play games together, and celebrate their love story.

## ✨ Features

### 🎂 Birthday Website Builder
- Create beautiful personalized birthday websites for your loved ones
- Add photos, messages, and countdown timers
- Share with friends and family
- Beautiful templates with animations

### 💑 Find a Partner
- Smart matching algorithm based on interests, preferences, and relationship goals
- Match scoring with compatibility reasons
- WhatsApp & Email notifications for new matches
- Chat with matched partners

### 🎮 25+ Couple Games
- **Puzzle**: Memory Match, 2048 Love, Love Maze
- **Action**: Love Snake, Flappy Heart, Love Typing Race
- **Quiz**: Would You Rather, Couple Quiz, Love Song Quiz, Trivia Battle
- **Romantic**: Truth or Dare, Couple Bucket List, Anniversary Planner
- **Strategy**: Tic Tac Toe, Hearts Card Game
- **Creative**: Emoji Story, Couple Pictionary, Love Letters
- All games designed for couples to play together!

### 👥 Friends System
- Add partners as friends after matching
- Chat with friends in real-time
- See recently played games
- Share game invitations

### 🏆 Badges & Achievements
- Earn badges for milestones (10 hours played together, etc.)
- Track game statistics
- Profile badges showcase

### 💬 Relationship Chatbot (LoveBot)
- AI-powered relationship companion
- Conflict resolution tips
- Date ideas generator
- Communication advice
- Always available via floating chat button

### ⚙️ Admin Dashboard
- Real-time analytics
- User management
- Game statistics
- Signup charts
- Peak traffic monitoring

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime (chat, live data) |
| Deployment | Vercel |

## 📦 Project Structure

```
lovedove/
├── src/
│   ├── app/
│   │   ├── admin/                    # Admin panel
│   │   │   ├── login/               # Admin login page
│   │   │   └── dashboard/           # Admin analytics dashboard
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/               # Admin APIs
│   │   │   ├── notifications/       # Match notifications
│   │   │   ├── auth/                # Authentication APIs
│   │   │   ├── chat/                # Chat APIs
│   │   │   └── ...
│   │   ├── auth/                     # Login/Signup pages
│   │   ├── birthday/                 # Birthday website builder
│   │   ├── find-partner/             # Partner matching page
│   │   ├── friends/                  # Friends list & management
│   │   ├── chat/[id]/                # Chat page
│   │   ├── games/                    # Games catalog
│   │   ├── dashboard/                # User dashboard
│   │   ├── profile/                  # User profile
│   │   └── games/                    # Individual game pages
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation with profile dropdown
│   │   ├── Chatbot.tsx               # LoveBot relationship chatbot
│   │   ├── ClientProvider.tsx        # Supabase client provider
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/                 # Supabase client config
│   │   ├── stores/                   # Zustand state management
│   │   └── utils/                    # Utility functions
│   └── styles/
├── supabase-schema.sql               # Database schema
├── supabase-schema-updated.sql       # Updated schema with games & analytics
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- GitHub account

### 1. Clone the Repository
```bash
git clone https://github.com/Rudar-teach/lovedove.git
cd lovedove
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the SQL from `supabase-schema-updated.sql`
4. Create admin user in Supabase Auth Dashboard:
   - Email: `manithakur123450@gmail.com`
   - Password: (set your own secure password)
5. Update the admin user in the SQL or manually:
   ```sql
   INSERT INTO profiles (id, username, full_name, email, bio, is_admin, created_at)
   VALUES (
     'your-admin-user-uuid-from-auth',
     'admin',
     'Admin',
     'manithakur123450@gmail.com',
     'Platform Administrator',
     true,
     NOW()
   );
   ```

### 4. Set Up Environment Variables
Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Admin
ADMIN_EMAIL=manithakur123450@gmail.com
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🔧 GitHub Integration (Auto-Upload)

### Set Up GitHub Connection
1. Create a new repository on GitHub:
   ```bash
   # On GitHub, create a new repo called "lovedove"
   # Then run:
   git remote set-url origin https://github.com/Rudar-teach/lovedove.git
   ```

2. Push your code:
   ```bash
   git add .
   git commit -m "Initial commit: Love Dove platform with games, matching, chatbot"
   git branch -M main
   git push -u origin main
   ```

### Connect Claude Code to GitHub
Claude Code can connect to your GitHub repository directly. Every change you make with Claude Code can be committed and pushed automatically.

**To set up auto-commit and push:**

1. Authenticate with GitHub in Claude Code:
   ```bash
   gh auth login
   ```

2. Create a `.claude/settings.json`:
   ```json
   {
     "autoCommit": true,
     "autoPush": true,
     "commitMessage": "chore: update Love Dove"
   }
   ```

3. When working with Claude Code, say "commit and push" after making changes.

## 🗄️ Database Schema

### Key Tables
- **profiles** - User profiles with preferences
- **matches** - Partner matches with scoring
- **conversations** - Chat conversations
- **messages** - Chat messages (realtime)
- **games_catalog** - Game definitions
- **game_stats** - Per-user game statistics
- **user_achievements** - Badges and milestones
- **notifications** - User notifications
- **chatbot_conversations** - LoveBot chat history
- **relationship_tips** - AI chatbot knowledge base
- **analytics_daily** - Daily analytics for admin

## 🎮 Games List (25+ Games)

| # | Game | Category | Players | Difficulty |
|---|------|----------|---------|-----------|
| 1 | Memory Match 💕 | Puzzle | 2 | Easy |
| 2 | Tic Tac Toe ❌ | Strategy | 2 | Easy |
| 3 | 2048 Love 🔢 | Puzzle | 1-2 | Medium |
| 4 | Love Snake 🐍 | Action | 1-2 | Easy |
| 5 | Flappy Heart 💖 | Action | 1-2 | Medium |
| 6 | Love Pong 🏓 | Action | 2 | Medium |
| 7 | Would You Rather 🤔 | Quiz | 2 | Easy |
| 8 | Truth or Dare 🎯 | Romantic | 2 | Easy |
| 9 | Couple Quiz 💡 | Quiz | 2 | Easy |
| 10 | Hangman 💬 | Quiz | 2 | Medium |
| 11 | Cupid's Arrow 🏹 | Action | 1-2 | Medium |
| 12 | Love Song Quiz 🎵 | Quiz | 2 | Medium |
| 13 | Love Calculator 🔢 | Quiz | 2 | Easy |
| 14 | Compatibility Test 💘 | Quiz | 2 | Medium |
| 15 | Hearts ❤️ | Strategy | 2-4 | Medium |
| 16 | Couple Pictionary 🎨 | Creative | 2 | Easy |
| 17 | Speed Date ⚡ | Quiz | 2 | Easy |
| 18 | Trivia Battle ⚔️ | Quiz | 2 | Medium |
| 19 | Love Typing Race ⌨️ | Action | 1-2 | Easy |
| 20 | Couple Bucket List 🌍 | Romantic | 2 | Easy |
| 21 | Anniversary Planner 💍 | Romantic | 2 | Easy |
| 22 | Couple Memory 📸 | Puzzle | 2 | Easy |
| 23 | Emoji Story 📖 | Creative | 2 | Easy |
| 24 | Love Riddles 🧩 | Quiz | 2 | Easy |
| 25 | Love Maze 🧩 | Puzzle | 1-2 | Medium |
| 26 | Love Letters 💌 | Creative | 2 | Easy |

## 🔐 Admin Access

- **URL**: `/admin/login`
- **Email**: `manithakur123450@gmail.com`
- The admin dashboard shows:
  - Total users, new signups
  - Active users (real-time)
  - Games played per week
  - Matches made per week
  - Messages sent
  - Peak traffic hours
  - Signup charts (30-day)
  - Top games
  - Recent users table

## 📱 Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with features |
| Games Catalog | `/games` | Browse all 25+ games |
| Find Partner | `/find-partner` | Smart matching system |
| Friends | `/friends` | Friends list & chat |
| Chat | `/chat/[id]` | Real-time messaging |
| Birthday Builder | `/birthday` | Create birthday websites |
| Dashboard | `/dashboard` | User dashboard |
| Profile | `/profile` | User profile & stats |
| Admin Login | `/admin/login` | Admin authentication |
| Admin Dashboard | `/admin/dashboard` | Analytics & management |

## 🎯 Key Features Implementation

### Partner Matching Algorithm
- Interest overlap scoring
- Relationship goal matching
- Location-based matching
- Partner preference alignment
- Match reasons explanation

### Real-time Chat
- Supabase Realtime subscriptions
- Message read status
- Game invitation messages
- Emoji quick reactions

### Game Statistics
- Total time played tracking
- Games played count
- Win/loss tracking
- Badge/achievement system
- Recently played games in profile

### Badges System
- 10 Hours Together
- First Game Win
- Perfect Match (100%)
- Chat Master
- And more...

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

### Deploy to Netlify
1. Push code to GitHub
2. Import repository in Netlify
3. Add environment variables
4. Deploy!

## 📊 Admin Features

The admin dashboard provides:
- **Real-time Stats**: Active users, games, matches
- **Charts**: 30-day signup trends, peak hours
- **User Management**: View recent users, manage accounts
- **Game Analytics**: Most played games, categories
- **Notifications**: Match notification system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is created by Rudar Salaria. All rights reserved.

## 💕 Credits

Built with love using Next.js, Supabase, and Tailwind CSS.

---

**Made with 💕 by Rudar Salaria**
