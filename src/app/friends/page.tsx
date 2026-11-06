'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  searchProfiles, sendFriendRequestByUsername,
  type FriendProfile
} from '@/lib/social';
import toast from 'react-hot-toast';
import {
  Heart, MessageCircle, UserPlus, Users, Search, Trash2, Clock,
  AtSign, Wifi, WifiOff
} from 'lucide-react';

/**
 * Friends page.
 *
 * "Friends" = accepted/connected matches (matches table) + accepted
 * friend requests (friend_requests table, once the social migration is
 * applied). The search box does two things: filters your friends, and —
 * if nothing matches — live-searches ALL users by @username so you can
 * add someone directly from here.
 *
 * Status is always shown with its OWN icon, kept separate from the
 * @username handle (identity vs. status — never mixed together).
 */

interface Friend {
  id: string;
  source: 'match' | 'friend_request';
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_online?: boolean;
    last_seen?: string | null;
  };
  conversation?: {
    id: string;
    last_message_at: string | null;
  };
}

export default function FriendsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');

  const loadFriends = useCallback(async (uid: string) => {
    const partnerIds: string[] = [];
    const rows: { id: string; source: 'match' | 'friend_request'; user1_id: string; user2_id: string; created_at: string; partnerId: string }[] = [];

    // ── 1. Accepted / connected matches ──────────────────────────
    const { data: matchData } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id, status, created_at')
      .or(`and(user1_id.eq.${uid},status.in.(accepted,connected)),and(user2_id.eq.${uid},status.in.(accepted,connected))`);

    for (const m of matchData || []) {
      const partnerId = m.user1_id === uid ? (m.user2_id as string) : (m.user1_id as string);
      partnerIds.push(partnerId);
      rows.push({
        id: `match_${m.id}`, source: 'match',
        user1_id: m.user1_id as string, user2_id: m.user2_id as string,
        created_at: m.created_at as string, partnerId,
      });
    }

    // ── 2. Accepted friend requests (table may not exist yet — the
    // social migration adds it; degrade gracefully until then).
    const { data: requestData, error: reqError } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, accepted_at')
      .or(`and(sender_id.eq.${uid},status.eq.accepted),and(receiver_id.eq.${uid},status.eq.accepted)`);

    if (reqError) {
      // PGRST205 = table missing (migration pending) — not a real failure.
      if (!(reqError.message || '').includes('Could not find the table')) {
        console.error('friend_requests error:', reqError);
      }
    } else {
      for (const r of requestData || []) {
        const partnerId = (r.sender_id as string) === uid ? (r.receiver_id as string) : (r.sender_id as string);
        partnerIds.push(partnerId);
        rows.push({
          id: `req_${r.id}`, source: 'friend_request',
          user1_id: r.sender_id as string, user2_id: r.receiver_id as string,
          created_at: (r.accepted_at as string) || (r.created_at as string),
          partnerId,
        });
      }
    }

    // ── 3. Batch-load partner profiles + conversations (no N+1) ──
    const uniqueIds = [...new Set(partnerIds)];
    const profilesById: Record<string, any> = {};
    const presenceById: Record<string, any> = {};
    const convByPartner: Record<string, any> = {};
    const dedupeByPartner: Record<string, boolean> = {};
    const seenFriends: Friend[] = [];

    if (uniqueIds.length > 0) {
      const [profilesRes, convsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', uniqueIds),
        supabase
          .from('conversations')
          .select('id, user1_id, user2_id, last_message_at')
          .or(
            `and(user1_id.eq.${uid},user2_id.in.(${uniqueIds.join(',')})),` +
            `and(user2_id.eq.${uid},user1_id.in.(${uniqueIds.join(',')}))`
          ),
      ]);
      for (const p of profilesRes.data || []) profilesById[p.id] = p;

      // Presence columns only exist after the social migration — probe
      // once and merge when available; otherwise everyone just shows "last seen".
      const { data: presenceRows } = await supabase
        .from('profiles')
        .select('id, is_online, last_seen')
        .in('id', uniqueIds);
      if (presenceRows) for (const p of presenceRows) presenceById[p.id] = p;

      for (const c of convsRes.data || []) {
        const partnerId = (c.user1_id as string) === uid ? (c.user2_id as string) : (c.user1_id as string);
        const prev = convByPartner[partnerId];
        if (!prev || new Date(c.last_message_at || 0) > new Date(prev.last_message_at || 0)) {
          convByPartner[partnerId] = c;
        }
      }
    }

    // Build the friend list (first entry per partner wins).
    for (const entry of rows) {
      if (dedupeByPartner[entry.partnerId]) continue;
      const profile = profilesById[entry.partnerId];
      if (!profile) continue;
      dedupeByPartner[entry.partnerId] = true;
      const presence = presenceById[entry.partnerId];
      seenFriends.push({
        id: entry.id,
        source: entry.source,
        user1_id: entry.user1_id,
        user2_id: entry.user2_id,
        created_at: entry.created_at,
        other_user: {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          is_online: Boolean(presence?.is_online),
          last_seen: presence?.last_seen ?? null,
        },
        conversation: convByPartner[entry.partnerId]
          ? { id: convByPartner[entry.partnerId].id, last_message_at: convByPartner[entry.partnerId].last_message_at }
          : undefined,
      });
    }

    seenFriends.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFriends(seenFriends);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      setUserId(user.id);
      void loadFriends(user.id);
      setLoading(false);
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFriends]);

  // ── Search: filter friends first; if none match, search ALL users ──
  const query = searchQuery.trim().replace(/^@/, '');
  const noFriendMatches = friends.length > 0 &&
    filteredFriends.length === 0 &&
    friends.every(f =>
      !(f.other_user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        f.other_user.username?.toLowerCase().includes(query.toLowerCase())));

  useEffect(() => {
    let filtered = friends;
    if (query) {
      filtered = filtered.filter(f =>
        f.other_user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        f.other_user.username?.toLowerCase().includes(query.toLowerCase()));
    }
    if (activeTab === 'recent') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    }
    setFilteredFriends(filtered);
  }, [searchQuery, friends, activeTab]);

  useEffect(() => {
    if (query.length < 2 || !userId || !noFriendMatches) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const rows = await searchProfiles(query, userId);
      if (!cancelled) {
        // Never suggest yourself or people already in the friend list.
        const friendIds = new Set(friends.map(f => f.other_user.id));
        setSearchResults(rows.filter(r => !friendIds.has(r.id)));
        setSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, noFriendMatches, userId, friends]);

  const handleAddFromSearch = async (profile: FriendProfile) => {
    if (!userId) return;
    const res = await sendFriendRequestByUsername(userId, profile.username || '');
    if (res.ok) {
      toast.success(res.alreadyFriends
        ? `You and @${profile.username} are already friends! 💕`
        : `Friend request sent to @${profile.username}! 💕`);
    } else {
      toast.error(res.error || 'Could not send request');
    }
  };

  const removeFriend = async (friend: Friend) => {
    const label = friend.other_user.full_name || friend.other_user.username || 'this user';
    if (!confirm(`Remove ${label} from your friends? ${friend.source === 'match' ? 'This also removes your match.' : ''}`)) return;

    if (friend.source === 'match') {
      const { error } = await supabase.from('matches').delete().eq('id', friend.id.replace('match_', ''));
      if (!error) setFriends(prev => prev.filter(f => f.id !== friend.id));
    } else {
      const { error } = await supabase.from('friend_requests').delete().eq('id', friend.id.replace('req_', ''));
      if (error && !(error.message || '').includes('Could not find the table')) toast.error('Could not remove friend');
      else setFriends(prev => prev.filter(f => f.id !== friend.id));
    }
    toast.success(`${label} removed`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const onlineCount = friends.filter(f => f.other_user.is_online).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Love Dove
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/find-partner" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1">
              <UserPlus className="w-4 h-4" />
              Find Partners
            </Link>
            <span className="text-sm text-gray-500 bg-pink-100 px-3 py-1 rounded-full">
              {friends.length} friends · {onlineCount} online
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-pink-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search friends or @username to add anyone…"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 border border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'recent' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* ── Live user search results (when no friend matches the query) ── */}
        {query.length >= 2 && noFriendMatches && (
          <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              {searching
                ? <><div className="w-3.5 h-3.5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" /> Searching all users…</>
                : searchResults.length === 0
                  ? 'No users found'
                  : `${searchResults.length} user${searchResults.length === 1 ? '' : 's'} found`}
            </p>
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(p.full_name || p.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.full_name || 'User'}</p>
                      {/* @username = identity · status icon = its own element */}
                      <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <AtSign className="w-3 h-3" />{p.username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddFromSearch(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 text-white text-xs font-bold rounded-xl hover:bg-pink-600 transition-colors flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends List */}
        {friends.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No friends yet</h3>
            <p className="text-gray-500 mb-6">Find partners and they'll automatically become your friends when you match! Or search a @username above to add someone directly.</p>
            <Link href="/find-partner" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              <Heart className="w-5 h-5" />
              Find Partners
            </Link>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No friends match your search</h3>
            <p className="text-gray-500 mt-2">Try a different search term, or use the results above to add someone new.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="bg-white rounded-2xl shadow-md p-5 border border-pink-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${friend.other_user.id}`} className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform">
                      {friend.other_user.avatar_url ? (
                        <img src={friend.other_user.avatar_url} alt={friend.other_user.username || 'avatar'} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        (friend.other_user.full_name || friend.other_user.username || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Online dot — separate from the name, bottom-right of avatar */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        friend.other_user.is_online ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Name (identity) */}
                      <Link href={`/profile/${friend.other_user.id}`} className="font-semibold text-gray-800 hover:text-pink-600 transition-colors truncate">
                        {friend.other_user.full_name || friend.other_user.username}
                      </Link>
                      {/* @username handle — its own line, monospace, grey */}
                      <span className="text-xs text-gray-400 font-mono">@{friend.other_user.username}</span>
                      {/* Friend status — its OWN icon, separate from the username */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Heart className="w-3 h-3" fill="currentColor" /> Friend
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Friends since {formatDate(friend.created_at)}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${friend.other_user.is_online ? 'text-green-600' : 'text-gray-400'}`}>
                        {friend.other_user.is_online
                          ? <><Wifi className="w-3 h-3" /> Online now</>
                          : <><WifiOff className="w-3 h-3" /> Offline</>}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {friend.conversation && (
                      <Link
                        href={`/chat/${friend.conversation.id}`}
                        className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                        title="Start chatting"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/profile/${friend.other_user.id}`}
                      className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                      title="View profile"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeFriend(friend)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove friend"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
