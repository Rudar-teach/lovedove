'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const ALL_SQUARES = [
  "Had a silly fight", "Watched a sunset together", "Shared a romantic meal", "Said 'I love you'",
  "Cooked together", "Danced in the kitchen", "Watched a movie cuddled", "Sent a sweet text",
  "Made each other laugh", "Held hands in public", "Gave a surprise gift", "Shared a long hug",
  "Took a selfie together", "Played a game together", "Sang a duet", "Made breakfast in bed",
  "Said 'good morning' first", "Kissed before sleeping", "Complimented each other", "Planned a future trip",
  "Stargazed together", "Built a pillow fort", "Made a playlist for partner", "Tried a new recipe",
  "Exchanged love letters", "Went on a midnight walk", "Solved a puzzle together", "Made a TikTok/Video",
  "Said sorry first", "Gave a back massage", "Brought flowers unexpectedly", "Took a nap together",
  "Wore matching outfits", "Made a wish together", "Played a board game", "Shared a secret",
  "Toasted marshmallows", "Made each other coffee", "Wrote a love note", "Visited a new place together",
  "Made a bucket list", "Cried happy tears together", "Sang karaoke", "Called just to say hi",
  "Said 'I miss you'", "Danced to 'our song'", "Took silly photos", "Watched the sunrise",
];

const WIN_LINES = [
  // Rows
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

export default function RelationshipBingoPage() {
  const [card, setCard] = useState<string[]>([]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [won, setWon] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [player1, setPlayer1] = useState({ name: 'Player 1', score: 0 });
  const [player2, setPlayer2] = useState({ name: 'Player 2', score: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [moves, setMoves] = useState(0);

  const newCard = useCallback(() => {
    const shuffled = [...ALL_SQUARES].sort(() => Math.random() - 0.5);
    setCard(shuffled.slice(0, 25));
    setMarked(new Set());
    setWon(false);
    setWinningLine([]);
    setMoves(0);
    setPlayer1(p => ({ ...p, score: 0 }));
    setPlayer2(p => ({ ...p, score: 0 }));
    setCurrentPlayer(1);
  }, []);

  useEffect(() => {
    newCard();
  }, [newCard]);

  const toggleSquare = (index: number) => {
    if (won) return;
    const next = new Set(marked);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setMarked(next);
    setMoves(m => m + 1);

    // Check win
    for (const line of WIN_LINES) {
      if (line.every(i => next.has(i))) {
        setWon(true);
        setWinningLine(line);
        if (currentPlayer === 1) {
          setPlayer1(p => ({ ...p, score: p.score + 1 }));
        } else {
          setPlayer2(p => ({ ...p, score: p.score + 1 }));
        }
        return;
      }
    }
    setCurrentPlayer(p => p === 1 ? 2 : 1);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Relationship Bingo
            </h1>
            <button onClick={newCard} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Players */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-2xl border-2 transition-all ${currentPlayer === 1 ? 'bg-primary-100 border-primary-400' : 'bg-white/70 border-pink-100'}`}>
              <p className="text-xs text-gray-500 uppercase font-semibold">Player 1</p>
              <input
                value={player1.name}
                onChange={e => setPlayer1(p => ({ ...p, name: e.target.value }))}
                className="bg-transparent font-bold text-gray-800 outline-none w-full"
              />
              <p className="text-sm text-primary-600 font-bold mt-1">Bingos: {player1.score}</p>
            </div>
            <div className={`p-3 rounded-2xl border-2 transition-all ${currentPlayer === 2 ? 'bg-rose-100 border-rose-400' : 'bg-white/70 border-pink-100'}`}>
              <p className="text-xs text-gray-500 uppercase font-semibold">Player 2</p>
              <input
                value={player2.name}
                onChange={e => setPlayer2(p => ({ ...p, name: e.target.value }))}
                className="bg-transparent font-bold text-gray-800 outline-none w-full"
              />
              <p className="text-sm text-rose-600 font-bold mt-1">Bingos: {player2.score}</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-2 font-semibold">
            {won ? '🎉 BINGO!' : `${currentPlayer === 1 ? player1.name : player2.name}&apos;s turn — tap a square`}
          </p>

          <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3">
              <div className="grid grid-cols-5 gap-1.5">
                {card.map((square, i) => {
                  const isMarked = marked.has(i);
                  const isWinning = winningLine.includes(i);
                  return (
                    <motion.button
                      key={i}
                      whileTap={won ? {} : { scale: 0.95 }}
                      onClick={() => toggleSquare(i)}
                      disabled={won}
                      className={`
                        aspect-square rounded-xl border-2 text-xs sm:text-sm font-semibold p-1
                        flex items-center justify-center text-center transition-all
                        ${isWinning ? 'bg-gradient-to-br from-yellow-200 to-orange-300 border-yellow-500 text-yellow-900 scale-105 shadow-lg' : ''}
                        ${isMarked && !isWinning ? 'bg-gradient-to-br from-primary-300 to-rose-300 border-primary-500 text-white' : ''}
                        ${!isMarked ? 'bg-white border-pink-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50' : ''}
                      `}
                    >
                      {isWinning ? '💖' : isMarked ? '❤️' : square}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </TiltCard>

          <p className="text-center text-sm text-gray-500 mt-3">
            Mark each experience you&apos;ve shared. Get 5 in a row to win! Tap again to unmark.
          </p>

          <AnimatePresence>
            {won && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 text-center space-y-3 bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                <p className="text-2xl font-bold text-primary-600">
                  {currentPlayer === 1 ? player1.name : player2.name} Got BINGO! 🎉
                </p>
                <p className="text-gray-600">In {moves} turns</p>
                <Button onClick={newCard} variant="primary">
                  New Card 🔀
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
            <Button onClick={newCard} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" /> New Card
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="relationshipbingo" />
      </PremiumBackground>
  );
}
