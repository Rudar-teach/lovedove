'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface CardData {
  id: number;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

const PAIRS: { emoji: string; label: string }[] = [
  { emoji: '💕', label: 'Love' },
  { emoji: '💋', label: 'Kiss' },
  { emoji: '🌹', label: 'Rose' },
  { emoji: '🫂', label: 'Hug' },
  { emoji: '💍', label: 'Ring' },
  { emoji: '🌙', label: 'Date Night' },
  { emoji: '✍️', label: 'Letter' },
  { emoji: '🎵', label: 'Song' },
];

export default function HeartmatchPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [checking, setChecking] = useState(false);

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
    const shuffled = [...PAIRS, ...PAIRS]
      .map((p, i) => ({ ...p, id: i }))
      .sort(() => Math.random() - 0.5)
      .map((p, idx) => ({ ...p, id: p.id, cardId: idx, flipped: false, matched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setScore(0);
    setMatchedPairs(0);
    setTimeLeft(90);
    setTimerActive(true);
    setChecking(false);
    setPhase('playing');
  };

  const handleFlip = (idx: number) => {
    if (checking) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (flipped.length >= 2) return;

    setCards(c => c.map((card, i) => i === idx ? { ...card, flipped: true } : card));
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setChecking(true);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards(c => c.map((card, i) => i === first || i === second ? { ...card, matched: true } : card));
          setMatchedPairs(p => p + 1);
          setScore(s => s + 15);
          setFlipped([]);
          setChecking(false);
          if (matchedPairs + 1 >= PAIRS.length) {
            setTimerActive(false);
            setPhase('finished');
          }
        }, 500);
      } else {
        setMoves(m => m + 1);
        setTimeout(() => {
          setCards(c => c.map((card, i) => i === first || i === second ? { ...card, flipped: false } : card));
          setFlipped([]);
          setChecking(false);
        }, 1000);
      }
    }
  };

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
                <div className="text-6xl mb-4">💞</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Heart Match</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Memory match with romantic cards! Match all 8 pairs of love symbols together.</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Matching
                </button>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-rose-600 font-semibold">💞 {matchedPairs}/{PAIRS.length}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {cards.map((card, i) => (
                    <motion.button
                      key={card.cardId}
                      onClick={() => handleFlip(i)}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg ${card.flipped || card.matched ? 'bg-white rotate-0' : 'bg-gradient-to-br from-rose-400 to-pink-500 rotate-180'}`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {card.flipped || card.matched ? card.emoji : '💕'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Matched!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-2">{moves} moves</p>
                <p className="text-gray-700 mb-6">
                  {moves <= 8 ? 'Perfect memory, lovebirds! 🧠' : moves <= 15 ? 'Great teamwork! 💖' : 'Every pair counts! 💕'}
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
