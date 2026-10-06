'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const ITEMS = ['💋','🍕','🎬','🌹','💏','🛁','🌅','🎵','📱','🎁','✈️','🌙'];

export default function LoveBingoPage(){
  const [board,setBoard]=useState<string[][]>([]);
  const [marked,setMarked]=useState<Set<number>>(new Set());
  const [phase,setPhase]=useState<'start'|'playing'|'result'>('start');
  const [hasWon,setHasWon]=useState(false);

  const newBoard = () => {
    const s = [...ITEMS].sort(() => Math.random() - 0.5);
    const b = [s.slice(0,5), s.slice(5,10), s.slice(10,15)];
    setBoard(b);
    setMarked(new Set());
    setHasWon(false);
  };

  const checkWin = () => {
    if (marked.size === 0 || board.length === 0) return;
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const w of wins) {
      if (w.every((i: number) => marked.has(i)) && !hasWon) {
        setHasWon(true);
        setTimeout(() => setPhase('result'), 1500);
        break;
      }
    }
  };

  const cellClick = (r: number, c: number) => {
    if (hasWon) return;
    const n = new Set(marked);
    n.add(r * 3 + c);
    setMarked(n);
  };

  useEffect(() => { if (board.length > 0) checkWin(); }, [marked, board]);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Love Bingo</h1>
            <div className="w-16"/>
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Love Bingo</h2>
                  <p className="text-gray-600">Match 3 in a row to win!</p>
                  <Button onClick={() => { newBoard(); setPhase('playing'); }} variant="primary" size="lg" className="w-full">Play 🎯</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="text-center text-sm text-gray-500">Tap to mark! Match 3 in a row.</div>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {[0,1,2,3,4,5,6,7,8].map(i => {
                      const r = Math.floor(i/5), c = i%5;
                      const m = marked.has(r * 3 + c);
                      return (
                        <button key={i} onClick={() => cellClick(r,c)} className={"aspect-square rounded-xl text-3xl flex items-center justify-center transition-all " + (m ? 'bg-pink-100 border-2 border-primary-400 scale-95' : 'bg-white border-2 border-gray-200 hover:border-primary-300')}>
                          {board[r]?.[c]}{m ? ' ✨' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-3xl font-display font-bold text-gray-800">BINGO!</h2>
                  <p className="text-xl text-gray-700">You matched 3 in a row!</p>
                  <Button onClick={() => { newBoard(); setPhase('playing'); }} variant="primary" className="w-full"><RotateCcw className="w-4 h-4 mr-1"/> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
