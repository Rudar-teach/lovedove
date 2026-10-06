'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = ['Rose', 'Kiss', 'Date', 'Hug', 'Love', 'Heart', 'Soul', 'Dream', 'Cupid', 'Angel', 'Baby', 'Forever'];

export default function LoveStoryBuilder() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [story, setStory] = useState<string[]>([]);
  const [line, setLine] = useState('');
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1');
  const start = () => { setGameState('playing'); setStory(['Once upon a time, there was a couple who...']); setLine(''); setTurn('p1'); };
  const submit = () => {
    if (!line.trim()) return;
    const newLine = `${turn === 'p1' ? '💕' : '💖'} ${line.trim()}`;
    setStory(prev => [...prev, newLine]);
    setLine('');
    setTurn(t => t === 'p1' ? 'p2' : 'p1');
    if (story.length >= 8) setGameState('finished');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">📚</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Story Builder</h1><p className="text-gray-600 mb-8 text-lg">Build a love story together!</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
          </motion.div>)}
          {gameState !== 'idle' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-4"><span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold">{turn === 'p1' ? '💕 Partner 1' : '💖 Partner 2'}'s turn</span></div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
              <p className="text-xl italic text-gray-700 leading-relaxed">{story.map((l, i) => <div key={i}>{l}</div>)}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
              <input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Continue the story..." className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-center mb-4 outline-none focus:border-amber-500" onKeyDown={(e) => e.key === 'Enter' && submit()} autoFocus />
              <button onClick={submit} disabled={!line.trim()} className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50">Continue Story</button>
            </div>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">📖</div><h2 className="text-3xl font-display font-black text-gray-900 mb-4">Your Love Story!</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-8 text-center"><p className="text-xl italic text-gray-700 leading-relaxed">{story.map((l, i) => <div key={i}>{l}</div>)}</p></div>
            <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> New Story</button>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}