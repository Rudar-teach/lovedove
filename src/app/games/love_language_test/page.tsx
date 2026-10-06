'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const LOVE_LANG_QUESTIONS = [
  { q: "I feel most loved when my partner gives me their undivided attention", lang: "Quality Time" },
  { q: "A heartfelt text message makes my entire day", lang: "Words of Affirmation" },
  { q: "I love receiving surprise gifts, no matter how small", lang: "Receiving Gifts" },
  { q: "I feel most connected through physical touch", lang: "Physical Touch" },
  { q: "When my partner helps with chores, I feel deeply loved", lang: "Acts of Service" },
  { q: "Compliments mean more to me than gifts", lang: "Words of Affirmation" },
  { q: "I love planning dates and spending quality time together", lang: "Quality Time" },
  { q: "A warm hug can fix almost any bad day", lang: "Physical Touch" },
  { q: "When my partner cooks for me, I know they truly care", lang: "Acts of Service" },
  { q: "Handmade gifts are the most meaningful to me", lang: "Receiving Gifts" },
];

export default function LoveLanguageTest() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [questions, setQuestions] = useState<typeof LOVE_LANG_QUESTIONS>([]);

  useEffect(() => { setQuestions([...LOVE_LANG_QUESTIONS].sort(() => Math.random() - 0.5)); }, []);
  const handleAnswer = (val: number) => { setSelected(val); setTimeout(() => { setAnswers(prev => [...prev, val >= 3 ? 'agree' : 'disagree']); setSelected(null); if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); else setGameState('finished'); }, 600); };
  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setAnswers([]); setSelected(null); setQuestions(prev => [...prev].sort(() => Math.random() - 0.5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🗣️</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Language Test</h1><p className="text-gray-600 mb-8 text-lg">Discover how you express and receive love!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start Test</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Q {currentIndex + 1}/{questions.length}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><p className="text-lg font-medium text-gray-900 text-center leading-relaxed">{questions[currentIndex]?.q}</p></div>
            <div className="grid grid-cols-2 gap-3">
              {['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'].map((opt, i) => (<button key={i} onClick={() => handleAnswer(i)} className={`p-4 rounded-2xl font-semibold transition-all ${selected === i ? 'bg-rose-500 text-white scale-95' : 'bg-white/70 text-gray-700 hover:bg-white'}`}>{opt}</button>))}
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">💝</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Your Love Language</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 max-w-md mx-auto">
              <p className="text-xl font-bold gradient-text mb-4">Words of Affirmation</p>
              <p className="text-gray-600">You express and receive love through kind words and encouragement!</p>
            </div>
            <div className="flex gap-4 justify-center mt-8"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Retry</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
