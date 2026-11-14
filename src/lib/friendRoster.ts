/**
 * Love Dove — Friend roster with presence + miss-meter ranking.
 *
 * One call returns everyone you can message: your partner, your accepted
 * friends, and for each of them their live online status and where they sit
 * on your "love ladder" (rank by how much you've talked). The dashboard's
 * friend card and the /chat/[id] messaging page both build on this.
 */

import { supabase } from './supabase';
import { fetchFriendRanking, type FriendRanking } from './friendMessages';

export interface RosterFriend {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
  via: 'partner' | 'friend';
  rank: number; // 1 = most messaged; 0 = no messages yet
  ranking: FriendRanking;
}

/** 1-based rank per friend; absent → rank 0. Sorted by exchanged desc. */
function rankMap(ranking: Map<string, FriendRanking>): Map<string, number> {
  const sorted = [...ranking.values()].sort((a, b) => b.exchanged - a.exchanged);
  const out = new Map<string, number>();
  sorted.forEach((r, i) => out.set(r.friendId, i + 1));
  return out;
}

/**
 * Build the full roster. `friendIds` is the accepted `friend_requests` set
 * and `partnerIds` the accepted `matches` set — pass both so partner sorts
 * first and gets a heart. Everything degrades to an empty roster if the
 * tables are still pending.
 */
export async function buildRoster(
  userId: string,
  partnerIds: string[],
  friendIds: string[]
): Promise<RosterFriend[]> {
  const seen = new Set<string>();
  const viaMap = new Map<string, 'partner' | 'friend'>();
  for (const id of partnerIds) if (id && !seen.has(id)) { seen.add(id); viaMap.set(id, 'partner'); }
  for (const id of friendIds) if (id && !seen.has(id)) { seen.add(id); viaMap.set(id, 'friend'); }

  const ids = [...seen];
  if (ids.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, is_online, last_seen')
    .in('id', ids)
    .limit(100);

  const [ranking] = await Promise.all([fetchFriendRanking(userId)]);
  const ranks = rankMap(ranking);

  const rows = (profiles || []).map((p: any) => {
    const r = ranking.get(p.id);
    const rank = ranks.get(p.id) || 0;
    return {
      id: p.id as string,
      name: p.full_name || p.username || 'Friend',
      username: p.username || '',
      avatar_url: p.avatar_url ?? null,
      is_online: Boolean(p.is_online),
      last_seen: p.last_seen ?? null,
      via: viaMap.get(p.id) || ('friend' as const),
      rank,
      ranking: r || {
        friendId: p.id,
        exchanged: 0,
        sentByMe: 0,
        unreadForMe: 0,
        last_message_at: null,
        last_message_body: null,
      },
    };
  });

  // Partner first, then online, then highest rank, then most recent.
  rows.sort((a, b) => {
    if (a.via !== b.via) return a.via === 'partner' ? -1 : 1;
    if (Number(b.is_online) !== Number(a.is_online)) return Number(b.is_online) - Number(a.is_online);
    if (b.rank !== a.rank) return b.rank - a.rank;
    return (b.ranking.last_message_at || '').localeCompare(a.ranking.last_message_at || '');
  });
  return rows;
}

/**
 * TTL cache for the id sets: the 30s dashboard poll keeps calling
 * resolveRosterIds, but the accepted-friends/partner sets rarely change —
 * the presence + message counts are what change every minute, and those
 * come from the profiles/ranking queries, not from here. 5min TTL means
 * a newly accepted friend shows up within 5 minutes at worst.
 */
const rosterIdsCache = new Map<string, { t: number; v: { partnerIds: string[]; friendIds: string[] } }>();
const ROSTER_IDS_TTL_MS = 5 * 60 * 1000;

/** Drop the cached id sets (call after adding/removing a friend). */
export function invalidateRosterIds(userId: string): void {
  rosterIdsCache.delete(userId);
}

/** Resolve partner + friend ids (the raw sets buildRoster consumes). */
export async function resolveRosterIds(userId: string): Promise<{ partnerIds: string[]; friendIds: string[] }> {
  const hit = rosterIdsCache.get(userId);
  if (hit && Date.now() - hit.t < ROSTER_IDS_TTL_MS) return hit.v;
  // Partner from accepted/connected matches (production `status` column).
  let partnerIds: string[] = [];
  const { data: matchData, error: mErr } = await supabase
    .from('matches')
    .select('user1_id, user2_id, status')
    .or(`and(user1_id.eq.${userId},status.in.(accepted,connected)),and(user2_id.eq.${userId},status.in.(accepted,connected))`)
    .limit(10);
  if (!mErr) {
    partnerIds = (matchData || []).map((m: any) => (m.user1_id === userId ? m.user2_id : m.user1_id));
  } else {
    const { data: legacy } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .or(`and(user1_id.eq.${userId},user1_accepted.eq.true),and(user2_id.eq.${userId},user2_accepted.eq.true)`)
      .limit(10);
    partnerIds = (legacy || []).map((m: any) => (m.user1_id === userId ? m.user2_id : m.user1_id));
  }

  const { data: reqData } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .limit(50);
  const friendIds = (reqData || []).map((r: any) => (r.sender_id === userId ? r.receiver_id : r.sender_id));

  const value = { partnerIds, friendIds };
  rosterIdsCache.set(userId, { t: Date.now(), v: value });
  return value;
}

/** Full convenience: ids + roster in one go. */
export async function fetchFriendRoster(userId: string): Promise<RosterFriend[]> {
  if (!userId) return [];
  const { partnerIds, friendIds } = await resolveRosterIds(userId);
  return buildRoster(userId, partnerIds, friendIds);
}
