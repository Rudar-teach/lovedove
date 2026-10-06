'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';
type Cell = { text: string; emoji: string; marked: boolean };

const BINGO_PHRASES = [
  'Says "I love you"', 'Makes you laugh', 'Steals the blanket', 'Cooks for you',
  'Surprises you', 'Plans a date', 'Sends a sweet text', 'Gives a forehead kiss',
  'Dances with you', 'Sings to you', 'Plans a future trip', 'Brings you coffee',
  'Remembers an anniversary', 'Writes a love note', 'Holds your hand in public', 'Cuddles on the couch',
  'Cooks breakfast in bed', 'Shares their food', 'Plays with your hair', 'Whispers "I miss you"',
  'Surprise gift', 'Plans movie night', 'Stays up to talk', 'Drops everything for you',
  'Says sorry first', 'Dreams out loud', 'Gives a back rub',
];

const BINGO_LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

export default function LoveBingoPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [board, setBoard] = useState<Cell[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);

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
    const emoji = ['💕', '✨', '💋', '🌹', '💖', '🥰', '💝', '🌸', '☕', '🎁'];
    const shuffled = [...BINGO_PHRASES].sort(() => Math.random() - 0.5);
    const cells: Cell[] = shuffled.map((text, i) => ({
      text, emoji: emoji[i % emoji.length], marked: false,
    }));
    setBoard(cells);
    setTimeLeft(120);
    setBingoCount(0);
    setTimerActive(true);
    setPhase('playing');
  };

  const toggle = (idx: number) => {
    setBoard(b => b.map((c, i) => i === idx ? { ...c, marked: !c.marked } : c));
  };

  useEffect(() => {
    let count = 0;
    BINGO_LINES.forEach(line => {
      if (line.every(i => board[i]?.marked)) count++;
    });
    setBingoCount(count);
  }, [board]);

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
                <div className="text-6xl mb-4">🎯</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Bingo</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Watch your partner through the day. Mark the squares as they do sweet things. Get a BINGO to win!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Watching
                </button>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                  <span className="text-pink-600 font-semibold">🎯 {bingoCount} BINGO{bingoCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {board.map((cell, i) => {
                    const isPart = BINGO_LINES.some(line => line.includes(i) && line.every(j => board[j]?.marked));
                    return (
                      <motion.button
                        key={i}
                        layout
                        onClick={() => toggle(i)}
                        whileTap={{ scale: 0.9 }}
                        className={`aspect-square rounded-lg text-xs sm:text-sm p-1 flex flex-col items-center justify-center text-center font-medium border-2 transition ${cell.marked ? (isPart ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white border-rose-600 shadow-lg' : 'bg-rose-200 text-rose-700 border-rose-300') : 'bg-white text-gray-700 border-rose-200 hover:border-rose-400'}`}
                      >
                        <span className="text-lg sm:text-xl mb-0.5">{cell.emoji}</span>
                        <span className="leading-tight">{cell.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
                {bingoCount > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-center bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-bold text-xl">
                    🎉 BINGO! {bingoCount} line{bingoCount !== 1 ? 's' : ''}!
                  </motion.div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Trophy className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Bingo Champion!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{bingoCount}</div>
                <p className="text-xl text-pink-600 mb-2">Bingo lines completed</p>
                <p className="text-gray-700 mb-6">
                  {bingoCount >= 3 ? 'Love Master! 💖' : bingoCount >= 1 ? 'Sweet partner detected! 💕' : 'Try again - watch closely! 👀'}
                </p>
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
