'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Goal {
  id: number;
  day: number;
  title: string;
  description: string;
  category: 'intimacy' | 'communication' | 'affection' | 'reflection';
  emoji: string;
}

const GOALS: Goal[] = [
  { id: 1, day: 1, title: 'Morning Affection', description: 'Start the day with a 30-second hug and tell your partner what you love about them this morning.', category: 'affection', emoji: '☀️' },
  { id: 2, day: 2, title: 'Gratitude Share', description: 'Share 3 things you are grateful for about your partner today.', category: 'reflection', emoji: '🙏' },
  { id: 3, day: 3, title: 'Deep Conversation', description: 'Ask your partner a question you have never asked before about their dreams.', category: 'communication', emoji: '💭' },
  { id: 4, day: 4, title: 'Physical Touch', description: 'Hold hands for 5 uninterrupted minutes while sitting together.', category: 'intimacy', emoji: '🤝' },
  { id: 5, day: 5, title: 'Love Letter', description: 'Write 3 sentences about why you love them and leave it somewhere they will find it.', category: 'affection', emoji: '✉️' },
  { id: 6, day: 6, title: 'Memory Lane', description: 'Share your favorite memory together from the past year.', category: 'reflection', emoji: '📸' },
  { id: 7, day: 7, title: 'No Complaints', description: 'Go the entire day without saying a single complaint about anything.', category: 'communication', emoji: '😊' },
  { id: 8, day: 8, title: 'Eye Contact', description: 'Spend 2 minutes looking into each others eyes without speaking.', category: 'intimacy', emoji: '👀' },
  { id: 9, day: 9, title: 'Plan Together', description: 'Plan your next date night together, picking every detail.', category: 'communication', emoji: '🗓️' },
  { id: 10, day: 10, title: 'Compliment Spree', description: 'Give your partner 5 genuine compliments throughout the day.', category: 'affection', emoji: '💬' },
  { id: 11, day: 11, title: 'Dream Sharing', description: 'Share a personal dream or goal you have never told anyone.', category: 'intimacy', emoji: '🌟' },
  { id: 12, day: 12, title: 'Appreciation List', description: 'List 10 small things about them that you take for granted.', category: 'reflection', emoji: '📝' },
  { id: 13, day: 13, title: 'Surprise Gesture', description: 'Do something small but thoughtful for your partner unexpectedly.', category: 'affection', emoji: '🎁' },
  { id: 14, day: 14, title: 'Active Listening', description: 'Listen to your partner talk about their day without interrupting for 15 minutes.', category: 'communication', emoji: '👂' },
  { id: 15, day: 15, title: 'Midpoint Reflection', description: 'Celebrate 2 weeks of growth! Share what has changed in your relationship.', category: 'reflection', emoji: '🎉' },
  { id: 16, day: 16, title: 'Massage Exchange', description: 'Give each other a 10-minute neck and shoulder massage.', category: 'intimacy', emoji: '💆' },
  { id: 17, day: 17, title: 'Shared Activity', description: 'Do a hobby or activity together that only ONE of you enjoys.', category: 'communication', emoji: '🎨' },
  { id: 18, day: 18, title: 'Forgiveness', description: 'Forgive something small that has been bothering you about them.', category: 'reflection', emoji: '🕊️' },
  { id: 19, day: 19, title: 'Dance Together', description: 'Dance to one romantic song, even if just in the kitchen.', category: 'affection', emoji: '💃' },
  { id: 20, day: 20, title: 'Future Vision', description: 'Describe your ideal life together 10 years from now in detail.', category: 'intimacy', emoji: '🔮' },
  { id: 21, day: 21, title: 'Daily Check-In', description: 'Share one feeling you had today and one thing you are looking forward to.', category: 'communication', emoji: '💭' },
  { id: 22, day: 22, title: 'Play Together', description: 'Play a game together - board game, video game, or just make one up.', category: 'affection', emoji: '🎮' },
  { id: 23, day: 23, title: 'Teach Something', description: 'Teach your partner something you are good at.', category: 'communication', emoji: '📚' },
  { id: 24, day: 24, title: 'Vulnerability', description: 'Share something that makes you feel vulnerable in the relationship.', category: 'intimacy', emoji: '💝' },
  { id: 25, day: 25, title: 'Celebration', description: 'Celebrate how far you have come together. Share 3 things you have improved.', category: 'reflection', emoji: '🎊' },
  { id: 26, day: 26, title: 'Quiet Morning', description: 'Spend 30 minutes together in comfortable silence over coffee/tea.', category: 'intimacy', emoji: '☕' },
  { id: 27, day: 27, title: 'Apology Practice', description: 'If needed, apologize sincerely for something. Or practice a perfect apology.', category: 'communication', emoji: '🙏' },
  { id: 28, day: 28, title: 'Adventure Plan', description: 'Plan a weekend adventure or day trip together.', category: 'affection', emoji: '🗺️' },
  { id: 29, day: 29, title: 'Final Reflections', description: 'Share the biggest lesson about love you have learned this month.', category: 'reflection', emoji: '💡' },
  { id: 30, day: 30, title: 'Renewal Day', description: 'Renew your commitment with a special gesture. Look at all 30 days of progress!', category: 'intimacy', emoji: '💍' },
];

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  intimacy: { icon: '💕', color: 'text-pink-600' },
  communication: { icon: '💬', color: 'text-blue-600' },
  affection: { icon: '🤗', color: 'text-amber-600' },
  reflection: { icon: '💭', color: 'text-purple-600' },
};

export default function CoupleGoals2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentDay, setCurrentDay] = useState(0);
  const [score, setScore] = useState(0);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [categoryProgress, setCategoryProgress] = useState<Record<string, number>>({});

  const startGame = () => {
    setCurrentDay(1); setScore(0); setCompletedDays([]); setStreak(0);
    setCategoryProgress({ intimacy: 0, communication: 0, affection: 0, reflection: 0 });
    setPhase('playing');
  };

  const completeDay = () => {
    const goal = GOALS[currentDay - 1];
    setScore(s => s + 10 + streak * 2);
    setStreak(s => s + 1);
    setCompletedDays(d => [...d, currentDay]);
    setCategoryProgress(p => ({ ...p, [goal.category]: p[goal.category] + 1 }));
    if (currentDay >= 30) setPhase('finished');
    else setCurrentDay(d => d + 1);
  };

  const skipDay = () => { setStreak(0); if (currentDay >= 30) setPhase('finished'); else setCurrentDay(d => d + 1); };

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
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" /><span className="font-bold text-gray-700">30 Day Goals</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🗓️</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">30 Day Goals</h1>
              <p className="text-gray-600 mb-8 text-lg">A 30-day journey to deepen your emotional intimacy!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Daily check-in with a new goal</li>
                  <li>30 unique intimacy-building tasks</li>
                  <li>Complete all 30 for a surprise reward</li>
                  <li>Build a streak for bonus points</li>
                </ul>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_META).map(([k, m]) => (
                    <div key={k} className="text-center p-2 bg-pink-50 rounded-xl">
                      <span className="text-lg">{m.icon}</span>
                      <p className="text-xs font-bold text-gray-700 mt-1">{GOALS.filter(g => g.category === k).length}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Day {currentDay}/30</span>
                <span className="text-sm font-bold text-orange-600"><Flame className="w-3 h-3 inline mr-1" />{streak} streak</span>
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
              </div>

              <div className="flex gap-1 mb-4">
                {GOALS.slice(0, currentDay).map(g => (
                  <div key={g.id} className={`flex-1 h-2 rounded-full ${completedDays.includes(g.day) ? 'bg-green-500' : 'bg-gray-200'}`} />
                ))}
                <div className="flex-1 h-2 rounded-full bg-pink-500 animate-pulse" />
              </div>

              <motion.div key={currentDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{GOALS[currentDay - 1].emoji}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 mb-3 inline-block`}>Day {currentDay}</span>
                  <h2 className="text-2xl font-display font-black text-gray-900 mb-2">{GOALS[currentDay - 1].title}</h2>
                  <p className="text-gray-600">{GOALS[currentDay - 1].description}</p>
                  <span className={`text-sm font-bold ${CATEGORY_META[GOALS[currentDay - 1].category].color} mt-2 block`}>{CATEGORY_META[GOALS[currentDay - 1].category].icon} {GOALS[currentDay - 1].category}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-pink-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-pink-600">{completedDays.length}</p>
                    <p className="text-xs text-gray-500">Days Done</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-blue-600">{30 - currentDay}</p>
                    <p className="text-xs text-gray-500">Remaining</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-purple-600">{score}</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={completeDay} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Complete +{10 + streak * 2} pts</button>
                  <button onClick={skipDay} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">30 Days Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">{score} pts</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Category Progress</h3>
                {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                  <div key={cat} className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{meta.icon}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all" style={{ width: `${Math.min((categoryProgress[cat] / 8) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{categoryProgress[cat]}/8</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
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