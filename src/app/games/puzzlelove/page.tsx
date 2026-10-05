'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, Heart, RotateCcw, Trophy, Zap, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

type Tile = { value: number; isEmpty: boolean };
type Board = Tile[][];

const HEART_PATTERN = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

const SOLVED_STATE = [
  [1,2,3,4],
  [5,6,7,8],
  [9,10,11,12],
  [13,14,15,0],
];

export default function PuzzleLovePage() {
  const [difficulty, setDifficulty] = useState<'3x3' | '4x4' | '5x5'>('4x4');
  const [board, setBoard] = useState<Board>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [solved, setSolved] = useState(false);
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<{r: number; c: number} | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSize = () => difficulty === '3x3' ? 3 : difficulty === '4x4' ? 4 : 5;
  const getTarget = () => {
    const n = getSize();
    const t: number[][] = [];
    for (let r = 0; r < n; r++) {
      const row: number[] = [];
      for (let c = 0; c < n; c++) {
        row.push(r * n + c + 1);
      }
      t.push(row);
    }
    t[n-1][n-1] = 0;
    return t;
  };

  const shuffleBoard = useCallback((size: number): Board => {
    const b: Board = [];
    for (let r = 0; r < size; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < size; c++) {
        row.push({ value: r * size + c + 1, isEmpty: r === size-1 && c === size-1 });
      }
      b.push(row);
    }
    // Shuffle by making valid moves
    for (let i = 0; i < size * 200; i++) {
      const empty = findEmpty(b);
      if (!empty) continue;
      const moves = getNeighbors(empty.r, empty.c, size);
      const move = moves[Math.floor(Math.random() * moves.length)];
      if (move) {
        b[empty.r][empty.c] = { ...b[move.r][move.c], isEmpty: false };
        b[move.r][move.c] = { value: 0, isEmpty: true };
      }
    }
    return b;
  }, []);

  const findEmpty = (b: Board) => {
    const n = b.length;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (b[r][c].isEmpty) return { r, c };
    return null;
  };

  const getNeighbors = (r: number, c: number, size: number) => {
    const n = [];
    if (r > 0) n.push({ r: r-1, c });
    if (r < size-1) n.push({ r: r+1, c });
    if (c > 0) n.push({ r, c: c-1 });
    if (c < size-1) n.push({ r, c: c+1 });
    return n;
  };

  const initGame = useCallback(() => {
    const size = getSize();
    setBoard(shuffleBoard(size));
    setMoves(0);
    setTime(0);
    setSolved(false);
    setSelected(null);
    setStarted(true);
  }, [difficulty, shuffleBoard]);

  useEffect(() => {
    if (started && !solved) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [started, solved]);

  const handleClick = (r: number, c: number) => {
    if (solved || !board[r]?.[c] || board[r][c].isEmpty) return;
    const empty = findEmpty(board);
    if (!empty) return;
    const neighbors = getNeighbors(empty.r, empty.c, board.length);
    const isNeighbor = neighbors.some(n => n.r === r && n.c === c);
    if (!isNeighbor) return;

    const newBoard = board.map(row => row.map(tile => ({ ...tile })));
    newBoard[empty.r][empty.c] = { ...newBoard[r][c], isEmpty: false };
    newBoard[r][c] = { value: 0, isEmpty: true };
    setBoard(newBoard);
    setMoves(m => m + 1);

    // Check solved
    const target = getTarget();
    let isSolved = true;
    for (let r = 0; r < newBoard.length; r++) {
      for (let c = 0; c < newBoard[r].length; c++) {
        if (newBoard[r][c].value !== target[r][c]) { isSolved = false; break; }
      }
      if (!isSolved) break;
    }
    if (isSolved) {
      setSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const checkSolved = () => {
    const target = getTarget();
    for (let r = 0; r < board.length; r++)
      for (let c = 0; c < board[r].length; c++)
        if (board[r][c].value !== target[r][c]) return false;
    return true;
  };

  const shareLink = useCallback(() => {
    if (typeof window !== 'undefined') navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  const formatTime = (t: number) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;
  const size = getSize();

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500" /> Puzzle Love</h1>
            <div className="w-16" />
          </div>

          {!started ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl mb-4">🧩</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Puzzle Love</h2>
                  <p className="text-gray-600">Slide the tiles to order them! A heart-shaped challenge.</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Difficulty:</p>
                    {(['3x3','4x4','5x5'] as const).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${difficulty === d ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white' : 'bg-pink-50 text-gray-600 hover:bg-pink-100'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                  <Button onClick={initGame} variant="primary" size="lg" className="w-full">Start Puzzle 🧩</Button>
                </div>
              </TiltCard>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-center gap-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Moves</p>
                  <p className="text-xl font-bold text-gray-800">{moves}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-xl font-bold text-gray-800">{formatTime(time)}</p>
                </div>
              </div>

              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <div className={`grid gap-2 mx-auto`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, maxWidth: `${size * 70}px` }}>
                    {board.map((row, r) => row.map((tile, c) => (
                      <motion.button
                        key={`${r}-${c}`}
                        whileTap={{ scale: tile.isEmpty ? 1 : 0.95 }}
                        onClick={() => handleClick(r, c)}
                        className={`aspect-square rounded-xl text-xl font-bold flex items-center justify-center transition-all ${
                          tile.isEmpty
                            ? 'bg-transparent'
                            : 'bg-gradient-to-br from-primary-400 to-rose-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {!tile.isEmpty && tile.value}
                      </motion.button>
                    )))}
                  </div>
                </div>
              </TiltCard>

              {solved && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-center space-y-3">
                  <div className="text-4xl">🎉</div>
                  <h2 className="text-2xl font-display font-bold text-primary-600">Solved! 💕</h2>
                  <p className="text-gray-600">{moves} moves · {formatTime(time)}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={initGame} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                    <Button onClick={shareLink} variant="outline"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
