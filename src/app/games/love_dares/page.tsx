'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Star, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Dare {
  text: string;
  difficulty: 'easy' | 'medium' | 'spicy';
  category: 'affection' | 'communication' | 'fun' | 'romantic';
}

const DARES: Dare[] = [
  { text: "Send your partner 10 heart emojis in a row", difficulty: "easy", category: "affection" },
  { text: "Call your partner and whisper 'I love you'", difficulty: "easy", category: "affection" },
  { text: "Send your partner your favorite photo of them", difficulty: "easy", category: "affection" },
  { text: "Write a 3-line love poem right now", difficulty: "easy", category: "romantic" },
  { text: "Do your best impression of your partner", difficulty: "easy", category: "fun" },
  { text: "Give your partner a 30-second back rub", difficulty: "easy", category: "affection" },
  { text: "Send a flirty text message right now", difficulty: "easy", category: "romantic" },
  { text: "Show your partner your favorite song", difficulty: "easy", category: "communication" },
  { text: "Make your partner a playlist for the day", difficulty: "easy", category: "fun" },
  { text: "Share a memory that makes you smile", difficulty: "easy", category: "communication" },
  { text: "Dance with your partner for 2 minutes", difficulty: "medium", category: "fun" },
  { text: "Tell your partner 5 things you love about them", difficulty: "medium", category: "communication" },
  { text: "Cook or bake something together tonight", difficulty: "medium", category: "fun" },
  { text: "Write a love letter and read it aloud", difficulty: "medium", category: "romantic" },
  { text: "Recreate your very first date at home", difficulty: "medium", category: "romantic" },
  { text: "Give each other a mini makeover", difficulty: "medium", category: "fun" },
  { text: "Plan a surprise date for this week", difficulty: "medium", category: "romantic" },
  { text: "Do 20 squats together while holding hands", difficulty: "medium", category: "fun" },
  { text: "Write 3 things you've never told them", difficulty: "medium", category: "communication" },
  { text: "Plan your dream vacation together", difficulty: "medium", category: "romantic" },
  { text: "Write each other's initials on your arms", difficulty: "spicy", category: "affection" },
  { text: "Send a voice note singing a love song", difficulty: "spicy", category: "fun" },
  { text: "Give your partner a 5-minute massage", difficulty: "spicy", category: "affection" },
  { text: "Blindfold your partner and feed them 3 bites", difficulty: "spicy", category: "fun" },
  { text: "Make your partner laugh without touching them", difficulty: "spicy", category: "fun" },
  { text: "Take a silly photo together and share it", difficulty: "spicy", category: "fun" },
  { text: "Whisper your sweetest secret to your partner", difficulty: "spicy", category: "romantic" },
  { text: "Draw something romantic and show it", difficulty: "spicy", category: "romantic" },
  { text: "Feed your partner something with your eyes closed", difficulty: "spicy", category: "affection" },
  { text: "Make up a song about your partner right now", difficulty: "spicy", category: "fun" },
];

const COLORS = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', grad: 'from-green-500 to-emerald-500', icon: '💚' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', grad: 'from-amber-500 to-orange-500', icon: '💛' },
  spicy: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', grad: 'from-red-500 to-pink-500', icon: '❤️' },
};
const LABELS = { easy: 'Easy', medium: 'Medium', spicy: 'Spicy' };
const POINTS = { easy: 10, medium: 25, spicy: 50 };
const TIMES = { easy: 30, medium: 60, spicy: 90 };

type Filter = 'all' | 'easy' | 'medium' | 'spicy' | 'affection' | 'communication' | 'fun' | 'romantic';

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  affection: { icon: '💕', label: 'Affection' },
  communication: { icon: '💬', label: 'Communication' },
  fun: { icon: '🎉', label: 'Fun' },
  romantic: { icon: '🌹', label: 'Romantic' },
};

export default function LoveDaresEnhanced() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [filter, setFilter] = useState<Filter>('all');
  const [pool, setPool] = useState<Dare[]>([]);
  const [current, setCurrent] = useState<Dare | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Dare[]>([]);
  const [streak, setStreak] = useState(0);
  const [skipCount, setSkipCount] = useState(0);

  const startGame = (f: Filter) => {
    let p = f === 'all' ? [...DARES] : DARES.filter(d => d.difficulty === f || d.category === f);
    const shuffled = p.sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setCurrent(shuffled[0] || null);
    setScore(0);
    setCompleted([]);
    setFilter(f);
    setTimer(shuffled[0] ? TIMES[shuffled[0].difficulty] : 0);
    setTimerOn(false);
    setStreak(0);
    setSkipCount(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing' || !timerOn || timer <= 0) return;
    const t = setTimeout(() => setTimer(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, timerOn, timer]);

  useEffect(() => {
    if (current && gameState === 'playing') setTimer(TIMES[current.difficulty]);
  }, [current?.text]);

  const completeDare = () => {
    if (!current) return;
    setScore(s => s + POINTS[current.difficulty] + streak * 5);
    setStreak(s => s + 1);
    setCompleted(c => [...c, current!]);
    const idx = pool.indexOf(current);
    if (idx < pool.length - 1) { setPool(p => p.slice(idx + 1)); setCurrent(pool[idx + 1]); }
    else { setCurrent(null); setGameState('finished'); }
  };

  const skipDare = () => {
    setStreak(0);
    setSkipCount(s => s + 1);
    const idx = pool.indexOf(current!);
    if (idx < pool.length - 1) { setPool(p => p.slice(idx + 1)); setCurrent(pool[idx + 1]); }
    else { setCurrent(null); setGameState('finished'); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const remaining = pool.length > 0 ? pool.length - 1 : 0;
  const percent = pool.length > 0 ? Math.round((completed.length / (completed.length + pool.length)) * 100) : 100;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Flame className="w-5 h-5 text-rose-500" /> Love Dares</h1>
            <div className="w-10" />
          </div>

          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🔥</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Dares</h1>
              <p className="text-gray-600 mb-8 text-lg">Choose your category and complete romantic dares!</p>

              <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
                {Object.entries(CATEGORY_META).map(([key, cat]) => (
                  <div key={key} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 text-center">
                    <span className="text-3xl block mb-1">{cat.icon}</span>
                    <span className="text-sm font-bold text-gray-700">{cat.label}</span>
                    <span className="text-xs text-gray-500 block">{DARES.filter(d => d.category === key).length} dares</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 max-w-xs mx-auto">
                <button onClick={() => startGame('all')} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-xl transition hover:scale-105">
                  🔥 All Dares ({DARES.length})
                </button>
                <button onClick={() => startGame('affection')} className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-2xl font-bold hover:shadow-xl transition">💕 Affection ({DARES.filter(d => d.category === 'affection').length})</button>
                <button onClick={() => startGame('romantic')} className="w-full py-4 bg-gradient-to-r from-fuchsia-400 to-purple-500 text-white rounded-2xl font-bold hover:shadow-xl transition">🌹 Romantic ({DARES.filter(d => d.category === 'romantic').length})</button>
                <button onClick={() => startGame('fun')} className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl transition">🎉 Fun ({DARES.filter(d => d.category === 'fun').length})</button>
                <button onClick={() => startGame('communication')} className="w-full py-4 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-2xl font-bold hover:shadow-xl transition">💬 Communication ({DARES.filter(d => d.category === 'communication').length})</button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 border">
                  {streak > 0 && <Flame className="w-3 h-3 inline text-orange-500 mr-1" />}{streak} streak
                </span>
                <span className="text-sm text-gray-600 font-medium">Score: <span className="font-bold text-red-500">{score}</span></span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full" style={{ width: `${percent}%` }} />
              </div>
              <div className={`bg-gradient-to-br ${COLORS[current.difficulty].grad} rounded-[2rem] shadow-2xl p-8 mb-4 text-white text-center`}>
                <span className="text-4xl block mb-3">{COLORS[current.difficulty].icon}</span>
                <p className="text-xl font-black leading-relaxed mb-2">{current.text}</p>
                <p className="text-sm text-white/70">+{POINTS[current.difficulty]} pts{streak > 1 ? ` (+${streak * 5} bonus)` : ''}</p>
              </div>
              <div className="flex gap-2 justify-center mb-4">
                {Object.entries(CATEGORY_META).map(([key, cat]) => (
                  <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${current.category === key ? 'bg-pink-200 text-pink-800' : 'bg-white/50 text-gray-500'}`}>
                    {cat.icon} {cat.label}
                  </span>
                ))}
              </div>
              {timer > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Timer className="w-5 h-5 text-gray-500" /><span className="font-bold text-gray-700">Time</span></div>
                  <span className={`font-mono text-lg font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{formatTime(timer)}</span>
                  <button onClick={() => setTimerOn(!timerOn)} className="px-4 py-2 bg-pink-100 rounded-xl text-sm font-bold text-pink-700">{timerOn ? 'Pause' : 'Start'}</button>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={completeDare} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Done! +{POINTS[current.difficulty] + streak * 5} pts</button>
                <button onClick={skipDare} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing!</h2>
              <p className="text-gray-600 mb-4">You completed {completed.length} dares!</p>
              <div className="text-5xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">{score} pts</div>

              <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{completed.reduce((a, d) => a + POINTS[d.difficulty], 0)}</p>
                  <p className="text-xs text-gray-500">Base Pts</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{completed.reduce((a, d) => a + (d.difficulty === 'spicy' ? 10 : d.difficulty === 'medium' ? 5 : 2), 0)}</p>
                  <p className="text-xs text-gray-500">Difficulty Bonus</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <BarChart3 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{skipCount}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 max-h-64 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-3">Completed Dares</h3>
                {completed.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-white/50">
                    <span className={`w-3 h-3 rounded-full ${COLORS[d.difficulty].dot}`} />
                    <span className="text-sm text-gray-700 flex-1">{d.text}</span>
                    <span className="text-xs font-bold text-gray-500">+{POINTS[d.difficulty]}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => startGame(filter)} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}