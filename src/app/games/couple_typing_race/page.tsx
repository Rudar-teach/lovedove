'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const QUOTES = [
  "You make my heart skip a beat",
  "I love you more than words can say",
  "You are my sunshine on a cloudy day",
  "Together is the most beautiful place to be",
  "Every love story is beautiful but ours is my favorite",
  "You are my today and all of my tomorrows",
  "I fell in love with you and I will never stop",
  "You are the missing piece to my puzzle",
  "In a sea of people my eyes will always search for you",
  "Home is wherever you are",
];

export default function CoupleTypingRace() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userInput, setUserInput] = useState('');
  const [quotes, setQuotes] = useState<typeof QUOTES>([]);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => { setQuotes([...QUOTES].sort(() => Math.random() - 0.5).slice(0, 5)); }, []);
  useEffect(() => { if (gameState !== 'playing' || timeLeft <= 0) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }, [gameState, timeLeft]);
  useEffect(() => { if (gameState === 'playing' && timeLeft === 0) setGameState('finished'); }, [timeLeft, gameState]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserInput(val);
    const quote = quotes[currentIndex] || '';
    const correct = val.split('').filter((c, i) => c === quote[i]).length;
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);
    if (val === quote) {
      const elapsed = (60 - timeLeft) / 60;
      const words = quote.split(' ').length;
      setWpm(Math.round(words / Math.max(elapsed, 0.1)));
      setTimeout(() => {
        if (currentIndex < quotes.length - 1) { setCurrentIndex(i => i + 1); setUserInput(''); }
        else setGameState('finished');
      }, 500);
    }
  };

  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setTimeLeft(60); setUserInput(''); setWpm(0); setAccuracy(100); setQuotes(prev => [...prev].sort(() => Math.random() - 0.5).slice(0, 5)); };

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
            <div className="text-6xl mb-6">⌨️</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Typing Race</h1><p className="text-gray-600 mb-8 text-lg">Type romantic quotes as fast as possible!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">{currentIndex + 1}/{quotes.length} • {wpm} WPM • {accuracy}%</span><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${((currentIndex + 1) / quotes.length) * 100}%` }} /></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6"><p className="text-lg italic text-gray-700">{quotes[currentIndex]}</p></div>
            <textarea value={userInput} onChange={handleChange} placeholder="Start typing here..." rows={3} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white outline-none focus:border-blue-500 resize-none" autoFocus />
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Done!</h2><p className="text-5xl font-black gradient-text mb-2">{wpm} WPM</p><p className="text-gray-600 mb-8">{accuracy}% accuracy</p>
            <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}