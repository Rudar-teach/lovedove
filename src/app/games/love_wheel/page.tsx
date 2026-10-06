'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Timer, Sparkles, Zap, Star, Volume2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Segment {
  label: string;
  color: string;
  bgColor: string;
  points: number;
  category: string;
  emoji: string;
  sound: string;
}

const ALL_SEGMENTS: Segment[] = [
  { label: 'Slow Kiss', color: '#ec4899', bgColor: 'from-pink-500 to-rose-500', points: 30, category: 'romance', emoji: '💋', sound: 'tick' },
  { label: 'Cuddle 1 Min', color: '#a855f7', bgColor: 'from-purple-500 to-indigo-500', points: 20, category: 'romance', emoji: '🫂', sound: 'tick' },
  { label: 'Whisper Love', color: '#f43f5e', bgColor: 'from-rose-500 to-red-500', points: 25, category: 'romance', emoji: '💬', sound: 'tick' },
  { label: 'Sweet Compliment', color: '#fb923c', bgColor: 'from-orange-400 to-pink-500', points: 15, category: 'romance', emoji: '💕', sound: 'tick' },
  { label: 'Forehead Kiss', color: '#ef4444', bgColor: 'from-red-500 to-pink-600', points: 25, category: 'romance', emoji: '💖', sound: 'tick' },
  { label: 'Slow Dance', color: '#db2777', bgColor: 'from-pink-600 to-purple-600', points: 35, category: 'fun', emoji: '💃', sound: 'beat' },
  { label: 'Love Note', color: '#d946ef', bgColor: 'from-fuchsia-500 to-pink-500', points: 20, category: 'creative', emoji: '✉️', sound: 'tick' },
  { label: 'Hug Tight', color: '#6366f1', bgColor: 'from-indigo-500 to-purple-500', points: 20, category: 'romance', emoji: '🤗', sound: 'tick' },
  { label: 'Sing Together', color: '#14b8a6', bgColor: 'from-teal-500 to-cyan-500', points: 15, category: 'fun', emoji: '🎵', sound: 'note' },
  { label: 'Funny Face', color: '#f59e0b', bgColor: 'from-amber-500 to-yellow-500', points: 15, category: 'fun', emoji: '😄', sound: 'laugh' },
  { label: 'Feed Each Other', color: '#22c55e', bgColor: 'from-green-500 to-emerald-500', points: 25, category: 'creative', emoji: '🍫', sound: 'tick' },
  { label: 'Back Rub', color: '#8b5cf6', bgColor: 'from-violet-500 to-purple-500', points: 25, category: 'romance', emoji: '💆', sound: 'tick' },
  { label: 'Dare Challenge', color: '#ef4444', bgColor: 'from-red-500 to-red-700', points: 40, category: 'adventure', emoji: '🔥', sound: 'boom' },
  { label: 'Spa Time', color: '#10b981', bgColor: 'from-emerald-500 to-teal-500', points: 30, category: 'romance', emoji: '🧖', sound: 'tick' },
  { label: 'Photo Op', color: '#6366f1', bgColor: 'from-indigo-500 to-blue-500', points: 15, category: 'fun', emoji: '📸', sound: 'shutter' },
  { label: 'Wild Card', color: '#9333ea', bgColor: 'from-purple-600 to-fuchsia-600', points: 50, category: 'wild', emoji: '🎴', sound: 'drum' },
];

type Category = 'all' | 'romance' | 'fun' | 'creative' | 'adventure' | 'wild';

const CATEGORY_LABELS: Record<string, string> = { all: 'All', romance: 'Romance', fun: 'Fun', creative: 'Creative', adventure: 'Adventure', wild: 'Wild' };
const CATEGORY_COLORS: Record<string, string> = { all: 'bg-gray-100', romance: 'bg-rose-100', fun: 'bg-amber-100', creative: 'bg-purple-100', adventure: 'bg-green-100', wild: 'bg-indigo-100' };

const SOUND_EFFECTS: Record<string, string> = {
  tick: '🎵 ', beat: '🎶 ', note: '🎵 ', laugh: '😂 ', boom: '💥 ', shutter: '📸 ', drum: '🥁 ',
};

export default function LoveWheelEnhanced() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'result' | 'finished'>('idle');
  const [rotation, setRotation] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Segment[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [timeLeft, setTimeLeft] = useState(90);
  const [spins, setSpins] = useState(0);
  const [soundFx, setSoundFx] = useState(true);
  const [sounds, setSounds] = useState<string[]>([]);
  const [tickCount, setTickCount] = useState(0);

  const getSegments = () => category === 'all' ? ALL_SEGMENTS : ALL_SEGMENTS.filter(s => s.category === category);
  const segments = getSegments();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'result' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'result') {
      setGameState('finished');
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const addSound = useCallback((text: string) => {
    setSounds(s => [...s.slice(-8), text]);
    setTimeout(() => setSounds(s => s.slice(1)), 2000);
  }, []);

  const spinWheel = () => {
    const segs = getSegments();
    const deg = (5 + Math.floor(Math.random() * 5)) * 360 + Math.floor(Math.random() * 360);
    setRotation(r => r + deg);
    setGameState('spinning');
    setTimeLeft(90);
    setSpins(s => s + 1);
    setTickCount(0);

    const interval = setInterval(() => {
      setTickCount(t => {
        const idx = t % segs.length;
        if (soundFx) addSound(SOUND_EFFECTS[segs[idx].sound] || '🎵 ');
        return t + 1;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      const idx = Math.floor(Math.random() * segs.length);
      setCurrentSegment(segs[idx]);
      setGameState('result');
      addSound('✨ Result!');
    }, 3000);
  };

  const completeChallenge = () => {
    if (!currentSegment) return;
    setScore(s => s + currentSegment.points);
    setCompleted(c => [...c, currentSegment!]);
    setCurrentSegment(null);
    setGameState('idle');
  };

  const getAchievement = () => {
    if (score >= 150) return { title: 'Love Legend!', emoji: '👑', color: 'from-amber-500 to-yellow-500' };
    if (score >= 100) return { title: 'Love Champion!', emoji: '🏆', color: 'from-amber-500 to-yellow-500' };
    if (score >= 50) return { title: 'Romance Expert!', emoji: '⭐', color: 'from-pink-500 to-rose-500' };
    if (score >= 25) return { title: 'Sweet Heart!', emoji: '💕', color: 'from-rose-500 to-pink-500' };
    return { title: 'Getting Started!', emoji: '💗', color: 'from-pink-400 to-rose-400' };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const conicGradient = segments.length > 0
    ? segments.map((s, i) => {
        const startDeg = (360 / segments.length) * i;
        const endDeg = (360 / segments.length) * (i + 1);
        return `${s.color} ${startDeg}deg, ${s.color === ALL_SEGMENTS[i]?.color ? s.color : s.color} ${endDeg}deg`;
      }).join(', ')
    : 'transparent';

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSoundFx(!soundFx)} className={`p-2 rounded-xl transition ${soundFx ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Volume2 className="w-4 h-4" />
                  </button>
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
              <p className="text-gray-600 mb-8 text-lg">{ALL_SEGMENTS.length} segments across 5 categories!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                    <div key={cat} className={`px-3 py-2 rounded-xl text-sm font-bold ${CATEGORY_COLORS[cat]} text-center`}>{label}</div>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 mt-4 mb-2">Sound Effects</h3>
                <button onClick={() => setSoundFx(!soundFx)} className={`px-4 py-2 rounded-xl text-sm font-bold w-full ${soundFx ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {soundFx ? 'ON - Tick sounds during spin' : 'OFF'}
                </button>
              </div>

              <div className="flex gap-2 mb-6 justify-center flex-wrap">
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
              <div className="relative w-72 h-72 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  className="w-full h-full rounded-full border-8 border-white/50 overflow-hidden relative shadow-2xl"
                  style={{ background: `conic-gradient(${segments.map((s, i) => {
                    const startDeg = (360 / segments.length) * i;
                    const endDeg = (360 / segments.length) * (i + 1);
                    return `${s.color} ${startDeg}deg, ${s.color} ${endDeg}deg`;
                  }).join(', ')})` }}
                >
                  {segments.map((seg, i) => {
                    const angle = (360 / segments.length) * i + (360 / segments.length) / 2;
                    return (
                      <div key={i} className="absolute top-1/2 left-1/2 text-white font-bold text-xs text-center whitespace-nowrap" style={{ transform: `rotate(${angle}deg) translateY(-105px) rotate(-${angle}deg)`, transformOrigin: 'center' }}>
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

              <motion.div className="space-y-1 text-center mb-4 h-16 overflow-hidden">
                <AnimatePresence>
                  {sounds.map((s, i) => (
                    <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-2xl">{s}</motion.p>
                  ))}
                </AnimatePresence>
              </motion.div>

              <p className="text-xl text-pink-600 font-bold animate-pulse">Spinning... 🎡 {soundFx ? '🔊' : '🔇'}</p>
            </motion.div>
          )}

          {gameState === 'result' && currentSegment && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold">Score: {score}</span>
                <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}><Timer className="w-4 h-4 inline mr-1" /> {formatTime(timeLeft)}</span>
              </div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className={`bg-gradient-to-br ${currentSegment.bgColor} rounded-[2rem] shadow-2xl p-10 mb-6 text-white text-center`}>
                <div className="text-6xl mb-4">{currentSegment.emoji}</div>
                <h2 className="text-3xl font-black mb-2">{currentSegment.label}</h2>
                <p className="text-white/70">+{currentSegment.points} points when completed</p>
                {currentSegment.category !== 'all' && <span className="mt-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold inline-block">{currentSegment.category}</span>}
              </motion.div>

              <div className="flex gap-3">
                <button onClick={completeChallenge} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Done! +{currentSegment.points} pts</button>
                <button onClick={() => { setCurrentSegment(null); setGameState('idle'); }} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Game Over!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">{score} pts</p>
              <p className="text-xl text-gray-600 mb-2">{getAchievement().emoji} {getAchievement().title}</p>
              <p className="text-gray-500 mb-8">{spins} spins, {completed.length} challenges</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Completed Challenges</h3>
                {completed.length === 0 ? <p className="text-sm text-gray-500">No challenges completed.</p> : (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {completed.map((c, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-bold border ${c.category === 'romance' ? 'bg-rose-50 text-rose-700 border-rose-200' : c.category === 'fun' ? 'bg-amber-50 text-amber-700 border-amber-200' : c.category === 'creative' ? 'bg-purple-50 text-purple-700 border-purple-200' : c.category === 'adventure' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                        {c.emoji} {c.label} (+{c.points})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => { setScore(0); setCompleted([]); setRotation(0); setGameState('idle'); }} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
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