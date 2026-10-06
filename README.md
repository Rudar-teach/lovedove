# 🕊️ Love Dove — Where Hearts Connect & Play

A beautiful, full-stack web application for couples to create personalized birthday websites, play 100+ romantic games, send proposals, and track their love journey together.

## ✨ Features

### 🎂 **Birthday Websites**
- Create personalized birthday pages with photos, messages, and themes
- Share via unique URL slug
- Public/private visibility options
- View counter for each birthday site

### 🎮 **100+ Couple Games** (organized in categories)
- **Classic** — Tic-Tac-Toe, Memory Match, 2048, Snake, Pong, Rock-Paper-Scissors, Hangman, Number Guess
- **Arcade** — Flappy Heart, Cupid's Arrow, Heart Catcher, Hearts
- **Party** — Truth or Dare, Kissing Spinner, Drawing Challenge, Emoji Story, Couple Pictionary, Dance Challenge
- **Quiz** — Would You Rather, Trivia Battle, Love Song Quiz, Photo Quiz, Speed Date, Love Trivia, Word Chain, Typing Race
- **Love Special** — Compatibility Test, Couple's Scramble, Love Maze, Love Letters, Puzzle Love, Love Calculator, Love Challenges
- **New Batch 51-115** — Who Knows Who, Love Horoscope, Future Together, Love Dares, Couple Goals, Would You Rather 2, Couple Truths, Love Riddles, Couple Poetry, Love Challenges, Romantic Riddles 2, Love Quotes Quiz, Couple Drawing, Love Scramble 2, Relationship Goals, Couple Music Quiz, Love Journal, Couple Playlist, Anniversary Planner, Couple Photo Story, Love Q&A, Girlfriend Rules, Boyfriend Rules, Love Scenarios, Love Bingo, Love Mad Libs, Love Truth Questions, Couple Goals 2, Love Dares 2, Couple Scenarios, Love Compatibility 2, Couple Memory Game, Love Word Search 2, Couple Quiz, Love Quotes, Love Emoji Quiz 2, Couple Photo Challenge, Love Story Builder 2, Love Wheel of Fortune, Love Countdown, Love Resolutions, Couple Time Capsule, Couple Reflex

### 💌 **Custom Proposals**
- Send custom proposals (purpose, anniversary, etc.) to your partner
- Email notifications via Resend
- 5 categories with emojis (proposal, anniversary, love letter, etc.)
- Yes/No/Maybe responses

### 👥 **Friends System**
- Add friends by username
- Friend request flow (send/accept/reject)
- See your friends list
- Play games together

### 🏆 **Badges & Stats**
- Earn badges for milestones (10 hours, 100 hours together)
- Track time played per game
- See recently played games
- Profile page with stats dashboard

### 🎨 **Beautiful UI**
- Glassmorphism design
- 3D tilt cards
- Particle field backgrounds
- Smooth framer-motion animations
- Premium gradients and Tailwind CSS

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **3D Effects:** Custom tilt card components
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (for photos)
- **Email:** Resend (for proposal notifications)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Resend account (free for 100 emails/day)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rudar-teach/lovedove.git
cd lovedove

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.local.example to .env.local and fill in your credentials
cp .env.local.example .env.local

# 4. Set up Supabase
# - Create a project at supabase.com
# - Run the SQL schema in supabase/schema.sql
# - Copy your project URL and anon key to .env.local

# 5. Set up Resend
# - Sign up at resend.com
# - Get your API key and add to .env.local

# 6. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Love Dove <onboarding@resend.dev>
PROPOSAL_NOTIFICATION_EMAIL=rudarsalaria12345@gmail.com
```

## 🗄️ Database Schema

Run the SQL in `supabase/schema.sql` to create these tables:
- `profiles` — User profiles with partner linking
- `birthday_sites` — Birthday websites
- `friend_requests` — Friend system
- `game_sessions` — Live multiplayer game state
- `badges` — Available badges
- `user_badges` — Earned badges
- `game_stats` — Per-user game statistics
- `proposals` — Custom proposals
- `notifications` — User notifications

## 🎨 Pages

- `/` — Landing page with features
- `/auth/login` & `/auth/signup` — Authentication
- `/dashboard` — User dashboard
- `/profile` — Profile with game stats
- `/friends` — Friends management
- `/games` — Browse 100+ games
- `/games/[slug]` — Individual game (115+ games)
- `/birthday/new` — Create birthday site
- `/birthday/[slug]` — View birthday site
- `/proposals` — Browse & send proposals
- `/proposals/new` — Create custom proposal
- `/proposals/[id]/respond` — Respond to proposal
- `/notifications` — View notifications

## 📧 Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use the default `onboarding@resend.dev`
3. Get your API key from the dashboard
4. Add to `.env.local`

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss major changes.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👤 Author

**Rudar** — [GitHub @Rudar-teach](https://github.com/Rudar-teach)

---

Built with 💕 for couples everywhere.
