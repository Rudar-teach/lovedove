'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const GRID = 9;
const SYMBOLS = ['💖', '💕', '💗', '💘', '❤️', '💝', '💓', '💞'];
const BONUS_SYMBOLS = ['⭐', '💎', '💫'];
const BONUS_MATCH_COUNT = 3;

type Board = { value: string; matched: boolean; row: number; col: number };

export default function HeartsGamePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [board, setBoard] = useState<Board[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(60);
  const [matched, setMatched] = useState(0);
  const [total] = useState(GRID * GRID);

  const initBoard = useCallback(() => {
    const all = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS, ...SYMBOLS, ...BONUS_SYMBOLS, ...BONUS_SYMBOLS];
    while (all.length < GRID * GRID) all.push(...SYMBOLS);
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, GRID * GRID);
    const cells: Board[] = shuffled.map((val, i) => ({
      value: val,
      matched: false,
      row: Math.floor(i / GRID),
      col: i % GRID,
    }));
    setBoard(cells);
  }, []);

  const start = () => {
    initBoard();
    setSelected([]);
    setScore(0);
    setMoves(0);
    setTime(60);
    setMatched(0);
    setState('playing');
  };

  const select = (idx: number) => {
    if (board[idx].matched || state !== 'playing') return;
    if (selected.includes(idx)) { setSelected([]); return; }
    const newSelected = [...selected, idx];
    if (newSelected.length === 2) {
      const [a, b] = newSelected;
      if (board[a].value === board[b].value) {
        setTimeout(() => {
          setBoard((b) => b.map((cell, i) => i === a || i === b ? { ...cell, matched: true } : cell));
          const bonus = BONUS_SYMBOLS.includes(board[a].value) ? 30 : 10;
          setScore((s) => s + bonus);
          setMatched((m) => m + 2);
          setSelected([]);
        }, 300);
      } else {
        setMoves((m) => m + 1);
        setTimeout(() => setSelected([]), 500);
      }
    } else {
      setSelected(newSelected);
    }
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (time <= 0) setState('finished');
    if (matched >= total) setState('finished');
    const t = setInterval(() => setTime((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [time, state, matched, total]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="grid grid-cols-3 gap-1 max-w-[200px] mx-auto mb-6 opacity-60">
              {[0,1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-white/30 rounded-lg" />)}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Hearts Match</h1>
            <p className="text-white/80 mb-8 text-lg">Match all the hearts before time runs out. Bonus symbols give extra points!</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Game
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4 text-white flex-wrap gap-2">
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Moves: {moves}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">{time}s</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">{matched}/{total}</span>
            </div>
            <div className="grid grid-cols-9 gap-1 bg-white/10 p-2 rounded-3xl">
              {board.map((cell, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => select(idx)}
                  whileTap={{ scale: 0.85 }}
                  animate={{
                    scale: selected.includes(idx) ? 1.1 : 1,
                    opacity: cell.matched ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-lg md:text-2xl transition-all ${
                    cell.matched ? 'bg-white/5' : selected.includes(idx) ? 'bg-white/40 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {!cell.matched && cell.value}
                </motion.button>
              ))}
            </div>
            <p className="text-white/50 text-center mt-3 text-sm">Match pairs of identical symbols. Bonus symbols are worth more!</p>
          </div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Game Complete!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-red-300">{score}</div>
              <div className="text-white/80 mt-2">Final Score</div>
              <div className="text-white/60 mt-2">{moves} moves taken</div>
              <p className="mt-6 text-white/80 italic">"In the game of love, every match is a connection."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Play Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}