'use client';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function HeartspellingPage() {

  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const words = ["LOVE","HEART","HUG","KISS","CARE","SOUL","ROSE","TRUE","MATE","SOAR","BEAM","GLOW"];
  const newWord = () => { setScrambled(words[idx].split('').sort(() => Math.random() - 0.5).join('')); setGuess(''); };
  const start = () => { setIdx(0); newWord(); setPhase('playing'); };
  const check = () => { if (guess.toUpperCase() === scrambled) { if (idx + 1 < words.length) { setIdx(i => i + 1); newWord(); } else setPhase('result'); } };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Heart Spelling</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">✍️</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Heart Spelling</h2>
                <p className="text-gray-600">Spell 12 love words</p>
              </div>
              
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <p className="text-sm text-gray-500">Unscramble this word:</p>
          <div className="text-2xl font-mono font-bold text-center bg-pink-50 rounded-2xl py-4 border-2 border-dashed border-primary-200 tracking-widest">{scrambled}</div>
          <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())} placeholder="Type answer..." className="w-full text-center text-xl font-bold uppercase rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" maxLength={scrambled.length} onKeyDown={e => e.key === 'Enter' && check()} />
          <Button onClick={check} variant="primary" className="w-full">Check</Button>
        </div>
      </TiltCard>
      <p className="text-center text-sm text-gray-500">Word {idx + 1} of 12</p>
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
