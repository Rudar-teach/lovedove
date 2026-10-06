'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Zap, Target, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: 'communication' | 'fun' | 'romance' | 'adventure';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  emoji: string;
  duration: string;
}

const CHALLENGES: Challenge[] = [
  { id: 1, title: '30 Days of Compliments', description: 'Give your partner at least one genuine compliment every day for 30 days straight.', category: 'romance', difficulty: 'easy', points: 50, emoji: '💝', duration: '30 days' },
  { id: 2, title: 'Weekly Date Night', description: 'Plan and execute a creative date night every week for a month.', category: 'romance', difficulty: 'medium', points: 80, emoji: '🌹', duration: '4 weeks' },
  { id: 3, title: 'Communication Marathon', description: 'Have a 30-minute uninterrupted conversation about anything for 7 days in a row.', category: 'communication', difficulty: 'medium', points: 70, emoji: '💬', duration: '7 days' },
  { id: 4, title: 'Adventure Seeker', description: 'Try 5 new activities together that neither of you has done before.', category: 'adventure', difficulty: 'hard', points: 100, emoji: '🎢', duration: '2 weeks' },
  { id: 5, title: 'Laughter Challenge', description: 'Make your partner laugh at least 3 times every day for 2 weeks.', category: 'fun', difficulty: 'easy', points: 40, emoji: '😂', duration: '14 days' },
  { id: 6, title: 'Silent Dinner', description: 'Have a 30-minute meal together without speaking, communicating only with gestures and eye contact.', category: 'communication', difficulty: 'medium', points: 60, emoji: '🤫', duration: '1 day' },
  { id: 7, title: 'Gratitude Exchange', description: 'Write down 3 things you appreciate about each other every day for 2 weeks.', category: 'romance', difficulty: 'easy', points: 50, emoji: '🙏', duration: '14 days' },
  { id: 8, title: 'Sunset Chaser', description: 'Watch the sunset together 3 times this week at different locations.', category: 'adventure', difficulty: 'easy', points: 45, emoji: '🌅', duration: '1 week' },
  { id: 9, title: 'Game Night Series', description: 'Play a board game or card game together every night for a week.', category: 'fun', difficulty: 'easy', points: 40, emoji: '🎲', duration: '7 days' },
  { id: 10, title: 'Future Planning', description: 'Create a vision board together for where you see your relationship in 5 years.', category: 'communication', difficulty: 'medium', points: 70, emoji: '🗺️', duration: '1 day' },
  { id: 11, title: 'Spontaneous Road Trip', description: 'Take an unplanned day trip to somewhere neither of you has been.', category: 'adventure', difficulty: 'hard', points: 90, emoji: '🚗', duration: '1 day' },
  { id: 12, title: 'Dance Off', description: 'Have a 10-minute dance party in your living room with no music to your own beat.', category: 'fun', difficulty: 'easy', points: 35, emoji: '💃', duration: '1 day' },
  { id: 13, title: 'Letter Writing', description: 'Write a handwritten love letter to each other and exchange them.', category: 'romance', difficulty: 'medium', points: 65, emoji: '✉️', duration: '1 day' },
  { id: 14, title: 'Fear Confession', description: 'Share one fear you have about the relationship and work on it together.', category: 'communication', difficulty: 'hard', points: 80, emoji: '💭', duration: '1 day' },
  { id: 15, title: 'Volunteer Together', description: 'Spend a day volunteering together at a local charity or community event.', category: 'adventure', difficulty: 'medium', points: 75, emoji: '🤝', duration: '1 day' },
  { id: 16, title: 'Cooking Challenge', description: 'Cook a full meal together from scratch, neither of you cooking.', category: 'fun', difficulty: 'easy', points: 40, emoji: '👨‍🍳', duration: '1 day' },
  { id: 17, title: 'Stargazing Night', description: 'Find a dark spot outside and identify constellations together.', category: 'romance', difficulty: 'easy', points: 45, emoji: '⭐', duration: '1 night' },
  { id: 18, title: 'Conflict Resolution Practice', description: 'Role-play a conflict scenario and practice healthy resolution techniques.', category: 'communication', difficulty: 'medium', points: 70, emoji: '🤝', duration: '1 day' },
  { id: 19, title: 'Photo Challenge', description: 'Take 50 photos together that represent your relationship, then make a collage.', category: 'fun', difficulty: 'medium', points: 60, emoji: '📸', duration: '1 week' },
  { id: 20, title: 'Hiking Adventure', description: 'Find a nature trail you have never been on and hike it together.', category: 'adventure', difficulty: 'medium', points: 65, emoji: '🥾', duration: '1 day' },
];

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  communication: { icon: '💬', color: 'bg-blue-100 text-blue-700' },
  fun: { icon: '🎉', color: 'bg-yellow-100 text-yellow-700' },
  romance: { icon: '🌹', color: 'bg-pink-100 text-pink-700' },
  adventure: { icon: '🎢', color: 'bg-green-100 text-green-700' },
};

type CategoryFilter = 'all' | 'communication' | 'fun' | 'romance' | 'adventure';
type DiffFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function LoveChallengesPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'pick' | 'active' | 'finished'>('start');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const [pool, setPool] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState(0);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [progress, setProgress] = useState({ communication: 0, fun: 0, romance: 0, adventure: 0 });

  const filtered = CHALLENGES.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false;
    return true;
  });

  const getDailyChallenge = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const cats = Object.keys(CATEGORY_META);
    const cat = cats[dayOfYear % cats.length];
    const catChallenges = CHALLENGES.filter(c => c.category === cat);
    return catChallenges[dayOfYear % catChallenges.length];
  };

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setPhase('active');
  };

  const completeChallenge = () => {
    if (!activeChallenge) return;
    setScore(s => s + activeChallenge.points + streak * 10);
    setStreak(s => s + 1);
    setCompleted(c => [...c, activeChallenge!]);
    setCompletedCategories(c => [...c, activeChallenge!.category]);
    setProgress(p => ({ ...p, [activeChallenge!.category]: p[activeChallenge!.category] + 1 }));
    setActiveChallenge(null);
    if (completed.length + 1 >= 5) setPhase('finished');
    else setPhase('pick');
  };

  const skipChallenge = () => {
    setStreak(0);
    setActiveChallenge(null);
    setPhase('pick');
  };

  const reset = () => { setPhase('start'); setScore(0); setCompleted([]); setStreak(0); setCompletedCategories([]); setProgress({ communication: 0, fun: 0, romance: 0, adventure: 0 }); };

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
                <div className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /><span className="font-bold text-gray-700">Challenges</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Challenges</h1>
              <p className="text-gray-600 mb-8 text-lg">Complete daily, weekly, and monthly challenges together!</p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[2rem] p-6 mb-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <h3 className="font-bold text-gray-900">Today's Featured Challenge</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getDailyChallenge().emoji}</span>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{getDailyChallenge().title}</p>
                    <p className="text-sm text-gray-600">{getDailyChallenge().category} • {getDailyChallenge().points} pts</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                  <div key={cat} className="bg-white/70 rounded-2xl p-3 text-center border border-pink-100">
                    <span className="text-2xl block mb-1">{meta.icon}</span>
                    <span className="text-xs font-bold text-gray-700 capitalize">{cat}</span>
                    <span className="text-xs text-gray-500 block">{CHALLENGES.filter(c => c.category === cat).length}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { setPool(filtered.sort(() => Math.random() - 0.5)); setPhase('pick'); }} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'pick' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">Completed: {completed.length}</span>
                <span className="text-sm font-bold text-orange-600">Score: {score}</span>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as CategoryFilter)} className="px-3 py-2 rounded-xl bg-white/70 text-sm font-bold border">
                  {Object.keys(CATEGORY_META).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {(['easy', 'medium', 'hard'] as DiffFilter[]).map(d => (
                  <button key={d} onClick={() => setDiffFilter(d)} className={`px-3 py-2 rounded-xl text-sm font-bold ${diffFilter === d ? 'bg-blue-500 text-white' : 'bg-white/70 text-gray-700'}`}>{d === 'all' ? 'All' : d}</button>
                ))}
              </div>

              <div className="grid gap-3">
                {filtered.map(ch => {
                  const isDone = completed.some(c => c.id === ch.id);
                  return (
                    <button key={ch.id} onClick={() => !isDone && startChallenge(ch)} disabled={isDone} className={`text-left p-4 rounded-2xl transition ${isDone ? 'bg-green-100 border-2 border-green-300' : 'bg-white/70 border border-pink-100 hover:bg-white hover:shadow-lg'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ch.emoji}</span>
                        <div className="flex-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CATEGORY_META[ch.category].color}`}>{ch.category}</span>
                          <p className="font-bold text-gray-900">{ch.title}</p>
                          <p className="text-sm text-gray-500">{ch.duration} • {ch.points} pts</p>
                        </div>
                        {isDone && <Trophy className="w-6 h-6 text-green-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'active' && activeChallenge && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-[2rem] shadow-2xl p-8 text-white mb-6`}>
                <span className="text-5xl block mb-4">{activeChallenge.emoji}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 mb-4 inline-block`}>{activeChallenge.difficulty.toUpperCase()}</span>
                <h2 className="text-2xl font-black mb-2">{activeChallenge.title}</h2>
                <p className="text-white/80">{activeChallenge.description}</p>
                <p className="text-sm text-white/60 mt-2">+{activeChallenge.points} pts{streak > 0 ? ` (+${streak * 10} bonus)` : ''}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={completeChallenge} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Complete +{activeChallenge.points + streak * 10} pts</button>
                <button onClick={skipChallenge} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Challenge Complete!</h2>
              <p className="text-gray-600 mb-2">{completed.length} challenges completed</p>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Category Progress</h3>
                <div className="space-y-2">
                  {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${Math.min(progress[cat] * 25, 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{progress[cat]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={reset} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
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