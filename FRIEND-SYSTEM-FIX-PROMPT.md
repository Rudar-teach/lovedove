# Love Dove — Friend System Fix (PLAN + PROMPT)

Copy everything below this line into Claude Code (or any coding agent) and say "execute this plan".

---

## TASK: Fix the Love Dove friend system end-to-end

**Project:** `C:\Users\hp omen\Downloads\project\lovedove` (Next.js 14 + Supabase + Vercel)
**Live site:** https://lovedove.vercel.app · **Supabase project id:** `pytjmswiynjsjatluftd`

### Symptom
- "Add Friends" / "Find Partners": typing a real username → **"No users found"** → users can never add friends.
- "0 friends · 0 online" forever.
- Invite links don't actually create friend requests.

### Root cause (verified 2026-11-06 with live REST probes)
1. `friend_requests` and `play_invites` tables **do not exist** in the live database (`PGRST205`).
2. `profiles` is **missing the `is_online` and `last_seen` columns** (`42703`).
3. `src/lib/social.ts` line 42: `PROFILE_COLS` includes both missing columns, so **every profiles query errors** and `searchProfiles`/`getProfileByUsername`/`fetchFriendRelations` all return empty.
4. Cause of all of it: `supabase/migrations/20251013_social_presence.sql` (or the consolidated `apply-migrations-lovedove.sql`) was **never run in the Supabase dashboard**.

### PHASE 0 — Database (the one step needing the owner, ~15 seconds)
Run the consolidated, idempotent migration in **Supabase Dashboard → SQL Editor → New query**:
- paste the entire contents of `apply-migrations-lovedove.sql` → Run.
- Creates: `friend_requests`, `play_invites`, `profiles.is_online/last_seen`, presence RPCs (`heartbeat_presence`, `expire_stale_presence`), unique-lowercase-username index, notification triggers, realtime publication entries.
- If you can instead get the **service_role key** (Project settings → API), hand it to the agent and it can apply this via the Management API instead.

### PHASE 1 — Make the app resilient (`src/lib/social.ts`)
1. `searchProfiles`: run the query with full `PROFILE_COLS`; on error, retry with `id, full_name, username, avatar_url` only and default `is_online: false`. (Graceful degradation if DB is behind.)
2. `getProfileByUsername`: same fallback, and on the no-match case distinguish "user doesn't exist" from "DB not migrated" and surface a helpful error.
3. `fetchFriendRelations`: catch the join error (missing table) and return empty lists with a console warning naming the missing table.
4. `sendFriendRequestByUsername`: if insert fails with PGRST205, return error: "Friend system is still setting up — please ask the owner to run the database migration (see README)".

### PHASE 2 — UI: friend icon SEPARATE from username (`src/app/add-friends/page.tsx`)
Requirement: every user has a unique @username; the **friend status must have its own icon**, visually separate from the @username handle.
1. Search results + My Friends + Requests: each row shows
   - Avatar (with green/grey online dot)
   - Name + `@username` (grey, mono-style handle — identity, not status)
   - **Distinct status icon column**: `Users` heart-in-pink-circle = "Friend", `UserPlus` = "Add friend", `Clock` amber = "Pending", `Check` green = "Request sent"
2. "Find Partners" / community view: same pattern — friend badge never mixed into the username text.
3. On the Add Friends tab, show **your own** `@username` with a copy button (so users can share it with their partner).

### PHASE 3 — Verify + deploy
1. `npx tsc --noEmit` → 0 errors.
2. Playwright with two test accounts: search real username → Add → Requests tab on other account → Accept → both show Friend + online; "Invite to play" button works.
3. `git add / commit / push origin main`, then `npx vercel deploy --prod`.
4. Verify https://lovedove.vercel.app/add-friends shows a user search returning results.

### Acceptance criteria
- [ ] Typing any registered username returns that user.
- [ ] Add sends a request; the friend sees it in Requests; Accept works; both lists show "Friend" with a dedicated icon + online dot.
- [ ] Online/offline reflects the 45s heartbeat.
- [ ] "Invite to play" creates a play_invites row and a notification.
- [ ] Deployed to Vercel production.
