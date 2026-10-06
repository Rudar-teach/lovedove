'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Sparkles, Star, Grid3x3, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORD_SETS: Record<string, string[]> = {
  romantic: ['LOVE', 'KISS', 'HUGS', 'HEART', 'SOUL', 'DREAM', 'DOVE', 'FLAME', 'ROSES', 'SWEET'],
  feelings: ['PASSION', 'DESIRE', 'AFFECTION', 'CHERISH', 'TENDER', 'ADORE', 'MISSING', 'DREAMY', 'ENCHANT', 'AFFINITY'],
  events: ['WEDDING', 'DINNER', 'DANCE', 'KISSING', 'ANNIV', 'CANDLE', 'MUSIC', 'GIFTS', 'RING', 'VOW'],
};

interface Position { row: number; col: number; }
interface Placement { word: string; cells: Position[]; found: boolean; }

const GRID_SIZE = 10;
const DIRECTIONS = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

const generateGrid = (wordList: string[], size: number = 10): { grid: string[][]; placements: Placement[] } => {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placements: Placement[] = [];
  const canPlace = (word: string, row: number, col: number, dRow: number, dCol: number): Position[] | null => {
    const cells: Position[] = [];
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      if (r < 0 || r >= size || c < 0 || c >= size) return null;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return null;
      cells.push({ row: r, col: c });
    }
    return cells;
  };
  for (const word of wordList) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const cells = canPlace(word, Math.floor(Math.random() * size), Math.floor(Math.random() * size), dir[0], dir[1]);
      if (cells) {
        cells.forEach(c => { grid[c.row][c.col] = word[cells.indexOf(c)]; });
        placements.push({ word, cells, found: false });
        placed = true;
      }
    }
  }
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
  return { grid, placements };
};

type Difficulty = 'easy' | 'medium' | 'hard';
const SIZE_MAP: Record<Difficulty, number> = { easy: 8, medium: 10, hard: 12 };

export default function LoveWordSearch2Page() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [wordSet, setWordSet] = useState<keyof typeof WORD_SETS>('romantic');
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState<number>(90);
  const [hintsLeft, setHintsLeft] = useState(3);
  const intervalRef = useRef<any>(null);

  const words = useMemo(() => WORD_SETS[wordSet], [wordSet]);
  const size = SIZE_MAP[difficulty];

  const startGame = () => {
    const result = generateGrid(words.slice(0, 8), size);
    setGrid(result.grid);
    setPlacements(result.placements);
    setSelected([]);
    setFoundWords([]);
    setScore(0);
    setTimer(difficulty === 'easy' ? 120 : difficulty === 'medium' ? 90 : 60);
    setHintsLeft(3);
    setGameState('playing');
    const iv = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(iv); setGameState('finished'); return 0; }
        return t - 1;
      });
    }, 1000);
    intervalRef.current = iv;
  };

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  useEffect(() => {
    if (foundWords.length === placements.length && placements.length > 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setGameState('finished');
    }
  }, [foundWords, placements]);

  const handleCellStart = (row: number, col: number) => {
    setSelected([{ row, col }]);
    setIsSelecting(true);
  };

  const handleCellEnter = (row: number, col: number) => {
    if (!isSelecting || selected.length === 0) return;
    const start = selected[0];
    const dRow = row === start.row ? 0 : row > start.row ? 1 : -1;
    const dCol = col === start.col ? 0 : col > start.col ? 1 : -1;
    const last = selected[selected.length - 1];
    if (last && last.row === row && last.col === col) return;
    const newPath: Position[] = [{ row: start.row, col: start.col }];
    const maxDist = Math.max(Math.abs(row - start.row), Math.abs(col - start.col), 1);
    let r = start.row + dRow, c = start.col + dCol, steps = 0;
    while (steps < maxDist) {
      newPath.push({ row: r, col: c });
      if (r === row && c === col) break;
      r += dRow; c += dCol; steps++;
    }
    setSelected(newPath);
  };

  const handleEnd = () => {
    if (!isSelecting || selected.length < 2) { setSelected([]); setIsSelecting(false); return; }
    const word = selected.map(s => grid[s.row][s.col]).join('');
    const reversed = word.split('').reverse().join('');
    const match = placements.find(p => (p.word === word || p.word === reversed) && !foundWords.includes(p.word));
    if (match) { setFoundWords(f => [...f, match.word]); setScore(s => s + match.word.length * 10 + (timer > 30 ? 20 : 0)); }
    setSelected([]); setIsSelecting(false);
  };

  const useHint = () => {
    const unfound = placements.filter(p => !foundWords.includes(p.word));
    if (unfound.length === 0 || hintsLeft <= 0) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    setFoundWords(f => [...f, pick.word]);
    setScore(s => s + 5);
    setHintsLeft(h => h - 1);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /><span className="font-bold text-gray-700">Word Search</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">A</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Word Search</h1>
              <p className="text-gray-600 mb-8 text-lg">Find hidden words across different categories!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Difficulty</h3>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize ${difficulty === d ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}>{d}</button>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 mt-4 mb-3">Category</h3>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(WORD_SETS) as Array<keyof typeof WORD_SETS>).map(k => (
                    <button key={k} onClick={() => setWordSet(k)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${wordSet === k ? 'bg-purple-500 text-white' : 'bg-white text-gray-600'}`}>{k}</button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">Grid: {size}x{size} | Words: {WORD_SETS[wordSet].slice(0, 8).join(', ')}</p>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">{foundWords.length}/{placements.length}</span>
                <span className={`text-lg font-black ${timer <= 15 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱️ {timer}s</span>
                <span className="text-sm font-bold text-amber-600">💡 {hintsLeft}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 mb-4 select-none">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                  {grid.map((row, ri) => row.map((letter, ci) => {
                    const isSelected = selected.some(s => s.row === ri && s.col === ci);
                    const inFoundWord = placements.some(p => p.found && p.cells.some(c => c.row === ri && c.col === ci));
                    return (
                      <button key={`${ri}-${ci}`} onMouseDown={() => handleCellStart(ri, ci)} onMouseEnter={() => handleCellEnter(ri, ci)} onMouseUp={handleEnd} onTouchStart={() => handleCellStart(ri, ci)} onTouchMove={(e) => { const t = e.touches[0]; const el = document.elementFromPoint(t.clientX, t.clientY); if (el && el.dataset.row && el.dataset.col) handleCellEnter(parseInt(el.dataset.row), parseInt(el.dataset.col)); }} onTouchEnd={handleEnd} data-row={ri} data-col={ci} className={`aspect-square rounded-md text-xs sm:text-sm font-black flex items-center justify-center transition ${isSelected ? 'bg-purple-500 text-white scale-110 z-10 relative' : inFoundWord ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-purple-100'}`}>
                        {letter}
                      </button>
                    );
                  }))}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Find these words:</h3><button onClick={useHint} disabled={hintsLeft <= 0} className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 disabled:opacity-50">💡 Hint ({hintsLeft})</button></div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {words.slice(0, 8).map(w => (
                    <span key={w} className={`px-2 py-1 rounded-lg text-center font-bold ${foundWords.includes(w) ? 'bg-green-100 text-green-700 line-through' : 'bg-gray-100 text-gray-600'}`}>{w}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Search Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">{score} pts</p>
              <p className="text-gray-600 mb-8">Found {foundWords.length}/{placements.length} words</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}