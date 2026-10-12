'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, UserPlus, Users, Search, Trash2, Clock } from 'lucide-react';

interface Friend {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  conversation?: {
    id: string;
    last_message_at: string;
  };
}

export default function FriendsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      setUserId(user.id);
      fetchFriends();
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    let filtered = friends;

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.other_user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.other_user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'recent') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
    }

    setFilteredFriends(filtered);
  }, [searchQuery, friends, activeTab]);

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all matches where user is involved
      const { data: matchData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_accepted.eq.true),and(user2_id.eq.${user.id},user1_accepted.eq.true)`)
        .eq('is_active', true);

      if (error) { console.error('Error fetching matches:', error); setLoading(false); return; }

      const friendsList: Friend[] = [];

      for (const match of matchData || []) {
        const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;

        const { data: otherUser } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .eq('id', otherId)
          .single();

        if (otherUser) {
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, last_message_at')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherId}),and(user1_id.eq.${otherId},user2_id.eq.${user.id})`)
            .single();

          friendsList.push({
            id: match.id,
            user1_id: match.user1_id,
            user2_id: match.user2_id,
            created_at: match.matched_at || match.created_at,
            other_user: otherUser,
            conversation: conv || undefined,
          });
        }
      }

      // Also add accepted friend requests
      const { data: requestData } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(from_user_id.eq.${user.id},status.eq.accepted),and(to_user_id.eq.${user.id},status.eq.accepted)`);

      for (const req of requestData || []) {
        const otherId = req.from_user_id === user.id ? req.to_user_id : req.from_user_id;
        const exists = friendsList.some(f => f.other_user.id === otherId);
        if (exists) continue;

        const { data: otherUser } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .eq('id', otherId)
          .single();

        if (otherUser) {
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, last_message_at')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherId}),and(user1_id.eq.${otherId},user2_id.eq.${user.id})`)
            .single();

          friendsList.push({
            id: req.id,
            user1_id: user.id,
            user2_id: otherId,
            created_at: req.accepted_at || req.created_at,
            other_user: otherUser,
            conversation: conv || undefined,
          });
        }
      }

      friendsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFriends(friendsList);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: string, friendName: string) => {
    if (!confirm(`Remove ${friendName} from your friends? This won't affect your match.`)) return;

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', friendId);

    if (!error) {
      setFriends(prev => prev.filter(f => f.id !== friendId));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
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
              {friends.length} friends
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-pink-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
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

        {/* Friends List */}
        {friends.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No friends yet</h3>
            <p className="text-gray-500 mb-6">Find partners and they'll automatically become your friends when you match!</p>
            <Link href="/find-partner" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              <Heart className="w-5 h-5" />
              Find Partners
            </Link>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No friends match your search</h3>
            <p className="text-gray-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="bg-white rounded-2xl shadow-md p-5 border border-pink-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${friend.other_user.id}`}>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform">
                      {(friend.other_user.full_name || friend.other_user.username || '?')[0].toUpperCase()}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${friend.other_user.id}`} className="font-semibold text-gray-800 hover:text-pink-600 transition-colors">
                        {friend.other_user.full_name || friend.other_user.username}
                      </Link>
                      <span className="text-xs text-gray-400">@{friend.other_user.username}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Friends since {formatDate(friend.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
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
                      onClick={() => removeFriend(friend.id, friend.other_user.full_name || friend.other_user.username)}
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
