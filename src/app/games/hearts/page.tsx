'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Trophy, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const GRID = 9;
const SYMBOLS = ['💖', '💕', '💗', '💘', '❤️', '💝', '💓', '💞'];
const BONUS_SYMBOLS = ['⭐', '💎', '💫'];

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
      const [a, second] = newSelected;
      if (board[a].value === board[second].value) {
        setTimeout(() => {
          setBoard((brd) => brd.map((cell, i) => i === a || i === second ? { ...cell, matched: true } : cell));
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-pink-600 mb-6">
          <ArrowLeft size={20}/> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="text-7xl mb-4">💗</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Hearts Match</h1>
            <p className="text-gray-600 mb-8 text-lg">Match all the hearts before time runs out. Bonus symbols give extra points!</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-rose-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2"/> Start Game
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4 text-pink-600 flex-wrap gap-2">
              <span className="bg-pink-100 px-4 py-2 rounded-full text-sm font-semibold">Score: {score}</span>
              <span className="bg-pink-100 px-4 py-2 rounded-full text-sm font-semibold">Moves: {moves}</span>
              <span className={`bg-pink-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 ${time <= 10 ? 'text-rose-500' : ''}`}><Timer size={14}/> {time}s</span>
              <span className="bg-pink-100 px-4 py-2 rounded-full text-sm font-semibold">{matched}/{total}</span>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-9 gap-2 p-3 bg-rose-50 rounded-3xl">
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
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    cell.matched ? 'bg-white/40' : selected.includes(idx) ? 'bg-white ring-2 ring-rose-400' : 'bg-white/60 hover:bg-white shadow-sm'
                  }`}
                >
                  {!cell.matched && cell.value}
                </motion.button>
              ))}
            </div>
            <p className="text-gray-500 text-center mt-3 text-sm">Match pairs of identical symbols. Bonus symbols are worth more!</p>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-black mb-4">Game Complete!</h2>
            <div className="bg-white p-6 rounded-3xl mb-8 border-2 border-rose-100">
              <div className="text-6xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{score}</div>
              <div className="text-gray-500 mt-2">Final Score</div>
              <div className="text-gray-400 mt-2 text-sm">{moves} moves taken</div>
              <p className="mt-4 text-gray-600 italic text-sm">"In the game of love, every match is a connection."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition">
                <RotateCcw className="inline mr-2"/> Play Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-rose-100 text-pink-700 rounded-full font-semibold hover:bg-rose-200 transition">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
