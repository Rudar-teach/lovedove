'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GRID_SIZE = 10;
const WORDS_TO_FIND = [
  "LOVE", "HEART", "KISS", "HUG", "SOUL",
  "MATE", "CHERISH", "DREAM", "ADORE", "BLISS",
  "DREAM", "PASSION", "KIND", "TRUST", "HAPPY",
];

const DIRECTIONS = [
  { dr: 0, dc: 1, name: "horizontal" },
  { dr: 1, dc: 0, name: "vertical" },
  { dr: 1, dc: 1, name: "diagonal-down" },
  { dr: 1, dc: -1, name: "diagonal-up" },
];

const WORD_CATEGORIES: Record<string, { icon: string; color: string }> = {
  "LOVE": { icon: "❤️", color: "bg-red-100 text-red-700" },
  "HEART": { icon: "💝", color: "bg-pink-100 text-pink-700" },
  "KISS": { icon: "💋", color: "bg-rose-100 text-rose-700" },
  "HUG": { icon: "🤗", color: "bg-amber-100 text-amber-700" },
  "SOUL": { icon: "✨", color: "bg-purple-100 text-purple-700" },
  "MATE": { icon: "💕", color: "bg-pink-100 text-pink-700" },
  "CHERISH": { icon: "🌹", color: "bg-rose-100 text-rose-700" },
  "DREAM": { icon: "🌙", color: "bg-indigo-100 text-indigo-700" },
  "ADORE": { icon: "💖", color: "bg-red-100 text-red-700" },
  "BLISS": { icon: "🥰", color: "bg-pink-100 text-pink-700" },
  "PASSION": { icon: "🔥", color: "bg-orange-100 text-orange-700" },
  "KIND": { icon: "💝", color: "bg-amber-100 text-amber-700" },
  "TRUST": { icon: "🤝", color: "bg-blue-100 text-blue-700" },
  "HAPPY": { icon: "😊", color: "bg-yellow-100 text-yellow-700" },
};

export default function CoupleWordSearch() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordPositions, setWordPositions] = useState<Map<string, { r: number; c: number; length: number; direction: { dr: number; dc: number } }>>(new Map());
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showRemaining, setShowRemaining] = useState(true);
  const [score, setScore] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const generateGrid = useCallback(() => {
    const newGrid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    const positions = new Map();
    const wordsToPlace = [...WORDS_TO_FIND].sort(() => Math.random() - 0.5);

    for (const word of wordsToPlace) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const startR = Math.floor(Math.random() * GRID_SIZE);
        const startC = Math.floor(Math.random() * GRID_SIZE);

        const endR = startR + dir.dr * (word.length - 1);
        const endC = startC + dir.dc * (word.length - 1);

        if (endR >= 0 && endR < GRID_SIZE && endC >= 0 && endC < GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const r = startR + dir.dr * i;
            const c = startC + dir.dc * i;
            if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[startR + dir.dr * i][startC + dir.dc * i] = word[i];
            }
            positions.set(word, { r: startR, c: startC, length: word.length, direction: dir });
            placed = true;
          }
        }
      }
    }

    // Fill empty cells
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    return { grid: newGrid, positions };
  }, []);

  const startGame = () => {
    const { grid: g, positions: p } = generateGrid();
    setGrid(g);
    setWordPositions(p);
    setFoundWords([]);
    setSelectedCells([]);
    setScore(0);
    setGameState('playing');
  };

  const getCellFromEvent = (e: React.MouseEvent | React.TouchEvent): { r: number; c: number } | null => {
    const cell = (e.target as HTMLElement).closest('[data-row][data-col]');
    if (!cell) return null;
    return { r: parseInt(cell.getAttribute('data-row')!), c: parseInt(cell.getAttribute('data-col')!) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const cell = getCellFromEvent(e);
    if (cell && !foundWords.some(w => wordPositions.get(w)?.r === cell.r && wordPositions.get(w)?.c === cell.c)) {
      setIsSelecting(true);
      setSelectedCells([cell]);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    if (foundWords.some(w => wordPositions.get(w)?.r === cell.r && wordPositions.get(w)?.c === cell.c)) return;

    const first = selectedCells[0];
    if (!first) return;

    const dr = cell.r - first.r;
    const dc = cell.c - first.c;
    const maxLen = Math.max(Math.abs(dr), Math.abs(dc));

    const newCells: { r: number; c: number }[] = [];
    for (let i = 0; i <= maxLen; i++) {
      const r = first.r + Math.sign(dr) * i;
      const c = first.c + Math.sign(dc) * i;
      newCells.push({ r, c });
    }
    setSelectedCells(newCells);
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const selectedWord = selectedCells.map(c => grid[c.r][c.c]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const matchedWord = WORDS_TO_FIND.find(w =>
      (w === selectedWord || w === reversedWord) && !foundWords.includes(w)
    );

    if (matchedWord) {
      setFoundWords(prev => [...prev, matchedWord]);
      setScore(s => s + matchedWord.length * 10);
      setSelectedCells([]);

      if (foundWords.length + 1 === WORDS_TO_FIND.length) {
        setTimeout(() => setGameState('finished'), 500);
      }
    } else {
      setSelectedCells([]);
    }
  };

  const getRemainingWords = () => WORDS_TO_FIND.filter(w => !foundWords.includes(w));

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-gray-700">Word Search</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🔍</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Word Search</h1>
              <p className="text-gray-600 mb-8 text-lg">Find romantic words hidden in a 10x10 grid!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🔍 Click and drag to select words in the grid</li>
                  <li>↔️ Words can be horizontal, vertical, or diagonal</li>
                  <li>✅ Find all {WORDS_TO_FIND.length} romantic words</li>
                  <li>⭐ Score points for each word found</li>
                </ul>
              </div>

              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && grid.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">{foundWords.length}/{WORDS_TO_FIND.length} found</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-600">{score} pts</span>
                  <button onClick={() => setShowRemaining(!showRemaining)} className="p-2 rounded-xl bg-white/70">
                    {showRemaining ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(foundWords.length / WORDS_TO_FIND.length) * 100}%` }} />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <div
                    ref={gridRef}
                    className="grid gap-0.5 bg-white/50 p-3 rounded-2xl shadow-lg"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => { if (isSelecting) { setIsSelecting(false); setSelectedCells([]); } }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const cell = getCellFromEvent(e as unknown as React.MouseEvent);
                      if (cell && !foundWords.some(w => wordPositions.get(w)?.r === cell.r && wordPositions.get(w)?.c === cell.c)) {
                        setIsSelecting(true);
                        setSelectedCells([cell]);
                      }
                    }}
                    onTouchMove={(e) => {
                      if (!isSelecting) return;
                      e.preventDefault();
                      const touch = e.touches[0];
                      const cell = getCellFromEvent(e as unknown as React.MouseEvent);
                      if (!cell) return;
                      const first = selectedCells[0];
                      if (!first) return;
                      const dr = cell.r - first.r;
                      const dc = cell.c - first.c;
                      const maxLen = Math.max(Math.abs(dr), Math.abs(dc));
                      const newCells: { r: number; c: number }[] = [];
                      for (let i = 0; i <= maxLen; i++) {
                        newCells.push({ r: first.r + Math.sign(dr) * i, c: first.c + Math.sign(dc) * i });
                      }
                      setSelectedCells(newCells);
                    }}
                    onTouchEnd={() => {
                      handleMouseUp();
                      setIsSelecting(false);
                    }}
                  >
                    {grid.map((row, r) => row.map((letter, c) => {
                      const isSelected = selectedCells.some(sc => sc.r === r && sc.c === c);
                      const isFound = foundWords.some(w => {
                        const pos = wordPositions.get(w);
                        if (!pos) return false;
                        const dr = pos.direction.dr;
                        const dc = pos.direction.dc;
                        for (let i = 0; i < pos.length; i++) {
                          if (pos.r + dr * i === r && pos.c + dc * i === c) return true;
                        }
                        return false;
                      });
                      return (
                        <div
                          key={`${r}-${c}`}
                          data-row={r}
                          data-col={c}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer transition-all ${isSelected ? 'bg-indigo-400 text-white scale-110' : isFound ? 'bg-green-400 text-white' : 'bg-white hover:bg-pink-50 text-gray-700'}`}
                        >
                          {letter}
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {showRemaining && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-32 shrink-0">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60 p-3">
                      <h3 className="text-xs font-bold text-gray-700 mb-2">Find These:</h3>
                      <div className="space-y-1">
                        {getRemainingWords().map(word => (
                          <div key={word} className={`px-2 py-1 rounded-lg text-xs font-bold ${WORD_CATEGORIES[word]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {WORD_CATEGORIES[word]?.icon} {word}
                          </div>
                        ))}
                        {foundWords.map(word => (
                          <div key={word} className="px-2 py-1 rounded-lg text-xs font-bold text-green-600 line-through opacity-50">
                            {word}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">You Found Them All!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-8">{score} points</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">All Words Found</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {foundWords.map(word => (
                    <span key={word} className={`px-3 py-1.5 rounded-full text-sm font-bold ${WORD_CATEGORIES[word]?.color || 'bg-gray-100'}`}>
                      {WORD_CATEGORIES[word]?.icon} {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> New Puzzle
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}