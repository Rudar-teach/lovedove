'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Drama } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = [
  'First Date', 'Wedding Vows', 'Baby Talk', 'Breakfast in Bed',
  'Dancing Together', 'Watching Sunset', 'Holding Hands', 'Kissing',
  'Cooking Together', 'Giving Flowers', 'Writing a Love Letter', 'Proposing',
  'Shopping Together', 'Taking Selfie', 'Building Snowman', 'Flying a Kite',
  'Pillow Fight', 'Stargazing', 'Couples Massage', 'Candle Lit Dinner',
  'First Kiss', 'Running Through Rain', 'Giving Hug', 'Blowing Kiss',
  'Slow Dance', 'Ice Skating', 'Beach Walk', 'Movie Night',
  'Baking Cookies', 'Planting a Tree', 'Tandem Bike', 'Hot Air Balloon',
];

export default function CoupleCharadesPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [word, setWord] = useState('');
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    const b = localStorage.getItem('charades_best');
    if (b) setBest(Number(b));
  }, []);

  const nextWord = useCallback(() => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setRevealed(false);
    setSkipped(0);
    setPointsEarned(0);
    setTimeLeft(45);
  }, []);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setState('playing');
    nextWord();
  }, [nextWord]);

  const getPoints = () => {
    const pts = Math.max(5, 25 - skipped * 5 + Math.floor(timeLeft / 3));
    setPointsEarned(pts);
    return pts;
  };

  const gotIt = () => {
    const pts = getPoints();
    setScore((s) => s + pts);
    if (round < 4) {
      setRound((r) => r + 1);
      nextWord();
    } else {
      setState('finished');
      const finalScore = score + pts;
      if (finalScore > best) {
        setBest(finalScore);
        localStorage.setItem('charades_best', String(finalScore));
      }
    }
  };

  const skipWord = () => {
    setSkipped((s) => s + 1);
    nextWord();
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      setState('finished');
      if (score > best) {
        setBest(score);
        localStorage.setItem('charades_best', String(score));
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((tt) => tt - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state, score, best]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Drama className="text-red-400" /> Charades
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Round</div>
                <div className="text-xl font-bold text-white">{Math.min(round + 1, 5)}/5</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Drama className="text-red-400 mx-auto mb-4" size={48} />
                <p className="text-white text-lg mb-2">Couple Charades</p>
                <p className="text-white/60 text-sm mb-4">Act out the word for your partner!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start
                </button>
              </motion.div>
            )}

            {state === 'playing' && (
              <div className="space-y-4">
                <div className="bg-black/30 rounded-2xl p-8 text-center relative">
                  {!revealed ? (
                    <>
                      <p className="text-white/60 text-sm mb-2">Act this out:</p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-bold text-white"
                      >
                        {word}
                      </motion.div>
                    </>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                      <p className="text-white text-xl">+{pointsEarned} pts!</p>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white/60 text-xs uppercase">Time</div>
                    <div className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                      {timeLeft}s
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (!revealed) { setRevealed(true); skipWord(); } }}
                      disabled={revealed}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl font-medium hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => { if (!revealed) { setRevealed(true); gotIt(); } }}
                      disabled={revealed}
                      className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50"
                    >
                      Got It!
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 150 ? '🏆 Actors!' : score >= 80 ? '💖 Great!' : '💕 Fun!'}
                    </h2>
                    <p className="text-white/70">Score: <span className="text-pink-300 font-bold">{score}</span></p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}