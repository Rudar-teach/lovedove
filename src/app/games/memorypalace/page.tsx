'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Heart, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const ICONS = ['💖', '💍', '🌹', '🕊️', '🎁', '💘', '💝', '💐', '❤️', '💗', '⭐', '🔥'];
const ICON_NAMES: Record<string, string> = {
  '💖': 'Heart', '💍': 'Ring', '🌹': 'Rose', '🕊️': 'Dove', '🎁': 'Gift',
  '💘': 'Arrow', '💝': 'Letter', '💐': 'Bouquet', '❤️': 'Red Heart',
  '💗': 'Growing Heart', '⭐': 'Star', '🔥': 'Flame',
};

type Card = {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
};

type RoundStats = { moves: number; time: number };

function shuffleArray(arr: any[]): any[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCards(): Card[] {
  const pairs = ICONS.slice(0, 6);
  const cards: Card[] = [];
  pairs.forEach((icon, idx) => {
    cards.push({ id: idx * 2, icon, flipped: false, matched: false });
    cards.push({ id: idx * 2 + 1, icon, flipped: false, matched: false });
  });
  return shuffleArray(cards);
}

export default function MemoryPalacePage() {
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bestStats, setBestStats] = useState<RoundStats | null>(null);
  const [allStats, setAllStats] = useState<RoundStats[]>([]);
  const [stats, setStats] = useState<{ round: number; moves: number; time: number }[]>([]);
  const runningRef = useRef(false);
  const timerRef = useRef(0);
  const flipTimeoutRef = useRef(0);

  const flipSpeed = Math.max(200, 1200 - (round - 1) * 150);

  const initRound = useCallback(() => {
    const cs = generateCards();
    setCards(cs);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setElapsed(0);
    setLocked(false);
    setGameOver(false);
    runningRef.current = true;
  }, [round]);

  useEffect(() => { initRound(); }, [round, initRound]);

  // Timer
  useEffect(() => {
    if (!runningRef.current || gameOver) return;
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameOver]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleFlip = (idx: number) => {
    if (!runningRef.current || locked) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;
    if (flippedIndices.length >= 2) return;

    const nextCards = [...cards];
    nextCards[idx] = { ...nextCards[idx], flipped: true };
    setCards(nextCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);

      if (nextCards[newFlipped[0]].icon === nextCards[newFlipped[1]].icon) {
        // Match
        setTimeout(() => {
          setCards(cs => cs.map(c => c.icon === nextCards[newFlipped[0]].icon ? { ...c, matched: true, flipped: true } : c));
          setMatchedPairs(mp => mp + 1);
          setFlippedIndices([]);
          setLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(cs => cs.map((c, i) => i === newFlipped[0] || i === newFlipped[1] ? { ...c, flipped: false } : c));
          setFlippedIndices([]);
          setLocked(false);
        }, flipSpeed);
      }
    }
  };

  // Check win
  useEffect(() => {
    if (matchedPairs === 6 && runningRef.current) {
      runningRef.current = false;
      const s = { round, moves, time: elapsed };
      const nextStats = [...stats, s];
      setStats(nextStats);
      setAllStats(prev => [...prev, s]);
      if (!bestStats || moves < bestStats.moves) setBestStats(s);

      setTimeout(() => setGameOver(true), 500);
    }
  }, [matchedPairs]);

  const nextRound = () => {
    setRound(r => r + 1);
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Memory Palace', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Memory Palace
            </h1>
            <div className="w-10" />
          </div>

          {!gameOver && cards.length > 0 && (
            <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
              <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100">
                Round {round} 💕
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
                {formatTime(elapsed)}
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
                💕 {matchedPairs}/6 pairs
              </div>
            </div>
          )}

          {!gameOver && cards.length > 0 && (
            <TiltCard>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                <div className="grid grid-cols-4 gap-2">
                  {cards.map((card, idx) => (
                    <motion.button
                      key={card.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFlip(idx)}
                      className="aspect-square rounded-xl relative"
                      style={{ perspective: 600 }}
                    >
                      <motion.div
                        animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                          <span className="text-3xl">💕</span>
                        </div>
                        <div className={`absolute inset-0 rounded-xl flex items-center justify-center shadow-md ${card.matched ? 'bg-gradient-to-br from-yellow-300 to-orange-400' : 'bg-gradient-to-br from-pink-100 to-white'} border-2 ${card.matched ? 'border-yellow-300' : 'border-pink-200'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                          <span className="text-3xl">{card.icon}</span>
                        </div>
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </TiltCard>
          )}

          {!gameOver && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Flip two cards to find matching love symbols! Find all 6 pairs. 💖
            </p>
          )}

          <AnimatePresence>
            {gameOver && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <TiltCard>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                    <h2 className="text-3xl font-display font-black gradient-text-animated">Round {round} Clear! 💖</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-pink-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500">Moves</div>
                        <div className="text-2xl font-bold text-primary-600">{moves}</div>
                      </div>
                      <div className="bg-pink-50 rounded-xl p-3">
                        <div className="text-xs text-gray-500">Time</div>
                        <div className="text-2xl font-bold text-rose-600">{formatTime(elapsed)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={nextRound} variant="primary"><Star className="w-4 h-4 mr-1" /> Next Round</Button>
                      <Button onClick={() => setRound(1)} variant="outline"><RotateCcw className="w-4 h-4 mr-1" /> New Game</Button>
                    </div>
                  </div>
                </TiltCard>

                {stats.length > 1 && (
                  <TiltCard>
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                      <h3 className="text-center font-bold text-gray-700 mb-2">📊 Score Card</h3>
                      <div className="space-y-1">
                        {stats.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm bg-pink-50 rounded-lg px-3 py-2">
                            <span className="text-gray-600">Round {s.round}</span>
                            <span className="font-bold text-primary-600">{s.moves} moves</span>
                            <span className="text-gray-500">{formatTime(s.time)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
            <Button onClick={() => setRound(1)} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="memorypalace" />
      </PremiumBackground>
  );
}
