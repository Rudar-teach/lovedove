'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, Heart } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CompatibilityResult {
  percentage: number;
  message: string;
  emoji: string;
}

function calculateLove(name1: string, name2: string): CompatibilityResult {
  const combined = (name1 + name2).toLowerCase().replace(/\s/g, '');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const percentage = Math.abs(hash % 101);

  let message: string;
  let emoji: string;
  if (percentage >= 90) {
    message = "Soulmates! Your love story is written in the stars! 💫";
    emoji = "💞";
  } else if (percentage >= 75) {
    message = "True love! You were made for each other! 💖";
    emoji = "💕";
  } else if (percentage >= 60) {
    message = "Great chemistry! A beautiful connection! 💗";
    emoji = "💓";
  } else if (percentage >= 45) {
    message = "There's potential here! With love, anything is possible! 💛";
    emoji = "💘";
  } else if (percentage >= 30) {
    message = "Opposites attract! Maybe fate has other plans... 💚";
    emoji = "💙";
  } else if (percentage >= 15) {
    message = "A challenge awaits, but love conquers all! 💜";
    emoji = "💔";
  } else {
    message = "Hmm... maybe just be amazing friends instead! 💔";
    emoji = "💩";
  }

  return { percentage, message, emoji };
}

const NAME_BADGES = [
  { emoji: '🦋', name: 'Butterfly', min: 80 },
  { emoji: '🌸', name: 'Lovebirds', min: 65 },
  { emoji: '💫', name: 'Spark', min: 50 },
  { emoji: '🌈', name: 'Rainbow', min: 35 },
  { emoji: '🌱', name: 'Budding', min: 0 },
];

export default function LoveCalculatorPage() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/lovecalculator`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleCalculate = () => {
    if (!name1.trim() || !name2.trim()) return;
    const r = calculateLove(name1.trim(), name2.trim());
    setResult(r);
    setHasCalculated(true);
  };

  const reset = () => {
    setName1('');
    setName2('');
    setResult(null);
    setHasCalculated(false);
  };

  const badge = useMemo(() => {
    if (!result) return null;
    return NAME_BADGES.find(b => result.percentage >= b.min) || NAME_BADGES[NAME_BADGES.length - 1];
  }, [result]);

  const getColor = (pct: number) => {
    if (pct >= 75) return 'from-pink-400 to-rose-500';
    if (pct >= 50) return 'from-purple-400 to-primary-500';
    if (pct >= 30) return 'from-primary-400 to-pink-500';
    return 'from-pink-300 to-rose-400';
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Love Calculator
            </h1>
            {hasCalculated && (
              <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors">
                <RefreshCw className="w-6 h-6 text-primary-500" />
              </button>
            )}
          </div>

          {/* Invite Button */}
          {!hasCalculated && (
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
          )}

          <AnimatePresence mode="wait">
            {!hasCalculated ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-3">💕</div>
                      <p className="text-gray-600">Enter both names to find your love compatibility!</p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Your Name"
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                        placeholder="Enter your name..."
                        className="text-center text-lg"
                      />
                      <div className="text-center text-3xl">💕</div>
                      <Input
                        label="Partner's Name"
                        value={name2}
                        onChange={(e) => setName2(e.target.value)}
                        placeholder="Enter partner's name..."
                        className="text-center text-lg"
                      />
                    </div>

                    <Button
                      onClick={handleCalculate}
                      variant="primary"
                      className="w-full mt-6"
                      size="lg"
                      disabled={!name1.trim() || !name2.trim()}
                    >
                      Calculate Love 💕
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                      className="text-8xl mb-4"
                    >
                      {result!.emoji}
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-3xl font-bold text-gray-800">{name1}</span>
                      <Heart className="w-8 h-8 text-rose-500" />
                      <span className="text-3xl font-bold text-gray-800">{name2}</span>
                    </div>

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gray-200 h-4 rounded-full mb-3 overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result!.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${getColor(result!.percentage)}`}
                      />
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-5xl font-black gradient-text mb-2"
                    >
                      {result!.percentage}%
                    </motion.p>

                    {badge && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-bold text-sm mb-4"
                      >
                        <span>{badge.emoji}</span>
                        <span>{badge.name}</span>
                      </motion.div>
                    )}

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="text-xl font-medium text-gray-700"
                    >
                      {result!.message}
                    </motion.p>

                    <Button onClick={reset} variant="outline" className="mt-6">
                      Calculate Again 💕
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
