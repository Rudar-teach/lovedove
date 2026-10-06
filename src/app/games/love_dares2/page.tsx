'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Star, Timer, Users, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Dare {
  text: string;
  difficulty: number;
  category: 'teamwork' | 'creative' | 'adventure' | 'affection';
  points: number;
  timeLimit: number;
}

const DARES: Dare[] = [
  { text: "Build a pillow fort together", difficulty: 1, category: "teamwork", points: 15, timeLimit: 120 },
  { text: "Cook dinner together with your non-dominant hand", difficulty: 2, category: "teamwork", points: 25, timeLimit: 60 },
  { text: "Do a couple's dance routine", difficulty: 3, category: "creative", points: 30, timeLimit: 90 },
  { text: "Write a short love story about your relationship", difficulty: 2, category: "creative", points: 25, timeLimit: 120 },
  { text: "Take 10 silly couple photos", difficulty: 1, category: "teamwork", points: 15, timeLimit: 60 },
  { text: "Create a playlist of songs that remind you of each other", difficulty: 2, category: "creative", points: 25, timeLimit: 90 },
  { text: "Blindfold each other and draw a portrait", difficulty: 3, category: "creative", points: 30, timeLimit: 60 },
  { text: "Have a picnic indoors with candlelight", difficulty: 1, category: "affection", points: 15, timeLimit: 60 },
  { text: "Give each other 5 genuine compliments", difficulty: 1, category: "affection", points: 15, timeLimit: 30 },
  { text: "Act out your favorite movie scene together", difficulty: 2, category: "creative", points: 25, timeLimit: 90 },
  { text: "Do a trust fall exercise (safely!)", difficulty: 2, category: "teamwork", points: 25, timeLimit: 30 },
  { text: "Paint each other's nails", difficulty: 1, category: "creative", points: 15, timeLimit: 30 },
  { text: "Go on a mini adventure in your neighborhood", difficulty: 2, category: "adventure", points: 25, timeLimit: 60 },
  { text: "Learn a new skill together from a YouTube tutorial", difficulty: 3, category: "teamwork", points: 30, timeLimit: 120 },
  { text: "Create your own secret handshake", difficulty: 1, category: "teamwork", points: 15, timeLimit: 30 },
  { text: "Give each other a 3-minute back massage", difficulty: 1, category: "affection", points: 15, timeLimit: 30 },
  { text: "Make a mixtape for each other", difficulty: 2, category: "creative", points: 25, timeLimit: 90 },
  { text: "Stargaze from your balcony with blankets", difficulty: 1, category: "adventure", points: 15, timeLimit: 60 },
  { text: "Do a couples' 10-minute workout together", difficulty: 3, category: "teamwork", points: 30, timeLimit: 30 },
  { text: "Write love letters and exchange them", difficulty: 2, category: "affection", points: 25, timeLimit: 60 },
  { text: "Build a LEGO set together", difficulty: 2, category: "teamwork", points: 25, timeLimit: 120 },
  { text: "Do a photoshoot with creative props", difficulty: 2, category: "creative", points: 25, timeLimit: 60 },
  { text: "Have a water balloon fight", difficulty: 3, category: "adventure", points: 30, timeLimit: 30 },
  { text: "Feed each other dessert with eyes closed", difficulty: 2, category: "affection", points: 25, timeLimit: 30 },
  { text: "Create a couples' vision board together", difficulty: 3, category: "teamwork", points: 30, timeLimit: 90 },
  { text: "Learn a magic trick together and perform it", difficulty: 3, category: "teamwork", points: 30, timeLimit: 120 },
  { text: "Have a spa day at home together", difficulty: 1, category: "affection", points: 15, timeLimit: 60 },
  { text: "Do a scavenger hunt for each other", difficulty: 3, category: "adventure", points: 30, timeLimit: 90 },
  { text: "Create a TikTok dance together", difficulty: 2, category: "creative", points: 25, timeLimit: 60 },
  { text: "Bake cookies and decorate them together", difficulty: 2, category: "teamwork", points: 25, timeLimit: 90 },
];

const DIFFICULTY_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: 'Easy', emoji: '💚', color: 'from-green-500 to-emerald-500' },
  2: { label: 'Medium', emoji: '💛', color: 'from-amber-500 to-orange-500' },
  3: { label: 'Hard', emoji: '❤️', color: 'from-red-500 to-pink-500' },
};

const CATEGORY_EMOJI: Record<string, string> = { teamwork: '🤝', creative: '🎨', adventure: '🌍', affection: '💕' };

export default function LoveDares2Page() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'dare' | 'finished'>('start');
  const [pool, setPool] = useState<Dare[]>([]);
  const [current, setCurrent] = useState<Dare | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Dare[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const t = setTimeout(() => setTimer(timer => timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timer]);

  const startGame = (diff: number[]) => {
    const p = DARES.filter(d => diff.includes(d.difficulty)).sort(() => Math.random() - 0.5);
    setPool(p);
    setCurrent(p[0] || null);
    setScore(0);
    setCompleted([]);
    setDifficulty(diff);
    setGameState('dare');
    setTimerRunning(false);
  };

  const completeDare = () => {
    if (!current) return;
    const timeBonus = timer > 0 && timer > current.timeLimit * 0.5 ? 10 : 0;
    const pts = current.points + timeBonus;
    setScore(s => s + pts);
    setCompleted(c => [...c, current!]);

    const idx = pool.indexOf(current);
    if (idx < pool.length - 1) setCurrent(pool[idx + 1]);
    else { setCurrent(null); setGameState('finished'); }
    setTimerRunning(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-700">Teamwork Dares</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🤝</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Teamwork Dares</h1>
              <p className="text-gray-600 mb-8 text-lg">Couple challenges that build teamwork and connection!</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
                {[{ diff: [1], label: 'Easy', emoji: '💚' }, { diff: [1, 2], label: 'Mixed', emoji: '💛' }, { diff: [1, 2, 3], label: 'All', emoji: '🔥' }, { diff: [3], label: 'Hard', emoji: '❤️' }].map(opt => (
                  <button key={opt.label} onClick={() => startGame(opt.diff)} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 hover:bg-white transition text-center">
                    <span className="text-3xl block mb-1">{opt.emoji}</span>
                    <span className="text-sm font-bold text-gray-700">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(CATEGORY_EMOJI).map(([key, emoji]) => (
                    <div key={key} className="flex items-center gap-2"><span>{emoji}</span><span className="capitalize text-gray-600">{key}</span></div>
                  ))}
                </div>
              </div>
              <button onClick={() => startGame([1, 2, 3])} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {gameState === 'dare' && current && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-gray-700 border">
                  {CATEGORY_EMOJI[current.category]} {current.category}
                </span>
                <span className="text-sm text-gray-600 font-medium">Score: {score}</span>
              </div>
              <div className={`bg-gradient-to-br ${DIFFICULTY_LABELS[current.difficulty].color} rounded-[2rem] shadow-2xl p-8 mb-4 text-white text-center`}>
                <div className="text-5xl mb-4">{CATEGORY_EMOJI[current.category]}</div>
                <p className="text-xl font-black leading-relaxed mb-2">{current.text}</p>
                <p className="text-white/70">{current.points} pts</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-gray-500" />
                  <span className="font-bold text-gray-700">Time Limit: {formatTime(current.timeLimit)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-lg font-bold ${timerRunning && timer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{formatTime(timer)}</span>
                  <button onClick={() => { setTimer(current.timeLimit); setTimerRunning(!timerRunning); }} className="px-4 py-2 bg-purple-100 rounded-xl text-sm font-bold text-purple-700">{timerRunning ? 'Pause' : 'Start'}</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={completeDare} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Done! +{current.points} pts</button>
                <button onClick={() => {
                  const idx = pool.indexOf(current);
                  if (idx < pool.length - 1) setCurrent(pool[idx + 1]);
                  else { setCurrent(null); setGameState('finished'); }
                }} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Great Teamwork!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">{score} pts</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Completed Dares</h3>
                {completed.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-white/50">
                    <span>{CATEGORY_EMOJI[d.category]}</span>
                    <span className="text-sm text-gray-700 flex-1">{d.text}</span>
                    <span className="text-xs font-bold text-gray-500">+{d.points}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => startGame(difficulty)} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}