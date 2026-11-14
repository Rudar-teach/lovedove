/**
 * Love Dove — Friend messaging + Miss-Meter ranking
 *
 * `friend_messages` is the private chat between you and each friend. Every
 * message you send drops a `notifications` row for the recipient (a DB
 * trigger), so it surfaces the moment they open the site.
 *
 * The "Miss Meter ranking" is computed from real message volume: the more
 * you've messaged the same person, the higher they climb your "love
 * ladder". Rank 1 = the friend you talk to the most.
 */

import { supabase } from './supabase';

export interface FriendMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface FriendRanking {
  friendId: string;
  /** Total messages the two of you exchanged. */
  exchanged: number;
  /** How many YOU sent them (your effort). */
  sentByMe: number;
  /** Unread messages they sent you. */
  unreadForMe: number;
  last_message_at: string | null;
  last_message_body: string | null;
}

function isTableMissing(error: { code?: string; message?: string } | null): boolean {
  return !!error && (error.code === 'PGRST205' || (error.message || '').includes('Could not find the table'));
}

/** Conversation thread between me and one friend (both directions). */
export async function fetchConversation(meId: string, friendId: string, limit = 50): Promise<FriendMessage[]> {
  const { data, error } = await supabase
    .from('friend_messages')
    .select('id, sender_id, recipient_id, body, read_at, created_at')
    .or(`and(sender_id.eq.${meId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${meId})`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  // Return oldest-first for display.
  return (data as FriendMessage[]).reverse();
}

/**
 * Ranking across every friend that has chatted with me. A friend with
 * nothing yet is absent from the result — the caller merges them in as
 * rank 0 so the whole friend list still shows up.
 */
export async function fetchFriendRanking(meId: string): Promise<Map<string, FriendRanking>> {
  const map = new Map<string, FriendRanking>();
  const { data, error } = await supabase
    .from('friend_messages')
    .select('sender_id, recipient_id, body, created_at, read_at')
    .or(`sender_id.eq.${meId},recipient_id.eq.${meId}`)
    .limit(1000);
  if (error || !data) return map;

  for (const row of data as Array<Pick<FriendMessage, 'sender_id' | 'recipient_id' | 'body' | 'created_at' | 'read_at'>>) {
    const otherId = row.sender_id === meId ? row.recipient_id : row.sender_id;
    let entry = map.get(otherId);
    if (!entry) {
      entry = {
        friendId: otherId,
        exchanged: 0,
        sentByMe: 0,
        unreadForMe: 0,
        last_message_at: null,
        last_message_body: null,
      };
      map.set(otherId, entry);
    }
    entry.exchanged += 1;
    const iSent = row.sender_id === meId;
    if (iSent) entry.sentByMe += 1;
    if (!iSent && !row.read_at) entry.unreadForMe += 1;
    const t = row.created_at;
    if (!entry.last_message_at || t > entry.last_message_at) {
      entry.last_message_at = t;
      entry.last_message_body = row.body;
    }
  }
  return map;
}

/** Send me→friend. The DB trigger notifies them in-app automatically. */
export async function sendFriendMessage(
  meId: string,
  friendId: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (text.length === 0) return { ok: false, error: 'Type something first' };
  const { error } = await supabase.from('friend_messages').insert({
    sender_id: meId,
    recipient_id: friendId,
    body: text,
  });
  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: 'Messaging is still being set up — try again in a couple of minutes.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Mark all friend→me messages read. */
export async function markConversationRead(meId: string, friendId: string): Promise<void> {
  const ids: string[] = [];
  const { data } = await supabase
    .from('friend_messages')
    .select('id')
    .eq('sender_id', friendId)
    .eq('recipient_id', meId)
    .is('read_at', null)
    .limit(200);
  if (data?.length) ids.push(...data.map((r) => r.id));
  if (ids.length === 0) return;
  await supabase
    .from('friend_messages')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids);
}
