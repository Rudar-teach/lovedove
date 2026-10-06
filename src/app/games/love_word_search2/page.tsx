'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type WordItem {
  word: string;
  emoji: string;
  found: boolean;
}

const GRID_SIZE = 10;
const WORDS_DATA: WordItem[] = [
  { word: 'LOVE', emoji: '❤️', found: false },
  { word: 'KISS', emoji: '💋', found: false },
  { word: 'HEART', emoji: '💖', found: false },
  { word: 'ROSE', emoji: '🌹', found: false },
  { word: 'MUSIC', emoji: '🎵', found: false },
  { word: 'DATE', emoji: '🌙', found: false },
  { word: 'HUG', emoji: '🫂', found: false },
  { word: 'SOUL', emoji: '✨', found: false },
  { word: 'FLOWER', emoji: '🌸', found: false },
  { word: 'SMILE', emoji: '😊', found: false },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateGrid() {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const { word } of WORDS_DATA) {
    let placed = false;
    while (!placed) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const [dr, dc] = dir;
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      let ok = true;
      for (let k = 0; k < word.length; k++) {
        const nr = r + k * dr, nc = c + k * dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) { ok = false; break; }
        if (grid[nr][nc] && grid[nr][nc] !== word[k]) { ok = false; break; }
      }
      if (ok) {
        for (let k = 0; k < word.length; k++) {
          grid[r + k * dr][c + k * dc] = word[k];
        }
        placed = true;
      }
    }
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
  }
  return grid;
}

function findWord(grid: string[][], word: string): [number, number][] | null {
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      for (const [dr, dc] of dirs) {
        let ok = true;
        for (let k = 0; k < word.length; k++) {
          const nr = r + k*dr, nc = c + k*dc;
          if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || grid[nr][nc] !== word[k]) { ok = false; break; }
        }
        if (ok) {
          const cells: [number, number][] = [];
          for (let k = 0; k < word.length; k++) cells.push([r + k*dr, c + k*dc]);
          return cells;
        }
      }
    }
  }
  return null;
}

export default function LoveWordSearch2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setPhase('finished');
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    setGrid(generateGrid());
    setFoundCells(new Set());
    setFoundWords(new Set());
    setScore(0);
    setTimeLeft(180);
    setTimerActive(true);
    setHintCooldown(false);
    setHintsShown(0);
    setPhase('playing');
  };

  const handleCellClick = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (foundCells.has(key)) return;
    setFoundCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const checkSelection = () => {
    const cells = Array.from(foundCells).map(k => k.split('-').map(Number) as [number, number]);
    if (cells.length < 3) return;
    const word = cells.map(([r, c]) => grid[r][c]).sort((a, b) => a.localeCompare(b)).join('');
    const targetWord = WORDS_DATA.find(w => w.word === word && !foundWords.has(w.word));
    if (targetWord) {
      setFoundWords(p => new Set([...p, targetWord.word]));
      setScore(s => s + targetWord.word.length * 10);
      setFoundCells(new Set());
      if (foundWords.size + 1 >= WORDS_DATA.length) {
        setTimerActive(false);
        setPhase('finished');
      }
    } else {
      setFoundCells(new Set());
    }
  };

  const checkWord = (w: string) => {
    const cells = findWord(grid, w);
    if (cells) {
      cells.forEach(([r, c]) => {
        const key = `${r}-${c}`;
        setFoundCells(prev => new Set([...prev, key]));
      });
      setFoundWords(p => new Set([...p, w]));
      setScore(s => s + w.length * 10);
      if (foundWords.size + 1 >= WORDS_DATA.length) {
        setTimerActive(false);
        setPhase('finished');
      }
    }
  };

  const showHint = () => {
    if (hintCooldown) return;
    const remaining = WORDS_DATA.filter(w => !foundWords.has(w.word));
    if (remaining.length > 0) {
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      checkWord(pick.word);
      setHintsShown(h => h + 1);
      setHintCooldown(true);
      setTimeout(() => setHintCooldown(false), 20000);
    }
  };

  const isFound = (r: number, c: number) => foundCells.has(`${r}-${c}`);

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Word Search</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Find 10 romantic words hidden in the letter grid. Click cells to select, then check your answers!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Searching
                </button>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-green-600 font-semibold">{foundWords.size}/{WORDS_DATA.length} found</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="bg-white/90 rounded-2xl p-2 shadow-xl inline-block mx-auto block">
                      {grid.map((row, r) => (
                        <div key={r} className="flex">
                          {row.map((letter, c) => (
                            <button
                              key={`${r}-${c}`}
                              onClick={() => handleCellClick(r, c)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold rounded m-px transition ${isFound(r, c) ? 'bg-green-100 text-green-600' : foundCells.has(`${r}-${c}`) ? 'bg-rose-500 text-white scale-110' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button onClick={checkSelection} className="bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition">🔍 Check Selection</button>
                    </div>
                  </div>

                  <div>
                    <div className="bg-white/90 rounded-2xl p-4 shadow-xl">
                      <h3 className="font-semibold text-rose-700 mb-3">Words to Find</h3>
                      <div className="space-y-2">
                        {WORDS_DATA.map(({ word, emoji }) => (
                          <div key={word} className={`flex items-center gap-2 p-2 rounded ${foundWords.has(word) ? 'bg-green-100 text-green-600 line-through' : 'bg-rose-50 text-rose-700'}`}>
                            <span>{emoji}</span>
                            <span className="font-medium">{word}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={showHint} disabled={hintCooldown} className="w-full mt-4 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm disabled:opacity-50">
                        {hintCooldown ? '💡 Cooldown...' : '💡 Auto Find'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Search className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Search Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{foundWords.size}/{WORDS_DATA.length}</div>
                <p className="text-xl text-pink-600 mb-6">words found • {score} points</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link href="/games" className="bg-pink-100 text-rose-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-200 transition">More Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
