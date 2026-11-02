# Love Dove 💕

A romantic birthday website builder and couples' gaming platform. Create beautiful birthday sites for someone special, play 2-player games together, track your relationship badges, and much more.

![Love Dove](https://img.shields.io/badge/Made%20with-%E2%9D%A4-ff69b4) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

- **🎂 Birthday Site Builder** — Create a personalized birthday website in 3 steps: sign in, upload photos, add the person's name. Share the link and celebrate.
- **🎮 100+ Couple Games** — Play Tic-Tac-Toe, Memory Match, Love Snake, Pong, Truth or Dare, Would You Rather, and many more. All support 2-player mode.
- **👥 Friend System** — Add friends by username or invite link. See who's online, send friend requests, and accept invites.
- **🏆 Badges & Achievements** — Earn badges for hours played together, games won, and milestones.
- **⏱️ Time Tracking** — See which games you recently played and for how long in your profile.
- **💍 Proposals** — Send a romantic proposal link by email and get a yes or no response.
- **🔔 Real-time Notifications** — Friend requests, badge unlocks, and game invites delivered instantly.
- **🌙 Premium UI** — Glassmorphism design, smooth animations with Framer Motion, fully responsive.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or newer
- A [Supabase](https://supabase.com) account and project
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Rudar-teach/lovedove.git
cd lovedove
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then fill in your credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

Get these from your Supabase dashboard: **Project Settings → API**.

### 4. Run the database migrations

Open your Supabase project, go to the **SQL Editor**, and run each file in `supabase/migrations/` in order:

1. `20240101_lovedove_base.sql` — profiles, game sessions, notifications, avatars bucket
2. `20240101_lovedove_features.sql` — additional features schema
3. `20251013_birthday_sites.sql` — birthday website tables
4. `20251013_social_presence.sql` — friends, invites, online presence
5. `20251013_matchmaking.sql` — matchmaking system

### 5. Start the dev server

```bash
npm run dev
```

The app runs at **http://localhost:3002**.

---

## 📁 Project Structure

```
lovedove/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Landing page with game catalog
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── games/            # 100+ game pages
│   │   ├── create/           # Birthday site builder
│   │   ├── my-sites/         # User's created birthday sites
│   │   ├── add-friends/      # Friend search and requests
│   │   ├── proposals/        # Proposal flow
│   │   ├── profile/          # User profile
│   │   └── api/              # API routes
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities, Supabase client, helpers
│   └── styles/               # Global CSS
├── supabase/
│   └── migrations/           # Database schema files
├── public/                   # Static assets
├── .github/
│   └── workflows/            # GitHub Actions CI
└── README.md
```

---

## 🗄️ Database

Love Dove uses **Supabase** (PostgreSQL + Auth + Storage).

Key tables:

| Table | Purpose |
|---|---|
| `profiles` | User accounts and profile info |
| `game_sessions` | Every game played, with duration and scores |
| `game_stats` | Per-user, per-game aggregate stats |
| `badges` / `user_badges` | Achievement definitions and unlocks |
| `friendships` | Friend relationships |
| `friend_requests` | Pending friend requests |
| `notifications` | In-app notifications |
| `birthday_sites` | Created birthday websites |
| `proposals` | Marriage proposal links |

All tables have **Row Level Security** enabled so users can only read and write their own data.

---

## 🎮 Games

Games are organized by category:

- **Classic** — Tic-Tac-Toe, Memory Match, Snake, 2048
- **Arcade** — Pong, Flappy Heart, Heart Catcher, Cupid's Arrow
- **Quiz** — Love Trivia, Compatibility, Would You Rather
- **Creative** — Love Letters, Couple Poetry, Time Capsule
- **Party** — Truth or Dare, Kissing Spinner, Emoji Games

Each game records play time and results to the `game_sessions` table.

### Playing together

Games are built for two people, so the entry screen is a friend picker rather
than a code box. Opening a game loads your friend list and marks each person
online or offline from the `user_presence` table, which the app heartbeats
every 25 seconds while you are on the page.

Pick a friend and send an invite. Two things happen on their side:

- A browser notification, if they have granted that permission. The first time
  they load the app a small button in the corner offers to turn it on.
- A banner at the bottom of the screen with Accept and Later buttons.

Either button resolves the invite. Accepting sends you both into the same
started session, so you arrive at the game together rather than one of you
waiting on a code. Invites arrive through Supabase realtime on the
`play_invites` table, which needs that table added to the realtime publication
(the migration does this).

If someone has no friends yet, the picker shows a link to `/add-friends`
instead of an empty list.

---

## 🚢 Deployment

### Deploy to Vercel (recommended)

1. Push your code to GitHub.
2. Import the repository at [vercel.com](https://vercel.com).
3. Add the same environment variables from `.env.local` in the Vercel dashboard.
4. Deploy.

Vercel automatically detects Next.js and builds the project.

### Manual build

```bash
npm run build
npm start
```

---

## 🔗 Connecting GitHub to Claude Code

If you want Claude Code to manage this repository for you, follow these steps.

### Option A: GitHub CLI (fastest)

1. **Install GitHub CLI** from [cli.github.com](https://cli.github.com).
2. **Authenticate**:

   ```bash
   gh auth login
   ```

   Choose `GitHub.com`, then `HTTPS`, then authenticate in the browser.

3. **Verify it worked**:

   ```bash
   gh auth status
   ```

   You should see your account `Rudar-teach` listed.

4. **Connect the repo**:

   ```bash
   git remote set-url origin https://github.com/Rudar-teach/lovedove.git
   git push -u origin main
   ```

5. **Let Claude Code push for you**:

   ```bash
   gh auth setup-git
   ```

   This configures git to use the GitHub CLI as a credential helper, so `git push` works without a password.

### Option B: Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. Generate a token with `repo` and `workflow` scopes.
3. Use it when prompted during `git push`, or store it:

   ```bash
   git config --global credential.helper store
   ```

### Option C: SSH key

1. Generate a key:

   ```bash
   ssh-keygen -t ed25519 -C "rudarsalaria12345@gmail.com"
   ```

2. Copy the public key:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. Add it at **GitHub → Settings → SSH and GPG keys → New SSH key**.
4. Change the remote:

   ```bash
   git remote set-url origin git@github.com:Rudar-teach/lovedove.git
   ```

---

## 🤖 GitHub Actions

The repository includes a CI workflow at `.github/workflows/ci.yml` that runs on every push and pull request:

- Installs dependencies
- Runs `tsc --noEmit` type checking
- Runs `eslint`
- Runs `next build`

View results under the **Actions** tab of your repository.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework, App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Supabase | Database, auth, storage, realtime |
| Lucide React | Icons |
| Sonner | Toast notifications |

---

## 📝 License

This project is private and personal. All rights reserved.

---

## 💌 Support

For questions or issues, open a GitHub issue or contact the maintainer.

Made with 💕 by Rudar Salaria
