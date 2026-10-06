'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUOTES = [
  "You are my sun, my moon, and all my stars.",
  "Every love story is beautiful, but ours is my favorite.",
  "You are the finest, loveliest, tenderest person I know.",
  "I love you more than yesterday, but less than tomorrow.",
  "You are my heart, my life, my one and only thought.",
  "In all the world, there is no heart for me like yours.",
  "If I know what love is, it is because of you.",
  "My heart is and always will be yours.",
];

export default function LoveTypingPage(){
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<{wpm:number;acc:number}[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const start = () => { setIdx(0); setText(''); setResults([]); setStartTime(Date.now()); setPhase('playing'); };

  const check = () => {
    const quote = QUOTES[idx];
    const correct = text.split('').filter((c,i) => c === quote[i]).length;
    const wpm = Math.max(1, Math.round(text.length / Math.max(1, (Date.now() - startTime) / 60000)));
    const acc = text.length > 0 ? Math.round((correct / text.length) * 100) : 0;
    setResults(r => [...r, { wpm, acc }]);
    if (idx + 1 < QUOTES.length) {
      setIdx(i => i + 1);
      setText('');
      setStartTime(Date.now());
    } else {
      setPhase('result');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Typing Love</h1>
            <div className="text-sm font-bold text-primary-600">{phase === 'playing' ? `Quote ${idx+1}/${QUOTES.length}` : `${results.length} quotes`}</div>
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl mb-4">⌨️</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Typing Love</h2>
                  <p className="text-gray-600">Type romantic quotes as fast as you can!</p>
                  <Button onClick={start} variant="primary" size="lg" className="w-full">Start Typing ⌨️</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <div className="space-y-4">
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                  <div className="bg-pink-50 rounded-2xl p-4 border-2 border-dashed border-primary-200">
                    <p className="text-lg sm:text-xl font-mono leading-relaxed text-gray-700">
                      {QUOTES[idx].split('').map((c, i) => (
                        <span key={i} className={(i < text.length ? (text[i] === QUOTES[idx][i] ? 'text-green-600' : 'text-red-500 bg-red-50') : 'text-gray-400')}>{c}</span>
                      ))}
                    </p>
                  </div>
                  <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Type here..." className="w-full p-4 rounded-2xl border-2 border-pink-200 bg-white focus:border-primary-400 outline-none text-base font-mono resize-none" rows={3} autoFocus />
                </div>
              </TiltCard>
              <div className="text-center">
                <Button onClick={check} variant="primary">Next Quote</Button>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-3xl font-display font-bold text-gray-800">Typing Champion!</h2>
                  <div className="space-y-2">
                    {results.map((r, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2 bg-pink-50 rounded-xl">
                        <span>Quote {i+1}</span>
                        <span className="text-primary-600 font-bold">{r.wpm} WPM · {r.acc}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-gray-700">Avg: {Math.round(results.reduce((a,r) => a + r.wpm, 0) / Math.max(1, results.length))} WPM</p>
                  <Button onClick={start} variant="primary" className="w-full"><RotateCcw className="w-4 h-4 mr-1"/> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
