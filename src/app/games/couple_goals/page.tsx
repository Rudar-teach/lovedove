'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Target, Trophy, Flame, TrendingUp, Award, Filter } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface Goal {
  text: string;
  category: 'romantic' | 'adventure' | 'fun' | 'intimacy' | 'communication';
  emoji: string;
  difficulty: number;
}

const GOALS: Goal[] = [
  { text: "Go on a romantic picnic in the park", category: "romantic", emoji: "🧺", difficulty: 1 },
  { text: "Stargaze together and make wishes on stars", category: "romantic", emoji: "⭐", difficulty: 2 },
  { text: "Write each other handwritten love letters", category: "intimacy", emoji: "✉️", difficulty: 2 },
  { text: "Take a cooking class together", category: "adventure", emoji: "👨‍🍳", difficulty: 2 },
  { text: "Go on a spontaneous road trip", category: "adventure", emoji: "🚗", difficulty: 3 },
  { text: "Watch the sunrise together from a beautiful spot", category: "romantic", emoji: "🌅", difficulty: 1 },
  { text: "Dance in the rain", category: "fun", emoji: "🌧️", difficulty: 1 },
  { text: "Plant a garden together", category: "intimacy", emoji: "🌱", difficulty: 2 },
  { text: "Build a blanket fort and watch movies", category: "fun", emoji: "🏠", difficulty: 1 },
  { text: "Have a professional photoshoot together", category: "romantic", emoji: "📸", difficulty: 2 },
  { text: "Learn a new skill together", category: "communication", emoji: "📚", difficulty: 2 },
  { text: "Go camping under the stars", category: "adventure", emoji: "⛺", difficulty: 3 },
  { text: "Create a time capsule to open in 5 years", category: "intimacy", emoji: "⏳", difficulty: 2 },
  { text: "Volunteer together at a charity", category: "communication", emoji: "🤝", difficulty: 2 },
  { text: "Recreate your very first date", category: "romantic", emoji: "🌹", difficulty: 1 },
  { text: "Take a hot air balloon ride", category: "adventure", emoji: "🎈", difficulty: 3 },
  { text: "Go horseback riding on a beach", category: "adventure", emoji: "🐴", difficulty: 3 },
  { text: "Have a board game marathon", category: "fun", emoji: "🎲", difficulty: 1 },
  { text: "Build something together (furniture/art)", category: "fun", emoji: "🔨", difficulty: 2 },
  { text: "Learn to bake each other's favorite dessert", category: "intimacy", emoji: "🧁", difficulty: 1 },
  { text: "Go to a concert together", category: "fun", emoji: "🎵", difficulty: 2 },
  { text: "Take a pottery class together", category: "adventure", emoji: "🏺", difficulty: 2 },
  { text: "Have a sunrise breakfast in bed", category: "romantic", emoji: "☕", difficulty: 1 },
  { text: "Go wine tasting together", category: "romantic", emoji: "🍷", difficulty: 2 },
  { text: "Create a scrapbook of your memories", category: "intimacy", emoji: "📖", difficulty: 2 },
  { text: "Go skydiving together", category: "adventure", emoji: "🪂", difficulty: 3 },
  { text: "Take a scenic train journey", category: "adventure", emoji: "🚂", difficulty: 2 },
  { text: "Go kayaking together", category: "adventure", emoji: "🛶", difficulty: 3 },
];

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  romantic: { icon: "💕", label: "Romantic", color: "from-pink-500 to-rose-500" },
  adventure: { icon: "🌟", label: "Adventure", color: "from-amber-500 to-orange-500" },
  fun: { icon: "🎉", label: "Fun", color: "from-green-500 to-emerald-500" },
  intimacy: { icon: "💬", label: "Intimacy", color: "from-purple-500 to-indigo-500" },
  communication: { icon: "🤝", label: "Communication", color: "from-blue-500 to-cyan-500" },
};

const CATEGORIES = ['all', 'romantic', 'adventure', 'fun', 'intimacy', 'communication'] as const;
type CategoryFilter = typeof CATEGORIES[number];

export default function CoupleGoalsEnhanced() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [goals, setGoals] = useState<{ text: string; checked: boolean; category: string; emoji: string; difficulty: number }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [lastCompleted, setLastCompleted] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const prevCompletedRef = useRef(0);

  const startGame = () => {
    const shuffled = [...GOALS].sort(() => Math.random() - 0.5).slice(0, 15);
    setGoals(shuffled.map(g => ({ text: g.text, checked: false, category: g.category, emoji: g.emoji, difficulty: g.difficulty })));
    setCompletedCount(0);
    setScore(0);
    setStreak(0);
    setLastCompleted(0);
    setPhase('playing');
    setShowAll(false);
    prevCompletedRef.current = 0;
  };

  const toggleGoal = (idx: number) => {
    setGoals(prev => {
      const updated = prev.map((g, i) => i === idx ? { ...g, checked: !g.checked } : g);
      const checked = updated.filter(g => g.checked).length;
      const diff = checked - prevCompletedRef.current;
      if (diff > 0) {
        setStreak(s => s + diff);
      } else if (diff < 0) {
        setStreak(s => Math.max(0, s + diff));
      }
      setCompletedCount(checked);
      setScore(checked * 10);
      setLastCompleted(checked);
      prevCompletedRef.current = checked;
      return updated;
    });
  };

  const visibleGoals = showAll
    ? goals
    : categoryFilter === 'all'
      ? goals.slice(0, 6)
      : goals.filter(g => g.category === categoryFilter).slice(0, 6);

  const percent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const categoryStats = CATEGORIES.slice(1).reduce((acc, cat) => {
    const total = goals.filter(g => g.category === cat).length;
    const done = goals.filter(g => g.category === cat && g.checked).length;
    acc[cat] = { total, done };
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2"><Target className="w-5 h-5 text-amber-500" /> Couple Goals</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🎯</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Couple Goals</h2>
                  <p className="text-gray-600">Check off romantic goals together! Earn points and build streaks!</p>

                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                      <div key={key} className={`bg-gradient-to-r ${cat.color} rounded-xl p-2 text-white text-center`}>
                        <span className="text-lg block">{cat.icon}</span>
                        <span className="text-xs font-bold">{cat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-bold text-amber-700">🏆 Features</p>
                    <p>✓ Category-based goal organization</p>
                    <p>✓ Completion streak counter</p>
                    <p>✓ +10 points per goal completed</p>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Goals 🎯</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">{streak} 🔥 streak</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-amber-600">Score: {score}</span>
                  <span className="text-sm font-bold text-primary-600">{percent}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" style={{ width: `${percent}%` }} />
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${categoryFilter === cat ? 'bg-amber-500 text-white' : 'bg-white/70 text-gray-600 hover:bg-white'}`}
                  >
                    {cat === 'all' ? '🌟 All' : `${CATEGORY_CONFIG[cat]?.icon} ${CATEGORY_CONFIG[cat]?.label}`}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {visibleGoals.map((goal, i) => {
                    const realIdx = goals.indexOf(goal);
                    return (
                      <motion.div
                        key={`${realIdx}-${goal.checked}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => toggleGoal(realIdx)}
                        className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border p-4 cursor-pointer transition-all flex items-center gap-4 ${goal.checked ? 'border-green-300 bg-green-50/70' : 'border-amber-100/60 hover:bg-white'}`}
                      >
                        <span className="text-2xl">{goal.emoji}</span>
                        <div className="flex-1">
                          <span className={`font-medium ${goal.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{goal.text}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CATEGORY_CONFIG[goal.category]?.color.includes('pink') ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                              {CATEGORY_CONFIG[goal.category]?.icon} {CATEGORY_CONFIG[goal.category]?.label}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <span key={i} className={`text-xs ${i < goal.difficulty ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${goal.checked ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                          {goal.checked && <Trophy className="w-4 h-4 text-white" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {goals.length > 6 && !showAll && categoryFilter === 'all' && (
                <button onClick={() => setShowAll(true)} className="w-full mt-4 py-3 text-primary-600 font-bold hover:bg-white/50 rounded-2xl transition-colors">
                  Show All Goals ({goals.length})
                </button>
              )}

              <div className="text-center mt-8">
                <Button onClick={() => setPhase('finished')} variant="primary" size="lg">See Results 🏆</Button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{percent === 100 ? '🏆' : percent >= 50 ? '⭐' : '🎯'}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Your Progress</h2>
                  <p className="text-5xl font-black gradient-text">{completedCount}/{goals.length}</p>
                  <p className="text-gray-600">{percent}% complete</p>

                  <div className="flex items-center justify-center gap-6 py-3">
                    <div className="text-center">
                      <p className="text-2xl font-black text-orange-500">{streak}</p>
                      <p className="text-xs text-gray-500">🔥 Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-amber-500">{score}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>
                  </div>

                  {Object.entries(categoryStats).filter(([, s]) => s.total > 0).map(([cat, stats]) => {
                    const config = CATEGORY_CONFIG[cat];
                    if (!config) return null;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-lg">{config.icon}</span>
                        <span className="text-sm font-medium text-gray-600 w-24">{config.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }} className={`h-full bg-gradient-to-r ${config.color} rounded-full`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{stats.done}/{stats.total}</span>
                      </div>
                    );
                  })}

                  <p className="text-xl font-semibold text-primary-600">
                    {percent === 100 ? 'Amazing couple! All goals achieved!' : percent >= 50 ? 'Great progress! Keep going!' : 'Start checking off your goals!'}
                  </p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🎯</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}