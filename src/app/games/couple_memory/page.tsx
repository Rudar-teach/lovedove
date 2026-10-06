'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const CARD_PAIRS = [
  '💘', '💖', '💗', '💓', '💕', '💝', '❤️', '💞',
  '💘', '💖', '💗', '💓', '💕', '💝', '❤️', '💞',
];

type CardType = { id: number; emoji: string; flipped: boolean; matched: boolean };

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CoupleMemory() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const startGame = useCallback(() => {
    const shuffledCards = shuffleArray(CARD_PAIRS).map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
      matched: false,
    }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsLocked(false);
    setGameState('playing');
  }, []);

  const flipCard = useCallback((index: number) => {
    if (isLocked) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;
    if (flippedIndices.length === 2) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, matched: true } : c));
        setMatches(m => m + 1);
        setFlippedIndices([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, flipped: false } : c));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [cards, flippedIndices, isLocked]);

  useEffect(() => {
    if (matches === CARD_PAIRS.length / 2 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [matches, gameState]);

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🧠</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Memory Game</h1>
              <p className="text-gray-600 mb-8 text-lg">Match the love hearts in this memory challenge!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-2">Rules:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🧠 Flip two cards at a time</li>
                  <li>🧠 Match all 8 pairs of hearts</li>
                  <li>🧠 Fewer moves = better memory!</li>
                  <li>🧠 Test your memory together!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Play className="w-5 h-5 inline mr-2" /> Start Game</button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4 flex justify-center gap-6">
                <span className="text-sm font-medium text-gray-600">Moves: <span className="font-bold text-purple-600">{moves}</span></span>
                <span className="text-sm font-medium text-gray-600">Matches: <span className="font-bold text-pink-600">{matches}/{CARD_PAIRS.length / 2}</span></span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {cards.map((card, i) => (
                  <motion.button
                    key={card.id}
                    onClick={() => flipCard(i)}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                  >
                    <AnimatePresence>
                      {card.flipped || card.matched ? (
                        <motion.div
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: 90, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                        >
                          {card.emoji}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: 0 }}
                          className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center"
                        >
                          <Heart className="w-8 h-8 text-white/50" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing Memory!</h2>
              <p className="text-gray-600 mb-8">Completed in {moves} moves with {matches} matches!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-purple-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Performance:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4"><p className="text-sm text-gray-600">Moves</p><p className="text-2xl font-black text-purple-600">{moves}</p></div>
                  <div className="bg-pink-50 rounded-xl p-4"><p className="text-sm text-gray-600">Matches</p><p className="text-2xl font-black text-pink-600">{matches}/{CARD_PAIRS.length / 2}</p></div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
