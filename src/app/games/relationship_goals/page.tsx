'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Star, Flame, TrendingUp, Target, Crown } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Goal {
  id: number;
  title: string;
  description: string;
  icon: string;
  priority: number;
  category: 'short' | 'long';
  completed: boolean;
}

const INITIAL_GOALS: Goal[] = [
  { id: 1, title: "Weekly date night", description: "Schedule a dedicated date night every week", icon: "🌙", priority: 1, category: 'short', completed: false },
  { id: 2, title: "Morning texts", description: "Send a good morning text every day", icon: "☀️", priority: 2, category: 'short', completed: false },
  { id: 3, title: "Communication ritual", description: "30-minute check-in every Sunday", icon: "🗣️", priority: 1, category: 'short', completed: false },
  { id: 4, title: "Visit 5 new places", description: "Explore new places together this year", icon: "🗺️", priority: 2, category: 'long', completed: false },
  { id: 5, title: "Save for a dream vacation", description: "Build a savings fund together", icon: "💰", priority: 2, category: 'long', completed: false },
  { id: 6, title: "Complete a 5K together", description: "Train and run as a team", icon: "🏃", priority: 3, category: 'long', completed: false },
  { id: 7, title: "Start a joint hobby", description: "Pick something new to learn together", icon: "🎨", priority: 3, category: 'long', completed: false },
  { id: 8, title: "Gratitude practice", description: "Share one thing you're grateful for daily", icon: "🙏", priority: 1, category: 'short', completed: false },
  { id: 9, title: "Cook a new cuisine", description: "Learn to cook a new cuisine together", icon: "🍳", priority: 2, category: 'long', completed: false },
  { id: 10, title: "Monthly surprises", description: "Plan a surprise date for each other monthly", icon: "🎭", priority: 2, category: 'short', completed: false },
  { id: 11, title: "Relationship book club", description: "Read and discuss a relationship book", icon: "📚", priority: 3, category: 'long', completed: false },
  { id: 12, title: "Create a scrapbook", description: "Document your favorite memories", icon: "📖", priority: 3, category: 'long', completed: false },
];

export default function RelationshipGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [view, setView] = useState<'all' | 'short' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name'>('priority');
  const [editingPriority, setEditingPriority] = useState<number | null>(null);

  const toggleComplete = (id: number) => {
    setGoals(g => g.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal));
  };

  const setPriority = (id: number, p: number) => {
    setGoals(g => g.map(goal => goal.id === id ? { ...goal, priority: p } : goal));
    setEditingPriority(null);
  };

  const getSorted = () => {
    let filtered = view === 'all' ? goals : goals.filter(g => g.category === view);
    return sortBy === 'priority' ? filtered.sort((a, b) => a.priority - b.priority || a.id - b.id) : filtered.sort((a, b) => a.title.localeCompare(b.title));
  };

  const completedCount = goals.filter(g => g.completed).length;

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
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-700">Relationship Goals</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex gap-2">
              {(['all', 'short', 'long'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${view === v ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'}`}>
                  {v === 'all' ? 'All' : v === 'short' ? 'Short-term' : 'Long-term'}
                </button>
              ))}
            </div>
            <button onClick={() => setSortBy(sortBy === 'priority' ? 'name' : 'priority')} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/50 text-gray-600 hover:bg-white transition">
              {sortBy === 'priority' ? 'Sort: Priority ↑' : 'Sort: Name A-Z'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map(p => {
              const count = goals.filter(g => g.priority === p).length;
              const colors = ['from-red-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-green-500 to-emerald-500'];
              return (
                <div key={p} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-pink-100 text-center">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[p - 1]} text-white flex items-center justify-center font-black text-sm mx-auto mb-1`}>{p}</div>
                  <p className="text-lg font-black text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">Priority {p}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {getSorted().map((goal) => (
              <motion.div
                key={goal.id}
                layout
                className={`bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border p-5 transition-all ${goal.completed ? 'border-green-300 bg-green-50/50' : 'border-pink-100'}`}
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleComplete(goal.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}>
                    {goal.completed && <span className="text-white text-sm">✓</span>}
                  </button>
                  <span className="text-3xl">{goal.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-gray-900 ${goal.completed ? 'line-through text-gray-400' : ''}`}>{goal.title}</h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${goal.category === 'short' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{goal.category === 'short' ? 'Short-term' : 'Long-term'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingPriority === goal.id ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map(p => (
                          <button key={p} onClick={() => setPriority(goal.id, p)} className={`w-8 h-8 rounded-full text-sm font-bold ${goal.priority === p ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'}`}>{p}</button>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => setEditingPriority(goal.id)} className={`px-3 py-1 rounded-full text-xs font-bold ${goal.priority === 1 ? 'bg-red-100 text-red-700' : goal.priority === 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>P{goal.priority}</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-600">Progress: <span className="font-black text-pink-600">{completedCount}/{goals.length}</span> goals completed</p>
            <div className="w-full h-4 bg-white/50 rounded-full mt-4 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${(completedCount / goals.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}