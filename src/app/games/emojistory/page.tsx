'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const EMOJI_SETS = [
  '💕 🌅 🐚', '💖 🍷 🕯️', '💘 🌹 💋', '❤️ 🎂 🕊️', '💝 🌸 💐',
  '💗 🍓 💌', '💓 ☕ 📖', '💞 🌙 🌟', '💟 🎁 💍', '💝 🏖️ 🥥',
  '💕 🎵 🎶', '💖 🛁 🌹', '💘 🥂 💐', '❤️ 🍫 💌', '💗 🌷 💕',
  '💓 🚗 🌅', '💞 📸 🌙', '💟 🎭 💘', '💝 🍕 ❤️', '💕 🌊 🐚',
  '💖 🎠 🌹', '💋 🍦 ☀️', '💍 🌺 💐', '💕 🎪 🎡', '💗 🌈 🌸',
  '💓 🍰 🕯️', '💘 🚲 🌳', '💖 🎹 🎵', '💝 🌻 🌞', '💕 🐶 💕',
  '💖 🌙 💫', '💗 📷 🌷', '💞 🍷 💋', '💟 🦋 🌺', '💝 💌 💐',
  '💕 ⛷️ 🏔️', '💖 🎬 🍿', '💘 🌮 💕', '❤️ 🛶 🌅', '💗 🏰 👑',
  '💓 🌺 💕', '💞 🎁 💘', '💟 🌹 💖', '💝 🕊️ 💕', '💕 🐰 🌷',
  '💖 🦢 💍', '💗 🌙 💫', '💘 ☕ 🍪', '💞 💐 🌷', '💟 💋 💖',
  '💝 🎂 🕯️', '💕 🌟 💫', '💖 🎪 🎠', '💗 🍓 🍒', '💓 🥂 🍾',
];

type Phase = 'pick1' | 'write1' | 'pick2' | 'write2' | 'reveal';

export default function EmojiStoryPage() {
  const [phase, setPhase] = useState<Phase>('pick1');
  const [set1, setSet1] = useState('');
  const [set2, setSet2] = useState('');
  const [story1, setStory1] = useState('');
  const [story2, setStory2] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [toast, setToast] = useState(false);

  const generateEmojis = () => {
    const shuffled = [...EMOJI_SETS].sort(() => Math.random() - 0.5);
    return shuffled[0];
  };

  const startPlayer1 = () => {
    const newSet = generateEmojis();
    setSet1(newSet);
    setStory1('');
    setTimeLeft(60);
    setPhase('write1');
  };

  const startPlayer2 = () => {
    const newSet = generateEmojis();
    setSet2(newSet);
    setStory2('');
    setTimeLeft(60);
    setPhase('write2');
  };

  useEffect(() => {
    if ((phase !== 'write1' && phase !== 'write2') || timeLeft <= 0) {
      if (timeLeft <= 0) {
        if (phase === 'write1') {
          setPhase('pick2');
        } else if (phase === 'write2') {
          setPhase('reveal');
        }
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const submitStory = () => {
    if (phase === 'write1') {
      if (!story1.trim()) return;
      setPhase('pick2');
    } else {
      if (!story2.trim()) return;
      setPhase('reveal');
    }
  };

  const resetGame = () => {
    setPhase('pick1');
    setSet1('');
    setSet2('');
    setStory1('');
    setStory2('');
    setTimeLeft(60);
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const currentSet = phase === 'write1' ? set1 : phase === 'write2' ? set2 : '';
  const currentStory = phase === 'write1' ? story1 : story2;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Emoji Story
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'pick1' && (
              <motion.div key="pick1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🎭💭</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Player 1: Get Your Emojis!</h2>
                    <p className="text-gray-600 mb-2">You&apos;ll get 5 emojis to weave into a romantic story</p>
                    <p className="text-sm text-gray-500 mb-6">You have 60 seconds!</p>
                    <Button onClick={startPlayer1} variant="primary" size="lg">Roll My Emojis! 🎲</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'write1' && (
              <motion.div key="write1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {/* Timer */}
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-primary-600">Player 1 writing...</p>
                  <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`}>⏱️ {timeLeft}s</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${(timeLeft / 60) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                    <p className="text-xs text-gray-500 mb-2 text-center">Your emojis:</p>
                    <div className="flex justify-center gap-3 mb-6 text-4xl">
                      {currentSet.split(' ').map((e, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>{e}</motion.span>)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-center">Write a romantic story using ALL these emojis:</p>
                    <textarea
                      value={currentStory}
                      onChange={e => setStory1(e.target.value)}
                      placeholder="Write your romantic story..."
                      rows={6}
                      className="w-full p-4 rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none text-base resize-none"
                    />
                    <div className="text-center mt-4">
                      <Button onClick={submitStory} variant="primary">Submit & Pass to Player 2 ➡️</Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'pick2' && (
              <motion.div key="pick2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🎭💭</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Player 2: Your Turn!</h2>
                    <p className="text-gray-600 mb-2">You&apos;ll get a NEW set of emojis</p>
                    <p className="text-sm text-gray-500 mb-6">You have 60 seconds!</p>
                    <Button onClick={startPlayer2} variant="primary" size="lg">Roll My Emojis! 🎲</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'write2' && (
              <motion.div key="write2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-rose-600">Player 2 writing...</p>
                  <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-rose-600'}`}>⏱️ {timeLeft}s</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${(timeLeft / 60) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                    <p className="text-xs text-gray-500 mb-2 text-center">Your emojis:</p>
                    <div className="flex justify-center gap-3 mb-6 text-4xl">
                      {currentSet.split(' ').map((e, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>{e}</motion.span>)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-center">Write a romantic story using ALL these emojis:</p>
                    <textarea
                      value={currentStory}
                      onChange={e => setStory2(e.target.value)}
                      placeholder="Write your romantic story..."
                      rows={6}
                      className="w-full p-4 rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none text-base resize-none"
                    />
                    <div className="text-center mt-4">
                      <Button onClick={submitStory} variant="primary">Reveal Stories! ✨</Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'reveal' && (
              <motion.div key="reveal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-center text-2xl font-bold text-gray-700 mb-4">📖 The Stories...</p>
                <div className="space-y-4">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.08)">
                      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">👤 Player 1</span>
                          <span className="text-2xl">{set1}</span>
                        </div>
                        <p className="text-gray-800 italic whitespace-pre-wrap">{story1 || '(no story)'}</p>
                      </div>
                    </TiltCard>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.08)">
                      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-bold">👤 Player 2</span>
                          <span className="text-2xl">{set2}</span>
                        </div>
                        <p className="text-gray-800 italic whitespace-pre-wrap">{story2 || '(no story)'}</p>
                      </div>
                    </TiltCard>
                  </motion.div>
                </div>
                <div className="text-center mt-6">
                  <Button onClick={resetGame} variant="primary" size="lg">New Stories 📝</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}