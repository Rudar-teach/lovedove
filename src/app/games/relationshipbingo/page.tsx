'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Sparkles, Milestone, Gift } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Milestone {
  title: string;
  description: string;
  phase: 'new' | 'dating' | 'committed' | 'married' | 'everlasting';
  emoji: string;
}

const MILESTONES: Milestone[] = [
  { title: "First Meeting", description: "The moment your eyes met for the first time", phase: "new", emoji: "👀" },
  { title: "First Conversation", description: "That initial chat that sparked something", phase: "new", emoji: "💬" },
  { title: "First Date", description: "The night that changed everything", phase: "new", emoji: "🌹" },
  { title: "First 'I Love You'", description: "Three words that changed your world", phase: "dating", emoji: "💭" },
  { title: "First 'I Love You Too'", description: "When they said it back - pure magic", phase: "dating", emoji: "✨" },
  { title: "First Trip Together", description: "Traveling together and learning each other's rhythms", phase: "dating", emoji: "✈️" },
  { title: "Meeting the Family", description: "Big step - meeting parents and family", phase: "committed", emoji: "👨‍👩‍👧" },
  { title: "Moving In Together", description: "Sharing a home - the ultimate commitment test", phase: "committed", emoji: "🏠" },
  { title: "First Pet Together", description: "A furry addition to your family", phase: "committed", emoji: "🐾" },
  { title: "The Proposal", description: "The big question and the biggest yes", phase: "married", emoji: "💍" },
  { title: "The Wedding Day", description: "Celebrating your love surrounded by those you love", phase: "married", emoji: "💒" },
  { title: "First Home", description: "Building your dream space together", phase: "married", emoji: "🏡" },
  { title: "First Anniversary", description: "Celebrating another year of love", phase: "everlasting", emoji: "🎉" },
  { title: "10 Year Anniversary", description: "A decade of memories and growing together", phase: "everlasting", emoji: "🎊" },
  { title: "Growing Old Together", description: "Every day is a new chapter in your story", phase: "everlasting", emoji: "👴👵" },
  { title: "Still In Love", description: "After all these years, still choosing each other", phase: "everlasting", emoji: "💕" },
];

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  dating: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  committed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  married: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  everlasting: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function RelationshipBingo() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [marked, setMarked] = useState<boolean[]>(Array(16).fill(false));
  const [completed, setCompleted] = useState<string[]>([]);

  const startGame = () => {
    setMarked(Array(16).fill(false));
    setCompleted([]);
    setGameState('playing');
  };

  const toggleMilestone = (idx: number) => {
    setMarked(prev => {
      const newMarked = [...prev];
      newMarked[idx] = !newMarked[idx];
      if (newMarked[idx] && !completed.includes(MILESTONES[idx].title)) {
        setCompleted(c => [...c, MILESTONES[idx].title]);
      }
      if (!newMarked[idx]) {
        setCompleted(c => c.filter(t => t !== MILESTONES[idx].title));
      }
      return newMarked;
    });
  };

  const getPhaseCompletion = (phase: string) => {
    const phaseMilestones = MILESTONES.filter(m => m.phase === phase);
    const done = phaseMilestones.filter(m => completed.includes(m.title)).length;
    return { done, total: phaseMilestones.length };
  };

  const totalCompletion = Math.round((completed.length / MILESTONES.length) * 100);

  const phases = ['new', 'dating', 'committed', 'married', 'everlasting'] as const;

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
                  <Milestone className="w-5 h-5 text-pink-500" />
                  <span className="font-bold text-gray-700">Milestone Bingo</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Relationship Milestone Bingo</h1>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Mark off relationship milestones as you experience them. Track your journey from first meeting to forever!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Milestone className="w-5 h-5 text-pink-500" /> Relationship Phases
                </h3>
                <div className="space-y-2">
                  {phases.map(p => (
                    <div key={p} className="flex items-center gap-2">
                      <span className="text-lg">{p === 'new' ? '🌱' : p === 'dating' ? '💕' : p === 'committed' ? '💍' : p === 'married' ? '🏡' : '🌅'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${PHASE_COLORS[p].bg} ${PHASE_COLORS[p].text}`}>{p}</span>
                      <span className="text-xs text-gray-500">{getPhaseCompletion(p).done}/{getPhaseCompletion(p).total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Start Tracking
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <span className="text-lg font-black text-gray-700">{completed.length}/{MILESTONES.length} milestones</span>
                <div className="w-full h-3 bg-white/50 rounded-full mt-2 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: `${totalCompletion}%` }} />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {phases.map(phase => {
                  const phaseMilestones = MILESTONES.filter(m => m.phase === phase);
                  return (
                    <div key={phase} className={`rounded-2xl p-4 ${PHASE_COLORS[phase].bg} border ${PHASE_COLORS[phase].border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{phase === 'new' ? '🌱' : phase === 'dating' ? '💕' : phase === 'committed' ? '💍' : phase === 'married' ? '🏡' : '🌅'}</span>
                        <span className="font-bold text-sm capitalize">{phase} Phase</span>
                        <span className="text-xs ml-auto">{getPhaseCompletion(phase).done}/{getPhaseCompletion(phase).total}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {phaseMilestones.map((m, i) => {
                          const realIdx = MILESTONES.indexOf(m);
                          return (
                            <motion.button
                              key={realIdx}
                              onClick={() => toggleMilestone(realIdx)}
                              whileTap={{ scale: 0.97 }}
                              className={`p-3 rounded-xl text-left transition border ${marked[realIdx] ? 'bg-white border-pink-300' : 'bg-white/50 border-transparent opacity-70 hover:opacity-100'}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-lg ${marked[realIdx] ? '' : 'grayscale opacity-50'}`}>{m.emoji}</span>
                                <div>
                                  <p className={`text-xs font-bold ${marked[realIdx] ? 'text-gray-900 line-through' : 'text-gray-700'}`}>{m.title}</p>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <button onClick={() => setGameState('finished')} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  See Results
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Your Journey</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-8">{totalCompletion}%</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Completed Milestones</h3>
                {phases.map(phase => {
                  const phaseMilestones = MILESTONES.filter(m => m.phase === phase && completed.includes(m.title));
                  if (phaseMilestones.length === 0) return null;
                  return (
                    <div key={phase} className="mb-3">
                      <p className={`text-xs font-bold uppercase mb-1 ${PHASE_COLORS[phase].text}`}>{phase} Phase</p>
                      {phaseMilestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                          <span>{m.emoji}</span>
                          <span className="text-sm text-gray-600">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={() => { setMarked(Array(16).fill(false)); setCompleted([]); setGameState('playing'); }} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Continue
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
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