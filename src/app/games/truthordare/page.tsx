'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, MessageCircle, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';
import { supabase } from '@/lib/supabase';

const TRUTHS = [
  "What is the first thing you noticed about me?",
  "What's your favorite memory of us together?",
  "If you could describe our love in one word, what would it be?",
  "What's something you've never told me but want to?",
  "What was your first impression of me?",
  "What's the most romantic thing I've ever done for you?",
  "What's your biggest fear about our relationship?",
  "If we had a movie of our love story, what would the title be?",
  "What's the most embarrassing thing you've done for love?",
  "What's the biggest surprise you've ever had from me?",
  "What's your favorite physical feature of mine?",
  "What song reminds you most of us?",
  "Where do you see us in 10 years?",
  "What's the craziest thing on your bucket list with me?",
  "What's something I do that always makes you smile?",
  "What's your love language?",
  "What was the moment you knew you loved me?",
  "What's the best compliment you've ever received from me?",
  "What's your dream date with me?",
  "What's something about me that you find irresistible?",
  "If you could change one thing about our relationship, what would it be?",
  "What's the most thoughtful gift you've ever given or received?",
  "What's your favorite pet name for me?",
  "What's the longest we've ever been apart and how did it feel?",
  "What's something you admire most about me?",
  "What's your favorite way to spend a rainy day together?",
  "What fictional couple do we remind you of?",
  "What's the kindest thing I've ever done for you?",
  "What makes you feel most loved by me?",
  "What's your favorite 'us' tradition?",
  "If we could travel anywhere together right now, where would we go?",
  "What's something small I do that makes a big difference to you?",
  "What was the moment you felt proudest of us as a couple?",
  "What's the funniest thing that's happened between us?",
];

const DARES = [
  "Give your partner a 30-second hug",
  "Whisper something sweet in your partner's ear",
  "Slow dance with your partner for one minute",
  "Send your partner a love text right now",
  "Recreate our first kiss pose",
  "Make a heart with your hands and hold it for 10 seconds",
  "Sing a love song chorus out loud",
  "Tell your partner three things you're grateful for about them",
  "Draw a heart on your partner's hand with a pen",
  "Give your partner a forehead kiss",
  "Massage your partner's shoulders for 60 seconds",
  "Say 'I love you' in five different languages",
  "Make your partner's favorite snack",
  "Look into your partner's eyes for one full minute without talking",
  "Write a short love poem about your partner",
  "Give your partner your best compliment",
  "Pretend it's your first date and ask your partner on a date",
  "Do your best romantic movie kiss impression",
  "Create a 30-second couple TikTok dance",
  "Tell your partner what you'd name your future kids",
  "Show your partner your favorite photo of them on your phone",
  "Plant a kiss on your partner's cheek right now",
  "Make a heart shape with your partner's hands and pose",
  "Say the alphabet while your partner gives you eskimo kisses",
  "Do a silly love dance for your partner",
  "Trace a heart on your partner's back with your finger",
  "Tell your partner what you love most about their personality",
  "Give your partner a piggyback ride around the room",
  "Close your eyes and guess what your partner smells like",
  "Sing 'Happy Birthday' in a romantic voice",
  "Recreate your partner's best photo pose together",
  "Pretend to be on a cooking show and describe your partner like one",
  "Hand-feed your partner a small treat",
  "Make a list of 5 date ideas for next month",
  "Do your best impression of your partner's laugh",
];

export default function TruthOrDarePage() {
  const [mode, setMode] = useState<'truth' | 'dare' | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'truthordare',
      players: [session.user.id],
      game_state: { round: 0 },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
  }, []);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/truthordare?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const pickMode = (selectedMode: 'truth' | 'dare') => {
    const arr = selectedMode === 'truth' ? TRUTHS : DARES;
    const randomContent = arr[Math.floor(Math.random() * arr.length)];
    setMode(selectedMode);
    setContent(randomContent);
    setRound(r => r + 1);
  };

  const nextRound = () => {
    setMode(null);
    setContent(null);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Truth or Dare
            </h1>
            <button onClick={() => { setMode(null); setContent(null); setRound(0); }} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Invite Button */}
          <div className="flex justify-center mb-6">
            <Button onClick={copyInvite} variant="outline" size="sm">
              {inviteCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friend
                </>
              )}
            </Button>
          </div>

          {/* Round Counter */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-pink-100/60 shadow-lg">
              <span className="text-sm font-medium text-gray-700">Round: </span>
              <span className="text-lg font-bold text-primary-600">{round}</span>
            </div>
          </div>

          {/* Game Area */}
          <AnimatePresence mode="wait">
            {!mode ? (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-center text-xl font-medium text-gray-700 mb-4">
                  Pick your challenge! 💕
                </p>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickMode('truth')}
                    className="w-full bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center min-h-[200px]"
                  >
                    <MessageCircle className="w-12 h-12 mb-3" />
                    <span className="text-3xl font-bold mb-2">Truth 💬</span>
                    <span className="text-sm opacity-90">Answer a question honestly</span>
                  </motion.button>
                </TiltCard>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickMode('dare')}
                    className="w-full bg-gradient-to-br from-rose-400 to-rose-600 text-white rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center min-h-[200px]"
                  >
                    <Flame className="w-12 h-12 mb-3" />
                    <span className="text-3xl font-bold mb-2">Dare 😈</span>
                    <span className="text-sm opacity-90">Complete a fun challenge</span>
                  </motion.button>
                </TiltCard>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className={`bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 md:p-10 text-center`}>
                    <div className={`inline-block px-6 py-2 rounded-full text-white font-bold text-lg mb-6 ${
                      mode === 'truth' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'
                    }`}>
                      {mode === 'truth' ? '💬 Truth' : '😈 Dare'}
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed min-h-[120px] flex items-center justify-center"
                    >
                      {content}
                    </motion.p>
                  </div>
                </TiltCard>
                <div className="flex justify-center gap-3 mt-6">
                  <Button onClick={() => pickMode(mode)} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Switch
                  </Button>
                  <Button onClick={nextRound} variant="primary" size="lg">
                    Next Round →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-400 mt-8">
            Have fun and be honest with each other! 💕
          </p>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="truthordare" />
      </PremiumBackground>
  );
}
