'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GRID_SIZE = 10;
const WORDS_TO_FIND = ['LOVE', 'KISS', 'HUG', 'DATE', 'HEART', 'SOUL', 'DREAM', 'PASSION', 'ROMANCE', 'CHERISH'];

function generateWordSearch(): { grid: string[][]; wordPositions: Record<string, {row: number; col: number; dir: string}[]> } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const wordPositions: Record<string, {row: number; col: number; dir: string}[]> = {};

  const directions = [
    { dr: 0, dc: 1, name: 'right' },
    { dr: 1, dc: 0, name: 'down' },
    { dr: 1, dc: 1, name: 'diagonal' },
    { dr: 0, dc: -1, name: 'left' },
    { dr: -1, dc: 0, name: 'up' },
  ];

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (const word of WORDS_TO_FIND) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (dir.dr !== 0 && row + dir.dr * (word.length - 1) < 0) continue;
      if (dir.dr !== 0 && row + dir.dr * (word.length - 1) >= GRID_SIZE) continue;
      if (dir.dc !== 0 && col + dir.dc * (word.length - 1) < 0) continue;
      if (dir.dc !== 0 && col + dir.dc * (word.length - 1) >= GRID_SIZE) continue;

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { fits = false; break; }
      }

      if (fits) {
        wordPositions[word] = wordPositions[word] || [];
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;
          grid[r][c] = word[i];
          wordPositions[word].push({ row: r, col: c, dir: dir.name });
        }
        placed = true;
      }
    }
    if (!placed) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (grid[r][c] === '') grid[r][c] = word[0] || letters[Math.floor(Math.random() * 26)];
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }

  return { grid, wordPositions };
}

export default function LoveWordSearch2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [searchData, setSearchData] = useState<{ grid: string[][]; wordPositions: Record<string, {row: number; col: number; dir: string}[]> }>({ grid: [], wordPositions: {} });

  const startGame = () => {
    const data = generateWordSearch();
    setSearchData(data);
    setGrid(data.grid);
    setFoundWords(new Set());
    setGameState('playing');
  };

  const foundCount = foundWords.size;
  const allFound = foundCount === WORDS_TO_FIND.length;

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🔎</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Word Search 2</h1>
              <p className="text-gray-600 mb-8 text-lg">Find all 10 love words hidden in the grid!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-2">Words to Find:</h3>
                <div className="flex flex-wrap gap-2">
                  {WORDS_TO_FIND.map(w => (<span key={w} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">{w}</span>))}
                </div>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Play className="w-5 h-5 inline mr-2" /> Start Search</button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">Found: {foundCount} / {WORDS_TO_FIND.length}</span>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
                  <div className="grid grid-cols-10 gap-1">
                    {grid.map((row, ri) => row.map((letter, ci) => (
                      <div key={`${ri}-${ci}`} className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded text-sm font-bold text-blue-800">{letter}</div>
                    )))}
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-3">Word List:</h3>
                  <div className="space-y-2">
                    {WORDS_TO_FIND.map(word => (
                      <div key={word} className={`text-sm font-medium ${foundWords.has(word) ? 'text-green-600 line-through' : 'text-gray-700'}`}>
                        {foundWords.has(word) ? '✓' : '○'} {word}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">Look for words horizontally, vertically, and diagonally!</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 mb-3">Found all the words? Click below!</p>
                <button onClick={() => allFound && setGameState('finished')} disabled={!allFound} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold disabled:opacity-50">Finish Game</button>
              </div>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🔎</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing Detective!</h2>
              <p className="text-gray-600 mb-8">You found all {WORDS_TO_FIND.length} words!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-blue-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4">Found Words:</h3>
                <div className="flex flex-wrap gap-2">
                  {WORDS_TO_FIND.map(w => (<span key={w} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">✓ {w}</span>))}
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> New Puzzle</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
