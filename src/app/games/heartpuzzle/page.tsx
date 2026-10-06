'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const PUZZLES = [
  { pieces: ['💕','💖','💗'], answer: ['💕','💖','💗'] },
  { pieces: ['🍕','🍔','🍟','🌭'], answer: ['🍕','🍔','🍟','🌭'] },
  { pieces: ['🌹','🌻','🌸','💐'], answer: ['🌸','🌹','🌻','💐'] },
];

export default function HeartPuzzlePage(){
  const [idx,setIdx]=useState(0);
  const [slots,setSlots]=useState<string[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [phase,setPhase]=useState<'start'|'playing'|'result'>('start');
  const [wrong,setWrong]=useState(false);

  const start = () => {
    setIdx(0); setPhase('playing');
    const pieces=[...PUZZLES[0].pieces].sort(()=>Math.random()-0.5);
    setSlots(new Array(pieces.length).fill(''));
    setSelected(null); setWrong(false);
  };

  const nextPuzzle = () => {
    if (idx + 1 < PUZZLES.length) {
      setIdx(i => i + 1);
      const pieces=[...PUZZLES[idx+1].pieces].sort(()=>Math.random()-0.5);
      setSlots(new Array(pieces.length).fill(''));
      setSelected(null); setWrong(false);
    } else {
      setPhase('result');
    }
  };

  const place = () => {
    if (!selected) return;
    const i = slots.indexOf('');
    if (i === -1) return;
    const n = [...slots];
    n[i] = selected;
    setSlots(n);
    if (!n.includes('')) {
      const correct = n.every((v, i) => v === PUZZLES[idx].answer[i]);
      setWrong(!correct);
      setTimeout(() => {
        if (correct) {
          nextPuzzle();
        } else {
          setSlots(new Array(PUZZLES[idx].pieces.length).fill(''));
          setSelected(null);
        }
      }, 1000);
    }
    setSelected(null);
  };

  const currentPieces = [...PUZZLES[idx].pieces].sort(()=>Math.random()-0.5);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Heart Puzzle</h1>
            <div className="text-sm text-gray-500">Puzzle {idx+1}/{PUZZLES.length}</div>
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl mb-4">🧩</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Heart Puzzle</h2>
                  <p className="text-gray-600">Tap pieces to place them in order!</p>
                  <Button onClick={start} variant="primary" size="lg" className="w-full">Play 🧩</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-center text-sm text-gray-500">Tap a piece below, then tap an empty slot to place it</p>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5">
                  <div className="flex gap-2 justify-center min-h-[60px]">
                    {slots.map((s,i) => (
                      <button key={i} onClick={place} className={"w-14 h-14 rounded-xl text-3xl border-2 flex items-center justify-center transition-all " + (s ? 'bg-pink-50 border-primary-300' : 'bg-gray-50 border-dashed border-gray-300 hover:border-primary-300')}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {currentPieces.map((p,i) => (
                      <button key={i} onClick={() => setSelected(p)} className={"w-14 h-14 rounded-xl text-3xl border-2 flex items-center justify-center transition-all " + (selected===p ? 'border-primary-500 bg-primary-50 scale-110' : 'bg-white border-gray-200 hover:border-primary-300')}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {wrong && <p className="text-center text-red-500 font-bold">Not quite right — try again!</p>}
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-3xl font-display font-bold text-gray-800">Puzzle Master!</h2>
                  <Button onClick={start} variant="primary" className="w-full">Play Again 🧩</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
