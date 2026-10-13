/**
 * Presence Heartbeat
 *
 * Marks the signed-in user as online in the `profiles` table every few seconds,
 * and periodically expires anyone who hasn't pinged in ~45s.
 *
 * Why client-side heartbeats instead of Supabase Realtime presence?
 * It works even with the anonymous key, needs no extra channel plumbing,
 * survives tab throttling (browsers keep setInterval alive at 1/min minimum),
 * and gives us a simple `is_online` column any query can filter on.
 */

import { supabase } from './supabase';

const HEARTBEAT_MS = 25000;      // ping every 25s
const EXPIRE_MS = 120000;        // sweep stale users every 2min

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let expireTimer: ReturnType<typeof setInterval> | null = null;
let currentUserId: string | null = null;

async function ping() {
  if (!currentUserId) return;
  try {
    await supabase.rpc('heartbeat_presence', { p_user_id: currentUserId });
  } catch {
    // offline or RLS hiccup — next tick will retry
  }
}

async function sweep() {
  try {
    await supabase.rpc('expire_stale_presence');
  } catch {
    // best-effort
  }
}

/**
 * Start the presence heartbeat for the given user.
 * Safe to call multiple times — it will simply swap the active user.
 */
export function startPresence(userId: string | null) {
  if (currentUserId === userId && heartbeatTimer) return;

  stopPresence();
  if (!userId) return;

  currentUserId = userId;
  void ping(); // immediate first ping

  heartbeatTimer = setInterval(() => void ping(), HEARTBEAT_MS);
  expireTimer = setInterval(() => void sweep(), EXPIRE_MS);

  // Flush on tab hide so the other side sees us go offline fast
  const onVisibility = () => {
    if (document.visibilityState === 'visible') void ping();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Best-effort "leave" ping when the tab actually closes
  const onUnload = () => {
    if (!currentUserId) return;
    try {
      void supabase.rpc('heartbeat_presence', { p_user_id: currentUserId });
    } catch { /* ignore */ }
  };
  window.addEventListener('pagehide', onUnload);
}

export function stopPresence() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  if (expireTimer) { clearInterval(expireTimer); expireTimer = null; }
  currentUserId = null;
}
