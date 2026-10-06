'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

export default function CoupleReflex() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'ready' | 'go' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const startRound = () => {
    setGameState('ready');
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => { setGameState('go'); setStartTime(Date.now()); setTimeLeft(3); }, delay);
  };

  useEffect(() => {
    if (gameState === 'go' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 100);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && gameState === 'go') setGameState('finished');
  }, [gameState, timeLeft]);

  const handleTap = () => {
    if (gameState === 'go') {
      const rt = Date.now() - startTime;
      setReactionTime(rt);
      if (!bestTime || rt < bestTime) setBestTime(rt);
      setGameState('finished');
    } else if (gameState === 'ready') {
      setGameState('finished');
    }
  };

  const reset = () => { setGameState('idle'); setReactionTime(0); };

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
            <div className="text-6xl mb-6">⚡</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Reflex</h1><p className="text-gray-600 mb-3 text-lg">Test your reaction speed!</p>
            <p className="text-sm text-gray-500 mb-8">Tap when the screen turns green</p>
            <button onClick={startRound} className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'ready' && (<motion.div initial={{ opacity: 1 }} className="fixed inset-0 bg-yellow-400 flex items-center justify-center z-50 cursor-pointer" onClick={handleTap}>
            <div className="text-center"><p className="text-6xl mb-4">⏳</p><p className="text-4xl font-black text-white">Wait for green...</p><p className="text-white mt-2">Don't tap yet!</p></div>
          </motion.div>)}
          {gameState === 'go' && (<motion.div initial={{ opacity: 1 }} className="fixed inset-0 bg-green-500 flex items-center justify-center z-50 cursor-pointer" onClick={handleTap}>
            <div className="text-center"><p className="text-6xl mb-4">⚡</p><p className="text-4xl font-black text-white">TAP NOW!</p></div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">⚡</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Reaction Time!</h2>
            <p className="text-6xl font-black gradient-text mb-2">{reactionTime}ms</p>
            {bestTime && <p className="text-gray-600 mb-2">Best: {bestTime}ms</p>}
            <p className="text-sm text-gray-500 mb-8">{reactionTime < 200 ? 'Lightning fast! ⚡' : reactionTime < 300 ? 'Great reflexes!' : 'Keep practicing!'}</p>
            <div className="flex gap-4 justify-center"><button onClick={startRound} className="px-8 py-3 bg-white/70 rounded-2xl font-bold">Try Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}