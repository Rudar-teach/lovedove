'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

export default function CoupleReflexPage() {
  const [state, setState] = useState<'idle' | 'countdown' | 'playing' | 'finished'>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [waitStart, setWaitStart] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [times, setTimes] = useState<number[]>([]);

  useEffect(() => {
    const b = localStorage.getItem('couplereflex_best');
    if (b) setBest(Number(b));
  }, []);

  const startRound = useCallback(() => {
    setState('countdown');
    setResult(null);
    setCountdown('Get Ready...');

    setTimeout(() => {
      setCountdown('Wait for 💕!');
      setTimeout(() => {
        const delay = 1500 + Math.random() * 3000;
        setState('playing');
        setWaitStart(performance.now());
        setCountdown('💕');
      }, 1000 + Math.random() * 1000);
    }, 800);
  }, []);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setTimes([]);
    startRound();
  }, [startRound]);

  const handleClick = useCallback(() => {
    if (state === 'countdown') {
      setResult('Too soon! Wait for the heart.');
      setTimeout(() => {
        setRound((r) => r + 1);
        if (round >= 4) {
          setState('finished');
          const finalScore = score;
          if (finalScore > best) {
            setBest(finalScore);
            localStorage.setItem('couplereflex_best', String(finalScore));
          }
        } else {
          startRound();
        }
      }, 1500);
    } else if (state === 'playing') {
      const reaction = performance.now() - waitStart;
      setTimes((t) => [...t, reaction]);
      setScore((s) => s + Math.max(10, 100 - Math.floor(reaction)));
      setResult(`Reaction: ${Math.floor(reaction)}ms`);
      setState('idle');
    }
  }, [state, waitStart, round, score, best, startRound]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" /> Reflex Game
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

            {/* Reaction times */}
            {times.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {times.map((t, i) => (
                  <div key={i} className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-1 text-sm">
                    <span className="text-white/60">R{i + 1}:</span> <span className="text-pink-300">{Math.floor(t)}ms</span>
                  </div>
                ))}
              </div>
            )}

            <motion.div
              animate={{
                backgroundColor:
                  state === 'playing'
                    ? '#ec4899'
                    : state === 'countdown'
                    ? '#7c3aed'
                    : 'rgba(255,255,255,0.05)',
              }}
              onClick={handleClick}
              className="relative rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none"
              style={{ height: 300 }}
            >
              <motion.div
                animate={{ scale: state === 'playing' ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl"
              >
                💕
              </motion.div>
              <motion.p
                animate={{ scale: state === 'countdown' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-2xl font-bold text-white mt-4"
              >
                {countdown || (state === 'idle' ? 'Click to Start' : '')}
              </motion.p>

              {result && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/80 mt-2"
                >
                  {result}
                </motion.p>
              )}

              {state === 'idle' && round === 0 && (
                <p className="text-white/40 text-sm mt-2">Click when you see the heart!</p>
              )}
            </motion.div>

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
                      {score >= 400 ? '🏆 Lightning Fast!' : score >= 250 ? '⚡ Quick!' : '💕 Good!'}
                    </h2>
                    <p className="text-white/70">Average: {times.length > 0 ? Math.floor(times.reduce((a, b) => a + b) / times.length) : 0}ms</p>
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