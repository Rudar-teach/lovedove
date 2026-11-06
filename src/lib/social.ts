/**
 * Love Dove — Social Layer
 *
 * One place for friend requests, presence, and play invites.
 * All functions take the current user id explicitly so they can be used
 * from any component (pages, sidebars, providers) without duplicating logic.
 */

import { supabase } from './supabase';
import { generateGameCode } from './gameShare';

export interface FriendProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
}

export type FriendRelation = {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  /** Direction relative to the current user */
  direction: 'sent' | 'received';
  created_at: string;
  accepted_at: string | null;
  friend: FriendProfile;
};

export type PlayInvite = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  game_slug: string;
  session_code: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  sender?: FriendProfile;
};

const PROFILE_COLS = 'id, full_name, username, avatar_url, is_online, last_seen';
/** Columns that exist in the base schema, before the social/presence migration. */
const PROFILE_COLS_MIN = 'id, full_name, username, avatar_url';

/** Friendly message shown when the live DB hasn't had the social migration yet. */
const DB_PENDING_ERROR =
  'Friends are still being set up on the server — please try again in a few minutes.';

function isTableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === 'PGRST205' || (error.message || '').includes('Could not find the table');
}

function isColumnMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42703' ||
    (error.message || '').includes('does not exist')
  );
}

/** Fill presence fields with safe defaults; tolerant of partial / migrated rows. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withPresenceDefaults(p: any): FriendProfile {
  return {
    id: p.id as string,
    full_name: p.full_name ?? null,
    username: p.username ?? null,
    avatar_url: p.avatar_url ?? null,
    is_online: Boolean(p.is_online),
    last_seen: p.last_seen ?? null,
  };
}

/** Fetch every friend + pending request involving this user, in one query. */
export async function fetchFriendRelations(userId: string): Promise<{
  friends: FriendRelation[];
  incoming: FriendRelation[];
  outgoing: FriendRelation[];
}> {
  // Minimal profile columns keep the join working even when the presence
  // migration (is_online/last_seen) hasn't been applied yet.
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id, sender_id, receiver_id, status, created_at, accepted_at,
      sender:profiles!friend_requests_sender_id_fkey(${PROFILE_COLS_MIN}),
      receiver:profiles!friend_requests_receiver_id_fkey(${PROFILE_COLS_MIN})
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    if (isTableMissing(error)) {
      console.warn('[social] friend_requests table missing — run the social migration', error.message);
      return { friends: [], incoming: [], outgoing: [] };
    }
    return { friends: [], incoming: [], outgoing: [] };
  }
  if (!data) return { friends: [], incoming: [], outgoing: [] };

  const friends: FriendRelation[] = [];
  const incoming: FriendRelation[] = [];
  const outgoing: FriendRelation[] = [];

  for (const row of data as any[]) {
    const isSender = row.sender_id === userId;
    const relation: FriendRelation = {
      id: row.id,
      status: row.status,
      direction: isSender ? 'sent' : 'received',
      created_at: row.created_at,
      accepted_at: row.accepted_at,
      friend: isSender ? row.receiver : row.sender,
    };
    if (row.status === 'accepted') friends.push(relation);
    else if (row.status === 'pending') {
      (isSender ? outgoing : incoming).push(relation);
    }
  }

  // Best-effort presence enrichment: fills is_online/last_seen when the
  // migration has been applied; silently no-ops when it hasn't.
  const ids = [...new Set([...friends, ...incoming, ...outgoing].map(r => r.friend?.id).filter(Boolean))] as string[];
  if (ids.length > 0) {
    const { data: presence } = await supabase
      .from('profiles')
      .select('id, is_online, last_seen')
      .in('id', ids)
      .limit(100);
    if (presence) {
      const map = new Map(presence.map(p => [p.id, p]));
      for (const r of [...friends, ...incoming, ...outgoing]) {
        if (!r.friend) continue;
        const p = map.get(r.friend.id);
        r.friend = withPresenceDefaults({ ...r.friend, is_online: p?.is_online, last_seen: p?.last_seen });
      }
    }
  }

  return { friends, incoming, outgoing };
}

/** Search profiles by username or name. Never returns the current user. */
export async function searchProfiles(query: string, excludeId: string): Promise<FriendProfile[]> {
  const q = query.trim().replace(/^@/, '');
  if (q.length < 2) return [];

  const run = (cols: string) =>
    supabase
      .from('profiles')
      .select(cols)
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .neq('id', excludeId)
      .limit(20);

  let { data, error } = await run(PROFILE_COLS);
  if ((isColumnMissing(error) || isTableMissing(error)) && data === undefined) {
    // Presence columns may not exist yet — retry with the minimal set.
    ({ data, error } = await run(PROFILE_COLS_MIN));
  }

  if (error || !data) return [];
  return data.map(withPresenceDefaults);
}

/** Look up a single profile by exact username (case-insensitive). */
export async function getProfileByUsername(username: string): Promise<FriendProfile | null> {
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  if (!clean) return null;

  const run = (cols: string) =>
    supabase.from('profiles').select(cols).eq('username', clean).maybeSingle();

  let { data, error } = await run(PROFILE_COLS);
  if (isColumnMissing(error) && !data) ({ data, error } = await run(PROFILE_COLS_MIN));

  if (error || !data) return null;
  return withPresenceDefaults(data as unknown as Record<string, unknown>);
}

/** Is a username already taken? */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', clean)
    .maybeSingle();
  return !!data;
}

export type SendRequestResult = { ok: true; alreadyFriends?: boolean } | { ok: false; error: string };

/** Send a friend request to a profile id. Idempotent for existing rows. */
export async function sendFriendRequest(fromId: string, toId: string): Promise<SendRequestResult> {
  if (fromId === toId) return { ok: false, error: 'You cannot add yourself' };

  // Already friends / pending?
  const { data: existing, error: readErr } = await supabase
    .from('friend_requests')
    .select('id, status, sender_id')
    .or(`and(sender_id.eq.${fromId},receiver_id.eq.${toId}),and(sender_id.eq.${toId},receiver_id.eq.${fromId})`)
    .maybeSingle();

  if (readErr && isTableMissing(readErr)) {
    return { ok: false, error: DB_PENDING_ERROR };
  }

  if (existing) {
    if (existing.status === 'accepted') return { ok: true, alreadyFriends: true };
    if (existing.status === 'pending') {
      // If they sent it to us, auto-accept (mutual add). Otherwise just report.
      if (existing.sender_id !== fromId) {
        const { error: accErr } = await supabase
          .from('friend_requests')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (!accErr) return { ok: true };
        return { ok: false, error: 'Could not accept request' };
      }
      return { ok: false, error: 'Request already sent' };
    }
  }

  const { error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: fromId, receiver_id: toId, status: 'pending' });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Send a request by username — the main path used by the add-friend search. */
export async function sendFriendRequestByUsername(fromId: string, username: string): Promise<SendRequestResult> {
  const profile = await getProfileByUsername(username);
  if (!profile) return { ok: false, error: 'No user found with that username' };
  return sendFriendRequest(fromId, profile.id);
}

/** Accept or reject an incoming request. */
export async function respondToFriendRequest(
  requestId: string,
  accept: boolean
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('friend_requests')
    .update({
      status: accept ? 'accepted' : 'rejected',
      accepted_at: accept ? new Date().toISOString() : null,
    })
    .eq('id', requestId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Remove a friend (deletes the friendship row either direction). */
export async function removeFriend(requestId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('friend_requests').delete().eq('id', requestId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Online friends (accepted + is_online), most recently seen first. */
export async function fetchOnlineFriends(userId: string): Promise<FriendRelation[]> {
  const { friends } = await fetchFriendRelations(userId);
  return friends
    .filter(f => f.friend.is_online)
    .sort((a, b) => (b.friend.last_seen || '').localeCompare(a.friend.last_seen || ''));
}

/** Send a real-time play invite. Creates a game session code automatically. */
export async function sendPlayInvite(
  fromId: string,
  toId: string,
  gameSlug: string
): Promise<{ ok: boolean; sessionCode?: string; error?: string }> {
  if (fromId === toId) return { ok: false, error: 'Cannot invite yourself' };

  // Reuse a pending invite if one exists for the same game
  const { data: existing } = await supabase
    .from('play_invites')
    .select('id, session_code, created_at')
    .eq('from_user_id', fromId)
    .eq('to_user_id', toId)
    .eq('game_slug', gameSlug)
    .eq('status', 'pending')
    .maybeSingle();

  let code = existing?.session_code;

  if (!code) {
    code = generateGameCode();
    const { error } = await supabase.from('play_invites').insert({
      from_user_id: fromId,
      to_user_id: toId,
      game_slug: gameSlug,
      session_code: code,
      status: 'pending',
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, sessionCode: code };
}

/** Mark an invite accepted/declined. */
export async function respondToPlayInvite(
  inviteId: string,
  accept: boolean
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('play_invites')
    .update({ status: accept ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
    .eq('id', inviteId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Pending invites sent TO me (for the notifications bell). */
export async function fetchIncomingPlayInvites(userId: string): Promise<PlayInvite[]> {
  const { data, error } = await supabase
    .from('play_invites')
    .select(`
      id, from_user_id, to_user_id, game_slug, session_code, status, created_at,
      sender:profiles!play_invites_from_user_id_fkey(${PROFILE_COLS})
    `)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as any[]).map(r => ({ ...r, sender: r.sender }));
}

/** Share link for the current user's profile invite page. */
export function getFriendInviteLink(userId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/add-friends?invite=${userId}`;
}

/** Share link to a specific game with an online friend. */
export function getPlayTogetherLink(gameSlug: string, sessionCode?: string): string {
  if (typeof window === 'undefined') return '';
  const base = `${window.location.origin}/games/${gameSlug}`;
  return sessionCode ? `${base}?session=${sessionCode}` : base;
}
