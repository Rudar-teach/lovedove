'use client';
import { useState, useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function LovemathPage() {

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState('+');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const [guess, setGuess] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const next = () => {
    const x = Math.floor(Math.random() * 20) + 1;
    const y = Math.floor(Math.random() * 20) + 1;
    const ops = ['+','-','×'];
    setA(x); setB(y); setOp(ops[Math.floor(Math.random() * 3)]); setGuess('');
  };
  const answer = () => { if (parseInt(guess) === (op==='+'?a+b:op==='-'?a-b:a*b)) setScore(s => s + 10); next(); };
  const start = () => {
    setScore(0); setTime(60); setPhase('playing'); next();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('result'); return 0; } return t - 1; }), 1000);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Love Math</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">➕</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Love Math</h2>
                <p className="text-gray-600">Solve math in 60 seconds!</p>
              </div>
              
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <div className="text-5xl font-bold text-center bg-pink-50 rounded-2xl py-4 border-2 border-dashed border-primary-200">{a} {op} {b} = ?</div>
          <input type="number" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === 'Enter' && answer()} className="w-full text-center text-3xl font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" autoFocus />
          <Button onClick={answer} variant="primary" className="w-full" disabled={!guess}>Submit</Button>
        </div>
      </TiltCard>
      <div className="flex justify-center gap-4 mt-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Score</p><p className="text-xl font-bold text-primary-600">{score}</p></div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Time</p><p className="text-xl font-bold text-gray-800">{time}s</p></div>
      </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
