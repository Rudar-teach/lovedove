'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Puzzle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type Piece = { id: number; r: number; c: number; correctR: number; correctC: number };
type PieceLayout = Piece[];

const PUZZLE_EMOJI: Record<string, string> = {
  'heart': '❤️', 'couple': '💑', 'rose': '🌹', 'dove': '🕊️', 'ring': '💍',
};

const PUZZLES = [
  { id: 'heart', title: 'Heart', emoji: '❤️', rows: 3, cols: 3, shape: [[1,0],[0,1],[1,1],[2,1],[1,2]] },
  { id: 'couple', title: 'Couple', emoji: '💑', rows: 3, cols: 4, shape: [[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,1],[2,2]] },
  { id: 'rose', title: 'Rose', emoji: '🌹', rows: 3, cols: 3, shape: [[0,0],[0,1],[0,2],[1,1],[2,1]] },
  { id: 'dove', title: 'Dove', emoji: '🕊️', rows: 3, cols: 4, shape: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[2,2],[2,3]] },
];

export default function HeartpuzzlePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentPuzzle, setCurrentPuzzle] = useState(PUZZLES[0]);
  const [puzzles, setPuzzles] = useState(PUZZLES);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pieces, setPieces] = useState<PieceLayout>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [puzzlesDone, setPuzzlesDone] = useState(0);

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

  const buildPieces = () => {
    const puzzle = PUZZLES[puzzleIdx];
    const shapeCells = puzzle.shape;
    let id = 0;
    const p: PieceLayout = shapeCells.map(([r, c]) => ({
      id: id++, r, c, correctR: r, correctC: c,
    }));
    const shuffled = p.sort(() => Math.random() - 0.5);
    setPieces(shuffled.map((p, i) => ({ ...p, r: Math.floor(i / puzzle.cols), c: i % puzzle.cols })));
  };

  const startGame = () => {
    setPuzzleIdx(0);
    setPuzzlesDone(0);
    setMoves(0);
    setScore(0);
    setTimeLeft(90);
    setTimerActive(true);
    setPhase('playing');
    buildPieces();
  };

  const handleSlotClick = (slotR: number, slotC: number) => {
    if (selected === null) {
      const occupying = pieces.find(p => p.r === slotR && p.c === slotC);
      if (occupying) setSelected(occupying.id);
      return;
    }
    const occupied = pieces.find(p => p.r === slotR && p.c === slotC && p.id !== selected);
    if (occupied) {
      setPieces(p => p.map(x => {
        if (x.id === selected) return { ...x, r: occupied.r, c: occupied.c };
        if (x.id === occupied.id) return { ...x, r: pieces.find(p => p.id === selected)!.r, c: pieces.find(p => p.id === selected)!.c };
        return x;
      }));
    } else {
      const piece = pieces.find(p => p.id === selected);
      if (piece) setPieces(p => p.map(x => x.id === selected ? { ...x, r: slotR, c: slotC } : x));
    }
    setMoves(m => m + 1);
    setSelected(null);
    checkWin();
  };

  const checkWin = () => {
    if (!currentPuzzle) return;
    const allCorrect = pieces.every(p => p.r === p.correctR && p.c === p.correctC);
    if (allCorrect) {
      setScore(s => s + Math.max(100 - moves * 2, 10));
      setPuzzlesDone(d => d + 1);
      if (puzzleIdx < PUZZLES.length - 1) {
        setPuzzleIdx(i => i + 1);
        buildPieces();
      } else {
        setPhase('finished');
      }
    }
  };

  const puzzle = PUZZLES[puzzleIdx];

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">🧩</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Heart Puzzle</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Slide puzzle pieces to form romantic shapes. Complete all 4 puzzles!</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Puzzles to Solve</h3>
                  <div className="space-y-2">
                    {PUZZLES.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-rose-50 p-2 rounded-lg">
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="font-medium text-rose-700">{p.title}</span>
                        <span className="text-xs text-gray-500 ml-auto">{p.rows}x{p.cols}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Puzzle
                </button>
              </motion.div>
            )}

            {phase === 'playing' && puzzle && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-rose-700 font-semibold mb-2">Puzzle {puzzleIdx + 1}/{PUZZLES.length}: {puzzle.emoji} {puzzle.title} • Score: {score}</div>

                <div className="flex justify-center mb-4">
                  <div className="grid gap-1 bg-rose-200 p-2 rounded-xl" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)` }}>
                    {Array.from({ length: puzzle.rows * puzzle.cols }).map((_, slotIdx) => {
                      const slotR = Math.floor(slotIdx / puzzle.cols);
                      const slotC = slotIdx % puzzle.cols;
                      const piece = pieces.find(p => p.r === slotR && p.c === slotC);
                      const inShape = puzzle.shape.some(([r, c]) => r === slotR && c === slotC);
                      const isSelected = piece?.id === selected;
                      return (
                        <button
                          key={slotIdx}
                          onClick={() => handleSlotClick(slotR, slotC)}
                          disabled={!inShape}
                          className={`w-14 h-14 flex items-center justify-center text-2xl rounded-lg transition ${inShape ? 'bg-white hover:bg-rose-50' : 'bg-rose-300/50 cursor-not-allowed'} ${isSelected ? 'ring-4 ring-rose-500 scale-110' : ''}`}
                        >
                          {piece && inShape ? '❤️' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Puzzle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">All Puzzles Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">{moves} total moves</p>
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
