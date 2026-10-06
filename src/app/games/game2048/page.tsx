'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const SIZE = 4;
const SYMBOLS = ['💕', '💖', '💗', '💓', '💘', '💝'];
const getCellValue = (r: number, c: number) => (r * SIZE + c + 1);

type Tile = { r: number; c: number; v: number };

export default function Game2048Page() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [grid, setGrid] = useState<Tile[]>([]);
  const [best, setBest] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const b = localStorage.getItem('game2048_best');
    if (b) setBest(Number(b));
  }, []);

  const newGame = useCallback(() => {
    const tiles: Tile[] = [];
    const positions: [number, number][] = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) positions.push([r, c]);
    const shuffled = positions.sort(() => Math.random() - 0.5);
    const start = shuffled.slice(0, 2);
    const t: Tile[] = start.map(([r, c], i) => ({ r, c, v: getCellValue(r, c) }));
    setGrid(t);
    setScore(0);
    setTimeLeft(120);
    setState('playing');
  }, []);

  const [cellMap, setCellMap] = useState<Record<string, { v: number; id: number }>>({});

  useEffect(() => {
    if (state !== 'playing') return;
    const map: Record<string, { v: number; id: number }> = {};
    grid.forEach((tile, i) => {
      map[`${tile.r}-${tile.c}`] = { v: tile.v, id: i };
    });
    setCellMap(map);
  }, [grid, state]);

  const move = useCallback(
    (dr: number, dc: number) => {
      if (state !== 'playing') return;
      setGrid((prev) => {
        const map: Record<string, Tile> = {};
        prev.forEach((t) => (map[`${t.r}-${t.c}`] = t));
        const newTiles: Tile[] = [];
        let addScore = 0;

        const rows = dr === 1 ? [SIZE - 1, SIZE - 2, 0] : [0, 1, SIZE - 1];
        const cols = dc === 1 ? [SIZE - 1, SIZE - 2, 0] : [0, 1, SIZE - 1];

        for (const r of rows) {
          for (const c of cols) {
            const key = `${r}-${c}`;
            if (!map[key]) continue;
            const tile = map[key];
            let nr = tile.r + dr;
            let nc = tile.c + dc;

            while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
              const nk = `${nr}-${nc}`;
              if (map[nk] && map[nk].v === tile.v && !map[nk]._merged) {
                map[nk].v *= 2;
                map[nk]._merged = true;
                addScore += map[nk].v;
                delete map[key];
                break;
              }
              if (map[nk]) break;
              map[key].r = nr;
              map[key].c = nc;
              nr += dr;
              nc += dc;
            }
          }
        }

        const result = Object.values(map).filter((t) => !t._merged);
        const merged = Object.values(map).filter((t) => t._merged);
        delete (merged as any)._merged;

        if (addScore > 0) setScore((s) => s + addScore);

        if (result.length + merged.length < SIZE * SIZE) {
          const occupied = new Set([
            ...result.map((t) => `${t.r}-${t.c}`),
            ...merged.map((t) => `${t.r}-${t.c}`),
          ]);
          const free: [number, number][] = [];
          for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
              if (!occupied.has(`${r}-${c}`)) free.push([r, c]);
          const pick = free.sort(() => Math.random() - 0.5).slice(0, 1);
          if (pick.length > 0) {
            const [r, c] = pick[0];
            result.push({ r, c, v: getCellValue(r, c) });
          }
        }

        return [...result, ...merged];
      });
    },
    [state],
  );

  useEffect(() => {
    if (state !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move(-1, 0);
      else if (e.key === 'ArrowDown' || e.key === 's') move(1, 0);
      else if (e.key === 'ArrowLeft' || e.key === 'a') move(0, -1);
      else if (e.key === 'ArrowRight' || e.key === 'd') move(0, 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move, state]);

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      setState('finished');
      if (score > best) {
        setBest(score);
        localStorage.setItem('game2048_best', String(score));
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state, score, best]);

  useEffect(() => {
    if (state !== 'playing') return;
    if (grid.length === SIZE * SIZE) {
      const occupied = new Set(grid.map((t) => `${t.r}-${t.c}`));
      const canMerge = grid.some((tile) => {
        return [
          [tile.r - 1, tile.c],
          [tile.r + 1, tile.c],
          [tile.r, tile.c - 1],
          [tile.r, tile.c + 1],
        ].some(([r, c]) => {
          if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
          const nk = `${r}-${c}`;
          const neighbor = Object.values(cellMap).find((_, i) => grid[i] && grid[i].r === r && grid[i].c === c);
          return neighbor?.v === tile.v;
        });
      });
      if (!canMerge) {
        setState('finished');
        if (score > best) {
          setBest(score);
          localStorage.setItem('game2048_best', String(score));
        }
      }
    }
  }, [grid, state, best, score, cellMap]);

  const getColor = (v: number) => {
    const level = Math.log2(v / 2);
    const colors = [
      'bg-pink-100 text-pink-600',
      'bg-pink-200 text-pink-700',
      'bg-rose-200 text-rose-700',
      'bg-red-200 text-red-700',
      'bg-fuchsia-200 text-fuchsia-700',
      'bg-purple-200 text-purple-700',
      'bg-violet-300 text-violet-800',
      'bg-pink-300 text-pink-800',
      'bg-rose-300 text-rose-800',
      'bg-fuchsia-300 text-fuchsia-800',
      'bg-pink-400 text-white',
      'bg-rose-400 text-white',
      'bg-fuchsia-400 text-white',
      'bg-purple-400 text-white',
    ];
    const idx = Math.min(level, colors.length - 1);
    return colors[Math.max(0, idx)];
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Love 2048
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            {/* Stats */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase tracking-wider">Score</div>
                <div className="text-2xl font-bold text-white">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase tracking-wider">Best</div>
                <div className="text-2xl font-bold text-pink-300">{best}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase tracking-wider">Time</div>
                <div className={`text-2xl font-bold ${timeLeft <= 20 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-white/10 rounded-2xl p-3 mb-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: SIZE * SIZE }).map((_, idx) => {
                  const r = Math.floor(idx / SIZE);
                  const c = idx % SIZE;
                  const cell = cellMap[`${r}-${c}`];
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold transition-all ${
                        cell ? getColor(cell.v) + ' shadow-lg scale-100' : 'bg-white/5'
                      }`}
                    >
                      {cell ? SYMBOLS[Math.min(Math.floor(Math.log2(cell.v)) - 1, SYMBOLS.length - 1)] : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            {state === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={newGame}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <Play size={20} /> Start Game
              </motion.button>
            )}

            {state === 'playing' && (
              <div className="text-center text-white/60 text-sm">
                Use arrow keys or WASD to move tiles 💕
              </div>
            )}

            {state === 'finished' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {score >= 500 ? '🏆 Amazing!' : score >= 200 ? '💖 Great Job!' : '💕 Nice Try!'}
                  </h2>
                  <p className="text-white/70">Final Score: <span className="text-pink-300 font-bold">{score}</span></p>
                  {score >= best && score > 0 && <p className="text-yellow-300 font-bold">🎉 New Best!</p>}
                </div>
                <button
                  onClick={newGame}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  <RotateCcw size={20} /> Play Again
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}
