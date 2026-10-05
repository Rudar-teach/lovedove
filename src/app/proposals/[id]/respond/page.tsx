'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  Heart, Sparkles, Check, X, ArrowLeft,
  Mail, PartyPopper, Frown, Smile
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Profile, ProposalCategory } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

const PROPOSAL_CATEGORIES: ProposalCategory[] = [
  { id: 'romantic_date', title: 'Romantic Date', emoji: '💕', description: '', gradient: 'from-pink-400 to-rose-500' },
  { id: 'valentine', title: 'Valentine', emoji: '🌹', description: '', gradient: 'from-red-400 to-rose-500' },
  { id: 'marriage', title: 'Marriage Proposal', emoji: '💍', description: '', gradient: 'from-amber-400 to-pink-500' },
  { id: 'late_night', title: 'Late Night Chat', emoji: '🌙', description: '', gradient: 'from-indigo-400 to-purple-500' },
  { id: 'party', title: 'Party', emoji: '🎉', description: '', gradient: 'from-purple-400 to-pink-500' },
  { id: 'love_letter', title: 'Love Letter', emoji: '💌', description: '', gradient: 'from-rose-400 to-red-500' },
  { id: 'gift_exchange', title: 'Gift Exchange', emoji: '🎁', description: '', gradient: 'from-orange-400 to-rose-500' },
  { id: 'adventure', title: 'Adventure', emoji: '🌟', description: '', gradient: 'from-teal-400 to-pink-500' },
  { id: 'dinner', title: 'Dinner Date', emoji: '🍽️', description: '', gradient: 'from-amber-400 to-orange-500' },
  { id: 'movie_night', title: 'Movie Night', emoji: '🎬', description: '', gradient: 'from-blue-400 to-indigo-500' },
];

const RESPONSE_MESSAGES: Record<string, { emoji: string; title: string; subtitle: string; color: string }> = {
  yes: {
    emoji: '💕',
    title: 'They Said Yes!',
    subtitle: 'What an amazing moment! Time to celebrate!',
    color: 'from-primary-500 to-rose-500',
  },
  no: {
    emoji: '💔',
    title: 'Not This Time',
    subtitle: 'Maybe another time. They\'ll still appreciate your courage!',
    color: 'from-gray-400 to-gray-500',
  },
  maybe: {
    emoji: '🤔',
    title: 'Needs More Time',
    subtitle: 'They\'re thinking about it. Be patient!',
    color: 'from-amber-400 to-yellow-500',
  },
};

export default function RespondProposalPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [proposal, setProposal] = useState<any>(null);
  const [sender, setSender] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [existingResponse, setExistingResponse] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (params.id) loadProposal(params.id as string);
  }, [isAuthenticated, params.id]);

  const loadProposal = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Proposal not found');
        router.push('/proposals');
        return;
      }

      // Check if user is the receiver
      if (data.receiver_id !== user?.id) {
        toast.error('You can only respond to proposals sent to you');
        router.push('/proposals');
        return;
      }

      setProposal(data);
      setHasResponded(!!data.response);
      setExistingResponse(data.response);

      // Load sender profile
      const { data: senderData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.sender_id)
        .single();
      if (senderData) setSender(senderData);

      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('link', `/proposals/${id}/respond`);
    } catch (e) {
      console.error('Error loading proposal:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: 'yes' | 'no' | 'maybe') => {
    if (!proposal || !user || responding) return;
    setResponding(true);

    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', proposal.id);

      if (error) throw error;

      if (response === 'yes') {
        setShowCelebration(true);
      } else {
        setShowDecline(true);
      }

      setHasResponded(true);
      setExistingResponse(response);

      // Create notification for sender
      const typeMap: Record<string, string> = {
        yes: 'proposal_accepted',
        no: 'proposal_declined',
        maybe: 'proposal_declined',
      };

      const titleMap: Record<string, string> = {
        yes: `${user.full_name} accepted your proposal!`,
        no: `${user.full_name} responded to your proposal`,
        maybe: `${user.full_name} needs more time to respond`,
      };

      const messageMap: Record<string, string> = {
        yes: `"${proposal.title}"`,
        no: `"${proposal.title}"`,
        maybe: `"${proposal.title}"`,
      };

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: proposal.sender_id,
          type: typeMap[response],
          title: titleMap[response],
          message: messageMap[response],
          link: `/proposals`,
          read: false,
        });

      if (notifError) console.error('Notification error:', notifError);

      // Send email to sender
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && sender) {
          const responseData = {
            proposalId: proposal.id,
            senderName: user.full_name,
            receiverName: sender.full_name,
            title: proposal.title,
            message: proposal.message,
            category: proposal.category,
            categoryEmoji: getCategoryEmoji(proposal.category),
            responseUrl: `${window.location.origin}/proposals`,
            isResponse: true,
            response,
          };

          const apiResponse = await fetch('/api/send-proposal-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              to: sender.email,
              proposalData: responseData,
            }),
          });

          if (!apiResponse.ok) {
            console.error('Email API error:', await apiResponse.text());
          }
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      toast.success(response === 'yes' ? 'You said yes! 💕' : 'Response sent!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const getCategoryEmoji = (categoryId: string): string => {
    const category = PROPOSAL_CATEGORIES.find(c => c.id === categoryId);
    return category?.emoji || '💕';
  };

  if (loading) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </PremiumBackground>
    );
  }

  if (!proposal || !sender) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600">Proposal not found</p>
          <Link href="/proposals"><Button>Go to Proposals</Button></Link>
        </div>
      </PremiumBackground>
    );
  }

  const category = (PROPOSAL_CATEGORIES.find(c => c.id === proposal.category) || PROPOSAL_CATEGORIES[0]) as ProposalCategory;
  const responseInfo = existingResponse ? RESPONSE_MESSAGES[existingResponse] : null;

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        {/* Navbar */}
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
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
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Proposer info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary-500/30">
              {sender.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">From</p>
              <h2 className="text-xl font-bold text-gray-900">{sender.full_name}</h2>
              <p className="text-sm text-gray-500">@{sender.username}</p>
            </div>
          </motion.div>

          {/* Proposal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`bg-gradient-to-br ${category.gradient} rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl`}>
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute top-6 right-6">
                <div className="text-5xl opacity-80">{category.emoji}</div>
              </div>
              <div className="relative z-10">
                <div className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-3">
                  {category.title}
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-black mb-4 leading-tight">
                  {proposal.title}
                </h1>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-6">
                  <p className="text-white/90 text-base leading-relaxed italic">
                    "{proposal.message}"
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Mail className="w-4 h-4" />
                  {new Date(proposal.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Response Result */}
          <AnimatePresence>
            {hasResponded && responseInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`mt-8 p-8 rounded-[2rem] bg-gradient-to-br ${responseInfo.color} text-white text-center shadow-2xl`}
              >
                <div className="text-6xl mb-4">{responseInfo.emoji}</div>
                <h2 className="text-3xl font-display font-black mb-2">{responseInfo.title}</h2>
                <p className="text-white/80 text-lg font-light">{responseInfo.subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response Buttons */}
          <AnimatePresence>
            {!hasResponded && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10"
              >
                <h3 className="text-center text-lg font-semibold text-gray-700 mb-6">
                  Will you accept this proposal?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleResponse('yes')}
                    isLoading={responding}
                    disabled={responding}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary-500 to-rose-500 text-white py-5 text-xl shadow-2xl shadow-primary-500/30 hover:shadow-3xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Heart className="w-6 h-6 mr-2 heart-beat" fill="white" />
                    YES
                  </Button>
                  <Button
                    onClick={() => handleResponse('no')}
                    disabled={responding}
                    variant="secondary"
                    size="lg"
                    className="flex-1 py-5 text-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <span className="mr-2">💔</span>
                    NO
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* More proposals link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <Link href="/proposals" className="text-primary-500 hover:text-primary-600 font-semibold text-sm inline-flex items-center gap-1">
              View all proposals
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="text-center p-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-9xl mb-6"
                >
                  💕
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl font-display font-black text-white mb-4"
                >
                  YES! 💕
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 text-lg mb-8"
                >
                  You said YES! How exciting!
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowCelebration(false)}
                  className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl"
                >
                  Celebrate!
                </motion.button>
              </motion.div>
              {/* Floating particles */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 1 }}
                  animate={{
                    y: -300 - Math.random() * 400,
                    x: (Math.random() - 0.5) * 300,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                  className="fixed text-3xl pointer-events-none"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${40 + Math.random() * 20}%`,
                  }}
                >
                  {['💕', '💖', '💗', '❤️', '💝', '✨', '💕', '🌟'][Math.floor(Math.random() * 8)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sympathetic overlay for NO */}
        <AnimatePresence>
          {showDecline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="text-center p-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-9xl mb-6"
                >
                  💔
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl font-display font-black text-white mb-4"
                >
                  Not This Time
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 text-lg mb-8"
                >
                  That's okay. Not everything is meant to be. Keep your chin up! 💪
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowDecline(false)}
                  className="bg-white text-gray-700 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl"
                >
                  Got it
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumBackground>
  );
}