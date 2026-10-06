'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, MessageCircle, Search, UserMinus, Users, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type Tab = 'friends' | 'requests' | 'search';

export default function FriendsPage(){
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string|null>(null);

  const loadFriends = async () => {
    if (!user) return;
    const { data: reqs } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq('status','accepted');
    const ids = reqs?.map(r => r.sender_id === user.id ? r.receiver_id : r.sender_id) || [];
    if (user.partner_id) ids.push(user.partner_id);
    const unique = [...new Set(ids)];
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', unique);
    setFriends(profiles || []);
  };

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from('friend_requests').select('*,sender:profiles!friend_requests_sender_id_fkey(*),receiver:profiles!friend_requests_receiver_id_fkey(*)').eq('receiver_id', user.id).eq('status','pending');
    setRequests(data || []);
  };

  useEffect(() => { if (user) { loadFriends(); loadRequests(); } }, [user]);

  const search = async (q: string) => {
    setSearchQ(q);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase.from('profiles').select('*').or(`full_name.ilike.%${q}%,username.ilike.%${q}%`).neq('id', user?.id || '').limit(20);
    setResults(data || []);
    setSearching(false);
  };

  const sendRequest = async (id: string) => {
    setSendingTo(id);
    const { error } = await supabase.from('friend_requests').insert({ sender_id: user!.id, receiver_id: id, status: 'pending' });
    if (error) { toast.error(error.message); }
    else { toast.success('Friend request sent! 💕'); }
    setSendingTo(null);
  };

  const respond = async (id: string, status: 'accepted'|'rejected') => {
    await supabase.from('friend_requests').update({ status }).eq('id', id);
    toast.success(status === 'accepted' ? 'Friend added! 🎉' : 'Request declined');
    loadFriends(); loadRequests();
  };

  const removeFriend = async (id: string) => {
    await supabase.from('friend_requests').delete().or(`and(sender_id.eq.${user!.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user!.id})`);
    toast.success('Friend removed');
    loadFriends();
  };

  if (!user) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Please log in to view friends.</p>
            <Link href="/auth/login"><Button>Log In</Button></Link>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2"><Users className="w-6 h-6 text-primary-500" /> Friends</h1>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={()=>setTab('friends')} className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab==='friends'?'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg':'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/60 hover:bg-white'}`}>
              Friends ({friends.length})
            </button>
            <button onClick={()=>setTab('requests')} className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab==='requests'?'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg':'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/60 hover:bg-white'}`}>
              Requests ({requests.length})
            </button>
            <button onClick={()=>setTab('search')} className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab==='search'?'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg':'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/60 hover:bg-white'}`}>
              Find People
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab==='friends' && (
              <motion.div key="friends" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-3">
                {friends.length===0?(
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg">No friends yet!</p>
                    <p className="text-gray-400 text-sm">Use "Find People" to send friend requests</p>
                  </div>
                ):friends.map(f=>(
                  <TiltCard key={f.id} intensity={4}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100/60 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">{f.full_name?.[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{f.full_name}</h3>
                        <p className="text-sm text-gray-500">@{f.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/chat?user=${f.id}`}><button className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"><MessageCircle className="w-5 h-5"/></button></Link>
                        <button onClick={()=>removeFriend(f.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><UserMinus className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </motion.div>
            )}

            {tab==='requests' && (
              <motion.div key="requests" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-3">
                {requests.length===0?(
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📨</div>
                    <p className="text-gray-500 text-lg">No pending requests</p>
                  </div>
                ):requests.map(r=>(
                  <TiltCard key={r.id} intensity={4}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100/60 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">{r.sender?.full_name?.[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{r.sender?.full_name}</h3>
                        <p className="text-sm text-gray-500">@{r.sender?.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>respond(r.id,'accepted')} className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100"><Check className="w-5 h-5"/></button>
                        <button onClick={()=>respond(r.id,'rejected')} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"><X className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </motion.div>
            )}

            {tab==='search' && (
              <motion.div key="search" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input value={searchQ} onChange={e=>search(e.target.value)} placeholder="Search by name or username..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 focus:border-primary-400 outline-none text-gray-700"/>
                </div>
                {searching && <div className="text-center py-4"><div className="w-6 h-6 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"/></div>}
                {results.map(u=>(
                  <TiltCard key={u.id} intensity={4}>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100/60 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">{u.full_name?.[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{u.full_name}</h3>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                      </div>
                      <Button onClick={()=>sendRequest(u.id)} isLoading={sendingTo===u.id} size="sm" variant="primary"><UserPlus className="w-4 h-4 mr-1"/> Add</Button>
                    </div>
                  </TiltCard>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
