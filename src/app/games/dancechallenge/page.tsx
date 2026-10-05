'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Flame, Trophy, Star, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const MOVES = [
  { emoji: '💃', name: 'Spin Around', desc: 'Do a graceful spin! Twirl like you\'re on a dance floor!' },
  { emoji: '✨', name: 'Strike a Pose', desc: 'Find your most dramatic pose and hold it!' },
  { emoji: '💑', name: 'Do a Dip', desc: 'Gently dip your partner (or air-dip) with style!' },
  { emoji: '🌹', name: 'Romantic Sway', desc: 'Slow dance sway with your eyes locked!' },
  { emoji: '🎶', name: 'Moonwalk', desc: 'Try the moonwalk — backwards like Michael!' },
  { emoji: '💫', name: 'Body Wave', desc: 'Wave your body from head to toe like a wave!' },
  { emoji: '💖', name: 'Heart Hands', desc: 'Make heart shapes with your hands, together!' },
  { emoji: '🕺', name: 'Funky Moves', desc: 'Do your funniest, funkiest dance moves!' },
  { emoji: '💪', name: 'Power Pose', desc: 'Flex and show your confidence!' },
  { emoji: '🌀', name: 'Twirl Partner', desc: 'Gently twirl your partner around!' },
];

type Rating = { label: string; min: number };

const RATINGS: Rating[] = [
  { label: 'Dancing Royalty', min: 450 },
  { label: 'Smooth Movers', min: 350 },
  { label: 'Rhythm Lovers', min: 250 },
  { label: 'Cute Couple', min: 150 },
  { label: 'Getting There', min: 50 },
  { label: 'Shy Starters', min: 0 },
];

const COMBO_MESSAGES = [
  '🔥 Fire move!',
  '💫 Electric!',
  '⭐ Stellar!',
  '💖 Perfect harmony!',
  '🌹 Beautiful!',
  '✨ Magnificent!',
  '🎵 Grooving!',
  '💕 So romantic!',
];

export default function DanceChallengePage() {
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(8);
  const [currentMove, setCurrentMove] = useState<(typeof MOVES)[0] | null>(null);
  const [timer, setTimer] = useState(10);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [comboMsg, setComboMsg] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef(0);

  const startGame = () => {
    setPlaying(true);
    setRound(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setDone(false);
    setShowResult(false);
    nextRound();
  };

  const nextRound = () => {
    setShowResult(false);
    const move = MOVES[Math.floor(Math.random() * MOVES.length)];
    setCurrentMove(move);
    setTimer(10);
    setRound(r => r + 1);
  };

  // Timer
  useEffect(() => {
    if (!playing || showResult || done) return;
    timerRef.current = window.setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowResult(true);
          setLastScore(0);
          setCombo(c => {
            const nc = 0;
            setBestCombo(prev => Math.max(prev, comboRef.current));
            comboRef.current = 0;
            return nc;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, showResult, done]);

  const comboRef = useRef(0);

  useEffect(() => { comboRef.current = combo; }, [combo]);

  const handleDance = () => {
    if (!playing || showResult) return;
    const style = Math.floor(Math.random() * 60) + 20 + combo * 5;
    const newCombo = combo + 1;
    setCombo(newCombo);
    setScore(s => s + style);
    setLastScore(style);
    setShowResult(true);
    if (newCombo > bestCombo) setBestCombo(newCombo);
    if (newCombo % 4 === 0 && newCombo > 0) {
      setComboMsg(COMBO_MESSAGES[Math.floor(Math.random() * COMBO_MESSAGES.length)]);
    }
  };

  useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(() => {
        if (round >= totalRounds) {
          setPlaying(false);
          setDone(true);
        } else {
          nextRound();
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showResult, round, totalRounds]);

  const rating = RATINGS.find(r => score >= r.min)!;

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Dance Challenge', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Dance Challenge
            </h1>
            <div className="w-10" />
          </div>

          {!playing && !done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                  <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-8xl">💃</span>
                  </motion.div>
                  <p className="text-gray-700 font-semibold text-lg">Get your groove on! 💃🕺</p>
                  <p className="text-sm text-gray-500">8 dance moves, 10 seconds each. Score points with your style!</p>
                  <Button onClick={startGame} variant="primary">Start Dancing!</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {playing && currentMove && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {timer}s
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
                  Round {round}/{totalRounds}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
                  Score: {score}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-orange-600 shadow border border-pink-100">
                  🔥 {combo}x
                </div>
              </div>

              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="absolute text-4xl" style={{ top: `${15 * i}%`, left: `${10 * i}%` }}>
                        {i % 2 === 0 ? '💃' : '🕺'}
                      </div>
                    ))}
                  </div>
                  <div className="relative text-center space-y-4">
                    <motion.div
                      key={currentMove.name + (showResult ? 'done' : 'active')}
                      animate={{ scale: showResult ? 1.3 : [1, 1.1, 1], rotate: showResult ? [0, -10, 10, 0] : 0 }}
                      transition={{ duration: showResult ? 0.5 : 1, repeat: showResult ? 0 : Infinity }}
                      className="text-8xl"
                    >
                      {currentMove.emoji}
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {!showResult ? (
                        <motion.div key="dance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <h2 className="text-2xl font-display font-black text-primary-600">{currentMove.name}!</h2>
                          <p className="text-gray-600 mt-1">{currentMove.desc}</p>
                        </motion.div>
                      ) : (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                          <p className="text-xl font-bold text-primary-600">+{lastScore} style points!</p>
                          {comboMsg && <p className="text-lg text-orange-500 font-bold">{comboMsg}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!showResult && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDance}
                        className="mt-2 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-full px-8 py-4 font-display font-black text-xl shadow-lg animate-pulse"
                      >
                        <Zap className="w-5 h-5 inline mr-2" />DO THE MOVE!
                      </motion.button>
                    )}
                  </div>
                </div>
              </TiltCard>
            </>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                  <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-6xl">{rating.label === 'Dancing Royalty' ? '👑' : '🏆'}</span>
                  </motion.div>
                  <h2 className="text-3xl font-display font-black gradient-text-animated">Dance Rating!</h2>
                  <p className="text-xl font-bold text-primary-600">{rating.label}</p>
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Total Score</div>
                      <div className="text-2xl font-bold text-primary-600">{score}</div>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Best Combo</div>
                      <div className="text-2xl font-bold text-rose-600">🔥 {bestCombo}x</div>
                    </div>
                  </div>
                  <Button onClick={startGame} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Dance Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
            {playing && (
              <Button onClick={startGame} variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="dancechallenge" />
      </PremiumBackground>
  );
}
