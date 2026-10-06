'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = ['LOVE', 'HEART', 'KISS', 'ROSE', 'CUPID', 'ROMANCE', 'CHERISH', 'ADORE', 'SWEET', 'SOULMATE', 'FOREVER', 'PASSION'];

function makeGrid(words: string[]) {
  const size = 10;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: { word: string; cells: [number, number][] }[] = [];
  for (const word of words) {
    let attempts = 0;
    while (attempts < 100) {
      const dir = Math.random() < 0.5 ? 'h' : 'v';
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const fits = dir === 'h' ? c + word.length <= size : r + word.length <= size;
      if (!fits) { attempts++; continue; }
      const cells: [number, number][] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const rr = dir === 'h' ? r : r + i;
        const cc = dir === 'h' ? c + i : c;
        if (grid[rr][cc] && grid[rr][cc] !== word[i]) { ok = false; break; }
        cells.push([rr, cc]);
      }
      if (ok) {
        for (let i = 0; i < word.length; i++) grid[cells[i][0]][cells[i][1]] = word[i];
        placed.push({ word, cells });
        break;
      }
      attempts++;
    }
  }
  // Fill empty with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * 26)];
  return { grid, placed };
}

export default function LoveWordSearch2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [grid, setGrid] = useState<string[][]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<[number, number][]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) { setGameState('finished'); return; }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [gameState, timeLeft]);

  const startGame = () => {
    const chosen = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
    const { grid: g } = makeGrid(chosen);
    setGrid(g);
    setTargets(chosen);
    setFound([]);
    setSelected([]);
    setTimeLeft(120);
    setScore(0);
    setGameState('playing');
  };

  const handleCell = (r: number, c: number) => {
    if (gameState !== 'playing') return;
    const next = [...selected, [r, c] as [number, number]];
    setSelected(next);
    if (next.length >= 3) {
      const word = next.map(([rr, cc]) => grid[rr][cc]).join('');
      const reverse = word.split('').reverse().join('');
      const match = targets.find(w => (w === word || w === reverse) && !found.includes(w));
      if (match) {
        setFound(f => [...f, match]);
        setScore(s => s + 15);
        setSelected([]);
        if (found.length + 1 === targets.length) setGameState('finished');
      } else if (next.length >= 8) setSelected([]);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button><Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link></div>
          <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
        </div></div></div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">🔎</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Word Search 2</h1>
              <p className="text-gray-600 mb-8 text-lg">Find 6 love words in the grid!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold">Score: {score}</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 15 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white/70 text-gray-700'}`}><Timer className="w-4 h-4" /><span className="font-bold">{timeLeft}s</span></div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4 text-xs font-bold">
                {targets.map(w => (<div key={w} className={`px-2 py-1 rounded-full text-center ${found.includes(w) ? 'bg-green-500 text-white line-through' : 'bg-white/70 text-gray-700'}`}>{w}</div>))}
              </div>
              <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
                {grid.map((row, r) => row.map((l, c) => {
                  const sel = selected.some(([rr, cc]) => rr === r && cc === c);
                  return (<button key={`${r}-${c}`} onClick={() => handleCell(r, c)} className={`aspect-square rounded-lg font-bold text-sm ${sel ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-800'}`}>{l}</button>);
                }))}
              </div>
              <div className="text-center mt-4"><button onClick={() => setSelected([])} className="px-4 py-2 text-sm bg-white/70 rounded-xl">Clear</button></div>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Word Search Complete!</h2>
              <p className="text-5xl font-black gradient-text mb-2">{score} pts</p>
              <p className="text-gray-600 mb-6">Found: {found.length}/{targets.length} words</p>
              <div className="flex gap-4 justify-center"><button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link></div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
