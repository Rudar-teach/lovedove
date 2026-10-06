'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Check, Plus } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const DEFAULT_GOALS = [
  { id: 1, text: "Have a movie night every Friday", completed: false },
  { id: 2, text: "Take a weekend trip together", completed: false },
  { id: 3, text: "Learn to cook a new recipe together", completed: false },
  { id: 4, text: "Go stargazing on a clear night", completed: false },
  { id: 5, text: "Write love letters to each other", completed: false },
  { id: 6, text: "Take a dance class together", completed: false },
  { id: 7, text: "Visit each other's favorite childhood places", completed: false },
  { id: 8, text: "Build a pillow fort together", completed: false },
];

export default function RelationshipGoals() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [goals, setGoals] = useState<typeof DEFAULT_GOALS>([]);
  const [newGoal, setNewGoal] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setGoals(DEFAULT_GOALS.map(g => ({ ...g })));
    setCompletedCount(0);
  };

  const toggleGoal = (id: number) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
      setCompletedCount(updated.filter(g => g.completed).length);
      return updated;
    });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now(),
      text: newGoal.trim(),
      completed: false
    }]);
    setNewGoal('');
  };

  const allDone = () => {
    setGameState('finished');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">🌱</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Relationship Goals</h1>
              <p className="text-gray-600 mb-8 text-lg">Set and achieve goals together!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-green-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-green-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🎯 Choose from preset goals</li>
                  <li>➕ Add your own custom goals</li>
                  <li>✅ Mark them complete as you go</li>
                  <li>📈 Track your relationship growth!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-black text-gray-900 mb-2">Your Relationship Goals</h2>
                <p className="text-green-600 font-bold">{completedCount}/{goals.length} completed</p>
                <div className="w-full h-2 bg-white/50 rounded-full mt-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                    style={{ width: `${goals.length > 0 ? (completedCount / goals.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {goals.map(goal => (
                  <motion.div key={goal.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleGoal(goal.id)}
                    className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border p-4 cursor-pointer transition-all flex items-center gap-4 ${goal.completed ? 'border-green-300 bg-green-50/70' : 'border-green-100/60'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${goal.completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                      {goal.completed && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {goal.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-green-100/60 p-4 mb-6">
                <div className="flex gap-2">
                  <input type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)}
                    placeholder="Add a custom goal..."
                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-green-500" />
                  <button onClick={addGoal} className="px-5 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {completedCount === goals.length && goals.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-lg font-bold text-green-700">All goals completed! Amazing couple! 🌟</p>
                  <button onClick={allDone} className="mt-3 px-6 py-2 bg-green-500 text-white rounded-xl font-bold">
                    See Results
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🌱</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Relationship Goals</h2>
              <p className="text-5xl font-black gradient-text mb-2">{completedCount}/{goals.length}</p>
              <p className="text-gray-600 mb-8">
                {completedCount === goals.length ? "You're an amazing couple! All goals achieved! 🎉" : "Keep working towards your goals! 💕"}
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-white font-bold shadow-lg">
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
