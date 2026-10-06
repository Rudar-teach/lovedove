'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const RIDDLES = [{ q: "I have cities, but no houses. Forests, but no trees. Water, but no fish. What am I?", a: "A map", hint: "You look at me before traveling" }, { q: "What has keys but no locks? Space but no room? You can enter, but can't go inside?", a: "A keyboard", hint: "You type on me" }, { q: "I speak without a mouth and hear without ears. I have no body, but come alive with the wind.", a: "An echo", hint: "I repeat what you say" }, { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps", hint: "You make these when walking" }, { q: "What gets wetter the more it dries?", a: "A towel", hint: "You use me after a shower" }, { q: "What has a head and a tail but no body?", a: "A coin", hint: "You flip me to decide" }, { q: "I'm tall when I'm young and short when I'm old. What am I?", a: "A candle", hint: "I give light" }, { q: "What has many needles but doesn't sew?", a: "A pine tree", hint: "I grow in winter" }];

export default function LoveRiddles() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questions, setQuestions] = useState<typeof RIDDLES>([]);
  useEffect(() => { setQuestions([...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 5)); }, []);
  useEffect(() => { if (gameState === 'playing' && timeLeft <= 0) setGameState('finished'); }, [timeLeft, gameState]);

  const handleSubmit = () => {
    if (input.toLowerCase() === questions[current]?.a.toLowerCase()) { setScore(s => s + 10); next(); }
    else { setShowAnswer(true); setTimeout(next, 1500); }
  };
  const next = () => { setShowAnswer(false); setShowHint(false); setInput(''); if (current < questions.length - 1) setCurrent(i => i + 1); else setGameState('finished'); };
  const start = () => { setGameState('playing'); setCurrent(0); setScore(0); setInput(''); setShowHint(false); setShowAnswer(false); setQuestions([...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🧩</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Riddles</h1><p className="text-gray-600 mb-8 text-lg">Solve romantic riddles together!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Q {current + 1}/{questions.length}</span><span className="text-sm font-medium text-purple-600">Score: {score}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
              <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">{questions[current]?.q}</p>
              {showHint && <p className="text-sm text-purple-600 text-center mt-3">Hint: {questions[current]?.hint}</p>}
              {showAnswer && <p className="text-sm text-green-600 text-center mt-3">Answer: {questions[current]?.a}</p>}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer..." className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-center mb-4 outline-none focus:border-purple-500" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
              <div className="flex gap-3">
                <button onClick={() => setShowHint(true)} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold">Hint</button>
                <button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl">Submit</button>
              </div>
            </div>
            {gameState === 'finished' && (<div className="text-center mt-8">
              <div className="text-6xl mb-6">🧠</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2><p className="text-5xl font-black gradient-text mb-4">{score}</p>
              <div className="flex gap-4 justify-center"><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link></div>
            </div>)}
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
