'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Target, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

type Category = 'Communication' | 'Intimacy' | 'Adventure' | 'Growth' | 'Family';

const DEFAULT_GOALS: Record<Category, { id: number; text: string; progress: number }[]> = {
  Communication: [
    { id: 1, text: 'Have a weekly relationship check-in', progress: 0 },
    { id: 2, text: 'Read a relationship book together', progress: 0 },
    { id: 3, text: 'Practice active listening for 10 min daily', progress: 0 },
  ],
  Intimacy: [
    { id: 4, text: 'Plan a monthly date night (no phones)', progress: 0 },
    { id: 5, text: 'Give each other a massage once a week', progress: 0 },
  ],
  Adventure: [
    { id: 6, text: 'Take a quarterly trip together', progress: 0 },
    { id: 7, text: 'Try one new activity every month', progress: 0 },
  ],
  Growth: [
    { id: 8, text: 'Try a new hobby together', progress: 0 },
    { id: 9, text: 'Learn a new skill as a couple', progress: 0 },
  ],
  Family: [
    { id: 10, text: 'Have a monthly family visit', progress: 0 },
    { id: 11, text: 'Plan a yearly family tradition', progress: 0 },
  ],
};

const CAT_COLORS: Record<Category, string> = {
  Communication: 'from-blue-400 to-indigo-500',
  Intimacy: 'from-pink-400 to-rose-500',
  Adventure: 'from-orange-400 to-red-500',
  Growth: 'from-green-400 to-teal-500',
  Family: 'from-purple-400 to-pink-500',
};

export default function RelationshipGoalsPage() {
  const [goals, setGoals] = useState<typeof DEFAULT_GOALS>(DEFAULT_GOALS);
  const [activeCat, setActiveCat] = useState<Category>('Communication');
  const [newGoal, setNewGoal] = useState('');

  const cats = Object.keys(goals) as Category[];

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(g => ({ ...g, [activeCat]: [...g[activeCat], { id: Date.now(), text: newGoal.trim(), progress: 0 }] }));
    setNewGoal('');
  };

  const updateProgress = (cat: Category, id: number, delta: number) => {
    setGoals(g => ({
      ...g,
      [cat]: g[cat].map(item => item.id === id ? { ...item, progress: Math.max(0, Math.min(100, item.progress + delta)) } : item)
    }));
  };

  const removeGoal = (cat: Category, id: number) => {
    setGoals(g => ({ ...g, [cat]: g[cat].filter(item => item.id !== id) }));
  };

  const allGoals = cats.flatMap(c => goals[c].map(i => ({ ...i, cat: c })));
  const totalProgress = allGoals.length === 0 ? 0 : Math.round(allGoals.reduce((s, g) => s + g.progress, 0) / allGoals.length);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Target className="w-5 h-5 text-rose-500" /> Relationship Goals</h1>
            <button onClick={() => { setGoals(DEFAULT_GOALS); setActiveCat('Communication'); }} className="p-2 hover:bg-white rounded-full transition-colors"><RotateCcw className="w-6 h-6 text-gray-600" /></button>
          </div>

          <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Yearly Progress</h3>
                <span className="text-2xl font-black text-rose-500">{totalProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${totalProgress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <p className="text-sm text-gray-500">{allGoals.length} goals across {cats.length} categories</p>
            </div>
          </TiltCard>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {cats.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCat === cat ? `bg-gradient-to-r ${CAT_COLORS[cat]} text-white shadow-lg` : 'bg-white border border-gray-200 text-gray-600'}`}>
                {cat}
              </button>
            ))}
          </div>

          <TiltCard intensity={3}>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-4 space-y-2">
              <div className="flex gap-2">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Add a custom goal..." onKeyDown={e => e.key === 'Enter' && addGoal()}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                <Button onClick={addGoal} variant="primary" size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </TiltCard>

          <div className="space-y-3">
            {goals[activeCat].map(goal => (
              <motion.div key={goal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800">{goal.text}</p>
                  <button onClick={() => removeGoal(activeCat, goal.id)} className="text-red-300 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateProgress(activeCat, goal.id, -10)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div className={`h-full bg-gradient-to-r ${CAT_COLORS[activeCat]} rounded-full`} animate={{ width: `${goal.progress}%` }} />
                  </div>
                  <button onClick={() => updateProgress(activeCat, goal.id, 10)} className="w-7 h-7 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold">+</button>
                  <span className="text-xs font-bold text-gray-600 w-10 text-right">{goal.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-3">Total: {allGoals.length} goals | Overall: {totalProgress}%</p>
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
