'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const QUESTIONS = [
  { a: 'Have breakfast in bed together every weekend', b: 'Go on a surprise weekend getaway every month' },
  { a: 'Recreate your very first date', b: 'Plan a dream date in a city you have never visited' },
  { a: 'Always hold hands in public', b: 'Always whisper sweet nothings in private' },
  { a: 'Write a love letter every Friday', b: 'Sing a love song to each other every morning' },
  { a: 'Have a candle-lit dinner at home', b: 'Dine at a fancy rooftop restaurant' },
  { a: 'Adopt a puppy together', b: 'Plant a garden of roses together' },
  { a: 'Watch a romantic comedy together', b: 'Stargaze on a quiet hilltop' },
  { a: 'Cook a meal together blindfolded', b: 'Paint a portrait of each other' },
  { a: 'Renew your vows in Paris', b: 'Get married on a tropical beach' },
  { a: 'Slow dance in the kitchen', b: 'Dance in the rain' },
];

export default function WouldYouRatherPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [index, setIndex] = useState(0);
  const [aCount, setACount] = useState(0);
  const [bCount, setBCount] = useState(0);

  const start = () => {
    setIndex(0);
    setACount(0);
    setBCount(0);
    setState('playing');
  };

  const choose = (choice: 'a' | 'b') => {
    if (choice === 'a') setACount((c) => c + 1);
    else setBCount((c) => c + 1);
    if (index + 1 >= QUESTIONS.length) setState('finished');
    else setIndex((i) => i + 1);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Heart className="w-20 h-20 text-pink-400 mx-auto mb-6" fill="currentColor" />
            <h1 className="text-5xl font-bold text-white mb-4">Would You Rather</h1>
            <p className="text-white/80 mb-8 text-lg">Pick the perfect romantic dilemma together. Discover how aligned your hearts truly are.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Playing
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto mt-12">
            <div className="text-white/70 text-center mb-6">Question {index + 1} / {QUESTIONS.length}</div>
            <h2 className="text-3xl font-bold text-white text-center mb-10">What would you rather do?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button onClick={() => choose('a')} className="bg-gradient-to-br from-pink-500/30 to-purple-500/30 hover:from-pink-500/50 hover:to-purple-500/50 border-2 border-pink-400/50 rounded-3xl p-8 text-white text-xl font-semibold transition-all hover:scale-105 min-h-[180px]">
                {QUESTIONS[index].a}
              </button>
              <button onClick={() => choose('b')} className="bg-gradient-to-br from-rose-500/30 to-orange-500/30 hover:from-rose-500/50 hover:to-orange-500/50 border-2 border-rose-400/50 rounded-3xl p-8 text-white text-xl font-semibold transition-all hover:scale-105 min-h-[180px]">
                {QUESTIONS[index].b}
              </button>
            </div>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Your Heart Map</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="grid grid-cols-2 gap-6 text-white">
                <div>
                  <div className="text-5xl font-bold text-pink-300">{aCount}</div>
                  <div className="opacity-70">Choice A</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-rose-300">{bCount}</div>
                  <div className="opacity-70">Choice B</div>
                </div>
              </div>
              <p className="mt-6 text-white/80 italic">"True love is in the choices we make together."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Play Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}