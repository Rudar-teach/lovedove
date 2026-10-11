# 💕 Love Dove

**Love Dove** is a romantic web platform where couples can create beautiful birthday websites, play 2-player games together, connect with friends, earn badges, and celebrate their love story.

## Features

### Birthday Websites
- Create personalized birthday pages with photos, messages, and stunning themes
- Choose from multiple beautiful themes and layouts
- Share your creation with a unique URL
- Track views and engagement

### 36 Couple Games
Play fun games together — quizzes, tic-tac-toe, memory match, love calculator, and many more!

**Classic Games:**
- Tic-Tac-Toe, Memory Match, Rock Paper Scissors, Hangman, 2048, Snake

**Arcade Games:**
- Flappy Heart, Pong, Cupid's Arrow, Heart Catcher, Hearts

**Party Games:**
- Truth or Dare, Kissing Spinner, Drawing Challenge, Emoji Story, Dance Challenge

**Quiz Games:**
- Couple Quiz, Would You Rather, Love Song Quiz, Trivia Battle, Speed Date

**Love Games:**
- Compatibility Test, Love Maze, Love Letters, Love Calculator, Couple Golfs

### Friend System
- Add friends and connect with your partner
- Accept/decline friend requests
- See online status

### Real-time Multiplayer
- Share any game with a friend using a game code
- Play the same session in real-time
- Turn-based gameplay support

### Profile & Badges
- Track games played and time spent together
- Earn badges: 10 Hours Together, 100 Hours Together, Game Master, and more
- View recent games and statistics

### Proposals
- Send beautiful custom proposals
- Email notifications via Resend
- Track responses

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Supabase | Database & Authentication |
| Framer Motion | Animations |
| Lucide React | Icons |
| Resend | Email notifications |

## Database Schema

```
profiles         - User profiles with avatars, bios, partner info
birthday_sites   - Birthday website pages
friend_requests  - Friend request management
game_sessions    - Real-time game sessions
user_badges      - Earned badges
game_stats       - Per-user game statistics
proposals        - Proposal records with email tracking
notifications    - User notifications
```

## Getting Started

### Prerequisites
- Node.js >= 18.17
- npm or yarn
- Supabase account
- Resend account (for email)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rudar-teach/lovedove.git
cd lovedove

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (Email)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=Love Dove <onboarding@resend.dev>

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rudar-teach/lovedove)

## Connecting GitHub to Claude Code

1. Open Claude Code CLI
2. Navigate to your project folder:
   ```bash
   cd C:\Users\hp omen\Downloads\project\lovedove
   ```
3. Claude automatically detects the Git repository
4. To commit changes:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    auth/                 # Login & Signup
    birthday/             # Birthday website pages
    dashboard/            # User dashboard
    friends/              # Friends management
    games/                # All 36 game pages
    notifications/        # Notifications
    proposals/            # Proposal pages
    profile/              # User profile
  components/             # Reusable components
    3d/                   # 3D effects (TiltCard, FlyingDove, ParticleField)
    ui/                   # UI components (Button, Card, Input)
    AuthProvider.tsx      # Authentication context
    ClientProvider.tsx    # Toast notifications wrapper
    ErrorBoundary.tsx     # Error handling
    GameSessionProvider.tsx # Real-time game sessions
    PremiumBackground.tsx # Animated background
  lib/                    # Utilities
    supabase.ts           # Supabase client & types
    gameShare.ts          # Game code generation
  stores/                 # Zustand stores
    useAuthStore.ts       # Auth state
```

## License

Copyright  2025 Love Dove. All rights reserved.

Made with 💕 for couples everywhere.
