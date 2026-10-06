'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Timer, Sparkles, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const ALL_SEGMENTS = [
  { label: 'Slow Kiss', color: 'from-pink-500 to-rose-500', points: 30, category: 'romance', emoji: '💋' },
  { label: 'Cuddle 1 Min', color: 'from-purple-500 to-indigo-500', points: 20, category: 'romance', emoji: '🫂' },
  { label: 'Whisper Love', color: 'from-rose-500 to-red-500', points: 25, category: 'romance', emoji: '💬' },
  { label: 'Sweet Compliment', color: 'from-orange-400 to-pink-500', points: 15, category: 'romance', emoji: '💕' },
  { label: 'Forehead Kiss', color: 'from-red-500 to-pink-600', points: 25, category: 'romance', emoji: '💖' },
  { label: 'Slow Dance', color: 'from-pink-600 to-purple-600', points: 35, category: 'fun', emoji: '💃' },
  { label: 'Love Note', color: 'from-fuchsia-500 to-pink-500', points: 20, category: 'creative', emoji: '✉️' },
  { label: 'Hug Tight', color: 'from-indigo-500 to-purple-500', points: 20, category: 'romance', emoji: '🤗' },
  { label: 'Sing Together', color: 'from-teal-500 to-cyan-500', points: 15, category: 'fun', emoji: '🎵' },
  { label: 'Funny Pose', color: 'from-amber-500 to-yellow-500', points: 15, category: 'fun', emoji: '📸' },
  { label: 'Feed Each Other', color: 'from-green-500 to-emerald-500', points: 25, category: 'creative', emoji: '🍫' },
  { label: 'Back Rub', color: 'from-violet-500 to-purple-500', points: 25, category: 'romance', emoji: '💆' },
];

type Category = 'all' | 'romance' | 'fun' | 'creative';

const CATEGORY_LABELS: Record<string, string> = {
  all: '🌟 All',
  romance: '💕 Romance',
  fun: '🎉 Fun',
  creative: '✍️ Creative',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  all: 'bg-gray-100 text-gray-700',
  romance: 'bg-rose-100 text-rose-700',
  fun: 'bg-amber-100 text-amber-700',
  creative: 'bg-purple-100 text-purple-700',
};

export default function LoveWheelEnhanced() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'result' | 'finished'>('idle');
  const [rotation, setRotation] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<typeof ALL_SEGMENTS[0] | null>(null);
  const [score, setScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<typeof ALL_SEGMENTS>([]);
  const [category, setCategory] = useState<Category>('all');
  const [timeLeft, setTimeLeft] = useState(90);
  const [spins, setSpins] = useState(0);

  const getSegments = () => category === 'all' ? ALL_SEGMENTS : ALL_SEGMENTS.filter(s => s.category === category);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'result' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'result') {
      setGameState('finished');
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const spinWheel = () => {
    const segments = getSegments();
    const spins = 5 + Math.floor(Math.random() * 5);
    const deg = spins * 360 + Math.floor(Math.random() * 360);
    setRotation(r => r + deg);
    setGameState('spinning');
    setTimeLeft(90);
    setSpins(s => s + 1);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * segments.length);
      setCurrentSegment(segments[idx]);
      setGameState('result');
    }, 3000);
  };

  const completeChallenge = () => {
    if (!currentSegment) return;
    setScore(s => s + currentSegment.points);
    setCompletedChallenges(c => [...c, currentSegment!]);
    setCurrentSegment(null);
    setGameState('idle');
  };

  const getAchievement = () => {
    if (score >= 100) return { title: 'Love Champion!', emoji: '🏆', color: 'from-amber-500 to-yellow-500' };
    if (score >= 50) return { title: 'Romance Expert!', emoji: '⭐', color: 'from-pink-500 to-rose-500' };
    if (score >= 25) return { title: 'Sweet Heart!', emoji: '💕', color: 'from-rose-500 to-pink-500' };
    return { title: 'Getting Started!', emoji: '💗', color: 'from-pink-400 to-rose-400' };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const segments = getSegments();

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
                  <span className="font-bold text-gray-700">Love Wheel</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎡</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Wheel</h1>
              <p className="text-gray-600 mb-8 text-lg">Spin the wheel and complete romantic challenges together!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🎡 {ALL_SEGMENTS.length} exciting segments</li>
                  <li>⏱️ Timer per challenge</li>
                  <li>📂 3 categories: Romance, Fun, Creative</li>
                  <li>⭐ Points for each challenge</li>
                </ul>
              </div>

              <div className="flex gap-2 mb-6 justify-center">
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-2 rounded-xl text-sm font-bold capitalize ${category === cat ? 'bg-pink-500 text-white' : 'bg-white/70 text-gray-600'}`}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <button onClick={spinWheel} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Spin!
              </button>
            </motion.div>
          )}

          {gameState === 'spinning' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="relative w-72 h-72 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  className="w-full h-full rounded-full border-8 border-white/50 overflow-hidden relative shadow-2xl"
                  style={{
                    background: `conic-gradient(${segments.map((s, i) => {
                      const startA = (360 / segments.length) * i;
                      const endA = (360 / segments.length) * (i + 1);
                      return `${s.color === 'from-pink-500 to-rose-500' ? '#ec4899 #f43f5e' : s.color === 'from-purple-500 to-indigo-500' ? '#a855f7 #6366f1' : s.color === 'from-rose-500 to-red-500' ? '#f43f5e #ef4444' : s.color === 'from-orange-400 to-pink-500' ? '#fb923c #ec4899' : s.color === 'from-red-500 to-pink-600' ? '#ef4444 #db2777' : s.color === 'from-pink-600 to-purple-600' ? '#db2777 #9333ea' : s.color === 'from-fuchsia-500 to-pink-500' ? '#d946ef #ec4899' : s.color === 'from-indigo-500 to-purple-500' ? '#6366f1 #a855f7' : s.color === 'from-teal-500 to-cyan-500' ? '#14b8a6 #06b6d4' : s.color === 'from-amber-500 to-yellow-500' ? '#f59e0b #eab308' : s.color === 'from-green-500 to-emerald-500' ? '#22c55e #10b981' : s.color === 'from-violet-500 to-purple-500' ? '#8b5cf6 #a855f7' : '#ec4899 #f43f5e'} ${startA}deg, ${s.color === 'from-pink-500 to-rose-500' ? '#f43f5e' : s.color === 'from-purple-500 to-indigo-500' ? '#6366f1' : s.color === 'from-rose-500 to-red-500' ? '#ef4444' : s.color === 'from-orange-400 to-pink-500' ? '#ec4899' : s.color === 'from-red-500 to-pink-600' ? '#db2777' : s.color === 'from-pink-600 to-purple-600' ? '#9333ea' : s.color === 'from-fuchsia-500 to-pink-500' ? '#ec4899' : s.color === 'from-indigo-500 to-purple-500' ? '#a855f7' : s.color === 'from-teal-500 to-cyan-500' ? '#06b6d4' : s.color === 'from-amber-500 to-yellow-500' ? '#eab308' : s.color === 'from-green-500 to-emerald-500' ? '#10b981' : s.color === 'from-violet-500 to-purple-500' ? '#a855f7' : '#f43f5e'} ${endA}deg`}).join(', ')})`,
                  }}
                >
                  {segments.map((seg, i) => {
                    const angle = (360 / segments.length) * i + (360 / segments.length) / 2;
                    return (
                      <div key={i} className="absolute top-1/2 left-1/2 text-white font-bold text-xs md:text-base text-center" style={{ transform: `rotate(${angle}deg) translateY(-110px) rotate(-${angle}deg)`, transformOrigin: 'center' }}>
                        <span className="block text-lg">{seg.emoji}</span>
                        <span className="block text-[10px]">{seg.label}</span>
                      </div>
                    );
                  })}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
                  </div>
                </motion.div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 text-4xl z-10">🔺</div>
              </div>
              <p className="text-xl text-pink-600 font-bold">Spinning... 🎡</p>
            </motion.div>
          )}

          {gameState === 'result' && currentSegment && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold">
                  Score: {score}
                </span>
                <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
                  <Timer className="w-4 h-4 inline mr-1" /> {formatTime(timeLeft)}
                </span>
              </div>

              <div className={`bg-gradient-to-br ${currentSegment.color} rounded-[2rem] shadow-2xl p-10 mb-6 text-white text-center`}>
                <div className="text-6xl mb-4">{currentSegment.emoji}</div>
                <h2 className="text-3xl font-black mb-2">{currentSegment.label}</h2>
                <p className="text-white/70">+{currentSegment.points} points when completed</p>
              </div>

              <div className="flex gap-3">
                <button onClick={completeChallenge} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">
                  Done! +{currentSegment.points} pts
                </button>
                <button onClick={() => { setCurrentSegment(null); setGameState('idle'); }} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  Skip
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Game Over!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">{score} pts</p>
              <p className="text-xl text-gray-600 mb-2">{getAchievement().emoji} {getAchievement().title}</p>
              <p className="text-gray-500 mb-8">{spins} spins, {completedChallenges.length} challenges</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Challenges</h3>
                {completedChallenges.length === 0 ? (
                  <p className="text-sm text-gray-500">No challenges completed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {completedChallenges.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-pink-50 rounded-full text-sm font-bold text-pink-700 border border-pink-200">
                        {c.emoji} {c.label} (+{c.points})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => { setScore(0); setCompletedChallenges([]); setRotation(0); setGameState('idle'); }} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}