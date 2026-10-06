'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';
type Depth = 'spicy' | 'deep' | 'fun';

interface Truth {
  text: string;
  depth: Depth;
  category: string;
}

const TRUTHS: Truth[] = [
  { text: "What's the very first thing you noticed about me?", depth: 'fun', category: 'First Impressions' },
  { text: "What's a secret fantasy you've never told me?", depth: 'spicy', category: 'Dreams' },
  { text: "What scares you most about our future together?", depth: 'deep', category: 'Fears' },
  { text: "If you could change one thing about us, what would it be?", depth: 'deep', category: 'Growth' },
  { text: "What's the most embarrassing thing you've done for love?", depth: 'fun', category: 'Memories' },
  { text: "When did you first realize you were falling for me?", depth: 'deep', category: 'Milestones' },
  { text: "What's your favorite physical feature of mine?", depth: 'spicy', category: 'Desire' },
  { text: "Have you ever kept a secret from me to protect my feelings?", depth: 'deep', category: 'Honesty' },
  { text: "What's the wildest place you'd want to kiss me?", depth: 'spicy', category: 'Desire' },
  { text: "What's a love song that makes you think of me?", depth: 'fun', category: 'Music' },
  { text: "What's the best lesson a past relationship taught you?", depth: 'deep', category: 'Growth' },
  { text: "What small thing do I do that drives you crazy (in a good way)?", depth: 'fun', category: 'Quirks' },
  { text: "If we had a year alone together, what would you want to do most?", depth: 'spicy', category: 'Dreams' },
  { text: "What part of me do you think changes when no one's watching?", depth: 'deep', category: 'Vulnerability' },
  { text: "What's the biggest compliment you'd love to give me but haven't?", depth: 'deep', category: 'Words' },
  { text: "Describe our love in one word.", depth: 'fun', category: 'Essence' },
  { text: "What's something you'd love to try together that we haven't?", depth: 'fun', category: 'Bucket List' },
  { text: "What's the most romantic thing you've ever imagined doing for me?", depth: 'spicy', category: 'Romance' },
];

const DEPTH_COLORS: Record<Depth, string> = {
  spicy: 'from-red-500 to-orange-500',
  deep: 'from-purple-500 to-indigo-500',
  fun: 'from-pink-500 to-rose-500',
};

const DEPTH_LABEL: Record<Depth, string> = {
  spicy: '🌶️ Spicy',
  deep: '💭 Deep',
  fun: '🎈 Fun',
};

export default function LoveTruthsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentTruth, setCurrentTruth] = useState<Truth | null>(null);
  const [deck, setDeck] = useState<Truth[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  const startGame = (depthFilter: Depth | 'all') => {
    const pool = depthFilter === 'all' ? TRUTHS : TRUTHS.filter(t => t.depth === depthFilter);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentTruth(shuffled[0]);
    setRevealedCount(1);
    setFavorites([]);
    setPhase('playing');
  };

  const nextTruth = () => {
    if (revealedCount >= deck.length) {
      setPhase('finished');
      return;
    }
    setCurrentTruth(deck[revealedCount]);
    setRevealedCount(c => c + 1);
  };

  const toggleFavorite = () => {
    if (!currentTruth) return;
    const idx = deck.indexOf(currentTruth);
    setFavorites(f => f.includes(idx) ? f.filter(x => x !== idx) : [...f, idx]);
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
                <div className="text-6xl mb-4">💬</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Truths</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Draw honest, intimate questions for your partner. Spark deep conversations, laughs, and tender moments.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Choose a Mood</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => startGame('all')} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3 rounded-xl hover:scale-105 transition">All Truths 💝</button>
                    <button onClick={() => startGame('fun')} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-xl hover:scale-105 transition">Fun 🎈</button>
                    <button onClick={() => startGame('deep')} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl hover:scale-105 transition">Deep 💭</button>
                    <button onClick={() => startGame('spicy')} className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-xl hover:scale-105 transition">Spicy 🌶️</button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && currentTruth && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-4 text-rose-700 text-sm">
                  Truth {revealedCount} / {deck.length} • Favorites: {favorites.length}
                </div>
                <div className="w-full bg-rose-100 h-2 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all" style={{ width: `${(revealedCount / deck.length) * 100}%` }} />
                </div>
                <motion.div key={revealedCount} initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.6 }} className={`bg-gradient-to-br ${DEPTH_COLORS[currentTruth.depth]} rounded-3xl p-10 shadow-2xl text-white text-center min-h-[280px] flex flex-col justify-center`}>
                  <div className="text-sm uppercase tracking-widest mb-3 opacity-90">{DEPTH_LABEL[currentTruth.depth]} • {currentTruth.category}</div>
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <p className="text-2xl font-medium leading-relaxed">{currentTruth.text}</p>
                </motion.div>
                <div className="flex gap-3 mt-6 justify-center">
                  <button onClick={toggleFavorite} className="bg-white/80 px-5 py-3 rounded-full text-rose-600 hover:bg-white transition">
                    {favorites.includes(deck.indexOf(currentTruth)) ? '💖 Saved' : '🤍 Save'}
                  </button>
                  <button onClick={nextTruth} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                    {revealedCount >= deck.length ? 'See Results' : 'Next Truth →'}
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Connection Complete!</h2>
                <p className="text-gray-700 mb-4">You explored {deck.length} truths together</p>
                <p className="text-2xl font-semibold text-pink-600 mb-6">💖 {favorites.length} favorites saved</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setPhase('idle')} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
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
