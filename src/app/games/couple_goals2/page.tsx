'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, Trophy, Flame, Target, Award, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface IntimacyGoal {
  id: number;
  title: string;
  description: string;
  icon: string;
  difficulty: 'gentle' | 'moderate' | 'deep';
  category: 'emotional' | 'vulnerability' | 'trust' | 'affection' | 'understanding';
  points: number;
  completed: boolean;
}

const GAME_GOALS: IntimacyGoal[] = [
  {
    id: 1,
    title: 'Share Your Top 3 Happy Memories',
    description: 'Each of you shares the three happiest moments you have experienced together so far.',
    icon: '🌟',
    difficulty: 'gentle',
    category: 'emotional',
    points: 15,
    completed: false,
  },
  {
    id: 2,
    title: 'Write Love Letters',
    description: 'Write a handwritten love letter to each other and exchange them over a quiet evening.',
    icon: '💌',
    difficulty: 'gentle',
    category: 'emotional',
    points: 15,
    completed: false,
  },
  {
    id: 3,
    title: 'Tell Your Partner Something They Do That Makes You Happy',
    description: 'Share a specific small thing your partner does that brightens your day without even trying.',
    icon: '😊',
    difficulty: 'gentle',
    category: 'emotional',
    points: 15,
    completed: false,
  },
  {
    id: 4,
    title: 'Hold Hands and Sit in Silence for 5 Minutes',
    description: 'Just be present with each other. No phones, no talking — just holding space.',
    icon: '🤝',
    difficulty: 'gentle',
    category: 'affection',
    points: 15,
    completed: false,
  },
  {
    id: 5,
    title: 'Give Each Other a Heartfelt Compliment',
    description: 'Something genuine and specific — not about appearance, but about who they are.',
    icon: '✨',
    difficulty: 'gentle',
    category: 'affection',
    points: 15,
    completed: false,
  },
  {
    id: 6,
    title: 'Discover Your Love Languages Together',
    description: 'Take the love languages quiz individually, then compare results and discuss how to show up better for each other.',
    icon: '💬',
    difficulty: 'moderate',
    category: 'understanding',
    points: 25,
    completed: false,
  },
  {
    id: 7,
    title: 'Practice Active Listening for 15 Minutes',
    description: 'One person speaks, the other listens without interrupting. Then switch roles.',
    icon: '👂',
    difficulty: 'moderate',
    category: 'understanding',
    points: 25,
    completed: false,
  },
  {
    id: 8,
    title: 'Write 10 Things You Love About Each Other',
    description: 'Each write a list of 10 things you love and admire about your partner, then read them aloud.',
    icon: '💖',
    difficulty: 'moderate',
    category: 'affection',
    points: 25,
    completed: false,
  },
  {
    id: 9,
    title: 'Discuss Your Biggest Hopes for the Relationship',
    description: 'Share your dreams for your future together — be bold and honest about what you want.',
    icon: '🌈',
    difficulty: 'moderate',
    category: 'emotional',
    points: 25,
    completed: false,
  },
  {
    id: 10,
    title: 'Name 3 Things That Make You Feel Safe',
    description: 'Share what makes you feel secure and protected within this relationship.',
    icon: '🏠',
    difficulty: 'moderate',
    category: 'trust',
    points: 25,
    completed: false,
  },
  {
    id: 11,
    title: 'Apologize for Something from the Past',
    description: 'Make amends for an unresolved issue. Speak from the heart with no defensiveness.',
    icon: '🤝',
    difficulty: 'moderate',
    category: 'trust',
    points: 25,
    completed: false,
  },
  {
    id: 12,
    title: 'Role-Play a Day in Your Partner\'s Shoes',
    description: 'Describe a typical day from your partner\'s perspective to show you truly understand their world.',
    icon: '👟',
    difficulty: 'moderate',
    category: 'understanding',
    points: 25,
    completed: false,
  },
  {
    id: 13,
    title: 'Explain What Trust Means to You',
    description: 'Share your personal definition of trust and what it looks like in practice.',
    icon: '🔒',
    difficulty: 'deep',
    category: 'trust',
    points: 40,
    completed: false,
  },
  {
    id: 14,
    title: 'Share a Fear You Have Never Told Anyone',
    description: 'Create a judgment-free space and each share a personal fear you have kept to yourself.',
    icon: '😰',
    difficulty: 'deep',
    category: 'vulnerability',
    points: 40,
    completed: false,
  },
  {
    id: 15,
    title: 'Share Something You Are Insecure About',
    description: 'Share an insecurity you carry so your partner can hold it with compassion and support.',
    icon: '💭',
    difficulty: 'deep',
    category: 'vulnerability',
    points: 40,
    completed: false,
  },
  {
    id: 16,
    title: 'Share a Vulnerable Childhood Memory',
    description: 'Open up about a formative experience that shaped who you are today.',
    icon: '🧒',
    difficulty: 'deep',
    category: 'vulnerability',
    points: 40,
    completed: false,
  },
  {
    id: 17,
    title: 'Create a Safe Word Together',
    description: 'Agree on a safe word you can use anytime you need a break or feel emotionally overwhelmed.',
    icon: '🛡️',
    difficulty: 'moderate',
    category: 'trust',
    points: 25,
    completed: false,
  },
  {
    id: 18,
    title: 'Create Your Relationship Vision Board',
    description: 'Cut out images, words, and phrases that represent your shared future and create a vision board together.',
    icon: '🎨',
    difficulty: 'moderate',
    category: 'understanding',
    points: 25,
    completed: false,
  },
];

const POINTS_BY_DIFFICULTY: Record<string, number> = {
  gentle: 15,
  moderate: 25,
  deep: 40,
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  gentle: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', gradient: 'from-emerald-400 to-green-500' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', gradient: 'from-amber-400 to-orange-500' },
  deep: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', gradient: 'from-rose-400 to-pink-600' },
};

const CATEGORY_META: Record<string, { emoji: string; label: string; gradient: string }> = {
  emotional: { emoji: '💝', label: 'Emotional', gradient: 'from-pink-400 to-rose-500' },
  vulnerability: { emoji: '🫂', label: 'Vulnerability', gradient: 'from-purple-400 to-violet-500' },
  trust: { emoji: '🤝', label: 'Trust', gradient: 'from-blue-400 to-indigo-500' },
  affection: { emoji: '💋', label: 'Affection', gradient: 'from-red-400 to-rose-500' },
  understanding: { emoji: '🧠', label: 'Understanding', gradient: 'from-teal-400 to-cyan-500' },
};

type ViewMode = 'start' | 'playing' | 'results';

const BADGES = [
  { name: 'Seed of Intimacy', min: 0, emoji: '🌱', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Open Heart', min: 80, emoji: '💗', gradient: 'from-pink-400 to-rose-500' },
  { name: 'Deep Connector', min: 160, emoji: '💞', gradient: 'from-purple-400 to-violet-500' },
  { name: 'Soul Pair', min: 280, emoji: '🧡', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Eternal Bond', min: 400, emoji: '👑', gradient: 'from-yellow-400 to-amber-500' },
];

const CATEGORIES = ['emotional', 'vulnerability', 'trust', 'affection', 'understanding'] as const;

export default function CoupleGoals2Page() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('start');
  const [goals, setGoals] = useState<IntimacyGoal[]>(GAME_GOALS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'difficulty' | 'completion'>('default');
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [resultsShown, setResultsShown] = useState(false);

  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals]);
  const completedCount = completedGoals.length;
  const progressPercent = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  const difficultyRank: Record<string, number> = { gentle: 0, moderate: 1, deep: 2 };

  const displayedGoals = useMemo<IntimacyGoal[]>(() => {
    let result = [...goals];
    if (activeCategory !== 'all') {
      result = result.filter((g) => g.category === activeCategory);
    }
    switch (sortBy) {
      case 'difficulty':
        result.sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.id - b.id);
        break;
      case 'completion':
        result.sort((a, b) => (a.completed === b.completed ? a.id - b.id : a.completed ? -1 : 1));
        break;
      default:
        result.sort((a, b) => a.id - b.id);
    }
    return result;
  }, [goals, activeCategory, sortBy]);

  const toggleGoal = (id: number) => {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      const target = updated.find((g) => g.id === id)!;
      if (target.completed) {
        setTotalPoints((tp) => tp + target.points);
        setCurrentStreak((s) => {
          const next = s + 1;
          if (next > bestStreak) setBestStreak(next);
          return next;
        });
      } else {
        setTotalPoints((tp) => Math.max(0, tp - target.points));
        setCurrentStreak(0);
      }
      return updated;
    });
  };

  const resetAll = () => {
    setGoals(GAME_GOALS);
    setTotalPoints(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setActiveCategory('all');
    setSortBy('default');
    setResultsShown(false);
    setViewMode('start');
  };

  const showResults = () => {
    setResultsShown(true);
    setViewMode('finished');
  };

  const earnedBadge = BADGES.filter((b) => totalPoints >= b.min).pop();

  const maxTotalPoints = GAME_GOALS.reduce((sum, g) => sum + g.points, 0);
  const categoryStats = CATEGORIES.map((cat) => {
    const catGoals = GAME_GOALS.filter((g) => g.category === cat);
    const catDone = goals.filter((g) => g.category === cat && g.completed);
    const catEarned = catDone.reduce((s, g) => s + g.points, 0);
    const catMax = catGoals.reduce((s, g) => s + g.points, 0);
    return { category: cat, ...CATEGORY_META[cat], total: catGoals.length, done: catDone.length, earned: catEarned, max: catMax };
  });

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-24">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition" aria-label="Go back">
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
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span className="font-bold text-gray-700">Couple Goals 2</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {viewMode === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100 p-6 md:p-8 text-center">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-500">{meta.label}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                Emotional Intimacy Goals
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto mb-6">
                Deepen your emotional bond together. Complete intimacy-building goals, earn points by difficulty, and grow closer with every shared conversation.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {Object.entries(POINTS_BY_DIFFICULTY).map(([diff, pts]) => (
                  <div key={diff} className={`rounded-2xl bg-gradient-to-br ${DIFFICULTY_STYLES[diff].gradient} p-3 text-white`}>
                    <p className="font-black text-lg">{pts} pts</p>
                    <p className="text-xs font-medium opacity-90 capitalize">{diff}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setViewMode('playing')}
                className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto hover:scale-105 transition-transform"
              >
                <Heart className="w-5 h-5" fill="white" />
                Start Your Journey
              </button>
            </motion.div>
          )}

          {viewMode === 'playing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-gray-900">{currentStreak}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 text-center">
                  <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-gray-900">{totalPoints}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 text-center">
                  <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-gray-900">{completedCount}/{goals.length}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600">Overall Progress</span>
                  <span className="text-sm font-bold text-pink-600">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeCategory === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' : 'bg-white/70 text-gray-700 hover:bg-white'}`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${activeCategory === cat ? `bg-gradient-to-r ${meta.gradient} text-white shadow-md` : 'bg-white/70 text-gray-700 hover:bg-white'}`}
                      >
                        <span>{meta.emoji}</span>
                        <span className="hidden sm:inline">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setSortBy(sortBy === 'default' ? 'completion' : sortBy === 'completion' ? 'difficulty' : 'default')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/50 text-gray-600 hover:bg-white transition"
                  >
                    {sortBy === 'default' ? '📋 Default' : sortBy === 'completion' ? '✅ By Progress' : '🎯 By Difficulty'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {displayedGoals.map((goal) => {
                    const dc = DIFFICULTY_STYLES[goal.difficulty];
                    const cm = CATEGORY_META[goal.category];
                    return (
                      <motion.div
                        key={goal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-[2rem] shadow-lg border p-5 transition-all cursor-pointer ${
                          goal.completed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-white/80 backdrop-blur-xl border-pink-100 hover:border-pink-300'
                        }`}
                        onClick={() => toggleGoal(goal.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${goal.completed ? 'bg-green-100' : 'bg-pink-50'}`}>
                            {goal.completed ? '✓' : goal.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className={`font-bold text-base ${goal.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {goal.title}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dc.bg} ${dc.text} border ${dc.border}`}>
                                {goal.difficulty}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${cm.gradient} text-white`}>
                                {cm.emoji} {cm.label}
                              </span>
                            </div>
                            <p className={`text-sm ${goal.completed ? 'text-gray-400' : 'text-gray-500'}`}>{goal.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs font-bold ${goal.completed ? 'text-green-600' : 'text-pink-500'}`}>+{goal.points} pts</span>
                              {goal.completed && (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                  <Star className="w-3 h-3" fill="currentColor" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={showResults}
                  className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <Trophy className="w-5 h-5" />
                  View Results
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-3 bg-white/70 border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {viewMode === 'finished' && resultsShown && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="space-y-4"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100 p-6 md:p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="text-6xl mb-3"
                  >
                    {earnedBadge?.emoji}
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-display font-black text-gray-900 mb-1">
                    {earnedBadge?.name}
                  </h2>
                  <p className={`text-sm font-bold bg-gradient-to-r ${earnedBadge?.gradient} bg-clip-text text-transparent mb-4`}>
                    {completedCount === goals.length ? 'Perfect! All goals completed!' : `${goals.length - completedCount} goals remaining to explore`}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3">
                      <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-gray-900">{totalPoints}</p>
                      <p className="text-xs text-gray-500">Total Points</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 p-3">
                      <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-gray-900">{bestStreak}</p>
                      <p className="text-xs text-gray-500">Best Streak</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3">
                      <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-gray-900">{completedCount}/{goals.length}</p>
                      <p className="text-xs text-gray-500">Goals Done</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 p-3">
                      <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-gray-900">{Math.round(progressPercent)}%</p>
                      <p className="text-xs text-gray-500">Completion</p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Completion History</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {completedGoals.map((goal) => (
                        <span
                          key={goal.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"
                        >
                          <span>{goal.icon}</span>
                          <span className="max-w-[120px] truncate">{goal.title}</span>
                        </span>
                      ))}
                      {completedCount === 0 && (
                        <span className="text-xs text-gray-400 italic">No goals completed yet.</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Points by Category</h3>
                    <div className="space-y-2.5">
                      {categoryStats.map((stat) => {
                        const pct = stat.max > 0 ? (stat.earned / stat.max) * 100 : 0;
                        return (
                          <div key={stat.category}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600">
                                {stat.emoji} {stat.label} — {stat.done}/{stat.total} goals
                              </span>
                              <span className="text-xs font-bold text-gray-700">{stat.earned}/{stat.max} pts</span>
                            </div>
                            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={resetAll}
                      className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                      <Sparkles className="w-4 h-4" />
                      Play Again
                    </button>
                    <Link
                      href="/games"
                      className="px-8 py-3 bg-white/70 border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-white transition"
                    >
                      All Games
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
