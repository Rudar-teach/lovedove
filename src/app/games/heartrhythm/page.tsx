'use client';
import { useState, useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function HeartrhythmPage() {

  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const [time, setTime] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const start = () => {
    setScore(0); setTime(20); setPhase('playing');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('result'); return 0; } return t - 1; }), 1000);
  };
  const tap = () => { if (phase === 'playing') setScore(s => s + 1); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Heart Rhythm</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">💓</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Heart Rhythm</h2>
                <p className="text-gray-600">Tap to the beat!</p>
              </div>
              
      {phase === 'start' && (<div className="text-center py-8"><div className="text-6xl mb-4">💓</div><p className="text-gray-600 mb-4">Tap the button!</p><Button onClick={start} variant="primary" size="lg">Start 💓</Button></div>)}
      {phase === 'playing' && (<div className="text-center py-8 space-y-4"><div className="text-6xl animate-pulse">💓</div><button onClick={tap} className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 text-white text-3xl font-bold shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all">TAP!</button><p className="text-lg text-gray-700 font-semibold">Score: {score} · Time: {time}s</p></div>)}
      {phase === 'result' && (<div className="text-center py-8 space-y-4"><div className="text-6xl">🏆</div><h2 className="text-2xl font-bold text-gray-800">Rhythm Master!</h2><p className="text-xl text-gray-700 font-semibold">{score} taps</p><Button onClick={start} variant="primary">Play Again 💓</Button></div>)}
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
