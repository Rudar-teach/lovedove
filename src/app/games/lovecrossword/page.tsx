'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, PenTool } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface CrosswordClue {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
  filled: string[];
  correct: boolean;
}

const CLUES: CrosswordClue[] = [
  { number: 1, direction: 'across', clue: 'Symbol of love', answer: 'HEART', row: 0, col: 1, length: 5, filled: [], correct: false },
  { number: 2, direction: 'down', clue: 'Sweet greeting', answer: 'HELLO', row: 0, col: 0, length: 5, filled: [], correct: false },
  { number: 3, direction: 'across', clue: 'Romantic flower', answer: 'ROSE', row: 2, col: 2, length: 4, filled: [], correct: false },
  { number: 4, direction: 'down', clue: 'Partner for life', answer: 'LOVE', row: 1, col: 3, length: 4, filled: [], correct: false },
  { number: 5, direction: 'across', clue: 'A warm embrace', answer: 'HUG', row: 3, col: 4, length: 3, filled: [], correct: false },
  { number: 6, direction: 'down', clue: 'A romantic dinner', answer: 'DATE', row: 0, col: 5, length: 4, filled: [], correct: false },
];

export default function LoveCrosswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [clues, setClues] = useState<CrosswordClue[]>(CLUES);
  const [activeClue, setActiveClue] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [activeInput, setActiveInput] = useState<{ clueIdx: number; cellIdx: number } | null>(null);

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
    setClues(CLUES.map(c => ({ ...c, filled: Array(c.length).fill(''), correct: false })));
    setActiveClue(0);
    setScore(0);
    setTimeLeft(120);
    setTimerActive(true);
    setActiveInput({ clueIdx: 0, cellIdx: 0 });
    setPhase('playing');
  };

  const currentClue = clues[activeClue];
  const checkAnswer = (clueIdx: number) => {
    setClues(cs => cs.map((c, i) => {
      if (i !== clueIdx) return c;
      const correct = c.filled.join('').toUpperCase() === c.answer;
      return { ...c, correct };
    }));
  };

  useEffect(() => {
    if (currentClue?.correct) {
      setScore(s => s + currentClue.answer.length * 10);
      const next = clues.findIndex((c, i) => i > activeClue && !c.correct);
      if (next !== -1) setActiveClue(next);
    }
  }, [currentClue?.correct]);

  const allCorrect = clues.every(c => c.correct);
  useEffect(() => {
    if (allCorrect && clues.length > 0) {
      setTimerActive(false);
      setPhase('finished');
    }
  }, [allCorrect]);

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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Crossword</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">A romantic crossword puzzle! Fill in the blanks with love-themed words.</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Puzzle
                </button>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {timeLeft}s</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="bg-white/90 rounded-2xl p-4 shadow-xl">
                      <div className="flex gap-2 mb-4">
                        {clues.map((c, i) => (
                          <button key={i} onClick={() => setActiveClue(i)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${activeClue === i ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700'} ${c.correct ? 'bg-green-500! text-white' : ''}`}>
                            {c.number}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold text-rose-700">{currentClue?.direction.toUpperCase()}:</span> {currentClue?.clue}
                        <span className="text-rose-500 ml-2">({currentClue?.length} letters)</span>
                      </p>
                      <div className="flex gap-1 justify-center my-3">
                        {currentClue?.filled.map((ch, i) => (
                          <input
                            key={i}
                            value={ch}
                            onChange={e => {
                              const val = e.target.value.toUpperCase();
                              setClues(cs => {
                                const clue = cs[activeClue];
                                const newFilled = [...clue.filled];
                                if (val && newFilled[i] !== val) {
                                  newFilled[i] = val.slice(-1);
                                  return cs.map((c, j) => j === activeClue ? { ...c, filled: newFilled } : c);
                                }
                                return cs;
                              });
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') checkAnswer(activeClue);
                            }}
                            className={`w-9 h-10 text-center text-lg font-bold border-2 rounded ${currentClue.correct ? 'bg-green-100 border-green-500 text-green-700' : 'border-rose-300 focus:border-rose-500'}`}
                          />
                        ))}
                      </div>
                      <button onClick={() => checkAnswer(activeClue)} className="w-full bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition">
                        {currentClue.correct ? '✓ Correct!' : 'Check Answer'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white/90 rounded-2xl p-4 shadow-xl">
                      <h3 className="font-semibold text-rose-700 mb-3">Clues</h3>
                      <div className="space-y-2">
                        {clues.map((c, i) => (
                          <div key={i} className={`p-2 rounded-lg text-sm ${c.correct ? 'bg-green-100 text-green-700' : activeClue === i ? 'bg-rose-100 text-rose-700' : 'text-gray-600'}`}>
                            <span className="font-semibold">{c.number}.</span> {c.clue}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <PenTool className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Puzzle Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">words completed</p>
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
