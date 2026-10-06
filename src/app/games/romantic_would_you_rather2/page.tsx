'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const QUESTIONS = [
  { a: 'Share your phone password with me', b: 'Share your diary with me' },
  { a: 'Go on a road trip with no destination', b: 'Fly to a city neither of us has been to' },
  { a: 'Cook dinner for me every night', b: 'Surprise me with breakfast in bed' },
  { a: 'Hold hands when we sleep', b: 'Cuddle on the couch every evening' },
  { a: 'Whisper sweet nothings', b: 'Write little love notes' },
  { a: 'Watch sunsets together', b: 'Watch sunrises together' },
  { a: 'Have a picnic under the stars', b: 'Have dinner on a boat' },
  { a: 'Adopt a kitten together', b: 'Adopt a bunny together' },
  { a: 'Sing karaoke duets', b: 'Have a dance battle' },
  { a: 'Make a scrapbook of us', b: 'Make a movie of our memories' },
];

const TIME_PER_Q = 15;

export default function RomanticWouldYouRather2Page() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(TIME_PER_Q);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (state !== 'playing') return;
    if (time <= 0) {
      choose('a', true);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, state, index]);

  useEffect(() => {
    if (state !== 'playing') return;
    const t = setInterval(() => setTotalTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const start = () => {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setTime(TIME_PER_Q);
    setTotalTime(0);
    setState('playing');
  };

  const choose = (_choice: 'a' | 'b', timeout = false) => {
    let points = 0;
    if (!timeout) {
      points = Math.max(1, Math.ceil(time / 3));
      if (time > 10) points += 2;
    }
    setScore((s) => s + points);
    setStreak((s) => (timeout ? 0 : s + 1));
    if (index + 1 >= QUESTIONS.length) setState('finished');
    else {
      setIndex((i) => i + 1);
      setTime(TIME_PER_Q);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Heart className="w-20 h-20 text-rose-400 mx-auto mb-6" fill="currentColor" />
            <h1 className="text-5xl font-bold text-white mb-4">Would You Rather 2</h1>
            <p className="text-white/80 mb-2 text-lg">Race the 15-second timer and build the longest love streak.</p>
            <p className="text-pink-200 mb-8 italic">Faster answers earn more sparks!</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Begin Sprint
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div key={index} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2"><Timer size={16} /> {time}s</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Streak: {streak}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-400 to-orange-400 h-full transition-all" style={{ width: `${(time / TIME_PER_Q) * 100}%` }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{QUESTIONS[index].a} — OR — {QUESTIONS[index].b}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button onClick={() => choose('a')} className="bg-gradient-to-br from-pink-500/40 to-purple-500/40 hover:from-pink-500/60 hover:to-purple-500/60 border-2 border-pink-400/50 rounded-3xl p-6 text-white text-lg font-semibold transition-all hover:scale-105 min-h-[160px]">
                {QUESTIONS[index].a}
              </button>
              <button onClick={() => choose('b')} className="bg-gradient-to-br from-rose-500/40 to-orange-500/40 hover:from-rose-500/60 hover:to-orange-500/60 border-2 border-rose-400/50 rounded-3xl p-6 text-white text-lg font-semibold transition-all hover:scale-105 min-h-[160px]">
                {QUESTIONS[index].b}
              </button>
            </div>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Sprint Complete!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-yellow-300">{score}</div>
              <div className="text-white/80 mt-2">Longest love streak: {streak}</div>
              <div className="text-white/60 mt-2 text-sm">Total time: {totalTime}s</div>
              <p className="mt-6 text-white/80 italic">"Every choice is a chance to fall deeper in love."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl flex items-center gap-2">
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