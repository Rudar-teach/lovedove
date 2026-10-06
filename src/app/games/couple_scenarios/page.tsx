'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const SCENARIOS = [
  { text: "Your partner forgets your birthday. What do you do?", choices: ["Talk to them about it", "Ignore them for a day", "Throw a surprise for them instead", "Break up"], best: 0 },
  { text: "Your partner wants to hang out with their ex as 'just friends'.", choices: ["Be okay with it", "Not comfortable, talk about it", "Break up", "Also hang with my ex"], best: 1 },
  { text: "Your partner spends more time gaming than with you.", choices: ["Join them", "Ask for more time together", "Get mad", "Ignore them"], best: 1 },
  { text: "A stranger flirts with your partner in front of you.", choices: ["Let them handle it", "Step in gracefully", "Start fighting", "Walk away"], best: 1 },
  { text: "Your partner cancels your date last minute for their friends.", choices: ["Say it's okay", "Feel hurt and tell them", "Cancel with them too", "Go on date alone"], best: 1 },
];

export default function CoupleScenarios() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<typeof SCENARIOS>([]);
  useEffect(() => { setQ([...SCENARIOS].sort(() => Math.random() - 0.5)); }, []);
  const handleAnswer = (idx: number) => { setSelected(idx); setTimeout(() => { if (idx === q[current]?.best) setScore(s => s + 20); setSelected(null); if (current < q.length - 1) setCurrent(i => i + 1); else setGameState('finished'); }, 600); };
  const start = () => { setGameState('playing'); setCurrent(0); setScore(0); setSelected(null); setQ([...SCENARIOS].sort(() => Math.random() - 0.5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🎭</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Scenarios</h1><p className="text-gray-600 mb-8 text-lg">How would you handle these situations?</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="text-sm font-medium text-gray-600">Q {current + 1}/{q.length}</span><span className="text-sm font-medium text-blue-600 ml-4">Score: {score}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${((current + 1) / q.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><h2 className="text-xl font-bold text-gray-900 text-center">{q[current]?.text}</h2></div>
            <div className="space-y-3">{q[current]?.choices.map((c, i) => (<button key={i} onClick={() => handleAnswer(i)} className={`w-full p-4 rounded-2xl font-semibold transition-all ${selected === i ? (i === q[current].best ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-white/70 hover:bg-white'}`}>{c}</button>))}</div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2><p className="text-5xl font-black gradient-text mb-4">{score}</p>
            <div className="flex gap-4 justify-center"><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}