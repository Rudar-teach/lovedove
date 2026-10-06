'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const PROMPTS = ["Draw a heart", "Draw your partner's face", "Draw a sunset", "Draw a rose", "Draw a house", "Draw a cat", "Draw a tree", "Draw a star"];

export default function CoupleDrawing() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [prompts, setPrompts] = useState<typeof PROMPTS>([]);
  const [current, setCurrent] = useState(0);

  const start = () => { setPrompts([...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 5)); setCurrent(0); setGameState('playing'); };
  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🖌️</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Drawing Challenge</h1><p className="text-gray-600 mb-8 text-lg">Draw these prompts!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-sm font-medium text-gray-600 mb-4">Prompt {current + 1}/{prompts.length}</p>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${((current + 1) / prompts.length) * 100}%` }} /></div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white"><p className="text-4xl font-black">Draw: {prompts[current]}</p></div>
            <button onClick={() => current < prompts.length - 1 ? setCurrent(i => i + 1) : setGameState('finished')} className="w-full px-6 py-4 bg-white/70 rounded-2xl font-bold">Done! Next →</button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🎨</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">All Done!</h2><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}