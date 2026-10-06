'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const WORDS = [
  {w:'ROSES',h:'Red flowers of love'},{w:'HEART',h:'Beats for you'},{w:'LOVE',h:'Strong feeling'},{w:'KISS',h:'Show of affection'},{w:'DREAM',h:'You share this together'},{w:'HONEY',h:'Sweet name for partner'},{w:'CUPID',h:'Matchmaker of love'},{w:'ROMANCE',h:'The vibe of love'},{w:'DEVOTION',h:'Total commitment'},{w:'ADORE',h:'Strong love'},{w:'CRUSH',h:'First feelings'},{w:'SOULMATE',h:'Your perfect match'}
];

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function LoveHangman2Page(){
  const [idx,setIdx]=useState(0); const [guessed,setGuessed]=useState<string[]>([]); const [lives,setLives]=useState(6); const [phase,setPhase]=useState<'start'|'playing'|'result'>('start');
  const word = WORDS[idx].w;
  const display = word.split('').map(c => guessed.includes(c) ? c : '_').join(' ');
  const won = !display.includes('_');
  const lost = lives <= 0;
  const start = () => { setIdx(0); setGuessed([]); setLives(6); setPhase('playing'); };
  const guess = (l: string) => { if (guessed.includes(l)) return; const n = [...guessed, l]; setGuessed(n); if (!word.includes(l)) setLives(li => li - 1); };
  useEffect(() => { if (won || lost) { const t = setTimeout(() => { if (idx+1 < WORDS.length) { setIdx(i => i+1); setGuessed([]); setLives(6); } else { setPhase('result'); } }, 1500); return () => clearTimeout(t); } }, [won, lost]);
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6"><Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link><h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Hangman Love 2</h1><div className="text-sm font-bold text-primary-600">❤️ {lives}</div></div>
          {phase==='start'&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4"><div className="text-6xl mb-4">💌</div><h2 className="text-2xl font-display font-bold text-gray-800">Hangman Love 2</h2><p className="text-gray-600">Guess love-themed words! 12 words total.</p><Button onClick={start} variant="primary" size="lg" className="w-full">Start Game 💌</Button></div></TiltCard></motion.div>)}
          {phase==='playing'&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4"><div className="w-full bg-white/50 rounded-full h-2 border border-pink-100"><motion.div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500" animate={{width:`${(idx/WORDS.length)*100}%`}}/></div><p className="text-center text-sm text-gray-500">Word {idx+1} of {WORDS.length}</p><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5"><div className="text-center"><span className="text-6xl">{lives>=5?'💕':lives>=3?'💔':'😢'}</span><p className="text-sm text-gray-500 mt-2">Lives: {lives}</p></div><p className="text-xs text-gray-500 italic text-center">Hint: {WORDS[idx].h}</p><p className="text-2xl sm:text-3xl font-mono font-bold text-center tracking-widest text-gray-800 bg-pink-50 rounded-2xl py-4 border-2 border-dashed border-primary-200">{display}</p>{won && <p className="text-center text-green-600 font-bold text-lg">Correct! 🎉</p>}{lost && <p className="text-center text-red-600 font-bold text-lg">It was: {word}</p>}<div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">{ALPHA.map(l => { const used = guessed.includes(l); const correct = used && word.includes(l); const wrong = used && !word.includes(l); return (<button key={l} onClick={() => guess(l)} disabled={used || won || lost} className={`aspect-square rounded-lg font-bold text-sm transition-all ${correct?'bg-green-200 text-green-800 border-2 border-green-400':wrong?'bg-red-100 text-red-300 border border-red-200':used?'bg-gray-100 text-gray-300':'bg-white border border-pink-200 hover:border-primary-400 hover:bg-pink-50 text-gray-700'}`}>{l}</button>);})}</div></div></TiltCard></motion.div>)}
          {phase==='result'&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4"><div className="text-6xl">🏆</div><h2 className="text-3xl font-display font-bold text-gray-800">Hangman Champion!</h2><p className="text-xl text-gray-700">You played all 12 words</p><Button onClick={start} variant="primary" className="w-full">Play Again 💌</Button></div></TiltCard></motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
