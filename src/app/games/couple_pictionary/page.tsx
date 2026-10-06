'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = ['Sunset', 'Beach', 'Heart', 'Flower', 'Rainbow', 'Star', 'Kite', 'Birthday Cake', 'Treasure', 'Magic', 'Wedding', 'Bouquet'];

export default function CouplePictionary() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [words, setWords] = useState<typeof WORDS>([]);

  useEffect(() => { setWords([...WORDS].sort(() => Math.random() - 0.5).slice(0, 5)); }, []);
  useEffect(() => { if (gameState !== 'playing' || timeLeft <= 0) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }, [gameState, timeLeft]);
  useEffect(() => { if (gameState === 'playing' && timeLeft === 0) setGameState('finished'); }, [timeLeft, gameState]);

  const nextWord = () => { if (currentIndex < words.length - 1) setCurrentIndex(i => i + 1); else setGameState('finished'); };
  const startGame = () => { setGameState('playing'); setCurrentIndex(0); setTimeLeft(60); setWords([...WORDS].sort(() => Math.random() - 0.5).slice(0, 5)); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🎨</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Pictionary</h1><p className="text-gray-600 mb-3 text-lg">Draw these words for your partner!</p>
            <p className="text-sm text-gray-500 mb-8">One person draws, the other guesses. Pass the phone after each word!</p>
            <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Word {currentIndex + 1}/{words.length}</span><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div></div>
            <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} /></div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white">
              <p className="text-sm mb-2 opacity-80">Draw this word:</p>
              <p className="text-5xl font-black">{words[currentIndex]}</p>
            </div>
            <div className="flex gap-3"><button onClick={nextWord} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl">Got it! Next →</button></div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🎨</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">All Done!</h2><p className="text-gray-600 mb-8">Great drawing session!</p>
            <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}