'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Sparkles, MessageCircle, Flame, Users } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'spinning' | 'question' | 'finished';
type Depth = 'spicy' | 'deep' | 'fun';
type GameMode = 'solo' | 'couple';

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
  { text: "What's the first song that comes to mind when you think of us?", depth: 'fun', category: 'Music' },
  { text: "What's a childhood dream that still lives inside you?", depth: 'deep', category: 'Dreams' },
  { text: "When do you feel most connected to me?", depth: 'deep', category: 'Connection' },
  { text: "What's something you've always wanted to ask me but were afraid?", depth: 'deep', category: 'Honesty' },
  { text: "What makes you laugh the hardest when we're together?", depth: 'fun', category: 'Memories' },
  { text: "If you could relive our first kiss, would you change anything?", depth: 'spicy', category: 'Romance' },
  { text: "What's the most vulnerable you've ever felt around me?", depth: 'deep', category: 'Vulnerability' },
];

const DEPTH_COLORS: Record<Depth, string> = {
  spicy: 'from-red-500 to-orange-500',
  deep: 'from-purple-500 to-indigo-500',
  fun: 'from-pink-500 to-rose-500',
};

const DEPTH_LABEL: Record<Depth, string> = {
  spicy: 'Spicy',
  deep: 'Deep',
  fun: 'Fun',
};

const DEPTH_POINTS: Record<Depth, number> = { spicy: 50, deep: 30, fun: 20 };

export default function LoveTruthsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<GameMode>('couple');
  const [spinAngle, setSpinAngle] = useState(0);
  const [currentTruth, setCurrentTruth] = useState<Truth | null>(null);
  const [deck, setDeck] = useState<Truth[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [rounds, setRounds] = useState(0);

  const pickRandom = useCallback((existing: Truth[]) => {
    const available = TRUTHS.filter(t => !existing.includes(t));
    if (available.length === 0) { const all = [...TRUTHS].sort(() => Math.random() - 0.5); return all[0]; }
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const startGame = (depthFilter: Depth | 'all') => {
    const pool = depthFilter === 'all' ? TRUTHS : TRUTHS.filter(t => t.depth === depthFilter);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setTotalScore(0);
    setRounds(0);
    setFavorites([]);
    setPhase('idle');
  };

  const spin = () => {
    const spins = 8 + Math.random() * 6;
    const angle = spins * 360 + Math.random() * 360;
    setSpinAngle(a => a + angle);
    setPhase('spinning');
    setRounds(r => r + 1);

    setTimeout(() => {
      const used = deck.slice(0, revealedCount);
      const q = pickRandom(used);
      setCurrentTruth(q);
      setPhase('question');
    }, 2500);
  };

  const answerQuestion = () => {
    if (!currentTruth) return;
    const pts = DEPTH_POINTS[currentTruth.depth] + (mode === 'couple' ? 15 : 0);
    setTotalScore(s => s + pts);
    const newRevealed = [...deck.slice(0, revealedCount), currentTruth];
    if (newRevealed.length >= 5) setPhase('finished');
    else {
      setRevealedCount(revealedCount + 1);
      setCurrentTruth(null);
      setPhase('idle');
    }
  };

  const toggleFavorite = () => {
    if (!currentTruth) return;
    const idx = deck.indexOf(currentTruth);
    setFavorites(f => f.includes(idx) ? f.filter(x => x !== idx) : [...f, idx]);
  };

  const reset = () => {
    setSpinAngle(0);
    setRevealedCount(0);
    setTotalScore(0);
    setRounds(0);
    setFavorites([]);
    setCurrentTruth(null);
    setPhase('idle');
  };

  const segAngle = 360 / TRUTHS.length;

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span className="font-bold text-gray-700">Love Truths</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💬</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Truths</h1>
              <p className="text-gray-600 mb-6 text-lg">Spin the wheel to get a truth question! Answer honestly and earn points.</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> Game Mode</h3>
                <div className="space-y-3">
                  <button onClick={() => setMode('solo')} className={`w-full p-4 rounded-2xl border-2 transition text-left ${mode === 'solo' ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white'}`}>
                    <p className="font-bold text-gray-800">🧑 Solo Mode</p>
                    <p className="text-xs text-gray-500">Answer truth questions individually</p>
                  </button>
                  <button onClick={() => setMode('couple')} className={`w-full p-4 rounded-2xl border-2 transition text-left ${mode === 'couple' ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white'}`}>
                    <p className="font-bold text-gray-800">💑 Couple Mode</p>
                    <p className="text-xs text-gray-500">Both partners answer, compare answers</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-6 justify-center">
                {(['all', 'fun', 'deep', 'spicy'] as const).map(d => (
                  <button key={d} onClick={() => startGame(d)} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/70 hover:bg-white transition">
                    {d === 'all' ? '🌟 All' : d === 'fun' ? '🎈 Fun' : d === 'deep' ? '💭 Deep' : '🌶️ Spicy'}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mb-4">Questions answered: {revealedCount}/5 | Score: {totalScore}</p>
              <button onClick={spin} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
                <Play className="w-5 h-5 inline mr-2" /> Spin Wheel
              </button>
            </motion.div>
          )}

          {phase === 'spinning' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: spinAngle }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden"
                  style={{ background: `conic-gradient(${TRUTHS.map((t, i) => { const colors: Record<Depth, [string, string]> = { fun: ['#ec4899', '#f43f5e'], deep: ['#a855f7', '#6366f1'], spicy: ['#f43f5e', '#f97316'] }; const c = colors[t.depth]; return `${c[0]} ${(segAngle * i)}deg, ${c[1]} ${(segAngle * (i + 1))}deg`; }).join(', ')})` }}
                >
                  {TRUTHS.map((t, i) => {
                    const angle = segAngle * i + segAngle / 2;
                    return (
                      <div key={i} className="absolute top-1/2 left-1/2 text-white text-xs font-bold text-center" style={{ transform: `rotate(${angle}deg) translateY(-90px) rotate(-${angle}deg)`, transformOrigin: 'center' }}>
                        <span className="text-sm">{t.depth === 'spicy' ? '🌶️' : t.depth === 'deep' ? '💭' : '🎈'}</span>
                      </div>
                    );
                  })}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-purple-500" fill="currentColor" />
                  </div>
                </motion.div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-3xl">🔺</div>
              </div>
              <p className="text-xl text-purple-600 font-bold animate-pulse">Spinning... 💬</p>
            </motion.div>
          )}

          {phase === 'question' && currentTruth && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">
                  Round {revealedCount}/5 • Score: {totalScore}
                </span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${(revealedCount / 5) * 100}%` }} />
              </div>

              <div className={`bg-gradient-to-br ${DEPTH_COLORS[currentTruth.depth]} rounded-[2rem] shadow-2xl p-8 mb-6 text-white text-center`}>
                <div className="text-sm uppercase tracking-widest mb-3 opacity-90">{DEPTH_LABEL[currentTruth.depth]} • {currentTruth.category}</div>
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <p className="text-2xl font-medium leading-relaxed">{currentTruth.text}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] shadow-xl p-6 mb-6 text-white text-center">
                <p className="text-sm text-white/70 mb-1">This question is worth</p>
                <p className="text-3xl font-black">{DEPTH_POINTS[currentTruth.depth]}{mode === 'couple' ? ' + 15 bonus' : ''} pts</p>
              </div>

              <div className="flex gap-3">
                <button onClick={answerQuestion} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">
                  Answered! +{DEPTH_POINTS[currentTruth.depth] + (mode === 'couple' ? 15 : 0)} pts
                </button>
                <button onClick={() => { setPhase('idle'); setCurrentTruth(null); }} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">✨</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Connection Complete!</h2>
              <p className="text-gray-600 mb-4">You answered {revealedCount} truths together!</p>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">{totalScore} pts</p>

              <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{revealedCount}</p>
                  <p className="text-xs text-gray-500">Rounds</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{totalScore}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Users className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{favorites.length}</p>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={reset} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}