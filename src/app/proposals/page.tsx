'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Heart, Sparkles, Mail, Plus, Star,
  ChevronRight, PartyPopper, Users
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Profile, ProposalCategory } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

const PROPOSAL_CATEGORIES: ProposalCategory[] = [
  { id: 'romantic_date', title: 'Romantic Date', emoji: '💕', description: 'Invite them on a romantic date', gradient: 'from-pink-400 to-rose-500' },
  { id: 'valentine', title: 'Will You Be My Valentine', emoji: '🌹', description: 'Pop the big Valentine question', gradient: 'from-red-400 to-rose-500' },
  { id: 'marriage', title: 'Marriage Proposal', emoji: '💍', description: 'Take the next big step', gradient: 'from-amber-400 to-pink-500' },
  { id: 'late_night', title: 'Late Night Chat', emoji: '🌙', description: 'Stay up talking together', gradient: 'from-indigo-400 to-purple-500' },
  { id: 'party', title: 'Party Together', emoji: '🎉', description: 'Celebrate with them', gradient: 'from-purple-400 to-pink-500' },
  { id: 'love_letter', title: 'Love Letter', emoji: '💌', description: 'Write a heartfelt letter', gradient: 'from-rose-400 to-red-500' },
  { id: 'gift_exchange', title: 'Gift Exchange', emoji: '🎁', description: 'Exchange special gifts', gradient: 'from-orange-400 to-rose-500' },
  { id: 'adventure', title: 'Adventure Together', emoji: '🌟', description: 'Go on an adventure', gradient: 'from-teal-400 to-pink-500' },
  { id: 'dinner', title: 'Dinner Date', emoji: '🍽️', description: 'Share a delicious meal', gradient: 'from-amber-400 to-orange-500' },
  { id: 'movie_night', title: 'Movie Night', emoji: '🎬', description: 'Watch a movie together', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'custom', title: 'Create Custom Proposal', emoji: '✨', description: 'Design your own proposal', gradient: 'from-primary-500 to-rose-500', isCustom: true },
];

export default function ProposalsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [sentProposals, setSentProposals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: friendRequests } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id, profiles!friend_requests_sender_id_fkey(*)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds: string[] = [];
      const friendProfiles: Profile[] = [];

      if (friendRequests) {
        for (const req of friendRequests) {
          const friendId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
          if (!friendIds.includes(friendId)) {
            friendIds.push(friendId);
            const friendProfile = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
            if (friendProfile) friendProfiles.push(friendProfile);
          }
        }
      }

      // Also check partner_id
      if (user.partner_id && !friendIds.includes(user.partner_id)) {
        friendIds.push(user.partner_id);
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.partner_id)
          .single();
        if (partnerProfile) friendProfiles.push(partnerProfile);
      }

      setFriends(friendProfiles);

      const { data: existingProposals } = await supabase
        .from('proposals')
        .select('id, receiver_id')
        .eq('sender_id', user.id)
        .is('response', null);

      if (existingProposals) {
        setSentProposals(existingProposals.map(p => p.receiver_id));
      }
    } catch (e) {
      console.error('Error loading friends:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        {/* Navbar */}
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <Heart className="w-4 h-4 text-white heart-beat" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Dashboard</Link>
                  <Link href="/games" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Games</Link>
                  <Link href="/friends" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Friends</Link>
                  <Link href="/proposals" className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl">Proposals</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-100/80 border border-pink-200/60 text-primary-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Proposal System
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4 leading-tight">
              Send Them a{' '}
              <span className="gradient-text-animated">Special Proposal</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light mb-2">
              Choose a category below or create a custom proposal to send to someone special.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No friends yet!</h3>
              <p className="text-gray-600 mb-6">Add friends first to send them proposals.</p>
              <Link href="/friends">
                <Button size="lg">Find Friends</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Friends selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary-500 heart-beat" />
                  Select Someone Special
                </h2>
                <div className="flex flex-wrap gap-3">
                  {friends.map((friend) => {
                    const isPending = sentProposals.includes(friend.id);
                    return (
                      <motion.button
                        key={friend.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/proposals/new?receiverId=${friend.id}`)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300 ${
                          isPending
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white/70 backdrop-blur-xl border-pink-100 hover:border-primary-300 hover:shadow-lg hover:shadow-pink-200/30 cursor-pointer'
                        }`}
                        disabled={isPending}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {friend.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold text-sm ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>
                            {friend.full_name}
                          </p>
                          <p className={`text-xs ${isPending ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isPending ? 'Pending response' : '@' + friend.username}
                          </p>
                        </div>
                        {isPending && <span className="text-xs text-gray-400 ml-1">⏳</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Categories grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PartyPopper className="w-5 h-5 text-primary-500" />
                  Choose a Category
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PROPOSAL_CATEGORIES.map((category, i) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <div
                        className={`group h-full p-6 bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-pink-100/60 shadow-lg hover:shadow-2xl hover:shadow-pink-200/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                        onClick={() => {
                          if (category.isCustom) {
                            router.push('/proposals/new');
                          } else if (friends.length > 0) {
                            router.push(`/proposals/new?receiverId=${friends[0]?.id}&category=${category.id}`);
                          }
                        }}
                      >
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          {category.emoji}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-1 text-primary-500 text-sm font-semibold">
                          {category.isCustom ? 'Create now' : 'Send proposal'}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}