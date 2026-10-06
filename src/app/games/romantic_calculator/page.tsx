'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const factors = [
  { name: "Names compatibility", weight: 25 },
  { name: "Birthday numbers", weight: 20 },
  { name: "Favorite colors", weight: 15 },
  { name: "Shared hobbies", weight: 20 },
  { name: "Communication style", weight: 10 },
  { name: "Love languages", weight: 10 },
];

export default function RomanticCalculator() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<{ factor: string; score: number }[]>([]);

  const calculate = () => {
    setCalculating(true);
    const res = factors.map(f => ({
      factor: f.name,
      score: Math.min(100, Math.floor(Math.random() * 40) + 60),
    }));
    setTimeout(() => {
      setResults(res);
      const total = res.reduce((a, b) => a + b.score, 0) / res.length;
      setScore(Math.round(total));
      setCalculating(false);
      setGameState('finished');
    }, 2000);
  };

  const getMessage = (pct: number) => {
    if (pct >= 90) return "Perfect match! Written in the stars! ⭐";
    if (pct >= 75) return "Amazing connection! Soulmates! 💕";
    if (pct >= 60) return "Great potential! Keep nurturing! 💖";
    if (pct >= 40) return "Room to grow! Communication is key! 🌱";
    return "Every couple is unique! Love conquers all! ❤️";
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/70 hover:bg-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="font-bold">Love Dove</span>
          </Link>
          <Link href="/games" className="text-sm text-gray-600 hover:text-pink-500 transition">All Games</Link>
        </nav>

        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-7xl mb-4">💕</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Love Calculator</h1>
            <p className="text-gray-600 mb-8 text-lg">Enter two names to discover your romantic compatibility percentage!</p>
            <div className="space-y-3 mb-8">
              <input type="text" value={name1} onChange={e => setName1(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 focus:outline-none text-center text-lg" />
              <p className="text-2xl">💖</p>
              <input type="text" value={name2} onChange={e => setName2(e.target.value)} placeholder="Partner's name" className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 focus:outline-none text-center text-lg" />
            </div>
            <button onClick={() => { if (name1 && name2) { setGameState('playing'); calculate(); } }} disabled={!name1 || !name2} className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-rose-500/30 transition transform hover:scale-105 disabled:opacity-50">
              <Play className="inline mr-2" /> Calculate Love
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && calculating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="text-7xl mb-4 animate-pulse">💕</div>
            <h2 className="text-2xl font-bold text-rose-500">Calculating love...</h2>
            <p className="text-gray-500 mt-2">The stars are aligning for {name1} and {name2}...</p>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">💕</div>
            <h2 className="text-3xl font-bold mb-2">{name1} + {name2}</h2>
            <p className="text-7xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-4">{score}%</p>
            <p className="text-lg text-gray-600 mb-6">{getMessage(score)}</p>
            <div className="bg-white/70 p-4 rounded-2xl mb-8 text-left">
              <h3 className="font-bold mb-3 text-gray-700">Breakdown:</h3>
              {results.map((r, i) => (
                <div key={i} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{r.factor}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full" style={{ width: `${r.score}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{r.score}%</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setGameState('idle'); setScore(0); setResults([]); setName1(''); setName2(''); }} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Try Again</button>
            <Link href="/games" className="block mt-4 text-rose-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
