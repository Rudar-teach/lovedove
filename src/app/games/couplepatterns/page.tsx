'use client';
import { useState, useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function CouplepatternsPage() {

  const [seq, setSeq] = useState<string[]>([]);
  const [userSeq, setUserSeq] = useState<string[]>([]);
  const [phase, setPhase] = useState<'start'|'show'|'input'|'result'>('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const colors = ['🔴','🟡','🟢','🔵'];
  const newSeq = (len: number) => {
    const s = Array.from({length: len}, () => colors[Math.floor(Math.random() * 4)]);
    setSeq(s); setUserSeq([]); setPhase('show');
    setTimeout(() => setPhase('input'), 1500 + len * 400);
  };
  const click = (c: string) => {
    if (phase !== 'input') return;
    const next = [...userSeq, c];
    setUserSeq(next);
    if (next[next.length - 1] !== seq[next.length - 1]) { setPhase('result'); return; }
    if (next.length === seq.length) { setScore(s => s + round * 10); setRound(r => r + 1); setTimeout(() => newSeq(round + 1), 1000); }
  };
  const start = () => { setScore(0); setRound(1); newSeq(3); };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Pattern Memory</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎨</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Pattern Memory</h2>
                <p className="text-gray-600">Memorize color patterns</p>
              </div>
              
      {phase === 'start' && (<div className="text-center py-8"><div className="text-6xl mb-4">🎨</div><p className="text-gray-600 mb-4">Memorize color patterns!</p><Button onClick={start} variant="primary" size="lg">Start 🎨</Button></div>)}
      {phase === 'show' && (<div className="text-center py-8"><p className="text-sm text-gray-500 mb-4">Memorize! Round {round}</p><div className="flex gap-3 justify-center">{seq.map((c,i) => (<motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.3}} className="text-5xl">{c}</motion.div>))}</div></div>)}
      {phase === 'input' && (<div className="text-center py-4"><p className="text-sm text-gray-500 mb-4">Your turn! Round {round}</p><div className="flex gap-3 justify-center mb-4">{colors.map(c => (<button key={c} onClick={() => click(c)} className="w-16 h-16 rounded-2xl text-3xl border-2 border-gray-200 hover:scale-110 transition-all">{c}</button>))}</div><div className="flex gap-1 justify-center min-h-[40px]">{userSeq.map((c,i) => (<span key={i} className="text-2xl">{c}</span>))}</div></div>)}
      {phase === 'result' && (<div className="text-center py-8 space-y-4"><div className="text-6xl">🏆</div><h2 className="text-2xl font-bold text-gray-800">Game Over!</h2><p className="text-xl text-gray-700 font-semibold">{score} pts · Round {round}</p><Button onClick={start} variant="primary">Play Again 🎨</Button></div>)}
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
