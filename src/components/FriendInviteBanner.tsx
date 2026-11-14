'use client';

/**
 * Love Dove — Big, clear friend-invitation banner.
 *
 * Mounted globally (layout.tsx). The moment a signed-in user opens ANY page,
 * this checks for:
 *   1. incoming pending friend requests ("@x wants to be your friend")
 *   2. unread friend-message notifications ("@x just messaged you")
 *   3. unread match/invite notifications
 * and raises a big, hard-to-miss card top-center of the screen with
 * Accept / Decline actions — so invites never sit silently in the
 * notifications page.
 *
 * Polls once on load + every 20s, and subscribes to realtime INSERTs on
 * friend_requests / notifications so a banner appears live, mid-session.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Gift, X, Check, ChevronRight, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { respondToFriendRequest } from '@/lib/social';
import { useAuthStore } from '@/stores/useAuthStore';

type InviteKind = 'friend_request' | 'friend_message' | 'match';

interface BigInvite {
  kind: InviteKind;
  title: string;
  body: string;
  emoji: string;
  fromUsername: string | null;
  fromId: string | null;
  requestId?: string; // for friend_request accept/decline
  href: string;
}

export default function FriendInviteBanner() {
  const user = useAuthStore((s) => s.user);
  const [invite, setInvite] = useState<BigInvite | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    if (!user) return;
    const me = user.id;

    // 1) Incoming friend requests — the "big clear invitation".
    const { data: reqs } = await supabase
      .from('friend_requests')
      .select(`
        id, sender_id, receiver_id,
        sender:profiles!friend_requests_sender_id_fkey(id, full_name, username, avatar_url)
      `)
      .eq('receiver_id', me)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3);

    if (reqs && reqs.length > 0) {
      const r = reqs[0] as any;
      const name = r.sender?.full_name || r.sender?.username || 'Someone';
      setInvite({
        kind: 'friend_request',
        title: `${name} wants to be your friend 💌`,
        body: r.sender?.username
          ? `@${r.sender.username} sent you a friend invitation — accept to chat, play games and share your story.`
          : 'Accept to chat, play games and share your story together.',
        emoji: '💌',
        fromUsername: r.sender?.username ?? null,
        fromId: r.sender?.id ?? null,
        requestId: r.id,
        href: '/add-friends',
      });
      return;
    }

    // 2) Unread friend-message notifications ("@x just messaged you").
    const { data: notifs } = await supabase
      .from('notifications')
      .select('id, type, title, message, data, read, created_at')
      .eq('user_id', me)
      .or("type.eq.friend_message,type.eq.match_found")
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (notifs && notifs.length > 0) {
      const n = notifs[0] as any;
      const senderSlug: string | undefined = n.data?.slug ?? n.data?.sender_username;
      setInvite({
        kind: n.type === 'friend_message' ? 'friend_message' : 'match',
        title: n.type === 'friend_message'
          ? `💬 ${senderSlug ? `@${senderSlug}` : 'A friend'} just messaged you`
          : '🎉 A new match found you!',
        body: n.type === 'friend_message'
          ? 'Open the chat to reply — every message you send climbs your miss-meter ranking together.'
          : 'Someone connected with you. Open your dashboard to see who it is.',
        emoji: n.type === 'friend_message' ? '💬' : '💞',
        fromUsername: senderSlug ?? null,
        fromId: (n.data?.sender_id ?? null),
        href: senderSlug
          ? `/chat/friend/${n.data?.sender_id ?? n.id}`
          : '/dashboard',
      });
      return;
    }

    setInvite(null);
  }, [user]);

  // Poll on load + every 20s.
  useEffect(() => {
    if (!user) { setInvite(null); return; }
    void check();
    const t = setInterval(() => void check(), 20000);
    return () => clearInterval(t);
  }, [check, user]);

  // Live: appears the second a request/notification lands, no reload needed.
  useEffect(() => {
    if (!user) return;
    const me = user.id;
    const channel = supabase
      .channel(`invite-banner-${me}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${me}` }, () => { void check(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${me}` }, () => { void check(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [check, user]);

  const act = async (accept: boolean) => {
    if (!invite) return;
    setBusy(true);
    try {
      if (invite.kind === 'friend_request' && invite.requestId) {
        await respondToFriendRequest(invite.requestId, accept);
      }
      setInvite(null);
      await check();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {invite && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-pink-900/20 border-2 border-pink-200 p-5 sm:p-6">
            {/* soft glow strip */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500" />
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-pink-200">
                {invite.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-pink-500 mb-0.5">
                  {invite.kind === 'friend_request' ? 'New invitation for you' : 'New activity for you'}
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">{invite.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{invite.body}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {invite.kind === 'friend_request' ? (
                    <>
                      <button
                        onClick={() => act(true)}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-pink-200/60 hover:scale-[1.02] transition disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Accept friend
                      </button>
                      <button
                        onClick={() => act(false)}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-2xl hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  ) : (
                    <Link
                      href={invite.href}
                      onClick={() => setInvite(null)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-pink-200/60 hover:scale-[1.02] transition"
                    >
                      {invite.kind === 'friend_message' ? <MessageCircle className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      Open
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={invite.href}
                    onClick={() => setInvite(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-purple-600 hover:text-purple-800 transition"
                  >
                    <Users className="w-4 h-4" /> {invite.kind === 'friend_request' ? 'See all' : 'View'}
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setInvite(null)}
                aria-label="Dismiss"
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
