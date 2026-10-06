'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Palette } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const CATEGORIES = [
  { name: 'Emoji Portraits', emoji: '😀', prompts: ['Draw each other using only emojis', 'Draw your first meeting', 'Draw your dream home', 'Draw your wedding'] },
  { name: 'Blind Art', emoji: '🎭', prompts: ['Draw your partner while blindfolded', 'Draw a pet you will adopt', 'Draw your future child', 'Draw your dream house'] },
  { name: 'Timed Doodles', emoji: '⏱️', prompts: ['Draw your first kiss in 30 seconds', 'Draw your favorite memory', 'Draw "love" in a single line', 'Draw what "happiness" looks like'] },
  { name: 'Word Art', emoji: '📝', prompts: ['Draw the word "passion"', 'Draw the word "forever"', 'Draw the word "together"', 'Draw the word "soulmate"'] },
];

const ROUND_TIME = 30;

const COORD_ROWS = [
  [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
  [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
  [2, 1, 0, 0, 0, 0, 0, 0, 1, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [2, 1, 0, 0, 0, 0, 0, 0, 1, 2],
  [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
  [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
];

const COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function DrawingChallengePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'picking' | 'playing' | 'finished'>('idle');
  const [category, setCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [grid, setGrid] = useState<number[][]>(COORD_ROWS.map((r) => r.map(() => 0)));
  const [color, setColor] = useState(1);
  const [score, setScore] = useState(0);

  const start = () => {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setCategory(cat);
    setRoundIndex(0);
    setTimeLeft(ROUND_TIME);
    setGrid(COORD_ROWS.map((r) => r.map(() => 0)));
    setColor(1);
    setScore(0);
    setState('picking');
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      if (roundIndex + 1 >= (category?.prompts.length || 0)) setState('finished');
      else {
        setRoundIndex((r) => r + 1);
        setTimeLeft(ROUND_TIME);
        setGrid(COORD_ROWS.map((r) => r.map(() => 0)));
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, state, roundIndex, category]);

  const paint = (r: number, c: number) => {
    if (state !== 'playing') return;
    const updated = grid.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? color : cell)));
    setGrid(updated);
  };

  const scoreRound = () => {
    setScore((s) => s + 30 + timeLeft * 2);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Palette className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Drawing Challenge</h1>
            <p className="text-white/80 mb-8 text-lg">Take turns drawing romantic prompts. Paint with love in the pixel canvas.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Pick Category
            </button>
          </motion.div>
        )}

        {state === 'picking' && category && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center mt-10">
            <h2 className="text-3xl font-bold text-white mb-2">Category: {category.emoji} {category.name}</h2>
            <div className="space-y-2">
              {category.prompts.map((p, i) => (
                <button key={i} onClick={() => { setRoundIndex(i); setTimeLeft(ROUND_TIME); setState('playing'); }} className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 text-white text-left">
                  <span className="text-lg">🎨 {p}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'playing' && category && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Round {roundIndex + 1}/{category.prompts.length}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-white">{category.prompts[roundIndex]}</p>
              <p className="text-5xl font-bold text-green-300">{timeLeft}s</p>
            </div>
            <div className="flex justify-center gap-1 mb-4 bg-white/10 p-2 rounded-2xl max-w-fit mx-auto">
              {COLORS.map((c, i) => (
                <button key={i} onClick={() => setColor(i)} className={`w-8 h-8 rounded-lg transition-all ${color === i ? 'ring-2 ring-white scale-110' : ''}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="max-w-fit mx-auto">
              {grid.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => (
                    <button key={c} onClick={() => paint(r, c)} className="w-10 h-10 border border-gray-700 hover:opacity-80 transition-all" style={{ backgroundColor: COLORS[cell] }} />
                  ))}
                </div>
              ))}
            </div>
            <button onClick={scoreRound} className="w-full mt-4 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-semibold">
              Done Painting (+{30 + timeLeft * 2})
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Gallery Complete!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-green-300">{score}</div>
              <div className="text-white/80 mt-2">Total Score</div>
              <p className="mt-6 text-white/80 italic">"Together you painted a masterpiece of love."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> New Gallery
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}