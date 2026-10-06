'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Calendar, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Milestone {
  id: number;
  month: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  emoji: string;
  completed: boolean;
}

const generateMilestones = (): Milestone[] => [
  { id: 1, month: 1, title: 'First Date', description: 'Plan and enjoy your first official date together.', difficulty: 'easy', points: 20, emoji: '🌹', completed: false },
  { id: 2, month: 1, title: 'Meet Friends', description: 'Introduce each other to a close friend.', difficulty: 'easy', points: 20, emoji: '👫', completed: false },
  { id: 3, month: 2, title: 'First Road Trip', description: 'Take a weekend trip together.', difficulty: 'medium', points: 40, emoji: '🚗', completed: false },
  { id: 4, month: 2, title: 'Share Stories', description: 'Share your childhood stories with each other.', difficulty: 'easy', points: 20, emoji: '📖', completed: false },
  { id: 5, month: 3, title: 'Meet Family', description: 'Meet each other close family member.', difficulty: 'medium', points: 40, emoji: '👨‍👩‍👧', completed: false },
  { id: 6, month: 3, title: 'First Argument', description: 'Have your first disagreement and resolve it maturely.', difficulty: 'medium', points: 30, emoji: '🤝', completed: false },
  { id: 7, month: 4, title: 'Love Letter', description: 'Write and exchange handwritten love letters.', difficulty: 'easy', points: 25, emoji: '✉️', completed: false },
  { id: 8, month: 4, title: 'Future Talk', description: 'Have a deep conversation about your future together.', difficulty: 'medium', points: 40, emoji: '🔮', completed: false },
  { id: 9, month: 5, title: '5 Date Challenge', description: 'Go on 5 different dates in one month.', difficulty: 'medium', points: 50, emoji: '🗓️', completed: false },
  { id: 10, month: 5, title: 'Cook Together', description: 'Cook a full meal together from scratch.', difficulty: 'easy', points: 25, emoji: '👨‍🍳', completed: false },
  { id: 11, month: 6, title: '6 Month Celebration', description: 'Celebrate your 6-month milestone with a special date.', difficulty: 'medium', points: 40, emoji: '🎂', completed: false },
  { id: 12, month: 12, title: 'One Year Together', description: 'Celebrate your first anniversary in a meaningful way.', difficulty: 'hard', points: 100, emoji: '💍', completed: false },
];

export default function RelationshipGoalsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [milestones, setMilestones] = useState<Milestone[]>(generateMilestones());
  const [score, setScore] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(1);

  const startGame = () => { setMilestones(generateMilestones()); setScore(0); setCurrentMonth(1); setPhase('playing'); };

  const completeMilestone = (id: number) => {
    setMilestones(m => m.map(ms => ms.id === id ? { ...ms, completed: true } : ms));
    const ms = milestones.find(m => m.id === id);
    if (ms) setScore(s => s + ms.points);
  };

  const allDone = milestones.every(m => m.completed);

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
                <div className="flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" /><span className="font-bold text-gray-700">Relationship Goals</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🗺️</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Relationship Goals</h1>
              <p className="text-gray-600 mb-8 text-lg">Track relationship milestones from month 1 to year 1!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
                <span className="text-sm font-bold text-purple-600">{milestones.filter(m => m.completed).length}/{milestones.length}</span>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-6">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4, 5, 6, 12].map(month => (
                    <button key={month} onClick={() => setCurrentMonth(month)} className={`px-3 py-2 rounded-xl text-xs font-bold ${currentMonth === month ? 'bg-purple-500 text-white' : 'bg-white text-gray-600'}`}>{month === 12 ? '12M' : month + 'M'}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {milestones.filter(m => m.month <= currentMonth).map(m => (
                  <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-white/70 backdrop-blur-xl rounded-2xl p-4 border-2 ${m.completed ? 'border-green-300 bg-green-50' : 'border-pink-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{m.completed ? '✅' : m.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{m.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.difficulty === 'easy' ? 'bg-green-100 text-green-700' : m.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{m.difficulty}</span>
                        </div>
                        <p className="text-sm text-gray-600">{m.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{m.points} pts</p>
                      </div>
                      {!m.completed && <button onClick={() => completeMilestone(m.id)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition">Done</button>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}