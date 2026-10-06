'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const HOW_WELL_QUESTIONS = [
  "What was your first impression of me?",
  "Where did we first meet?",
  "What was I wearing on our first date?",
  "What was the first meal we shared?",
  "What did you think when you first saw me?",
  "Where was our first kiss?",
  "What song was playing when we first met?",
  "What was the first gift I gave you?",
  "What was your biggest fear on our first date?",
  "What did you love most about our first conversation?",
  "Where did we have our first proper date?",
  "What was the first movie we watched together?",
  "What made you realize you liked me?",
  "What was your favorite moment from our first meeting?",
  "What did you think I would be like before meeting me?",
];

export default function HowWellMetGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState<typeof HOW_WELL_QUESTIONS>([]);

  useEffect(() => { setQuestions([...HOW_WELL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)); }, []);
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && currentAnswer.trim()) {
      setAnswers(prev => [...prev, currentAnswer.trim()]);
      setTimeout(() => { if (currentIndex < questions.length - 1) { setCurrentIndex(i => i + 1); setCurrentAnswer(''); setTimeLeft(20); } else setGameState('finished'); }, 500);
    }
  }, [timeLeft]);

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    setAnswers(prev => [...prev, currentAnswer.trim()]);
    if (currentIndex < questions.length - 1) { setCurrentIndex(i => i + 1); setCurrentAnswer(''); setTimeLeft(20); }
    else setGameState('finished');
  };

  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setTimeLeft(20); setAnswers([]); setCurrentAnswer(''); setQuestions(prev => [...prev].sort(() => Math.random() - 0.5).slice(0, 10)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">💞</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">How Well Did You Meet</h1><p className="text-gray-600 mb-8 text-lg">Test your memory of how you first met!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start Game</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Q {currentIndex + 1}/{questions.length}</span><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 5 ? 'bg-red-100 text-red-600' : 'bg-white/70'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><h2 className="text-xl font-bold text-gray-900 text-center">{questions[currentIndex]}</h2></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
              <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Write your answer..." rows={3} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white resize-none mb-4 outline-none focus:border-pink-500" autoFocus />
              <button onClick={handleSubmit} disabled={!currentAnswer.trim()} className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl disabled:opacity-50">Submit</button>
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">💞</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2>
            <p className="text-gray-600 mb-8">Your answers have been saved.</p>
            <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
