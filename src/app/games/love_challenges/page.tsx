'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Target, Star, Zap, Calendar, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Challenge {
  id: number;
  text: string;
  emoji: string;
  category: 'communication' | 'fun' | 'romance' | 'adventure';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  streak: number;
}

const CHALLENGES: Challenge[] = [
  { id: 1, text: "Share 3 things you're grateful for about each other", emoji: "🙏", category: "communication", difficulty: "easy", points: 10, streak: 3 },
  { id: 2, text: "Have a no-phone date night for 2 hours", emoji: "📵", category: "communication", difficulty: "medium", points: 25, streak: 1 },
  { id: 3, text: "Send each other 10 compliments throughout the day", emoji: "💬", category: "romance", difficulty: "easy", points: 10, streak: 1 },
  { id: 4, text: "Take a sunrise walk together", emoji: "🌅", category: "adventure", difficulty: "easy", points: 15, streak: 1 },
  { id: 5, text: "Learn and do a new dance together", emoji: "💃", category: "fun", difficulty: "medium", points: 25, streak: 1 },
  { id: 6, text: "Write a love letter and hide it for them to find", emoji: "💌", category: "romance", difficulty: "medium", points: 25, streak: 3 },
  { id: 7, text: "Cook a new recipe together from scratch", emoji: "👨‍🍳", category: "fun", difficulty: "easy", points: 15, streak: 1 },
  { id: 8, text: "Go on a surprise adventure - destination decided by the other person", emoji: "🎯", category: "adventure", difficulty: "hard", points: 50, streak: 1 },
  { id: 9, text: "Share your biggest fear and comfort each other", emoji: "🤗", category: "communication", difficulty: "hard", points: 40, streak: 7 },
  { id: 10, text: "Recreate your first date exactly", emoji: "💕", category: "romance", difficulty: "easy", points: 15, streak: 1 },
  { id: 11, text: "Do 10 push-ups together (or modify for abilities)", emoji: "💪", category: "fun", difficulty: "medium", points: 25, streak: 1 },
  { id: 12, text: "Have a 30-minute deep conversation without phones", emoji: "🗣️", category: "communication", difficulty: "medium", points: 30, streak: 3 },
  { id: 13, text: "Plan a surprise date for next weekend", emoji: "📅", category: "romance", difficulty: "medium", points: 30, streak: 1 },
  { id: 14, text: "Try a new hobby together this week", emoji: "🎨", category: "fun", difficulty: "easy", points: 15, streak: 1 },
  { id: 15, text: "Go stargazing and share dreams", emoji: "✨", category: "adventure", difficulty: "easy", points: 15, streak: 1 },
  { id: 16, text: "Create a couple's vision board", emoji: "📌", category: "communication", difficulty: "hard", points: 50, streak: 7 },
  { id: 17, text: "Volunteer together for a cause you both care about", emoji: "🤝", category: "adventure", difficulty: "medium", points: 30, streak: 1 },
  { id: 18, text: "Give each other a 10-minute full-body massage", emoji: "💆", category: "romance", difficulty: "easy", points: 15, streak: 3 },
  { id: 19, text: "Learn to cook your partner's favorite meal", emoji: "🍳", category: "fun", difficulty: "medium", points: 25, streak: 1 },
  { id: 20, text: "Take a day trip somewhere neither has been", emoji: "🗺️", category: "adventure", difficulty: "hard", points: 50, streak: 7 },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  communication: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💬' },
  fun: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🎉' },
  romance: { bg: 'bg-pink-100', text: 'text-pink-700', icon: '💕' },
  adventure: { bg: 'bg-green-100', text: 'text-green-700', icon: '🌍' },
};

const DAILY_CHALLENGES: Record<string, string[]> = {
  Monday: ["Share your weekend plans with each other", "Give each other a morning hug for 30 seconds"],
  Tuesday: ["Send a sweet text mid-day", "Do a random act of kindness for each other"],
  Wednesday: ["Midweek check-in - how's each other's week going?", "Do something creative together for 15 minutes"],
  Thursday: ["Plan your perfect weekend together", "Share something you appreciate about each other"],
  Friday: ["Do a fun activity together tonight", "Share your favorite memory from this week"],
  Saturday: ["Go on an adventure together", "Do something spontaneous"],
  Sunday: ["Weekly reflection: what went well?", "Plan your week ahead together"],
};

type Period = 'daily' | 'weekly';

export default function CoupleChallengesPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [pool, setPool] = useState<Challenge[]>([]);
  const [current, setCurrent] = useState<Challenge | null>(null);
  const [completed, setCompleted] = useState<Challenge[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('daily');

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const startGame = (p: Period, cat?: string | null) => {
    let p2 = cat ? CHALLENGES.filter(c => c.category === cat) : [...CHALLENGES];
    p2.sort(() => Math.random() - 0.5);
    setPool(p2);
    setCurrent(p2[0] || null);
    setCompleted([]);
    setScore(0);
    setStreak(0);
    setCategoryFilter(cat || null);
    setPeriod(p);
    setGameState('playing');
  };

  const completeChallenge = () => {
    if (!current) return;
    const pts = current.points + streak * 2;
    setScore(s => s + pts);
    setStreak(s => s + 1);
    setCompleted(c => [...c, current!]);
    const idx = pool.indexOf(current);
    if (idx < pool.length - 1) setCurrent(pool[idx + 1]);
    else { setCurrent(null); setGameState('finished'); }
  };

  const skipChallenge = () => {
    setStreak(0);
    const idx = pool.indexOf(current!);
    if (idx < pool.length - 1) setCurrent(pool[idx + 1]);
    else { setCurrent(null); setGameState('finished'); }
  };

  const daily = DAILY_CHALLENGES[getDayName()];

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
                  <Target className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-gray-700">Couple Challenges</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Challenges</h1>
              <p className="text-gray-600 mb-8 text-lg">Strengthen your bond with daily challenges!</p>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem] shadow-xl p-6 mb-8 text-white text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Today: {getDayName()}</h3>
                <div className="space-y-2">
                  {daily.map((d, i) => (
                    <p key={i} className="text-sm text-white/80">• {d}</p>
                  ))}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
                  <button key={key} onClick={() => startGame('daily', key)} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 hover:bg-white transition text-left">
                    <span className="text-2xl block mb-1">{style.icon}</span>
                    <span className="text-sm font-bold capitalize text-gray-700">{key}</span>
                    <span className="text-xs text-gray-500 block">{CHALLENGES.filter(c => c.category === key).length} challenges</span>
                  </button>
                ))}
              </div>
              <button onClick={() => startGame('daily')} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start Random</button>
            </motion.div>
          )}

          {gameState === 'playing' && current && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-gray-700 border">
                  {streak > 0 && <><Flame className="w-4 h-4 inline text-orange-500 mr-1" />{streak} streak </>}{CATEGORY_STYLES[current.category].icon} {current.category}
                </span>
                <span className="text-sm text-gray-600 font-medium">Score: {score}</span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${(completed.length / (completed.length + pool.length - pool.indexOf(current) - (current ? 0 : 1))) * 100 || 0}%` }} />
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-4 text-center">
                <div className="text-5xl mb-4">{current.emoji}</div>
                <p className="text-xl font-bold text-gray-900 leading-relaxed mb-4">{current.text}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-2">{current.difficulty} difficulty</span>
                <p className="text-sm text-gray-500">{current.points} pts + {current.streak} day streak bonus</p>
              </div>

              <div className="flex gap-3">
                <button onClick={completeChallenge} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Complete! +{current.points} pts</button>
                <button onClick={skipChallenge} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Session Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">{score} pts</p>

              <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{completed.length}</p>
                  <p className="text-xs text-gray-500">Done</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{streak}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 border border-pink-100">
                  <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-gray-900">{score}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => startGame(period, categoryFilter)} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}