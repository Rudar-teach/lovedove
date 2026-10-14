'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Search, UserPlus, Users, Share2, Copy, Check, MessageCircle,
  Gamepad2, Bell, X, ArrowLeft, Sparkles, Link2, Send, Wifi, WifiOff,
  Instagram, Twitter, Facebook, Trash2, Clock, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  fetchFriendRelations, searchProfiles, sendFriendRequestByUsername,
  respondToFriendRequest, removeFriend, getFriendInviteLink,
  sendPlayInvite, type FriendRelation, type FriendProfile
} from '@/lib/social';
import toast from 'react-hot-toast';

type Tab = 'add' | 'friends' | 'requests';

const POPULAR_GAMES = [
  { slug: 'tictactoe', name: 'Tic-Tac-Toe', emoji: '❌' },
  { slug: 'memory', name: 'Memory Match', emoji: '🎴' },
  { slug: 'quiz', name: 'Couple Quiz', emoji: '💡' },
  { slug: 'wouldyourather', name: 'Would You Rather', emoji: '🤔' },
  { slug: 'rockpaperscissors', name: 'Rock Paper Scissors', emoji: '✋' },
  { slug: 'truthordare', name: 'Truth or Dare', emoji: '🎯' },
];

function timeAgo(iso: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AddFriendsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite');

  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('add');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [incoming, setIncoming] = useState<FriendRelation[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [invitingGame, setInvitingGame] = useState<string | null>(null);

  const inviteLink = useMemo(() => (userId ? getFriendInviteLink(userId) : ''), [userId]);

  // ── Load everything ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.replace('/auth/login'); return; }
    setUserId(session.user.id);

    const { friends: f, incoming: i, outgoing: o } = await fetchFriendRelations(session.user.id);
    setFriends(f);
    setIncoming(i);
    setOutgoing(o);

    // If the page was opened via ?invite=<id>, auto-send a request so the
    // inviter's friend list shows a pending request immediately.
    if (inviteCode && inviteCode !== session.user.id) {
      const res = await sendFriendRequestByUsername(session.user.id, inviteCode).catch(() => null);
      // inviteCode is actually a user id, not a username — handle that too
      if (!res?.ok) {
        await supabase.from('friend_requests').insert({
          sender_id: session.user.id,
          receiver_id: inviteCode,
          status: 'pending',
        });
      }
      toast.success('Friend request sent to your inviter! 💕');
    }

    setLoading(false);
  }, [router, inviteCode]);

  useEffect(() => { void load(); }, [load]);

  // ── Live refresh on friend request / accept ─────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`friends-page-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${userId}`,
      }, () => void load())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `sender_id=eq.${userId}`,
      }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, load]);

  // ── Debounced username / name search ────────────────────────────────────
  useEffect(() => {
    const q = search.trim().replace(/^@/, '');
    if (q.length < 2 || !userId) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const rows = await searchProfiles(q, userId);
      if (!cancelled) { setResults(rows); setSearching(false); }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search, userId]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleAddByUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const clean = search.trim().replace(/^@/, '');
    if (!clean) return;
    const res = await sendFriendRequestByUsername(userId, clean);
    if (res.ok) {
      if (res.alreadyFriends) toast.success('You are already friends! 💕');
      else toast.success('Friend request sent! 💕');
      setSearch('');
      setResults([]);
      void load();
    } else {
      toast.error(res.error || 'Could not send request');
    }
  };

  const handleAddFromResults = async (profile: FriendProfile) => {
    if (!userId) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await sendFriendRequestByUsername(session.user.id, profile.username || '');
    if (res.ok) {
      if (res.alreadyFriends) toast.success(`You and @${profile.username} are already friends! 💕`);
      else toast.success(`Friend request sent to @${profile.username}! 💕`);
      void load();
    } else {
      toast.error(res.error || 'Could not send request');
    }
  };

  const handleAccept = async (id: string) => {
    await respondToFriendRequest(id, true);
    toast.success('Friend added! 💕');
    void load();
  };

  const handleReject = async (id: string) => {
    await respondToFriendRequest(id, false);
    void load();
  };

  const handleRemove = async (rel: FriendRelation) => {
    const res = await removeFriend(rel.id);
    if (res.ok) { toast.success(`Removed @${rel.friend.username}`); void load(); }
    else toast.error(res.error || 'Could not remove friend');
  };

  const handleInviteToPlay = async (rel: FriendRelation, gameSlug: string) => {
    if (!userId) return;
    setInvitingGame(`${rel.id}:${gameSlug}`);
    const res = await sendPlayInvite(userId, rel.friend.id, gameSlug);
    setInvitingGame(null);
    if (res.ok) {
      toast.success(`Invited @${rel.friend.username} to play! 🎮`);
    } else {
      toast.error(res.error || 'Could not send invite');
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      toast.success('Invite link copied! Share it anywhere 💕');
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const shareTo = (network: string) => {
    if (!inviteLink) return;
    const text = encodeURIComponent('Come play couple games with me on Love Dove! 💕');
    const url = encodeURIComponent(inviteLink);
    const targets: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      instagram: `https://www.instagram.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      discord: `https://discord.com/channels/@me`,
      snapchat: `https://www.snapchat.com/`,
    };
    if (targets[network]) window.open(targets[network], '_blank', 'noopener,noreferrer');
  };

  const onlineFriends = friends.filter(f => f.friend.is_online);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
            <Heart className="w-12 h-12 text-pink-500 mx-auto" fill="currentColor" />
          </motion.div>
          <p className="text-purple-600 mt-4 font-medium">Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
      {/* Floating background hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200/40 select-none"
            style={{ left: `${(i * 8.3) % 100}%`, fontSize: `${14 + (i % 4) * 6}px` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            {['💖', '💕', '💗', '💓'][i % 4]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/70 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Friends
              </h1>
              <p className="text-sm text-gray-500">
                {friends.length} friend{friends.length !== 1 ? 's' : ''} · {onlineFriends.length} online
              </p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-purple-600 hover:text-purple-800">
            Dashboard →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 border border-pink-100">
          {([
            { key: 'add' as Tab, label: 'Add Friends', icon: UserPlus },
            { key: 'friends' as Tab, label: `My Friends (${friends.length})`, icon: Users },
            { key: 'requests' as Tab, label: `Requests${incoming.length ? ` (${incoming.length})` : ''}`, icon: Bell },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.key === 'add' ? 'Add' : t.key === 'friends' ? 'Friends' : 'Req'}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ TAB: ADD FRIENDS ═══ */}
          {tab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              {/* Search by username */}
              <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/40 border border-pink-100 p-6">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Search className="w-5 h-5 text-pink-500" />
                  Add by username
                </h2>
                <p className="text-sm text-gray-500 mb-4">Search your partner's unique Love Dove username.</p>
                <form onSubmit={handleAddByUsername} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="username"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-sm font-medium"
                    />
                    {searching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={search.trim().length < 2}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200/50 disabled:opacity-40 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </motion.button>
                </form>

                {/* Live search results */}
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      {results.map(p => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50/60 border border-pink-100"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(p.full_name || p.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{p.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500">@{p.username}</p>
                          </div>
                          <button
                            onClick={() => handleAddFromResults(p)}
                            className="px-3 py-1.5 bg-pink-500 text-white text-xs font-bold rounded-xl hover:bg-pink-600 transition-colors"
                          >
                            Add
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {search.trim().length >= 2 && !searching && results.length === 0 && (
                  <p className="text-sm text-gray-400 mt-3 text-center">No users found. Try a different username.</p>
                )}
              </div>

              {/* Share your invite link */}
              <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/40 border border-purple-100 p-6">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-500" />
                  Share your invite link
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Send this link to your partner. When they open it, a friend request is sent to you automatically.
                </p>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-2xl border border-purple-100 mb-4">
                  <Link2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <code className="text-xs text-purple-700 truncate flex-1">{inviteLink}</code>
                  <button
                    onClick={copyInviteLink}
                    className="flex-shrink-0 px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-1.5"
                  >
                    {inviteCopied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'whatsapp', label: 'WhatsApp', icon: Send, color: 'from-green-400 to-green-600' },
                    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-400 via-purple-500 to-orange-400' },
                    { key: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'from-gray-700 to-gray-900' },
                    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-700' },
                    { key: 'discord', label: 'Discord', icon: MessageCircle, color: 'from-indigo-400 to-indigo-600' },
                    { key: 'snapchat', label: 'Snapchat', icon: Sparkles, color: 'from-yellow-300 to-yellow-500' },
                  ].map(s => (
                    <motion.button
                      key={s.key}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => shareTo(s.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${s.color} text-white text-xs font-bold rounded-2xl shadow-md`}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pending outgoing */}
              {outgoing.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Pending requests ({outgoing.length})
                  </h3>
                  <div className="space-y-2">
                    {outgoing.map(o => (
                      <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
                          {(o.friend.full_name || o.friend.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">@{o.friend.username}</p>
                          <p className="text-xs text-amber-600">Waiting for them to accept…</p>
                        </div>
                        <button
                          onClick={() => handleRemove(o)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ TAB: FRIENDS LIST ═══ */}
          {tab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              {friends.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-12 text-center">
                  <Users className="w-14 h-14 text-pink-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No friends yet</h3>
                  <p className="text-sm text-gray-500 mb-5">Search a username or share your invite link to get started.</p>
                  <button
                    onClick={() => setTab('add')}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg"
                  >
                    Add your first friend
                  </button>
                </div>
              ) : (
                friends.map((rel, i) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 overflow-hidden"
                  >
                    <div className="p-5 flex items-center gap-4">
                      {/* Avatar with online dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {(rel.friend.full_name || rel.friend.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                          rel.friend.is_online ? 'bg-green-400' : 'bg-gray-300'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{rel.friend.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500">@{rel.friend.username}</p>
                        <p className="text-xs mt-0.5 flex items-center gap-1">
                          {rel.friend.is_online
                            ? <span className="text-green-600 font-semibold flex items-center gap-1"><Wifi className="w-3 h-3" /> Online now</span>
                            : <span className="text-gray-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> {rel.friend.last_seen ? `Active ${timeAgo(rel.friend.last_seen)}` : 'Offline'}</span>
                          }
                        </p>
                      </div>

                      <div className="flex gap-1.5">
                        <Link
                          href={`/chat/${rel.friend.id}`}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          title="Chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemove(rel)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          title="Remove friend"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick play row */}
                    <div className="px-5 pb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Invite to play</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_GAMES.map(g => (
                          <button
                            key={g.slug}
                            onClick={() => handleInviteToPlay(rel, g.slug)}
                            disabled={!rel.friend.is_online}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 text-xs font-semibold text-gray-700 hover:border-pink-300 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span>{g.emoji}</span>
                            {g.name}
                            {invitingGame === `${rel.id}:${g.slug}` && (
                              <span className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                      {!rel.friend.is_online && (
                        <p className="text-xs text-gray-400 mt-2">Come back when they're online to send an instant invite.</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ═══ TAB: REQUESTS ═══ */}
          {tab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              {incoming.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-12 text-center">
                  <Bell className="w-14 h-14 text-pink-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No pending requests</h3>
                  <p className="text-sm text-gray-500">Friend requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">Incoming requests</h3>
                  {incoming.map(rel => (
                    <motion.div
                      key={rel.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-lg border-2 border-pink-200 p-5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                        {(rel.friend.full_name || rel.friend.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{rel.friend.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500">@{rel.friend.username} wants to be friends</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(rel.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(rel.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating play CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 text-white text-center shadow-2xl shadow-pink-300/40"
        >
          <Zap className="w-8 h-8 mx-auto mb-2" />
          <h3 className="text-xl font-black mb-1">Ready to play?</h3>
          <p className="text-white/80 text-sm mb-4">Browse couple games and invite your friends instantly.</p>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <Gamepad2 className="w-4 h-4" />
            Browse Games
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function AddFriendsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-purple-600 mt-4 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <AddFriendsContent />
    </Suspense>
  );
}
