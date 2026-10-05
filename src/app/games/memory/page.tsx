'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const EMOJIS = ['💕', '💖', '💗', '💓', '💝', '💘', '❤️', '🕊️'];

type CardState = { emoji: string; id: number; isFlipped: boolean; isMatched: boolean };

export default function MemoryPage() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [matches, setMatches] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const shuffle = () => {
    const deck = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({
      emoji,
      id: i,
      isFlipped: false,
      isMatched: false,
    })).sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
    setMatches(0);
  };

  useEffect(() => {
    shuffle();
    createSession();
  }, []);

  const createSession = async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'memory',
      players: [authSession.user.id],
      game_state: { cards: [], flipped: [] },
      status: 'waiting',
      current_turn: authSession.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  const handleCardClick = async (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    setCards(prev => prev.map((c, i) => i === index ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [i1, i2] = newFlipped;
      if (cards[i1].emoji === cards[i2].emoji) {
        setCards(prev => prev.map((c, i) => i === i1 || i === i2 ? { ...c, isMatched: true } : c));
        setMatches(m => m + 1);
        setFlippedIndices([]);
        if (matches + 1 === EMOJIS.length) {
          setGameOver(true);
          saveGame();
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === i1 || i === i2 ? { ...c, isFlipped: false } : c));
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const saveGame = async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) return;
    if (sessionId) {
      await supabase.from('game_sessions').update({ status: 'completed' }).eq('id', sessionId);
    }
    const { data: existing } = await supabase.from('game_stats').select('*').eq('user_id', authSession.user.id).eq('game_type', 'memory').single();
    if (existing) {
      await supabase.from('game_stats').update({
        games_played: existing.games_played + 1,
        wins: existing.wins + 1,
        total_time_played: existing.total_time_played + 60,
        last_played: new Date().toISOString(),
      }).eq('id', existing.id);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Memory Match
            </h1>
            <button onClick={shuffle} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white/70 backdrop-blur-xl px-5 py-2 rounded-2xl shadow-lg border border-pink-100/60">
              <p className="text-sm text-gray-500">Moves</p>
              <p className="text-2xl font-bold text-gray-900">{moves}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl px-5 py-2 rounded-2xl shadow-lg border border-pink-100/60">
              <p className="text-sm text-gray-500">Matches</p>
              <p className="text-2xl font-bold text-primary-600">{matches}/{EMOJIS.length}</p>
            </div>
          </div>

          <AnimatePresence>
            {gameOver && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                <p className="text-2xl font-bold text-primary-600">🎉 You won in {moves} moves!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              <div className="grid grid-cols-4 gap-3">
                {cards.map((card, index) => (
                  <motion.button
                    key={card.id}
                    whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                    whileTap={{ scale: card.isFlipped || card.isMatched ? 1 : 0.95 }}
                    onClick={() => handleCardClick(index)}
                    className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-500 ${
                      card.isFlipped || card.isMatched
                        ? 'bg-white shadow-lg border-2 border-primary-200 rotate-0'
                        : 'bg-gradient-to-br from-primary-400 to-rose-500 shadow-lg rotate-180'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? card.emoji : '💕'}
                  </motion.button>
                ))}
              </div>
            </div>
          </TiltCard>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
