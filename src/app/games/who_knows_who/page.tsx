'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const QUESTIONS = ["What's your favorite memory of us?", "What do you love most about me?", "Where did we have our first kiss?", "What's your ideal date night?", "What makes you happiest in our relationship?", "What's a small thing I do that you adore?", "What's your favorite thing about my personality?", "Where do you see us in 5 years?"];

export default function WhoKnowsWho() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p1Ans, setP1Ans] = useState<string[]>([]);
  const [p2Ans, setP2Ans] = useState<string[]>([]);
  const [phase, setPhase] = useState<'p1' | 'p2'>('p1');
  const [answer, setAnswer] = useState('');
  const [q, setQ] = useState<typeof QUESTIONS>([]);

  useEffect(() => { setQ([...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)); }, []);
  const handleSubmit = () => {
    if (!answer.trim()) return;
    if (phase === 'p1') { setP1Ans(prev => [...prev, answer.trim()]); setPhase('p2'); setAnswer(''); }
    else { setP2Ans(prev => [...prev, answer.trim()]); if (currentIndex < q.length - 1) { setCurrentIndex(i => i + 1); setPhase('p1'); setAnswer(''); } else setGameState('finished'); }
  };
  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setP1Ans([]); setP2Ans([]); setPhase('p1'); setAnswer(''); setQ([...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🤔</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Who Knows Who</h1><p className="text-gray-600 mb-8 text-lg">Answer about each other!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold">{phase === 'p1' ? '💕 Partner 1' : '💖 Partner 2'} answering</span></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><h2 className="text-xl font-bold text-gray-900 text-center">{q[currentIndex]}</h2></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer..." rows={3} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white resize-none mb-4 outline-none focus:border-teal-500" autoFocus />
              <button onClick={handleSubmit} disabled={!answer.trim()} className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50">{phase === 'p1' ? 'Partner 2 →' : 'Finish'}</button>
            </div>
            {gameState === 'finished' && (<div className="mt-8"><p className="text-center text-2xl font-bold gradient-text mb-6">Compare your answers!</p>
              {q.map((qq, i) => (<div key={i} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-4">
                <p className="text-sm font-semibold text-teal-600 mb-2">Q{i+1}: {qq}</p>
                <p className="text-sm text-gray-600">💕 P1: {p1Ans[i] || 'N/A'}</p>
                <p className="text-sm text-gray-600">💖 P2: {p2Ans[i] || 'N/A'}</p>
              </div>))}
              <div className="flex gap-4 justify-center mt-4"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl text-white font-bold">More Games</Link></div>
            </div>)}
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}