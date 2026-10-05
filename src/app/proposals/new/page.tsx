'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Heart, Sparkles, Send, ChevronLeft,
  MessageCircle
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
];

const CATEGORY_MESSAGES: Record<string, string[]> = {
  romantic_date: [
    'I would love to take you out on a romantic date. Would you say yes?',
    'How about a candlelit dinner for two?',
    'Let me take you somewhere special...',
  ],
  valentine: [
    'Roses are red, violets are blue... will you be my Valentine?',
    'My heart only beats for you. Will you be my Valentine?',
    'This Valentine\'s, I want to spend it with you.',
  ],
  marriage: [
    'From the moment I met you, I knew you were the one. Will you marry me?',
    'You are my forever person. Say yes to forever with me.',
    'Every love story is beautiful, but ours is my favorite. Will you marry me?',
  ],
  late_night: [
    'The stars are brighter when I talk to you. Stay up late with me tonight?',
    'I can\'t sleep without talking to you. Can we chat tonight?',
    'Late night conversations with you are my favorite thing.',
  ],
  party: [
    'Let\'s celebrate together! Will you party with me?',
    'A party isn\'t the same without you. Will you come?',
    'I want to dance with you tonight. Let\'s party!',
  ],
  love_letter: [
    'I have so many things to say to you, and this letter is just the beginning.',
    'Words can\'t express how much I love you, but let me try...',
    'You deserve to know just how much you mean to me.',
  ],
  gift_exchange: [
    'I have something special for you. Will you exchange gifts with me?',
    'I want to surprise you with something. Gift exchange?',
    'The best gift is seeing your smile. Let\'s exchange gifts!',
  ],
  adventure: [
    'Pack your bags, we\'re going on an adventure together!',
    'Life is an adventure, and I want you by my side. Come with me?',
    'Let\'s explore the world together, one adventure at a time.',
  ],
  dinner: [
    'How about dinner for two? My treat!',
    'I want to share a meal with you and hear about your day.',
    'Dinner, wine, and you sounds perfect to me.',
  ],
  movie_night: [
    'I\'ll bring the popcorn, you bring the cozy blankets. Movie night?',
    'Let\'s binge-watch something together tonight!',
    'A movie under the stars with you sounds perfect.',
  ],
  custom: [
    'I have something I want to ask you...',
    'I\'ve been thinking about you a lot and...',
    'I wrote this proposal just for you.',
  ],
};

export default function CreateProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [sending, setSending] = useState(false);
  const [receiver, setReceiver] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('romantic_date');
  const [selectedCategory, setSelectedCategory] = useState<ProposalCategory>(PROPOSAL_CATEGORIES[0]);

  const receiverId = searchParams.get('receiverId');
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (receiverId) loadReceiver(receiverId);
    if (categoryParam) {
      const found = PROPOSAL_CATEGORIES.find(c => c.id === categoryParam);
      if (found) { setCategory(found.id); setSelectedCategory(found); }
    }
  }, [isAuthenticated, receiverId, categoryParam]);

  useEffect(() => {
    if (category && !categoryParam) {
      const found = PROPOSAL_CATEGORIES.find(c => c.id === category);
      if (found) setSelectedCategory(found);
    }
  }, [category, categoryParam]);

  const loadReceiver = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (data && !error) setReceiver(data);
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const found = PROPOSAL_CATEGORIES.find(c => c.id === catId);
    if (found) {
      setSelectedCategory(found);
      setTitle(found.title);
    }
    const suggestions = CATEGORY_MESSAGES[catId];
    if (suggestions && (!message || suggestions.includes(message))) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setMessage(randomSuggestion);
    }
  };

  const searchFriends = async (query: string) => {
    if (!query.trim() || !user) return;
    setSearching(true);
    try {
      const { data: requests } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds: string[] = [];
      if (requests) {
        for (const req of requests) {
          friendIds.push(req.sender_id === user.id ? req.receiver_id : req.sender_id);
        }
      }
      if (user.partner_id) friendIds.push(user.partner_id);

      const uniqueIds = [...new Set(friendIds)];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueIds)
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(10);

      if (profiles) setSearchResults(profiles);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      searchFriends(query);
    } else {
      setSearchResults([]);
    }
  };

  const selectReceiver = (profile: Profile) => {
    setReceiver(profile);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!receiver || !user || !title.trim() || !message.trim()) {
      toast.error('Please fill in all fields and select a receiver');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert({
          sender_id: user.id,
          receiver_id: receiver.id,
          title: title.trim(),
          message: message.trim(),
          category,
          response: null,
          email_sent: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for receiver
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: receiver.id,
          type: 'proposal_received',
          title: `${user.full_name} sent you a proposal!`,
          message: `"${title}"`,
          link: `/proposals/${data.id}/respond`,
          read: false,
        });

      if (notifError) console.error('Notification error:', notifError);

      // Send email via API
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await fetch('/api/send-proposal-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              to: receiver.email,
              proposalData: {
                proposalId: data.id,
                senderName: user.full_name,
                receiverName: receiver.full_name,
                title: title.trim(),
                message: message.trim(),
                category: selectedCategory.title,
                categoryEmoji: selectedCategory.emoji,
                responseUrl: `${window.location.origin}/proposals/${data.id}/respond`,
              },
            }),
          });

          if (!response.ok) {
            console.error('Email API error:', await response.text());
          }
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      toast.success('Proposal sent! 💕');
      router.push('/proposals');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send proposal');
    } finally {
      setSending(false);
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
                <Link href="/proposals" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  All Proposals
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900 mb-2">
              Create a <span className="gradient-text-animated">Proposal</span>
            </h1>
            <p className="text-gray-600 font-light">Send something special to someone you love</p>
          </motion.div>

          <div className="space-y-6">
            {/* Receiver */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500 heart-beat" />
                To: {receiver ? receiver.full_name : 'Select someone'}
              </h2>
              {receiver ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {receiver.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{receiver.full_name}</p>
                    <p className="text-sm text-gray-500">@{receiver.username}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a friend by name or username..."
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                  />
                  {searching && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectReceiver(p)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                            {p.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm text-gray-900">{p.full_name}</p>
                            <p className="text-xs text-gray-500">@{p.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPOSAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                      category === cat.id
                        ? 'border-primary-500 bg-pink-50 shadow-lg shadow-pink-200/20'
                        : 'border-pink-100 bg-white/50 hover:border-primary-300'
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className={`text-sm font-semibold ${category === cat.id ? 'text-primary-700' : 'text-gray-700'}`}>
                      {cat.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Title
              </h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this proposal about?"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-500" />
                Your Message
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your heartfelt message..."
                rows={5}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
              />
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500 heart-beat" />
                Preview
              </h2>
              <div className={`bg-gradient-to-br ${selectedCategory.gradient} rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl`}>
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{selectedCategory.emoji}</div>
                  <h3 className="text-2xl font-display font-bold mb-3">
                    {title || 'Your Proposal Title'}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed italic mb-4">
                    "{message || 'Your message will appear here...'}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {user.full_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white/70">From: {user.full_name}</span>
                  </div>
                  {receiver && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                        {receiver.full_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-white/70">To: {receiver.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-4"
            >
              <Button
                onClick={handleSubmit}
                isLoading={sending}
                disabled={!receiver || !title.trim() || !message.trim()}
                size="lg"
                className="px-10 py-4 text-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Proposal
              </Button>
              {!receiver && (
                <p className="text-sm text-gray-500 mt-3">Select a recipient first to send your proposal</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}