'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const EMOJI_QUIZ = [
  { emojis: "💕💍", answer: "Marriage proposal", options: ["Wedding", "Marriage proposal", "Date night", "Anniversary"] },
  { emojis: "🌹🍽️", answer: "Romantic dinner", options: ["Cooking class", "Romantic dinner", "Picnic", "Camping"] },
  { emojis: "💋😘", answer: "First kiss", options: ["Fight", "First kiss", "Hello", "Goodbye"] },
  { emojis: "💌📮", answer: "Love letter", options: ["Letter", "Love letter", "Postcard", "Bill"] },
  { emojis: "🏖️🌅", answer: "Beach date", options: ["Swimming", "Beach date", "Vacation", "Surfing"] },
  { emojis: "🎁💝", answer: "Anniversary gift", options: ["Birthday", "Anniversary gift", "Wedding gift", "Surprise"] },
  { emojis: "🌙🌹", answer: "Late night date", options: ["Sleeping", "Late night date", "Star gazing", "Moon walk"] },
  { emojis: "💃❤️", answer: "Dance together", options: ["Wedding", "Dance together", "Concert", "Party"] },
  { emojis: "☕💕", answer: "Coffee date", options: ["Work", "Coffee date", "Breakfast", "Friends"] },
  { emojis: "✈️🗺️", answer: "Travel together", options: ["Work trip", "Travel together", "Backpacking", "Moving"] },
];

export default function LoveEmojiQuiz() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [questions, setQuestions] = useState<typeof EMOJI_QUIZ>([]);

  useEffect(() => { setQuestions([...EMOJI_QUIZ].sort(() => Math.random() - 0.5)); }, []);
  const handleAnswer = (idx: number) => { setSelected(idx); setTimeout(() => { if (idx === questions[currentIndex]?.options.indexOf(questions[currentIndex].answer)) setScore(s => s + 10); setSelected(null); if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); else setGameState('finished'); }, 600); };
  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setScore(0); setSelected(null); setQuestions(prev => [...prev].sort(() => Math.random() - 0.5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">😍</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Emoji Quiz</h1><p className="text-gray-600 mb-8 text-lg">Guess the romantic phrase from emojis!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Q {currentIndex + 1}/{questions.length}</span><span className="text-sm font-medium text-rose-600">Score: {score}</span></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-12 mb-6 text-center"><p className="text-6xl mb-4">{questions[currentIndex]?.emojis}</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{questions[currentIndex]?.options.map((opt, i) => (<button key={i} onClick={() => handleAnswer(i)} className={`p-4 rounded-2xl font-semibold transition-all ${selected === i ? (opt === questions[currentIndex].answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-white/70 text-gray-700 hover:bg-white'}`}>{opt}</button>))}</div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Quiz Complete!</h2><p className="text-5xl font-black gradient-text mb-4">{score}</p><p className="text-gray-600 mb-8">points</p>
            <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}