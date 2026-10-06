'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const WORDS = ['LOVE','HEART','KISS','HUG','DATE','ROSE','SOUL','DREAM','TRUE','CARE'];
export default function Page() {
  const [word, setWord] = useState(WORDS[Math.floor(Math.random()*WORDS.length)]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [input, setInput] = useState('');
  const click = (l: string) => {
    if (won || lost || guessed.has(l)) return;
    const g = new Set(guessed); g.add(l); setGuessed(g);
    if (!word.includes(l)) setWrong(w => w + 1);
    if (wrong + 1 >= 6) setLost(true);
    else if (word.split('').every(c => g.has(c))) setWon(true);
  };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Game</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
              {(won||lost) ? (
                <div className="space-y-4">
                  <div className="text-6xl">{won ? '🏆' : '💔'}</div>
                  <h2 className="text-2xl font-bold">{won ? 'You Won!' : 'Game Over!'}</h2>
                  <p className="text-lg">The word was: <span className="font-bold text-primary-600">{word}</span></p>
                  <Button onClick={() => { setWord(WORDS[Math.floor(Math.random()*WORDS.length)]); setGuessed(new Set()); setWrong(0); setWon(false); setLost(false); }} variant="primary">Play Again</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl mb-2">💌</div>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {word.split('').map((c, i) => (<span key={i} className="w-10 h-12 border-b-2 border-gray-300 text-2xl font-bold text-primary-600 flex items-center justify-center">{guessed.has(c) ? c : '_'}</span>))}
                  </div>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
                      let color = 'bg-white border-gray-200 text-gray-700 hover:border-primary-300';
                      if (guessed.has(l)) { color = word.includes(l) ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-400 opacity-50'; }
                      return <button key={l} onClick={() => click(l)} className={"w-9 h-9 rounded-lg border-2 font-bold text-sm transition-all " + color}>{l}</button>;
                    })}
                  </div>
                  <div className="text-sm text-gray-500">Wrong guesses: {wrong} / 6</div>
                </div>
              )}
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
