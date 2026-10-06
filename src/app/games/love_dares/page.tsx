'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const DARES = ["Send your partner 5 heart emojis ❤️❤️❤️❤️❤️", "Call your partner and sing a love song", "Write a short poem about your partner right now", "Do your best impression of your partner", "Send a flirty text to your partner right now", "Show your partner your favorite song and explain why you love it", "Dance with your partner for 1 minute", "Tell your partner 5 things you love about them"];

export default function LoveDares() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState<string[]>([]);
  const [dares, setDares] = useState<typeof DARES>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setDares([...DARES].sort(() => Math.random() - 0.5)); }, []);
  useEffect(() => { if (gameState === 'playing' && idx < dares.length) setCurrent(dares[idx]); }, [gameState, idx, dares]);

  const next = () => { setDone(prev => [...prev, current]); if (idx < dares.length - 1) { setIdx(i => i + 1); setCurrent(dares[idx + 1]); } else setGameState('finished'); };
  const start = () => { setGameState('playing'); setIdx(0); setDone([]); setDares([...DARES].sort(() => Math.random() - 0.5)); setCurrent(DARES[0]); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">💪</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Dares</h1><p className="text-gray-600 mb-8 text-lg">Romantic dares for couples!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Dare Me!</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="text-sm font-medium text-gray-600">Dare {idx + 1}/{dares.length}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full" style={{ width: `${((idx + 1) / dares.length) * 100}%` }} /></div>
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white">
              <p className="text-4xl font-black leading-relaxed">{current}</p>
            </div>
            <button onClick={next} className="w-full px-6 py-4 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition-colors">I did it! Next Dare →</button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing!</h2>
            <p className="text-gray-600 mb-8">You completed all {done.length} dares!</p>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-900 mb-4">Your completed dares:</h3>
              {done.map((d, i) => (<div key={i} className="flex items-start gap-2 mb-2"><span className="text-red-500">✓</span><p className="text-sm text-gray-700">{d}</p></div>))}
            </div>
            <div className="flex gap-4 justify-center"><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}