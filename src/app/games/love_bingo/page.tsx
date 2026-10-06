'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, Trophy, Flame, Star, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type BingoPattern = 'horizontal' | 'vertical' | 'diagonal' | 'fullcard';

const ALL_ITEMS = [
  'Kiss', 'Hug', 'Dance', 'Compliment', 'Cook together', 'Stargaze',
  'Hold hands', 'Share a memory', 'Sing together', 'Give flowers',
  'Write love note', 'Take selfie', 'Feed each other', 'Whisper sweet nothings',
  'Watch sunset', 'Give massage', 'Play game', 'Go for walk',
  'Share dreams', 'Cuddle', 'Make toast', 'FIVE CORNER BINGO'
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCard(items: string[]): string[] {
  const pool = items.filter((i) => i !== 'FIVE CORNER BINGO');
  const shuffled = shuffle(pool);
  const card: string[] = [];
  // 5x5 = 25 cells; center (index 12) is FREE
  let p = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      card.push('FREE');
    } else {
      card.push(shuffled[p % shuffled.length]);
      p++;
    }
  }
  return card;
}

function checkPatterns(marked: boolean[]): { name: BingoPattern; cells: number[] }[] {
  const wins: { name: BingoPattern; cells: number[] }[] = [];
  const rows = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
  ];
  const cols = [
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
  ];
  const diags = [
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  rows.forEach((r) => {
    if (r.every((i) => marked[i])) wins.push({ name: 'horizontal', cells: r });
  });
  cols.forEach((c) => {
    if (c.every((i) => marked[i])) wins.push({ name: 'vertical', cells: c });
  });
  diags.forEach((d) => {
    if (d.every((i) => marked[i])) wins.push({ name: 'diagonal', cells: d });
  });
  if (marked.every(Boolean)) wins.push({ name: 'fullcard', cells: marked.map((_, i) => i) });
  return wins;
}

export default function LoveBingoPage() {
  const router = useRouter();
  const [card, setCard] = useState<string[]>(() => generateCard(ALL_ITEMS));
  const [marked, setMarked] = useState<boolean[]>(() => {
    const m = new Array(25).fill(false);
    m[12] = true; // FREE
    return m;
  });
  const [calledPool, setCalledPool] = useState<string[]>([]);
  const [calledOrder, setCalledOrder] = useState<string[]>([]);
  const [currentCall, setCurrentCall] = useState<string | null>(null);
  const [wins, setWins] = useState<{ name: BingoPattern; cells: number[] }[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [autoCall, setAutoCall] = useState(false);

  const toggleCell = (i: number) => {
    if (i === 12) return; // FREE can't be unmarked
    if (card[i] === 'FREE') return;
    const next = [...marked];
    next[i] = !next[i];
    setMarked(next);
    const newWins = checkPatterns(next);
    if (newWins.length > wins.length) {
      const gained = newWins.length - wins.length;
      setScore((s) => s + gained * 100);
      setStreak((s) => s + 1);
      setWins(newWins);
    }
  };

  const callNext = () => {
    if (calledPool.length === 0) {
      setCalledPool(shuffle(ALL_ITEMS));
    }
    setCalledPool((pool) => {
      if (pool.length === 0) {
        const fresh = shuffle(ALL_ITEMS);
        const next = fresh[0];
        setCurrentCall(next);
        setCalledOrder((o) => [...o, next]);
        return fresh.slice(1);
      }
      const next = pool[0];
      setCurrentCall(next);
      setCalledOrder((o) => [...o, next]);
      return pool.slice(1);
    });
  };

  const resetGame = () => {
    setCard(generateCard(ALL_ITEMS));
    const m = new Array(25).fill(false);
    m[12] = true;
    setMarked(m);
    setCalledPool([]);
    setCalledOrder([]);
    setCurrentCall(null);
    setWins([]);
    setScore(0);
    setStreak(0);
  };

  useEffect(() => {
    if (!autoCall) return;
    const t = setInterval(() => {
      callNext();
    }, 1800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCall]);

  const winSet = new Set<number>();
  wins.forEach((w) => w.cells.forEach((c) => winSet.add(c)));

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
            className="text-5xl font-bold bg-gradient-to-r from-rose-300 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent"
          >
            Love Bingo
          </motion.h1>
          <p className="text-rose-100/80 mt-2 flex items-center justify-center gap-2">
            <Heart size={16} className="text-rose-400" /> Mark your card as items are called
            <Heart size={16} className="text-rose-400" />
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Trophy, label: 'Score', value: score, color: 'text-amber-300' },
            { icon: Flame, label: 'Streak', value: streak, color: 'text-orange-300' },
            { icon: Target, label: 'Patterns', value: wins.length, color: 'text-emerald-300' },
            { icon: Sparkles, label: 'Called', value: calledOrder.length, color: 'text-fuchsia-300' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={18} className={s.color} />
                <span className="text-xs uppercase text-rose-100/70">{s.label}</span>
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Caller */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-rose-500/10 to-pink-500/10 backdrop-blur-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs uppercase tracking-widest text-rose-200/70 mb-1">Now Calling</div>
              <AnimatePresence mode="wait">
                {currentCall ? (
                  <motion.div
                    key={currentCall + calledOrder.length}
                    initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-3xl md:text-4xl font-extrabold text-white"
                  >
                    {currentCall}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl text-rose-200/60 italic"
                  >
                    Press Call Next to begin
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={callNext}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold shadow-lg shadow-rose-500/40 transition"
              >
                <Zap size={18} className="inline -mt-1 mr-1" /> Call Next
              </button>
              <button
                onClick={() => setAutoCall((a) => !a)}
                className={`px-5 py-3 rounded-full font-semibold transition border ${
                  autoCall
                    ? 'bg-fuchsia-500/30 border-fuchsia-300 text-white'
                    : 'bg-white/5 border-white/10 text-rose-100 hover:bg-white/10'
                }`}
              >
                {autoCall ? 'Stop Auto' : 'Auto Call'}
              </button>
              <button
                onClick={resetGame}
                className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-rose-100 hover:bg-white/10 transition"
              >
                New Card
              </button>
            </div>
          </div>
        </div>

        {/* Bingo Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 mb-6">
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {card.map((label, i) => {
              const isWin = winSet.has(i);
              const isFree = i === 12 || label === 'FREE';
              return (
                <motion.button
                  key={`${i}-${label}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCell(i)}
                  className={`relative aspect-square rounded-xl md:rounded-2xl border p-1 md:p-2 flex items-center justify-center text-center text-[10px] sm:text-xs md:text-sm font-semibold transition-all ${
                    isFree
                      ? 'bg-gradient-to-br from-amber-300 to-pink-400 border-amber-200 text-rose-900'
                      : marked[i]
                      ? isWin
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200 text-white shadow-lg shadow-emerald-500/40'
                        : 'bg-gradient-to-br from-rose-500 to-pink-500 border-rose-300 text-white'
                      : 'bg-white/5 border-white/15 text-rose-50 hover:bg-white/10'
                  }`}
                >
                  {isFree ? (
                    <div className="flex flex-col items-center">
                      <Star size={18} className="mb-0.5" />
                      <span className="leading-none">FREE</span>
                    </div>
                  ) : (
                    <span className="leading-tight">{label}</span>
                  )}
                  {marked[i] && !isFree && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Heart size={12} className="fill-white text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Called Items */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 mb-6">
          <div className="text-xs uppercase tracking-widest text-rose-200/70 mb-2 flex items-center gap-2">
            <Sparkles size={14} /> Called Items ({calledOrder.length})
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {calledOrder.length === 0 && (
              <span className="text-rose-100/50 text-sm italic">No items called yet…</span>
            )}
            {calledOrder.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-300/30 text-rose-100 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Wins */}
        {wins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-emerald-300/30 bg-emerald-500/10 backdrop-blur-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={22} className="text-amber-300" />
              <span className="text-xl font-bold text-white">Patterns Completed!</span>
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

        <div className="text-center mt-8">
          <Link
            href="/games"
            className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
          >
            Browse More Games
          </Link>
        </div>
      </div>
    </div>
  );
}