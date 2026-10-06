'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const PREDICTIONS = [
  "You will travel to Paris together by 2026", "A surprise proposal is coming soon!", "You'll adopt a pet together next year",
  "Your next vacation will be magical", "You'll celebrate your 5th anniversary in style", "A surprise gift is in your future",
  "You'll learn to dance together", "Your love story will be a movie someday", "You'll build a home together",
  "A romantic road trip is in your future", "You'll recreate your first date", "A surprise dinner date awaits you",
];

export default function FutureTogether() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [predictions, setPredictions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  const reveal = () => {
    const shuffled = [...PREDICTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setPredictions(shuffled);
    setCurrent(0);
    setGameState('playing');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🔮</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Future Together</h1><p className="text-gray-600 mb-8 text-lg">See what the future holds for you two!</p>
            <button onClick={reveal} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Reveal Future</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="text-sm font-medium text-gray-600">Prediction {current + 1}/{predictions.length}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${((current + 1) / predictions.length) * 100}%` }} /></div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white">
              <p className="text-3xl font-black leading-relaxed">{predictions[current]}</p>
            </div>
            <button onClick={() => current < predictions.length - 1 ? setCurrent(i => i + 1) : setGameState('finished')} className="w-full px-6 py-4 bg-white/70 rounded-2xl font-bold">Next Prediction →</button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🔮</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Your Future!</h2><p className="text-gray-600 mb-8">A bright future awaits you two!</p>
            <button onClick={reveal} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}