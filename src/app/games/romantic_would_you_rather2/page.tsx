'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WYR = [
  { a: "Romantic dinner at home", b: "Fancy restaurant" }, { a: "Beach vacation", b: "Mountain retreat" },
  { a: "Morning person", b: "Night owl" }, { a: "Cuddle movies", b: "Hold hands walk" },
  { a: "Receiving gifts", b: "Doing things for you" }, { a: "Verbal compliments", b: "Physical touch" },
  { a: "Small wedding", b: "Big wedding" }, { a: "City life", b: "Country life" },
];

export default function WouldYouRather() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [p1Ans, setP1Ans] = useState<string[]>([]);
  const [p2Ans, setP2Ans] = useState<string[]>([]);
  const [phase, setPhase] = useState<'p1' | 'p2'>('p1');
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState<typeof WYR>([]);

  useEffect(() => { setQ([...WYR].sort(() => Math.random() - 0.5)); }, []);
  const handleSelect = (val: string) => {
    setSelected(val);
    setTimeout(() => {
      if (phase === 'p1') { setP1Ans(prev => [...prev, val]); setPhase('p2'); setSelected(null); }
      else { setP2Ans(prev => [...prev, val]); if (current < q.length - 1) { setCurrent(i => i + 1); setPhase('p1'); setSelected(null); } else setGameState('finished'); }
    }, 500);
  };
  const start = () => { setGameState('playing'); setCurrent(0); setP1Ans([]); setP2Ans([]); setPhase('p1'); setSelected(null); setQ([...WYR].sort(() => Math.random() - 0.5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🤷</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Would You Rather 2</h1><p className="text-gray-600 mb-8 text-lg">Tough romantic choices!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold">{phase === 'p1' ? '💕 Partner 1' : '💖 Partner 2'}</span></div>
            <p className="text-center text-sm font-medium text-gray-600 mb-6">Q {current + 1}/{q.length}</p>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full" style={{ width: `${((current + 1) / q.length) * 100}%` }} /></div>
            <div className="grid grid-cols-1 gap-4">
              {[q[current]?.a, q[current]?.b].map((opt, i) => (
                <button key={i} onClick={() => handleSelect(opt || '')} className={`p-8 rounded-2xl font-bold text-xl transition-all ${selected === opt ? 'bg-green-500 text-white scale-95' : 'bg-white/70 text-gray-800 hover:bg-white'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">💕</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-8 text-left">
              <h3 className="font-bold mb-4">Your choices:</h3>
              {q.map((q2, i) => (<div key={i} className="mb-3"><p className="text-sm text-gray-600 mb-1">Q{i+1}: A or B?</p><p className="text-sm">💕 P1: {p1Ans[i]}</p><p className="text-sm">💖 P2: {p2Ans[i]}</p></div>))}
            </div>
            <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}