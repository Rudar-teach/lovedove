'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const ACTIVITIES = ["Hold hands", "Kiss", "Dance together", "Share a compliment", "Take a selfie", "Hug for 10 seconds", "Say 'I love you'", "Look into each other's eyes", "Sing a song together", "Do your best impression", "Whisper something sweet", "Feed each other"];

export default function LoveBingo() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [grid, setGrid] = useState<{ text: string; done: boolean }[]>([]);
  const [hasBingo, setHasBingo] = useState(false);

  const initGame = () => {
    const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5).slice(0, 25);
    setGrid(shuffled.map(t => ({ text: t, done: false })));
    setGameState('playing');
    setHasBingo(false);
  };

  const toggleCell = (idx: number) => {
    const updated = [...grid];
    updated[idx].done = !updated[idx].done;
    setGrid(updated);
    checkBingo(updated);
  };

  const checkBingo = (cells: typeof grid) => {
    const wins = [
      [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
      [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
      [0,6,12,18,24],[4,8,12,16,20]
    ];
    setHasBingo(wins.some(line => line.every(i => cells[i]?.done)));
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🎯</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Bingo</h1><p className="text-gray-600 mb-8 text-lg">Match 5 in a row!</p>
            <button onClick={initGame} className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {hasBingo && <div className="text-center mb-4 p-4 bg-green-100 rounded-2xl text-green-700 font-bold text-xl">🎉 BINGO! 🎉</div>}
            <div className="grid grid-cols-5 gap-2">{grid.map((cell, i) => (
              <button key={i} onClick={() => toggleCell(i)} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold p-1 transition-all ${cell.done ? 'bg-green-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'}`}>
                {cell.text}
              </button>
            ))}</div>
            <button onClick={() => setGameState('finished')} className="mt-6 px-6 py-3 bg-white/70 rounded-2xl font-bold">Finish Game</button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🎯</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Game Over!</h2>
            <div className="flex gap-4 justify-center"><button onClick={initGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}