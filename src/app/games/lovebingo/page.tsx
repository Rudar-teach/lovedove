'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, Timer as TimerIcon, Trophy, Zap, Play, RotateCcw, Star, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type SpeedPattern = 'line' | 'corners' | 'cross' | 'blackout';

interface SpeedItem {
  label: string;
  emoji: string;
  seconds: number;
}

const SPEED_ITEMS: SpeedItem[] = [
  { label: 'Sing a song', emoji: '🎤', seconds: 20 },
  { label: 'Do 10 push-ups', emoji: '💪', seconds: 25 },
  { label: 'Say I love you 3 ways', emoji: '💖', seconds: 15 },
  { label: 'Impress partner', emoji: '✨', seconds: 30 },
  { label: "Do partner's accent", emoji: '🗣️', seconds: 25 },
  { label: 'Dance 30 secs', emoji: '💃', seconds: 30 },
  { label: 'Draw on partner', emoji: '✏️', seconds: 35 },
  { label: 'High five 5 times', emoji: '🙌', seconds: 15 },
  { label: 'Tell a joke', emoji: '😂', seconds: 20 },
  { label: 'Puppy eyes contest', emoji: '🥺', seconds: 15 },
  { label: 'Feed each other blind', emoji: '🍓', seconds: 30 },
  { label: 'Best impression of partner', emoji: '🎭', seconds: 35 },
  { label: 'Whisper a secret', emoji: '🤫', seconds: 15 },
  { label: 'Create a rap', emoji: '🎶', seconds: 30 },
  { label: 'Do the robot', emoji: '🤖', seconds: 20 },
  { label: 'Pinky swear', emoji: '🤙', seconds: 10 },
  { label: 'Eyes locked for 60s', emoji: '👀', seconds: 60 },
  { label: 'Build a tower', emoji: '🏗️', seconds: 40 },
  { label: 'Shadow puppet show', emoji: '🐶', seconds: 25 },
  { label: "Guess what I'm thinking", emoji: '🧠', seconds: 20 },
  { label: 'Make a face', emoji: '🤪', seconds: 10 },
  { label: 'Spin and kiss', emoji: '💋', seconds: 15 },
  { label: 'BUZZ', emoji: '⚡', seconds: 5 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCard(): SpeedItem[] {
  const pool = shuffle(SPEED_ITEMS).slice(0, 24);
  const card: SpeedItem[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      card.push({ label: 'FREE', emoji: '⭐', seconds: 0 });
    } else {
      card.push(pool[card.filter((c) => c.label !== 'FREE').length]);
    }
  }
  return card;
}

function checkPatterns(marked: boolean[]): { name: SpeedPattern; cells: number[] }[] {
  const wins: { name: SpeedPattern; cells: number[] }[] = [];
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
  ];
  lines.forEach((l) => {
    if (l.every((i) => marked[i])) wins.push({ name: 'line', cells: l });
  });
  const corners = [0, 4, 20, 24];
  if (corners.every((i) => marked[i])) wins.push({ name: 'corners', cells: corners });
  const cross = [2, 7, 10, 11, 12, 13, 14, 15, 17, 22];
  if (cross.every((i) => marked[i])) wins.push({ name: 'cross', cells: cross });
  if (marked.every(Boolean)) wins.push({ name: 'blackout', cells: marked.map((_, i) => i) });
  return wins;
}

export default function LoveBingoSpeedPage() {
  const router = useRouter();
  const [card, setCard] = useState<SpeedItem[]>(() => generateCard());
  const [marked, setMarked] = useState<boolean[]>(() => {
    const m = new Array(25).fill(false);
    m[12] = true;
    return m;
  });
  const [timeLeft, setTimeLeft] = useState(90);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState<{ name: SpeedPattern; cells: number[] }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTime, setActiveTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    resetGame();
    setRunning(true);
    setTimeLeft(90);
  };

  const stopGame = () => {
    setRunning(false);
    if (tickRef.current) clearInterval(tickRef.current);
    if (activeRef.current) clearInterval(activeRef.current);
    setActiveIndex(null);
  };

  const resetGame = () => {
    setCard(generateCard());
    const m = new Array(25).fill(false);
    m[12] = true;
    setMarked(m);
    setScore(0);
    setStreak(0);
    setWins([]);
    setActiveIndex(null);
    setActiveTime(0);
    if (tickRef.current) clearInterval(tickRef.current);
    if (activeRef.current) clearInterval(activeRef.current);
  };

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopGame();
          setScore((s) => {
            setHighScore((h) => Math.max(h, s));
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (activeIndex === null) return;
    activeRef.current = setInterval(() => {
      setActiveTime((t) => t + 0.1);
    }, 100);
    return () => {
      if (activeRef.current) clearInterval(activeRef.current);
    };
  }, [activeIndex]);

  const startCell = (i: number) => {
    if (!running) return;
    if (marked[i] || i === 12) return;
    setActiveIndex(i);
    setActiveTime(0);
  };

  const completeCell = () => {
    if (activeIndex === null) return;
    const cell = card[activeIndex];
    const target = cell.seconds;
    if (activeTime <= target) {
      const bonus = Math.max(10, Math.floor((target - activeTime) * 10));
      const next = [...marked];
      next[activeIndex] = true;
      setMarked(next);
      setScore((s) => s + bonus + 50);
      setStreak((s) => s + 1);
      const newWins = checkPatterns(next);
      if (newWins.length > wins.length) {
        setScore((s) => s + (newWins.length - wins.length) * 250);
        setWins(newWins);
      }
    } else {
      setScore((s) => Math.max(0, s - 20));
      setStreak(0);
    }
    setActiveIndex(null);
    setActiveTime(0);
  };

  const cancelCell = () => {
    setActiveIndex(null);
    setActiveTime(0);
  };

  const winSet = new Set<number>();
  wins.forEach((w) => w.cells.forEach((c) => winSet.add(c)));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PremiumBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-rose-200 hover:text-white transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent"
          >
            Speed Love Bingo
          </motion.h1>
          <p className="text-rose-100/80 mt-2 flex items-center justify-center gap-2">
            <Flame size={16} className="text-orange-300" />
            Race the clock — complete challenges before time runs out
            <Flame size={16} className="text-orange-300" />
          </p>
        </div>

        {/* Timer + Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div
            animate={{ scale: timeLeft <= 10 && running ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 && running ? Infinity : 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 col-span-2 md:col-span-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <TimerIcon size={18} className="text-amber-300" />
              <span className="text-xs uppercase text-rose-100/70">Timer</span>
            </div>
            <div className={`text-3xl font-mono ${timeLeft <= 10 ? 'text-rose-300' : 'text-amber-300'}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </motion.div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={18} className="text-yellow-300" />
              <span className="text-xs uppercase text-rose-100/70">Score</span>
            </div>
            <div className="text-3xl font-bold text-yellow-300">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={18} className="text-orange-300" />
              <span className="text-xs uppercase text-rose-100/70">Streak</span>
            </div>
            <div className="text-3xl font-bold text-orange-300">{streak}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star size={18} className="text-fuchsia-300" />
              <span className="text-xs uppercase text-rose-100/70">Best</span>
            </div>
            <div className="text-3xl font-bold text-fuchsia-300">{highScore}</div>
          </div>
        </div>

        {/* Active challenge */}
        <AnimatePresence>
          {activeIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-xl p-6 mb-6"
            >
              <div className="text-xs uppercase tracking-widest text-amber-200/80 mb-1">Active Challenge</div>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                {card[activeIndex].emoji} {card[activeIndex].label}
              </div>
              <div className="flex items-center gap-3 text-rose-100">
                <span className="text-sm">Time limit: {card[activeIndex].seconds}s</span>
                <span className="text-sm">Elapsed: {activeTime.toFixed(1)}s</span>
              </div>
              <div className="mt-3 h-2 bg-white/10 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (activeTime / card[activeIndex].seconds) * 100)}%` }}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={completeCell}
                  className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
                >
                  Done!
                </button>
                <button
                  onClick={cancelCell}
                  className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {!running ? (
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-semibold shadow-lg shadow-rose-500/40"
            >
              <Play size={18} className="inline -mt-1 mr-1" /> Start 90s Speed Run
            </button>
          ) : (
            <button
              onClick={stopGame}
              className="px-6 py-3 rounded-full bg-rose-500/30 border border-rose-300 text-white"
            >
              Stop
            </button>
          )}
          <button
            onClick={() => {
              stopGame();
              resetGame();
            }}
            className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-rose-100 hover:bg-white/10"
          >
            <RotateCcw size={16} className="inline -mt-1 mr-1" /> New Card
          </button>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 mb-6">
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {card.map((item, i) => {
              const isWin = winSet.has(i);
              const isFree = item.label === 'FREE' || i === 12;
              const isActive = activeIndex === i;
              return (
                <motion.button
                  key={`${i}-${item.label}`}
                  whileHover={running && !isFree && !marked[i] ? { scale: 1.05 } : {}}
                  whileTap={running && !isFree && !marked[i] ? { scale: 0.95 } : {}}
                  onClick={() => startCell(i)}
                  disabled={!running || isFree || marked[i]}
                  className={`relative aspect-square rounded-xl md:rounded-2xl border p-1 md:p-2 flex flex-col items-center justify-center text-center transition-all ${
                    isFree
                      ? 'bg-gradient-to-br from-amber-300 to-rose-400 border-amber-200 text-rose-900'
                      : marked[i]
                      ? isWin
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200 text-white shadow-lg shadow-emerald-500/40'
                        : 'bg-gradient-to-br from-fuchsia-500 to-rose-500 border-fuchsia-300 text-white'
                      : isActive
                      ? 'bg-gradient-to-br from-orange-400/40 to-amber-400/40 border-orange-200 text-white animate-pulse'
                      : 'bg-white/5 border-white/15 text-rose-50 hover:bg-white/10'
                  }`}
                >
                  {isFree ? (
                    <>
                      <Star size={20} />
                      <span className="text-[10px] sm:text-xs font-bold">FREE</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl md:text-2xl">{item.emoji}</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold leading-tight mt-1">
                        {item.label}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-amber-200/80 mt-0.5">
                        {item.seconds}s
                      </span>
                    </>
                  )}
                  {marked[i] && !isFree && (
                    <div className="absolute top-1 right-1">
                      <Heart size={12} className="fill-white text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Wins */}
        <AnimatePresence>
          {wins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-emerald-300/30 bg-emerald-500/10 backdrop-blur-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={22} className="text-amber-300" />
                <span className="text-xl font-bold text-white">Patterns Hit!</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wins.map((w, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-emerald-500/30 border border-emerald-300 text-white font-semibold capitalize"
                  >
                    {w.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!running && timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-rose-300/30 bg-rose-500/10 backdrop-blur-xl p-6 text-center mb-6"
          >
            <Sparkles size={28} className="mx-auto text-rose-300 mb-2" />
            <h3 className="text-2xl font-bold text-white mb-1">Time&apos;s up!</h3>
            <p className="text-rose-100">Final score: {score}</p>
          </motion.div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/games"
            className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            Browse More Games
          </Link>
        </div>
      </div>
    </div>
  );
}