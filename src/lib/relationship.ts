/**
 * Love Dove — Relationship Depth Layer
 *
 * Data access for the "couple" features:
 *  - couples row (start / anniversary dates)
 *  - love_reasons ("Reasons I love you", revealed one at a time)
 *  - milestones ("Our Story" timeline, incl. auto-logged events)
 *  - surprise_pool (birthday "pool a surprise" contributions)
 *
 * Every function is resilient: if the relationship schema hasn't been
 * applied to a given database yet (table missing → PGRST205) it returns a
 * safe empty shape instead of throwing, so screens degrade gracefully.
 */

import { supabase } from './supabase';

export interface CoupleDates {
  /** First day of the relationship (or the match day when unset). */
  startDate: string | null;
  anniversaryDate: string | null;
}

export interface LoveReason {
  id: string;
  text: string;
  sender_username: string | null;
  created_at: string;
  revealed_at: string | null;
}

export interface Milestone {
  id: string;
  type: string;
  title: string;
  description: string | null;
  emoji: string;
  author_username: string | null;
  created_at: string;
}

export interface SurpriseContribution {
  id: string;
  contributor: string;
  message: string;
  created_at: string;
}

export interface PartnerActivity {
  session_id: string;
  game_type: string;
  status: string;
  ended_at: string | null;
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  return !!error && (
    error.code === 'PGRST205' ||
    (error.message || '').includes('Could not find the table')
  );
}

// ── 1. Couple dates ─────────────────────────────────────────────────

/** Look up (or lazily create) the couples row between two users. */
export async function upsertCouple(
  userId: string,
  partnerId: string,
  dates?: Partial<CoupleDates>
): Promise<CoupleDates> {
  try {
    const { data, error } = await supabase
      .from('couples')
      .select('user1_id, user2_id, start_date, anniversary_date')
      .or(
        `and(user1_id.eq.${userId},user2_id.eq.${partnerId}),` +
        `and(user1_id.eq.${partnerId},user2_id.eq.${userId})`
      )
      .maybeSingle();

    if (!error && data) {
      return {
        startDate: data.start_date || null,
        anniversaryDate: data.anniversary_date || null,
      };
    }
    if (!error) {
      // No row yet — create it. RLS allows either side of the pair.
      const { data: created } = await supabase
        .from('couples')
        .insert({
          user1_id: userId,
          user2_id: partnerId,
          start_date: dates?.startDate ?? null,
          anniversary_date: dates?.anniversaryDate ?? null,
        })
        .select()
        .maybeSingle();
      if (created) {
        return {
          startDate: created.start_date || null,
          anniversaryDate: created.anniversary_date || null,
        };
      }
      return { startDate: null, anniversaryDate: null };
    }
    // Table missing (migration not applied) — degrade.
    if (isMissingTable(error)) return { startDate: null, anniversaryDate: null };
    return { startDate: null, anniversaryDate: null };
  } catch {
    return { startDate: null, anniversaryDate: null };
  }
}

/**
 * Effective start date: explicit start_date → match day → account creation.
 * `matchCreatedAt` / `accountCreatedAt` are supplied by the caller so this
 * stays a pure helper.
 */
export function resolveStartDate(
  explicit: string | null,
  matchCreatedAt: string | null | undefined,
  accountCreatedAt: string | null | undefined
): string | null {
  if (explicit) return explicit;
  if (matchCreatedAt) return String(matchCreatedAt);
  if (accountCreatedAt) return String(accountCreatedAt);
  return null;
}

/** Whole days between a start date and now (0 when the date is today or unknown-far-future). */
export function daysBetween(dateStr: string | null): number {
  if (!dateStr) return 0;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}

/** Days until an anniversary (or null when none set). */
export function daysUntilAnniversary(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return null;
  const thisYear = new Date(d);
  thisYear.setFullYear(new Date().getFullYear());
  let diff = Math.floor((thisYear.getTime() - Date.now()) / 86400000);
  if (diff < 0) {
    const nextYear = new Date(d);
    nextYear.setFullYear(new Date().getFullYear() + 1);
    diff = Math.floor((nextYear.getTime() - Date.now()) / 86400000);
  }
  return diff;
}

// ── 2. Love reasons ─────────────────────────────────────────────────

/** Unrevealed reasons written TO this user, newest first. */
export async function getUnrevealedReasons(userId: string): Promise<LoveReason[]> {
  try {
    const { data, error } = await supabase
      .from('love_reasons')
      .select('id, text, created_at, revealed_at, sender:profiles!love_reasons_sender_id_fkey(username)')
      .eq('receiver_id', userId)
      .is('revealed_at', null)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return [];
    return (data || []).map((r: any) => ({
      id: r.id,
      text: r.text,
      sender_username: r.sender?.username || null,
      created_at: r.created_at,
      revealed_at: r.revealed_at,
    }));
  } catch {
    return [];
  }
}

/** How many reasons I've already revealed (for the "x of y unlocked" label). */
export async function getRevealedCount(userId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('love_reasons')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .not('revealed_at', 'is', null);
    return count || 0;
  } catch {
    return 0;
  }
}

/** Reveal exactly one unrevealed reason and return it. */
export async function unlockNextReason(userId: string): Promise<LoveReason | null> {
  try {
    const reasons = await getUnrevealedReasons(userId);
    const next = reasons[0];
    if (!next) return null;
    await supabase
      .from('love_reasons')
      .update({ revealed_at: new Date().toISOString() })
      .eq('id', next.id);
    return { ...next, revealed_at: new Date().toISOString() };
  } catch {
    return null;
  }
}

/** Add a reason for your partner (triggers a notification + realtime event). */
export async function addLoveReason(
  senderId: string,
  receiverId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const clean = text.trim();
  if (clean.length < 3) return { ok: false, error: 'A little longer, please' };
  try {
    const { error } = await supabase
      .from('love_reasons')
      .insert({ sender_id: senderId, receiver_id: receiverId, text: clean });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save' };
  }
}

// ── 3. Milestones ("Our Story" timeline) ───────────────────────────

/** Milestones belonging to me OR my partner, newest first. */
export async function getMilestones(userId: string, partnerId?: string | null): Promise<Milestone[]> {
  try {
    const ids = partnerId ? [userId, partnerId] : [userId];
    const { data, error } = await supabase
      .from('milestones')
      .select('id, type, title, description, emoji, created_at, author:profiles!milestones_user_id_fkey(username)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) return [];
    return (data || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      description: m.description,
      emoji: m.emoji || '💕',
      author_username: m.author?.username || null,
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

/** Manually add a memory to the timeline. */
export async function addMilestone(
  userId: string,
  input: { type?: string; title: string; description?: string; emoji?: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('milestones').insert({
      user_id: userId,
      type: input.type || 'memory',
      title: input.title.slice(0, 80),
      description: input.description?.slice(0, 500) || null,
      emoji: input.emoji || '💕',
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save' };
  }
}

/**
 * Auto-log one-shot milestones (first match, first game).
 * The unique index on (user_id, type) for these types makes them
 * idempotent — ON CONFLICT DO NOTHING.
 */
export async function logAutoMilestone(
  userId: string,
  type: 'first_match' | 'first_game',
  title: string,
  emoji: string
): Promise<void> {
  try {
    await supabase.from('milestones').upsert(
      { user_id: userId, type, title, emoji },
      { onConflict: 'user_id,type' }
    );
  } catch {
    /* best-effort */
  }
}

// ── 4. Birthday surprise pool ──────────────────────────────────────

export async function getSurprisePool(siteId: string): Promise<SurpriseContribution[]> {
  try {
    const { data, error } = await supabase
      .from('surprise_pool')
      .select('id, contributor, message, created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return [];
    return (data || []) as SurpriseContribution[];
  } catch {
    return [];
  }
}

export async function addToSurprisePool(
  siteId: string,
  contributor: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const cleanContrib = contributor.trim().slice(0, 60);
  const cleanMsg = message.trim().slice(0, 500);
  if (!cleanMsg) return { ok: false, error: 'Write a little something first' };
  try {
    const { error } = await supabase
      .from('surprise_pool')
      .insert({ site_id: siteId, contributor: cleanContrib || 'Someone', message: cleanMsg });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save' };
  }
}

// ── 5. Partner activity feed ───────────────────────────────────────

/** Recent game sessions the partner took part in (needs the couples RLS policy). */
export async function getPartnerActivity(
  userId: string,
  partnerId: string
): Promise<PartnerActivity[]> {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id, game_type, status, ended_at')
      .or(`player1_id.eq.${partnerId},player2_id.eq.${partnerId}`)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) {
      // RLS may hide cross-user sessions until the couples policy is live;
      // that's not an app-level failure.
      return [];
    }
    void userId;
    return (data || []).map((s: any) => ({
      session_id: s.id,
      game_type: s.game_type,
      status: s.status,
      ended_at: s.ended_at,
    }));
  } catch {
    return [];
  }
}
