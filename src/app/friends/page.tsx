'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, UserPlus, UserCheck, Send, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import Input from '@/components/ui/Input';

type Profile = { id: string; full_name: string; username: string; avatar_url: string | null };
type FriendReq = { id: string; sender_id: string; receiver_id: string; status: string };

export default function FriendsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<FriendReq[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); else loadData(); }, [isAuthenticated]);

  const loadData = async () => {
    if (!user) return;
    const { data: friendReqs } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    if (friendReqs) {
      const accepted = friendReqs.filter(r => r.status === 'accepted');
      const otherIds = accepted.map(r => r.sender_id === user.id ? r.receiver_id : r.sender_id);
      if (otherIds.length > 0) {
        const { data: friendProfiles } = await supabase.from('profiles').select('*').in('id', otherIds);
        if (friendProfiles) setFriends(friendProfiles);
      }
      const pending = friendReqs.filter(r => r.status === 'pending' && r.receiver_id === user.id);
      setRequests(pending);
    }
    const { data: users } = await supabase.from('profiles').select('id, full_name, username, avatar_url').neq('id', user.id).limit(20);
    if (users) setAllUsers(users);
  };

  const sendRequest = async (userId: string) => {
    const { error } = await supabase.from('friend_requests').insert({ sender_id: user!.id, receiver_id: userId, status: 'pending' });
    if (error) toast.error('Failed to send request');
    else { toast.success('Friend request sent! 💕'); loadData(); }
  };

  const acceptRequest = async (reqId: string, senderId: string) => {
    const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId);
    if (!error) { toast.success('Friend added! 💖'); await supabase.from('profiles').update({ partner_id: senderId }).eq('id', user!.id).is('partner_id', null); loadData(); }
  };

  if (!isAuthenticated) return null;

  const discovered = allUsers.filter(u => u.id !== user?.id && !friends.some(f => f.id === u.id) && !requests.some(r => r.receiver_id === u.id));

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard"><button className="p-2.5 hover:bg-white/60 backdrop-blur-sm rounded-2xl transition-all"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-3xl font-display font-black gradient-text-animated">Friends</h1>
            <div className="w-10" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-pink-100/60 max-w-md mx-auto">
            {[
              { key: 'friends', label: 'My Friends', icon: '❤️', count: friends.length },
              { key: 'requests', label: 'Requests', icon: '📩', count: requests.length },
              { key: 'discover', label: 'Discover', icon: '🔍' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.key ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/25' : 'text-gray-600 hover:bg-pink-50'}`}>
                {tab.label} {tab.count > 0 && activeTab === tab.key && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* Friends */}
          {activeTab === 'friends' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-pink-100/60">
                  <p className="text-7xl mb-4">💕</p>
                  <p className="text-xl font-bold text-gray-700 mb-2">No friends yet</p>
                  <p className="text-gray-500">Discover and add friends to play games together!</p>
                </div>
              ) : friends.map(friend => (
                <div key={friend.id} className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-pink-100/60 shadow-lg p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {friend.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{friend.full_name}</h3>
                      <p className="text-gray-500 text-sm">@{friend.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/birthday/${friend.username}`}><Button variant="outline" size="sm">Visit Site</Button></Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-pink-100/60">
                  <p className="text-7xl mb-4">📭</p>
                  <p className="text-xl font-bold text-gray-700">No pending requests</p>
                </div>
              ) : requests.map(req => (
                <div key={req.id} className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-pink-100/60 shadow-lg p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Someone wants to connect with you!</h3>
                      <p className="text-sm text-gray-500">Accept to become friends and start playing together</p>
                    </div>
                    <button onClick={() => acceptRequest(req.id, req.sender_id)} className="p-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-full hover:shadow-lg hover:scale-110 transition-all"><UserCheck className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Discover */}
          {activeTab === 'discover' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Input placeholder="Search users by name or username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mb-6" />
              <div className="space-y-4">
                {(searchQuery ? allUsers.filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase())) : discovered).map(person => (
                  <div key={person.id} className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-pink-100/60 shadow-lg p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {person.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{person.full_name}</h3>
                        <p className="text-gray-500 text-sm">@{person.username}</p>
                      </div>
                      <button onClick={() => sendRequest(person.id)} className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-rose-500 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm">
                        <UserPlus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
