'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, MessageCircle, Shuffle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const TRUTHS = [
  'What is the first thing you noticed about your partner?',
  'Describe your partner in 3 words.',
  'What is your favorite memory together?',
  'What is one thing your partner does that always makes you smile?',
  'When did you first know you were in love?',
  'What is your partner`s most adorable habit?',
  'What is one dream you want to fulfill together?',
  'If you could relive one date, which would it be?',
  'What is something your partner has taught you?',
  'What is the most romantic thing your partner has done?',
  'What is your partner`s best quality?',
  'What small gesture from your partner means the most?',
  'What song reminds you of your partner?',
  'Where do you see yourselves in 10 years?',
  'What is your favorite thing to do together?',
  'What is the most thoughtful gift you have received?',
  'What is your love language?',
  'What is one thing you have never told your partner?',
  'What is your partner`s perfect day?',
  'What makes your relationship unique?',
  'What is your favorite physical feature of your partner?',
  'What is the funniest moment you have shared?',
  'What is your partner`s hidden talent?',
  'What nickname do you use for your partner?',
  'What was your first impression of your partner?',
  'What do you love most about being in love?',
  'What is one promise you will keep forever?',
  'What is your favorite way to show love?',
];

export default function LoveTruthsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentTruth, setCurrentTruth] = useState<string>('');
  const [rounds, setRounds] = useState(0);
  const [usedTruths, setUsedTruths] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const intervalRef = useRef<any>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const available = TRUTHS.filter(t => !usedTruths.includes(t));
    const pool = available.length > 0 ? available : TRUTHS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRotation(r => r + 1440 + Math.random() * 720);
    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setCurrentTruth(TRUTHS[Math.floor(Math.random() * TRUTHS.length)]);
      if (count > 20) {
        clearInterval(intervalRef.current);
        setCurrentTruth(pick);
        setUsedTruths([...usedTruths, pick]);
        setRounds(r => r + 1);
        setIsSpinning(false);
      }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const reset = () => {
    setRounds(0);
    setUsedTruths([]);
    setCurrentTruth('');
    setRotation(0);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-amber-500" /><span className="font-bold text-gray-700">Truths</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💭</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Truths</h1>
              <p className="text-gray-600 mb-8 text-lg">Spin the wheel of romantic truth questions!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Click Spin to get a random romantic truth</li>
                  <li>28 different truths to explore</li>
                  <li>Take turns with your partner</li>
                  <li>Answer honestly and openly</li>
                </ul>
              </div>
              <button onClick={() => { reset(); setPhase('playing'); }} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Rounds: {rounds}</span>
                <button onClick={reset} className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-bold hover:bg-rose-200"><Shuffle className="w-3 h-3 inline mr-1" /> Reset</button>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: 'easeOut' }}
                    className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-rose-400 to-pink-500 shadow-2xl flex items-center justify-center relative"
                  >
                    <div className="absolute inset-4 rounded-full border-4 border-white/40"></div>
                    <div className="text-6xl z-10">💭</div>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, i) => (
                      <div key={i} className="absolute text-white font-black" style={{ transform: `rotate(${i * 45}deg) translateY(-100px)`, transformOrigin: 'center' }}>{letter}</div>
                    ))}
                  </motion.div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-rose-600"></div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={currentTruth || 'empty'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl p-6 min-h-[140px] flex items-center justify-center">
                    <p className="text-lg font-bold text-gray-800 text-center">{currentTruth || 'Click spin to get a truth!'}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button onClick={spinWheel} disabled={isSpinning} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition disabled:opacity-50">
                <Sparkles className="w-5 h-5 inline mr-2" /> {isSpinning ? 'Spinning...' : 'Spin Wheel'}
              </button>

              <div className="mt-6 text-sm text-gray-500">Rounds played: {rounds} | Truths available: {TRUTHS.length - usedTruths.length}</div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}