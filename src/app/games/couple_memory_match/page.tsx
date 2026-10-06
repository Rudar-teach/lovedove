'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const EMOJIS = ['💕', '💖', '💝', '💘', '🌹', '💐', '💌', '💍'];

export default function CoupleMemoryMatch() {
  const router = useRouter();
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);

  const initGame = () => {
    const pairs = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(pairs.map(emoji => ({ emoji, flipped: false, matched: false })));
    setFlipped([]); setMoves(0); setTimeLeft(60); setGameState('playing');
  };

  useEffect(() => { if (gameState !== 'playing' || timeLeft <= 0) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t); }, [gameState, timeLeft]);
  useEffect(() => { if (gameState === 'playing' && timeLeft === 0) setGameState('finished'); }, [timeLeft, gameState]);
  useEffect(() => { if (cards.length && cards.every(c => c.matched)) setGameState('finished'); }, [cards]);

  const flipCard = (idx: number) => {
    if (flipped.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    const updated = [...cards]; updated[idx].flipped = true; setCards(updated);
    setFlipped(prev => [...prev, idx]);
    if (flipped.length === 1) {
      setMoves(m => m + 1);
      const [first] = flipped;
      if (cards[first].emoji === cards[idx].emoji) {
        setTimeout(() => {
          const matched = [...updated];
          matched[first].matched = true; matched[idx].matched = true;
          setCards(matched);
        }, 400);
        setFlipped([]);
      } else {
        setTimeout(() => { const reset = [...updated]; reset[first].flipped = false; reset[idx].flipped = false; setCards(reset); setFlipped([]); }, 800);
      }
    }
  };

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
            <div className="text-6xl mb-6">🎴</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Memory Match</h1><p className="text-gray-600 mb-8 text-lg">Match the pairs of love emojis!</p>
            <button onClick={initGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-600">Moves: {moves}</span><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div></div>
            <div className="grid grid-cols-4 gap-3">{cards.map((c, i) => (<button key={i} onClick={() => flipCard(i)} className={`aspect-square rounded-2xl text-4xl font-bold transition-all ${c.flipped || c.matched ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-white/70'}`}>{c.flipped || c.matched ? c.emoji : '?'}</button>))}</div>
            {gameState === 'finished' && (<div className="text-center mt-8">
              <p className="text-3xl font-bold gradient-text mb-4">Done in {moves} moves!</p>
              <div className="flex gap-4 justify-center"><button onClick={initGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link></div>
            </div>)}
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}