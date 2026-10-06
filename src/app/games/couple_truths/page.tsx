'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const TRUTHS = [
  "What's the most romantic thing someone has ever done for you?",
  "What's your biggest relationship fear?",
  "What's one thing you've never told your partner?",
  "When did you first realize you were in love?",
  "What's your favorite memory together so far?",
  "What's a dream you have for your relationship?",
  "What makes you feel most loved and appreciated?",
  "What's a small thing your partner does that melts your heart?",
  "What's something you hope never changes about your partner?",
  "What's the hardest part of being in a long-distance relationship (if applicable)?",
  "What's a secret talent your partner doesn't know about?",
  "What would you do if you knew you couldn't fail?",
  "What's your love language and do you feel understood?",
  "What's a tradition you want to start together?",
  "What's something that always makes you laugh together?",
  "If you could relive one day together, which would it be?",
  "What's your biggest hope for your future together?",
  "What does 'home' mean to you?",
  "What's something your partner does that you find incredibly attractive?",
  "What's a fear you're working on overcoming?",
  "When do you feel most vulnerable with your partner?",
  "What's the most thoughtful gift you've ever received?",
  "What's a hobby you'd love to try together?",
  "What does unconditional love mean to you?",
  "What's something that always cheers you up?",
  "If you could travel anywhere together, where would you go?",
  "What's your favorite thing about morning together?",
  "What's a lesson love has taught you?",
  "What's your favorite way to spend quality time?",
  "What makes you feel safe and secure in this relationship?",
];

export default function CoupleTruths() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState('');
  const [truths, setTruths] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setTruths([...TRUTHS].sort(() => Math.random() - 0.5));
  }, []);

  const startGame = () => {
    const shuffled = [...TRUTHS].sort(() => Math.random() - 0.5);
    setTruths(shuffled);
    setDone([]);
    setIdx(0);
    setCurrent(shuffled[0]);
    setGameState('playing');
  };

  const next = () => {
    setDone(prev => [...prev, current]);
    if (idx < truths.length - 1) {
      setIdx(i => i + 1);
      setCurrent(truths[idx + 1]);
    } else {
      setGameState('finished');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💕</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Truths</h1>
              <p className="text-gray-600 mb-8 text-lg">Deep, meaningful questions to strengthen your bond!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>💕 Take turns answering truth questions</li>
                  <li>💕 Be honest and open with each other</li>
                  <li>💕 {TRUTHS.length} deep questions to explore</li>
                  <li>💕 This will bring you closer together!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Play className="w-5 h-5 inline mr-2" /> Start Truths</button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">Truth {idx + 1} / {truths.length}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full" style={{ width: `${((idx + 1) / truths.length) * 100}%` }} />
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-2xl font-bold leading-relaxed">{current}</p>
              </div>
              <button onClick={next} className="w-full px-6 py-4 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition-colors">Answered! Next Truth →</button>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">💕</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Beautiful!</h2>
              <p className="text-gray-600 mb-8">You shared {done.length} truths together!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4">Questions you answered:</h3>
                {done.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2"><span className="text-rose-500">💬</span><p className="text-sm text-gray-700">{t}</p></div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
