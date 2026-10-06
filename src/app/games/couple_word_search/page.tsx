'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const words = ['HEART', 'LOVE', 'KISS', 'DOVE', 'HUGS', 'SOUL', 'PASSION', 'ROMANCE', 'VALENTINE', 'SWEET'];

export default function CoupleWordSearch() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

  const generateGrid = () => {
    const size = 10;
    const g: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const word of words) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const dir = Math.floor(Math.random() * 3);
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        let valid = true;
        if (dir === 0 && col + word.length <= size) {
          for (let i = 0; i < word.length; i++) { if (g[row][col + i] && g[row][col + i] !== word[i]) valid = false; }
          if (valid) { for (let i = 0; i < word.length; i++) g[row][col + i] = word[i]; placed = true; }
        } else if (dir === 1 && row + word.length <= size) {
          for (let i = 0; i < word.length; i++) { if (g[row + i]?.[col] && g[row + i][col] !== word[i]) valid = false; }
          if (valid) { for (let i = 0; i < word.length; i++) g[row + i][col] = word[i]; placed = true; }
        } else if (dir === 2 && row + word.length <= size && col + word.length <= size) {
          for (let i = 0; i < word.length; i++) { if (g[row + i]?.[col + i] && g[row + i][col + i] !== word[i]) valid = false; }
          if (valid) { for (let i = 0; i < word.length; i++) g[row + i][col + i] = word[i]; placed = true; }
        }
        attempts++;
      }
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!g[r][c]) g[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
    return g;
  };

  const startGame = () => {
    const newGrid = generateGrid();
    setGrid(newGrid);
    setFound([]);
    setFoundWords(new Set());
    setScore(0);
    setGameState('playing');
  };

  const handleCellClick = (r: number, c: number, letter: string) => {
    const key = `${r}-${c}`;
    if (selected.includes(key)) {
      setSelected(selected.filter(k => k !== key));
      return;
    }
    const newSelected = [...selected, key];
    setSelected(newSelected);
    const word = newSelected.map(k => { const [row, col] = k.split('-').map(Number); return grid[row][col]; }).join('');
    if (words.includes(word)) {
      setFound(f => [...f, word]);
      setFoundWords(fw => new Set([...fw, word]));
      setScore(s => s + word.length * 10);
      setSelected([]);
      if (foundWords.size + 1 === words.length) {
        setTimeout(() => setGameState('finished'), 500);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/70 hover:bg-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="font-bold">Love Dove</span>
          </Link>
          <Link href="/games" className="text-sm text-gray-600 hover:text-pink-500 transition">All Games</Link>
        </nav>

        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-7xl mb-4">🔎</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Word Search</h1>
            <p className="text-gray-600 mb-4 text-lg">Find all the love-related words hidden in the grid! Click or tap letters to select them.</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {words.map(w => (
                <span key={w} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{w}</span>
              ))}
            </div>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start Game
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-amber-600">Score: {score}</span>
              <span className="text-sm text-gray-500">Found: {found.length}/{words.length}</span>
            </div>
            <div className="grid grid-cols-10 gap-1 mb-4">
              {grid.map((row, r) => row.map((cell, c) => {
                const key = `${r}-${c}`;
                const isSelected = selected.includes(key);
                return (
                  <button key={key} onClick={() => handleCellClick(r, c, cell)} className={`w-8 h-8 rounded text-sm font-bold transition ${isSelected ? 'bg-amber-500 text-white' : 'bg-amber-50 text-gray-700 hover:bg-amber-100'}`}>
                    {cell}
                  </button>
                );
              }))}
            </div>
            <div className="flex flex-wrap gap-2">
              {words.map(w => (
                <span key={w} className={`px-3 py-1 rounded-full text-sm font-medium ${foundWords.has(w) ? 'bg-green-100 text-green-700 line-through' : 'bg-amber-100 text-amber-700'}`}>{w}</span>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">🔎</div>
            <h2 className="text-3xl font-bold mb-4">Amazing!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">{score} pts</p>
            <p className="text-gray-600 mb-8">You found all the words! 🔍</p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-amber-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
