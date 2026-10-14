'use client';

/**
 * Love Dove — Play Invite Notifications
 *
 * Mounted once in the root layout. Watches for play invites addressed to the
 * signed-in user and raises them two ways:
 *
 *   1. A browser (Web Notification) alert, so the user hears about the invite
 *      even while they are on a different tab.
 *   2. A dismissible in-page banner at the bottom of the screen.
 *
 * Both entry points let the recipient accept or decline. Accepting marks the
 * invite accepted in the database, which flips the sender's page into the
 * started-game state through their own realtime subscription.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { respondToPlayInvite } from '@/lib/social';
import { BellRing, Check, X, Loader2 } from 'lucide-react';

type IncomingInvite = {
  id: string;
  from_user_id: string;
  game_slug: string;
  senderName: string;
};

type InviteContextValue = {
  /** Current pending invite awaiting a decision, if any. */
  pending: IncomingInvite | null;
  accept: () => Promise<void>;
  decline: () => Promise<void>;
  /** True once the browser has granted Notification permission. */
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
};

const InviteContext = createContext<InviteContextValue>({
  pending: null,
  accept: async () => {},
  decline: async () => {},
  notificationsEnabled: false,
  enableNotifications: async () => {},
});

export const usePlayInvites = () => useContext(InviteContext);

const GAME_NAMES: Record<string, string> = {
  love_compatibility: 'Love Compatibility',
  truthordare: 'Truth or Dare',
  tictactoe: 'Tic-Tac-Toe',
  couplequiz: 'Couple Quiz',
};

function gameLabel(slug: string): string {
  return GAME_NAMES[slug] || slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function PlayInviteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [pending, setPending] = useState<IncomingInvite | null>(null);
  const [busy, setBusy] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // ── Track the signed-in user ────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (alive) setUserId(session?.user?.id ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setUserId(session?.user?.id ?? null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  // ── Reflect current browser-notification permission ─────────────────
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  const enableNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return;
    }
    const result = await Notification.requestPermission();
    setNotificationsEnabled(result === 'granted');
  }, []);

  // ── Listen for invites addressed to me ──────────────────────────────
  useEffect(() => {
    if (!userId) {
      setPending(null);
      return;
    }

    const channel = supabase
      .channel(`play-invites-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'play_invites',
          filter: `to_user_id=eq.${userId}`,
        },
        async (payload: any) => {
          const row = payload.new;
          if (!row || row.status !== 'pending') return;

          // Resolve the sender's display name for the alert copy.
          let senderName = 'Someone';
          try {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', row.from_user_id)
              .maybeSingle();
            if (data) senderName = data.full_name || data.username || 'Someone';
          } catch {
            // A missing name should not stop the invite from showing.
          }

          const invite: IncomingInvite = {
            id: row.id,
            from_user_id: row.from_user_id,
            game_slug: row.game_slug,
            senderName,
          };
          setPending(invite);

          const body = `${senderName} wants to play ${gameLabel(row.game_slug)} with you!`;

          // Browser alert. Guarded so a denied permission degrades quietly.
          try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Love Dove — Play invite 💕', {
                body,
                icon: '/favicon.ico',
                tag: `invite-${row.id}`,
              });
            }
          } catch {
            // Some browsers require a service worker; the banner still shows.
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const accept = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await respondToPlayInvite(pending.id, true);
      // The sender's subscription starts their game; we go straight to it too.
      router.push(`/games/${pending.game_slug}`);
    } finally {
      setBusy(false);
      setPending(null);
    }
  }, [pending, router]);

  const decline = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await respondToPlayInvite(pending.id, false);
    } finally {
      setBusy(false);
      setPending(null);
    }
  }, [pending]);

  return (
    <InviteContext.Provider value={{ pending, accept, decline, notificationsEnabled, enableNotifications }}>
      {children}

      {/* ── In-page invite banner ───────────────────────────────────── */}
      {pending && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-rose-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm">Play invite!</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  <span className="font-semibold text-gray-900">{pending.senderName}</span> wants to play{' '}
                  <span className="font-semibold text-rose-600">{gameLabel(pending.game_slug)}</span> with you.
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={accept}
                    disabled={busy}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Accept
                  </button>
                  <button
                    onClick={decline}
                    disabled={busy}
                    className="px-4 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <X className="w-4 h-4" />
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── One-time prompt to enable browser notifications ──────────── */}
      {userId && !notificationsEnabled && !pending && typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'default' && (
        <button
          onClick={enableNotifications}
          className="fixed bottom-4 right-4 z-[90] bg-white shadow-xl border border-rose-200 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-rose-600 hover:border-rose-300 transition-colors flex items-center gap-2"
        >
          <BellRing className="w-4 h-4 text-rose-500" />
          Turn on game alerts
        </button>
      )}
    </InviteContext.Provider>
  );
}
