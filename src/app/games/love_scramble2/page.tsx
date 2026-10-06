'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = ['LOVE', 'KISS', 'HUG', 'DATE', 'HEART', 'SOUL', 'DREAM', 'CHERISH', 'PASSION', 'ROMANCE', 'VALENTINE', 'CUPID', 'FOREVER', 'TOGETHER', 'ADORE'];

export default function LoveScramble2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [words, setWords] = useState<typeof WORDS>([]);

  const scramble = (word: string) => word.split('').sort(() => Math.random() - 0.5).join('');
  useEffect(() => { setWords([...WORDS].sort(() => Math.random() - 0.5).slice(0, 8)); }, []);
  useEffect(() => { if (gameState !== 'playing' || timeLeft <= 0) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }, [gameState, timeLeft]);
  useEffect(() => { if (gameState === 'playing' && timeLeft === 0) setGameState('finished'); }, [timeLeft, gameState]);
  useEffect(() => { if (gameState === 'playing' && words.length > 0) setScrambledWord(scramble(words[currentIndex])); }, [currentIndex, gameState, words]);

  const handleSubmit = () => {
    if (userAnswer.toUpperCase() === words[currentIndex]) setScore(s => s + 10);
    if (currentIndex < words.length - 1) setCurrentIndex(i => i + 1);
    else setGameState('finished');
    setUserAnswer('');
  };

  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setTimeLeft(45); setScore(0); setUserAnswer(''); setWords([...WORDS].sort(() => Math.random() - 0.5).slice(0, 8)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🔤</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Scramble 2</h1><p className="text-gray-600 mb-8 text-lg">More word scramble fun!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Score: {score}</span><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-12 mb-6 text-center"><p className="text-sm text-gray-500 mb-2">Unscramble this word:</p><p className="text-4xl font-black tracking-widest">{scrambledWord}</p></div>
            <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value.toUpperCase())} placeholder="Type answer..." className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-center text-xl font-bold tracking-widest mb-4 outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} autoFocus />
            <button onClick={handleSubmit} className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl">Submit</button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Done!</h2><p className="text-5xl font-black gradient-text mb-4">{score}</p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}