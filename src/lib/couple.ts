import { supabase } from './supabase';

// ── Shared "togetherness" brain ──────────────────────────────────────
//
// One helper every miss-meter / love-wall / live-card screen reads from.
// It resolves "your partner" from an accepted, active `matches` row,
// reads their live presence from `profiles`, and derives the miss meter
// from the couple's shared activity (get_couple_streak) plus any unread
// "missed you" entries.
//
// It never throws — every field degrades to a safe default so a missing
// partner or a hiccup in one query can't blank a whole screen.

export interface PartnerInfo {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
}

export interface UnreadEntry {
  id: string;
  message: string;
  photo_url: string | null;
  created_at: string;
}

export interface CoupleState {
  /** null when the user has no partner yet. */
  partner: PartnerInfo | null;
  /** Whole days since the two of you were last active together (0 = together today). */
  daysApart: number;
  /** True when both of you are online right now. */
  bothOnlineNow: boolean;
  /** 0–100. How "full" the miss meter is (capped at the meter cap). */
  meterPct: number;
  /** Unread "missed you" entries waiting for this user. */
  unreadCount: number;
  unread: UnreadEntry[];
}

// Miss meter caps at this many days apart — beyond it the meter just
// stays full ("I miss you MORE than words").
const METER_CAP_DAYS = 7;

const PROFILE_COLS = 'id, full_name, username, avatar_url, is_online, last_seen';

/**
 * Resolve "your partner" = the other side of your accepted match.
 *
 * The production `matches` table uses a `status` column
 * ('pending' | 'accepted' | 'rejected' | 'connected') — the older
 * `user1_accepted` / `is_active` columns don't exist there, so query both
 * shapes and never throw: if the accepted-match query fails (column
 * missing), retry with a permissive query.
 *
 * Results are cached for 60s: the partner rarely changes, but this is
 * called on mount AND on 30s presence polls from several pages at once.
 */
const partnerTtlCache = new Map<string, { t: number; v: PartnerInfo | null }>();
const PARTNER_TTL_MS = 60_000;

export async function resolvePartner(userId: string): Promise<PartnerInfo | null> {
  const hit = partnerTtlCache.get(userId);
  if (hit && Date.now() - hit.t < PARTNER_TTL_MS) return hit.v;

  let matches: any[] | null = null;
  const { data, error } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id, status, created_at')
    .or(
      `and(user1_id.eq.${userId},status.in.(accepted,connected)),` +
      `and(user2_id.eq.${userId},status.in.(accepted,connected))`
    )
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data) {
    // Permissive fallback (also covers legacy schemas, and finds any match
    // so partner resolution never hard-fails).
    const { data: legacy } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id, status, created_at')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1);
    matches = legacy;
  } else {
    matches = data;
  }

  const m = (matches || [])[0] as any;
  if (!m) return null;
  const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
  if (!partnerId) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_COLS)
    .eq('id', partnerId)
    .maybeSingle();

  if (!profile) {
    partnerTtlCache.set(userId, { t: Date.now(), v: null });
    return null;
  }
  const partner: PartnerInfo = {
    id: profile.id,
    full_name: profile.full_name || '',
    username: profile.username || '',
    avatar_url: profile.avatar_url,
  };
  partnerTtlCache.set(userId, { t: Date.now(), v: partner });
  return partner;
}

/** Drop the cached partner for a user (call when the partner relationship
 *  may have just changed — e.g. after a new match is accepted). */
export function invalidatePartnerCache(userId: string): void {
  partnerTtlCache.delete(userId);
}

/**
 * The whole couple state in one call. Pass the signed-in user's id;
 * partner/presence/meter/entries are all derived here so screens stay thin.
 */
export async function getCoupleState(userId: string | null): Promise<CoupleState> {
  const empty: CoupleState = {
    partner: null,
    daysApart: 0,
    bothOnlineNow: false,
    meterPct: 0,
    unreadCount: 0,
    unread: [],
  };
  if (!userId) return empty;

  const [partner, me, unread] = await Promise.all([
    resolvePartner(userId),
    supabase.from('profiles').select(PROFILE_COLS).eq('id', userId).maybeSingle(),
    // Unread "missed you" entries waiting for ME.
    supabase
      .from('missed_you_entries')
      .select('id, message, photo_url, created_at')
      .eq('partner_id', userId)
      .is('revealed_at', null)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (!partner) {
    // Still load my unread count in case a partner got resolved elsewhere.
    const entries = unread.data || [];
    return { ...empty, unreadCount: entries.length, unread: entries };
  }

  const partnerRow = (await supabase
    .from('profiles')
    .select('is_online, last_seen')
    .eq('id', partner.id)
    .maybeSingle())?.data as { is_online?: boolean; last_seen?: string } | undefined;

  const myOnline = Boolean(me.data?.is_online);
  const partnerOnline = Boolean(partnerRow?.is_online);

  // Days apart, straight from the couple's shared activity.
  let daysApart = 0;
  const { data: streak } = await supabase.rpc('get_couple_streak', {
    p_a: userId,
    p_b: partner.id,
  });
  const lastTogether = (streak as any)?.last_together_at;
  if (lastTogether) {
    const then = new Date(lastTogether);
    const now = new Date();
    daysApart = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86400000));
  }

  const meterPct = Math.min(100, Math.round((daysApart / METER_CAP_DAYS) * 100));

  const entries = unread.data || [];

  return {
    partner,
    daysApart,
    bothOnlineNow: myOnline && partnerOnline,
    meterPct,
    unreadCount: entries.length,
    unread: entries,
  };
}

/** Create a "missed you" entry for your partner. */
export async function addMissedYouEntry(
  senderId: string,
  partnerId: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('missed_you_entries').insert({
    sender_id: senderId,
    partner_id: partnerId,
    message,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark the entries I just read as revealed. */
export async function markEntriesRevealed(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await supabase
    .from('missed_you_entries')
    .update({ revealed_at: new Date().toISOString() })
    .eq('partner_id', userId)
    .in('id', ids)
    .is('revealed_at', null);
}

/** A short human phrase for the meter ("3 days apart"). */
export function apartLabel(daysApart: number): string {
  if (daysApart <= 0) return "You're together today";
  if (daysApart === 1) return '1 day apart';
  return `${daysApart} days apart`;
}
