'use client';

/**
 * Friend messaging — a 1:1 chat built on the `friend_messages` table.
 *
 * The URL is /chat/friend/<friendProfileId>. Reach it from the dashboard's
 * friend list (the "Message" button on each friend card) or from the
 * FriendInviteBanner when someone messages you first.
 *
 * Every message you send lands in the recipient's `notifications` table
 * (a DB trigger), so it shows up in their banner + notifications page the
 * moment they open the site.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Trophy, Wifi, WifiOff, Heart, MessageCircleHeart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  fetchConversation, sendFriendMessage, markConversationRead,
} from '@/lib/friendMessages';
import { fetchFriendRanking } from '@/lib/friendMessages';
import toast from 'react-hot-toast';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
}

export default function FriendChatPage() {
  const params = useParams();
  const router = useRouter();
  const friendId = String(params.id ?? '');
  const user = useAuthStore((s) => s.user);

  const [friend, setFriend] = useState<Friend | null>(null);
  const [thread, setThread] = useState<Awaited<ReturnType<typeof fetchConversation>>>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [exchanged, setExchanged] = useState(0);
  const [rank, setRank] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const meId = user?.id ?? '';

  useEffect(() => {
    if (!user) router.replace('/auth/login');
  }, [user, router]);

  // Load friend profile + conversation once (and when I send a message).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!friendId) return;
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_online, last_seen')
        .eq('id', friendId)
        .maybeSingle();
      if (cancelled || !data) { setFriend(null); return; }
      setFriend(data as unknown as Friend);
      const msgs = await fetchConversation(meId, friendId);
      if (cancelled) return;
      setThread(msgs);
      // Read anything they sent me.
      await markConversationRead(meId, friendId);
      // Where do I sit on the love ladder?
      const ranking = await fetchFriendRanking(meId);
      if (cancelled) return;
      const mine = ranking.get(friendId);
      setExchanged(mine?.exchanged ?? 0);
      setRank([...ranking.values()].filter(r => r.exchanged >= (mine?.exchanged ?? 1) && r.friendId !== friendId).length + 1);
    };
    void load();
    const t = setInterval(() => { void load(); }, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, [friendId, meId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async () => {
    if (!draft.trim() || !meId || !friendId) return;
    setSending(true);
    const res = await sendFriendMessage(meId, friendId, draft);
    setSending(false);
    if (res.ok) {
      const msgs = await fetchConversation(meId, friendId);
      setThread(msgs);
      setExchanged((n) => n + 1);
      toast.success('Sent 💌 They\'ll see it the moment they open the site');
    } else {
      toast.error(res.error || 'Could not send');
    }
    setDraft('');
  };

  const lastTime = useMemo(() => {
    const last = thread[thread.length - 1];
    if (!last?.created_at) return null;
    const d = new Date(last.created_at);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  }, [thread]);

  const lastFromMe = thread[thread.length - 1]?.sender_id === meId;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-xl hover:bg-pink-50 transition-colors text-gray-500"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {friend ? (
            <>
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {friend.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friend.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : friend.name.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${friend.is_online ? 'bg-green-400' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{friend.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  {friend.is_online
                    ? <><Wifi className="w-3 h-3 text-green-500" /> online now</>
                    : <><WifiOff className="w-3 h-3" /> last seen {lastTime}</>}
                  {friend.username && <span className="font-mono">@{friend.username}</span>}
                </p>
              </div>
              <div className="shrink-0 text-center px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">Love ladder</p>
                <p className="text-sm font-black text-amber-700 flex items-center gap-1 justify-center">
                  <Trophy className="w-3.5 h-3.5" /> #{rank} · {exchanged} msgs
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="font-bold text-gray-900 text-sm">Opening chat…</p>
              <p className="text-xs text-gray-400">Loading your conversation</p>
            </div>
          )}
        </div>
      </header>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {thread.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-5xl mb-3">💌</div>
              <p className="font-bold text-gray-800 mb-1">
                Say hi to {friend?.name ?? 'your friend'}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Your messages show up on their side the second they open the site — and every
                message moves you up the love ladder together.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {thread.map((m) => {
                const mine = m.sender_id === meId;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        mine
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-pink-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${mine ? 'text-pink-100/80' : 'text-gray-400'}`}>
                        {new Date(m.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-pink-100 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Write a message… 💕"
              className="flex-1 px-4 py-3 bg-pink-50/70 border border-pink-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              maxLength={500}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="w-12 h-12 shrink-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200/50 hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
            <MessageCircleHeart className="w-3 h-3 text-pink-400" />
            More messages with the same friend = higher love-ladder rank
            {rank > 0 && <> — you two are #{rank} now</>}
            <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
          </p>
        </div>
      </div>
    </div>
  );
}
