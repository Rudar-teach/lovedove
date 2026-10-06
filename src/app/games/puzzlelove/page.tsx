'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const IMAGES = [
  'A beautiful sunset at the beach',
  'A cozy cabin in the mountains',
  'A picnic in a flower garden',
  'A candlelit dinner for two',
  'A rainy day reading together',
  'A hot air balloon ride',
  'A starry night under the sky',
  'A walk on a snowy path',
  'A boat ride on a calm lake',
  'A flower crown in a meadow',
  'A morning coffee on a balcony',
  'A sunset cruise together',
  'A campfire under stars',
  'A bicycle ride through autumn leaves',
  'A day at the vineyard',
];

export default function LovePuzzlePage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [imageIdx, setImageIdx] = useState(0);
  const [pieces, setPieces] = useState<{ row: number; col: number; correctRow: number; correctCol: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const GRID = 3;

  useEffect(() => {
    const b = localStorage.getItem('puzzlelove_best');
    if (b) setBest(Number(b));
  }, []);

  const generatePuzzle = useCallback(() => {
    const idx = Math.floor(Math.random() * IMAGES.length);
    setImageIdx(idx);
    const ordered: typeof pieces = [];
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++)
        ordered.push({ row: r, col: c, correctRow: r, correctCol: c });
    const shuffled = [...ordered].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setSelected(null);
    setSwaps(0);
    setScore(0);
  }, []);

  const startGame = useCallback(() => {
    generatePuzzle();
    setState('playing');
  }, [generatePuzzle]);

  const handleClick = (idx: number) => {
    if (state !== 'playing') return;
    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      setSwaps((s) => s + 1);
      setPieces((prev) => {
        const next = [...prev];
        [next[selected], next[idx]] = [next[idx], next[selected]];
        return next;
      });
      setSelected(null);
    }
  };

  useEffect(() => {
    if (state !== 'playing') return;
    const correct = pieces.filter(
      (p) => p.row === p.correctRow && p.col === p.correctCol,
    ).length;
    if (correct === GRID * GRID) {
      const earned = Math.max(10, 100 - swaps * 5);
      setScore(earned);
      setState('finished');
      if (earned > best) {
        setBest(earned);
        localStorage.setItem('puzzlelove_best', String(earned));
      }
    }
  }, [pieces, state, swaps, best]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Love Puzzle
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Moves</div>
                <div className="text-xl font-bold text-white">{swaps}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 mb-4">
              <p className="text-white/60 text-sm text-center mb-3 italic">"{IMAGES[imageIdx]}"</p>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
              >
                {pieces.map((piece, idx) => {
                  const row = Math.floor(idx / GRID);
                  const col = idx % GRID;
                  const correct = piece.row === piece.correctRow && piece.col === piece.correctCol;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleClick(idx)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${
                        selected === idx
                          ? 'ring-4 ring-pink-400 scale-105'
                          : correct
                          ? 'bg-green-500/20'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {piece.row === piece.correctRow && piece.col === piece.correctCol
                        ? ['💕', '💖', '💗', '🌅', '🏔️', '🌸', '🕯️', '🌧️', '🎈'][piece.correctRow * GRID + piece.correctCol] || '💕'
                        : '?'}
                    </button>
                  );
                })}
              </div>
            </div>

            {state === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <Play size={20} /> Start Game
              </motion.button>
            )}

            {state === 'playing' && (
              <p className="text-center text-white/50 text-sm">
                Click tiles to swap them. Arrange them correctly!
              </p>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {swaps <= 3 ? '🏆 Puzzle Master!' : swaps <= 6 ? '💖 Great Job!' : '💕 Completed!'}
                    </h2>
                    <p className="text-white/70">
                      Score: <span className="text-pink-300 font-bold">{score}</span> in {swaps} moves
                    </p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> New Puzzle
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}