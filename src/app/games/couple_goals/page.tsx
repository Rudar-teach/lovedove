'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Target, Calendar, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Goal {
  id: number;
  title: string;
  description: string;
  category: 'intimacy' | 'communication' | 'adventure' | 'growth';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  emoji: string;
  isDaily: boolean;
}

const GOALS: Goal[] = [
  { id: 1, title: '30 Days of Compliments', description: 'Give your partner at least one genuine compliment every day for 30 days.', category: 'intimacy', difficulty: 'easy', points: 100, emoji: '💝', isDaily: false },
  { id: 2, title: 'Date Night Series', description: 'Plan and execute a creative date night every week for a month.', category: 'adventure', difficulty: 'medium', points: 150, emoji: '🌹', difficulty: 'medium', points: 150, emoji: '🌹', isDaily: false },
  { id: 3, title: 'Communication Streak', description: 'Have a 30-minute heartfelt conversation each day for 7 days.', category: 'communication', difficulty: 'medium', points: 120, emoji: '💬', isDaily: false },
  { id: 4, title: 'Weekly Adventure', description: 'Try something new together every week for 4 weeks.', category: 'adventure', difficulty: 'hard', points: 200, emoji: '🎢', isDaily: false },
  { id: 5, title: 'Morning Love', description: 'Start each day with a hug and kind words for 14 days.', category: 'intimacy', difficulty: 'easy', points: 70, emoji: '☀️', isDaily: false },
  { id: 6, title: 'Deep Conversations', description: 'Ask each other a thoughtful question each day for 21 days.', category: 'communication', difficulty: 'medium', points: 130, emoji: '🤔', isDaily: false },
  { id: 7, title: 'Express Gratitude', description: 'Write down 3 things you appreciate about each other daily for 2 weeks.', category: 'intimacy', difficulty: 'easy', points: 80, emoji: '🙏', isDaily: false },
  { id: 8, title: 'Sunset Dates', description: 'Watch the sunset together at 3 different locations this week.', category: 'adventure', difficulty: 'medium', points: 100, emoji: '🌅', isDaily: false },
  { id: 9, title: 'Laugh Together', description: 'Make your partner laugh at least 3 times every day for a week.', category: 'growth', difficulty: 'easy', points: 60, emoji: '😂', isDaily: false },
  { id: 10, title: 'Grow Together', description: 'Learn a new skill together over the next month.', category: 'growth', difficulty: 'hard', points: 200, emoji: '📚', isDaily: false },
  { id: 11, title: 'Physical Affection Goal', description: 'Hold hands, hug, or kiss at least 10 times each day for 14 days.', category: 'intimacy', difficulty: 'easy', points: 70, emoji: '🤗', isDaily: false },
  { id: 12, title: 'Future Planning Session', description: 'Create a vision board together for your life as a couple.', category: 'communication', difficulty: 'medium', points: 120, emoji: '🗺️', isDaily: false },
];

const CATEGORY_META: Record<string, { icon: string; color: string; label: string }> = {
  intimacy: { icon: '💕', color: 'bg-pink-100 text-pink-700', label: 'Intimacy' },
  communication: { icon: '💬', color: 'bg-blue-100 text-blue-700', label: 'Communication' },
  adventure: { icon: '🎢', color: 'bg-green-100 text-green-700', label: 'Adventure' },
  growth: { icon: '📈', color: 'bg-purple-100 text-purple-700', label: 'Growth' },
};

export default function CoupleGoalsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'goals' | 'active' | 'finished'>('start');
  const [filter, setFilter] = useState<string>('all');
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Goal[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState<Record<number, boolean>>({});

  const filtered = GOALS.filter(g => filter === 'all' || g.category === filter);
  const totalPoints = completed.reduce((s, g) => s + g.points, 0);

  const startGame = () => { setPhase('goals'); };
  const selectGoal = (goal: Goal) => { setActiveGoal(goal); setPhase('active'); };
  const completeGoal = () => {
    if (!activeGoal) return;
    setScore(s => s + activeGoal.points + (streak * 5));
    setStreak(s => s + 1);
    setCompleted(c => [...c, activeGoal!]);
    setDailyProgress(d => ({ ...d, [activeGoal!.id]: true }));
    setActiveGoal(null);
    if (completed.length + 1 >= 6) setPhase('finished');
    else setPhase('goals');
  };

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
                <div className="flex items-center gap-2"><Target className="w-5 h-5 text-pink-500" /><span className="font-bold text-gray-700">Couple Goals</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Goals</h1>
              <p className="text-gray-600 mb-8 text-lg">Work towards beautiful goals together!</p>
              <div className="grid grid-cols-4 gap-3 mb-8">
                {Object.entries(CATEGORY_META).map(([k, m]) => (
                  <div key={k} className="bg-white/70 rounded-2xl p-3 text-center border border-pink-100">
                    <span className="text-2xl block mb-1">{m.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{m.label}</span>
                    <span className="text-xs text-gray-500 block">{GOALS.filter(g => g.category === k).length}</span>
                  </div>
                ))}
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Begin</button>
            </motion.div>
          )}

          {phase === 'goals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
                <span className="text-sm font-bold text-orange-600"><Flame className="w-3 h-3 inline mr-1" />{streak} streak</span>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', ...Object.keys(CATEGORY_META)].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${filter === f ? 'bg-pink-500 text-white' : 'bg-white/70 text-gray-700'}`}>{f === 'all' ? 'All' : CATEGORY_META[f]?.label || f}</button>
                ))}
              </div>
              <div className="space-y-3">
                {filtered.map(g => {
                  const isDone = completed.some(c => c.id === g.id);
                  return (
                    <button key={g.id} onClick={() => !isDone && selectGoal(g)} disabled={isDone} className={`w-full text-left p-4 rounded-2xl transition ${isDone ? 'bg-green-100 border-2 border-green-300' : 'bg-white/70 border border-pink-100 hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{g.emoji}</span>
                        <div className="flex-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CATEGORY_META[g.category].color}`}>{g.title}</span>
                          <p className="text-sm text-gray-600 mt-1">{g.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{g.points} pts • {g.difficulty}</p>
                        </div>
                        {isDone && <CheckCircle className="w-6 h-6 text-green-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'active' && activeGoal && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-[2rem] shadow-2xl p-8 text-white mb-6">
                <span className="text-5xl block mb-4">{activeGoal.emoji}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 mb-4 inline-block`}>{activeGoal.difficulty.toUpperCase()}</span>
                <h2 className="text-2xl font-black mb-2">{activeGoal.title}</h2>
                <p className="text-white/80">{activeGoal.description}</p>
                <p className="text-sm text-white/60 mt-2">+{activeGoal.points} pts{streak > 0 ? ` (+${streak * 5} streak bonus)` : ''}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={completeGoal} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Complete! +{activeGoal.points + streak * 5} pts</button>
                <button onClick={() => { setActiveGoal(null); setPhase('goals'); setStreak(0); }} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="grid grid-cols-4 gap-3 mb-6 max-w-sm mx-auto">
                {Object.entries(CATEGORY_META).map(([k, m]) => (
                  <div key={k} className="bg-white/70 rounded-2xl p-3 text-center border border-pink-100">
                    <span className="text-xl">{m.icon}</span>
                    <p className="text-sm font-black text-gray-900">{progress[k] || 0}</p>
                    <p className="text-xs text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => { reset(); startGame(); }} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}