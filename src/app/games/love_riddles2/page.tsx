'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const RIDDLES = [{ q: "I have a heart that doesn't beat. I have a face that never smiles. What am I?", a: "A playing card", hint: "Used in card games" }, { q: "What belongs to you but others use it more than you?", a: "Your name", hint: "People call you by it" }, { q: "What gets bigger the more you take away?", a: "A hole", hint: "Digging" }];

export default function LoveRiddles2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [q, setQ] = useState<typeof RIDDLES>([]);
  useEffect(() => { setQ([...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 3)); }, []);
  const handleSubmit = () => { if (input.toLowerCase() === q[current]?.a.toLowerCase()) { setScore(s => s + 10); next(); } else { setShowAnswer(true); setTimeout(next, 1500); } };
  const next = () => { setShowAnswer(false); setShowHint(false); setInput(''); if (current < q.length - 1) setCurrent(i => i + 1); else setGameState('finished'); };
  const start = () => { setGameState('playing'); setCurrent(0); setScore(0); setInput(''); setShowHint(false); setShowAnswer(false); setQ([...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 3)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🧩</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Asked Riddles</h1><p className="text-gray-600 mb-8 text-lg">Solve fun riddles!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-sm font-medium text-gray-600 mb-4">Q {current + 1}/{q.length} • Score: {score}</p>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
              <p className="text-xl font-medium text-gray-900 text-center">{q[current]?.q}</p>
              {showHint && <p className="text-sm text-indigo-600 text-center mt-3">Hint: {q[current]?.hint}</p>}
              {showAnswer && <p className="text-sm text-green-600 text-center mt-3">Answer: {q[current]?.a}</p>}
            </div>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-center mb-4 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} autoFocus />
            <div className="flex gap-3"><button onClick={() => setShowHint(true)} className="flex-1 px-4 py-3 bg-white/70 rounded-xl font-semibold">Hint</button><button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl">Submit</button></div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2><p className="text-5xl font-black gradient-text mb-4">{score}</p>
            <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}