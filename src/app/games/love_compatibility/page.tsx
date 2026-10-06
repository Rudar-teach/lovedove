'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const COMPAT_QUESTIONS = [
  "Do you prefer nights in or going out?",
  "Coffee or tea?",
  "Early bird or night owl?",
  "Dogs or cats?",
  "Beach or mountains?",
  "Movies at home or theater?",
  "Sweet or savory?",
  "Plan ahead or spontaneous?",
  "Talk on phone or text?",
  "Cooking or ordering takeout?",
];

export default function LoveCompatibility() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p1Answers, setP1Answers] = useState<boolean[]>([]);
  const [p2Answers, setP2Answers] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'p1' | 'p2'>('p1');
  const [currentAnswer, setCurrentAnswer] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<typeof COMPAT_QUESTIONS>([]);

  useEffect(() => { setQuestions([...COMPAT_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8)); }, []);

  const handleAnswer = (val: boolean) => {
    setCurrentAnswer(val);
    setTimeout(() => {
      if (phase === 'p1') { setP1Answers(prev => [...prev, val]); setPhase('p2'); setCurrentAnswer(null); }
      else {
        setP2Answers(prev => [...prev, val]);
        if (currentIndex < questions.length - 1) { setCurrentIndex(i => i + 1); setPhase('p1'); setCurrentAnswer(null); }
        else setGameState('finished');
      }
    }, 400);
  };

  const calculateScore = () => {
    let matches = 0;
    for (let i = 0; i < Math.min(p1Answers.length, p2Answers.length); i++) {
      if (p1Answers[i] === p2Answers[i]) matches++;
    }
    return Math.round((matches / questions.length) * 100);
  };

  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setP1Answers([]); setP2Answers([]); setPhase('p1'); setCurrentAnswer(null); setQuestions(prev => [...prev].sort(() => Math.random() - 0.5).slice(0, 8)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">💖</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Compatibility</h1><p className="text-gray-600 mb-8 text-lg">How compatible are you two?</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold">{phase === 'p1' ? '💕 Partner 1' : '💖 Partner 2'} answering</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><h2 className="text-xl font-bold text-gray-900 text-center">{questions[currentIndex]}</h2></div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAnswer(true)} className={`p-6 rounded-2xl font-bold text-lg transition-all ${currentAnswer === true ? 'bg-green-500 text-white scale-95' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>Yes 👍</button>
              <button onClick={() => handleAnswer(false)} className={`p-6 rounded-2xl font-bold text-lg transition-all ${currentAnswer === false ? 'bg-red-500 text-white scale-95' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>No 👎</button>
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">💕</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Compatibility Score</h2>
            <p className="text-7xl font-black gradient-text mb-4">{calculateScore()}%</p>
            <p className="text-gray-600 mb-8">{calculateScore() >= 70 ? "Perfect match! 💕" : calculateScore() >= 40 ? "You have potential! 💖" : "Opposites attract? 😅"}</p>
            <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
