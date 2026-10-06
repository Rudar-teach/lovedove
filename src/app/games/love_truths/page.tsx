'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const TRUTHS = ["What is your biggest fear in our relationship?", "Have you ever lied to me? About what?", "What is one thing you wish I would change?", "What's the most embarrassing thing you've done for love?", "What do you think is your biggest flaw?", "If you could change one decision in our relationship, what would it be?", "What's your biggest regret?", "Have you ever had a crush on someone else while with me?"];

export default function LoveTruths() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [q, setQ] = useState<typeof TRUTHS>([]);
  useEffect(() => { setQ([...TRUTHS].sort(() => Math.random() - 0.5).slice(0, 5)); }, []);
  const submit = () => { if (!answer.trim()) return; setAnswers(prev => [...prev, answer.trim()]); if (current < q.length - 1) { setCurrent(i => i + 1); setAnswer(''); } else setGameState('finished'); };
  const start = () => { setGameState('playing'); setCurrent(0); setAnswer(''); setAnswers([]); setQ([...TRUTHS].sort(() => Math.random() - 0.5).slice(0, 5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">💭</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Truth Questions</h1><p className="text-gray-600 mb-8 text-lg">Deep truth questions!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-sm font-medium text-gray-600 mb-4">Q {current + 1}/{q.length}</p>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><h2 className="text-xl font-bold text-gray-900 text-center">{q[current]}</h2></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Be honest..." rows={3} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white resize-none mb-4 outline-none" autoFocus />
              <button onClick={submit} disabled={!answer.trim()} className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50">Submit</button>
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">💭</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">All Truths Shared!</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 max-h-96 overflow-y-auto">
              {answers.map((a, i) => (<div key={i} className="mb-4 pb-4 border-b border-pink-100 last:border-0"><p className="text-sm text-gray-600 mb-1">Q{i+1}: {q[i]}</p><p className="text-sm font-semibold text-gray-800">Answer: {a}</p></div>))}
            </div>
            <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}