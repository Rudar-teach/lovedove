'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const MISSIONS = [
  { name: 'Peck on the Cheek', emoji: '😘', points: 10, time: 5 },
  { name: 'Peck on the Lips', emoji: '💋', points: 20, time: 8 },
  { name: 'Eskimo Kiss', emoji: '🐽', points: 15, time: 6 },
  { name: 'Forehead Kiss', emoji: '💕', points: 15, time: 5 },
  { name: 'Nose Kiss', emoji: '👃', points: 12, time: 4 },
  { name: 'Hand Kiss', emoji: '🤌', points: 18, time: 6 },
  { name: 'Neck Kiss', emoji: '💞', points: 25, time: 8 },
  { name: 'Surprise Kiss', emoji: '😚', points: 30, time: 10 },
];

const SPIN_TIME = 8;

export default function KissingGamePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'spinning' | 'mission' | 'finished'>('idle');
  const [current, setCurrent] = useState<typeof MISSIONS[0] | null>(null);
  const [missionTime, setMissionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    if (state === 'spinning') {
      const t = setTimeout(() => {
        const m = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
        setCurrent(m);
        setMissionTime(m.time);
        setState('mission');
      }, SPIN_TIME * 1000);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (state !== 'mission' || missionTime <= 0) return;
    const t = setTimeout(() => setMissionTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [missionTime, state]);

  const start = () => {
    setScore(0);
    setRound(0);
    setState('spinning');
    setSpin((x) => x + 1);
  };

  const complete = () => {
    if (!current) return;
    setScore((s) => s + current.points);
    if (round + 1 >= 6) setState('finished');
    else {
      setRound((r) => r + 1);
      setState('spinning');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-8xl mb-6">💋</div>
            <h1 className="text-5xl font-bold text-white mb-4">The Kissing Game</h1>
            <p className="text-white/80 mb-8 text-lg">Spin to discover your next kiss mission. Complete 6 rounds for a perfect love score.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Game
            </button>
          </motion.div>
        )}

        {state === 'spinning' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-7xl mb-8 animate-pulse">💖</div>
            <h2 className="text-3xl font-bold text-white mb-4">Choosing your kiss...</h2>
            <div className="w-64 mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={spin}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: SPIN_TIME }}
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
              />
            </div>
            <p className="text-white/60 mt-4">{SPIN_TIME}s</p>
          </motion.div>
        )}

        {state === 'mission' && current && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center mt-12">
            <div className="flex justify-between items-center mb-6 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Round {round + 1}/6</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="bg-gradient-to-br from-rose-500/40 to-pink-500/40 backdrop-blur-md rounded-3xl p-10 border-2 border-rose-300/50">
              <div className="text-9xl mb-4">{current.emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-3">{current.name}</h2>
              <div className="flex items-center justify-center gap-2 text-rose-200 text-lg">
                <Timer size={20} /> <span className="text-3xl font-bold">{missionTime}s</span>
              </div>
              <div className="mt-3 text-pink-200">Worth {current.points} points</div>
            </div>
            <button onClick={complete} className="mt-8 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-semibold text-lg">
              Completed! (+{current.points})
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Sweet Kisses! 💋</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-7xl font-bold text-rose-300">{score}</div>
              <div className="text-white/80 mt-2">Total Love Points</div>
              <p className="mt-6 text-white/80 italic">"Every kiss is a love letter written with lips."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Play Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}