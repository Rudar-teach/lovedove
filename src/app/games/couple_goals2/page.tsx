'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GOALS = ["Save for our dream home", "Visit 5 countries together", "Adopt a pet", "Run a marathon together", "Learn to dance together", "Start a podcast together", "Plant a tree", "Cook a 5-course meal", "Sleep under the stars", "Volunteer together", "Take a dance lesson", "Make a scrapbook"];

export default function CoupleGoals2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (i: number) => setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const start = () => { setGameState('playing'); setChecked([]); };
  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🎯</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Goals 2</h1><p className="text-gray-600 mb-8 text-lg">More couple goals to achieve!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-sm text-gray-600 mb-6">{checked.length}/{GOALS.length} done</p>
            <div className="space-y-3">{GOALS.map((g, i) => (
              <button key={i} onClick={() => toggle(i)} className={`w-full text-left p-5 rounded-2xl font-medium transition-all ${checked.includes(i) ? 'bg-green-500 text-white line-through' : 'bg-white/70 text-gray-800 hover:bg-white'}`}>
                {checked.includes(i) ? '✓ ' : '○ '}{g}
              </button>
            ))}</div>
            <div className="text-center mt-8"><button onClick={() => setGameState('finished')} className="px-8 py-3 bg-white/70 rounded-2xl font-bold">See Results</button></div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Your Goals!</h2><p className="text-5xl font-black gradient-text mb-2">{checked.length}/{GOALS.length}</p>
            <div className="flex gap-4 justify-center"><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Reset</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}