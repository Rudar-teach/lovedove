'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type Cell = number;

function initGrid(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  addRandom(grid);
  addRandom(grid);
  return grid;
}

function addRandom(grid: Cell[][]) {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!grid[r][c]) empty.push([r, c]);
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => [...row]);
}

function slideRow(row: Cell[]): { row: Cell[]; score: number } {
  const arr = row.filter(v => v !== 0);
  let score = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < 4) arr.push(0);
  return { row: arr, score };
}

function moveLeft(grid: Cell[][]): { grid: Cell[][]; score: number } {
  const newGrid = cloneGrid(grid);
  let totalScore = 0;
  for (let r = 0; r < 4; r++) {
    const { row, score } = slideRow(newGrid[r]);
    newGrid[r] = row;
    totalScore += score;
  }
  return { grid: newGrid, score: totalScore };
}

function rotate(grid: Cell[][]): Cell[][] {
  const n = 4;
  const rotated: Cell[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      rotated[c][n - 1 - r] = grid[r][c];
  return rotated;
}

function doMove(grid: Cell[][], direction: 'left' | 'right' | 'up' | 'down'): { grid: Cell[][]; score: number; moved: boolean } {
  let g = cloneGrid(grid);
  let rotations = 0;
  if (direction === 'up') { g = rotate(g); rotations = 1; }
  else if (direction === 'right') { g = rotate(rotate(g)); rotations = 2; }
  else if (direction === 'down') { g = rotate(rotate(rotate(g))); rotations = 3; }

  const { grid: newGrid, score } = moveLeft(g);
  g = newGrid;

  while (rotations > 0) { g = rotate(g); rotations--; }

  const moved = JSON.stringify(g) !== JSON.stringify(grid);
  return { grid: g, score, moved };
}

function canMove(grid: Cell[][]): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!grid[r][c]) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

function hasWon(grid: Cell[][]): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] === 2048) return true;
  return false;
}

const CELL_COLORS: Record<number, { bg: string; text: string }> = {
  0:    { bg: 'bg-gray-100', text: 'text-transparent' },
  2:    { bg: 'bg-gray-100', text: 'text-gray-800' },
  4:    { bg: 'bg-gray-200', text: 'text-gray-800' },
  8:    { bg: 'bg-orange-200', text: 'text-orange-900' },
  16:   { bg: 'bg-orange-300', text: 'text-white' },
  32:   { bg: 'bg-orange-400', text: 'text-white' },
  64:   { bg: 'bg-orange-500', text: 'text-white' },
  128:  { bg: 'bg-yellow-300', text: 'text-yellow-900' },
  256:  { bg: 'bg-yellow-400', text: 'text-yellow-900' },
  512:  { bg: 'bg-yellow-500', text: 'text-white' },
  1024: { bg: 'bg-gradient-to-br from-primary-400 to-rose-500', text: 'text-white' },
  2048: { bg: 'bg-gradient-to-br from-yellow-300 to-primary-500', text: 'text-white' },
};

export default function Game2048Page() {
  const [grid, setGrid] = useState<Cell[][]>(initGrid);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: '2048',
      players: [session.user.id],
      game_state: { grid: initGrid(), score: 0 },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
    const stored = localStorage.getItem('best2048');
    if (stored) setBestScore(parseInt(stored));
  }, []);

  useEffect(() => {
    if (hasWon(grid)) {
      setWon(true);
    } else if (!canMove(grid)) {
      setGameOver(true);
    }
  }, [grid]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver && won) return;
    const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const dir = keyMap[e.key];
    if (!dir) return;
    e.preventDefault();

    setGrid(prev => {
      const { grid: newGrid, score: gained, moved } = doMove(prev, dir);
      if (!moved) return prev;
      const g = [...newGrid];
      addRandom(g);
      setScore(s => {
        const ns = s + gained;
        if (ns > bestScore) {
          setBestScore(ns);
          localStorage.setItem('best2048', ns.toString());
        }
        return ns;
      });
      return g;
    });
  }, [gameOver, won, bestScore]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/game2048?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const reset = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getCellClass = (val: number) => {
    if (!val) return 'bg-gray-100';
    const base = CELL_COLORS[val] || { bg: 'bg-primary-500', text: 'text-white' };
    const fontSize = val >= 1024 ? 'text-2xl' : val >= 128 ? 'text-3xl' : 'text-4xl';
    return `${base.bg} ${base.text} ${fontSize}`;
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              2048
            </h1>
            <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Invite Button */}
          <div className="flex justify-center mb-4">
            <Button onClick={copyInvite} variant="outline" size="sm">
              {inviteCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friend
                </>
              )}
            </Button>
          </div>

          {/* Score */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 px-5 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-medium">Score</p>
              <p className="text-2xl font-bold text-primary-600">{score}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 px-5 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-medium">Best</p>
              <p className="text-2xl font-bold text-yellow-600">{bestScore}</p>
            </div>
          </div>

          {/* Game Board */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 md:p-4">
              <div className="grid grid-cols-4 gap-2">
                {grid.map((row, r) =>
                  row.map((val, c) => (
                    <motion.div
                      key={`${r}-${c}`}
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`aspect-square rounded-xl flex items-center justify-center font-black transition-colors ${getCellClass(val)}`}
                    >
                      {val || ''}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </TiltCard>

          {/* Win/Lose Overlay */}
          <AnimatePresence>
            {(won || gameOver) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-[2rem] p-8 text-center max-w-sm w-full shadow-2xl"
                >
                  <div className="text-6xl mb-4">{won ? '🎉' : '😢'}</div>
                  <h2 className="text-3xl font-display font-bold gradient-text mb-2">
                    {won ? 'You Win!' : 'Game Over!'}
                  </h2>
                  <p className="text-5xl font-black text-primary-600 mb-2">{score}</p>
                  <p className="text-gray-500 mb-6">Your score</p>
                  <div className="flex gap-3">
                    <Button onClick={reset} variant="primary" className="flex-1">
                      Play Again
                    </Button>
                    <Link href="/games" className="flex-1">
                      <Button variant="outline" className="w-full">Back</Button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-400 mt-6">
            Use arrow keys or WASD to move tiles. Merge same numbers to reach 2048!
          </p>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-6">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
