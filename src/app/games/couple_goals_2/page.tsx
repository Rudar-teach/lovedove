'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, Trophy, Flame, Calendar, Star, Zap, Medal, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface DayChallenge {
  day: number;
  title: string;
  description: string;
  emoji: string;
  category: 'communication' | 'romance' | 'fun' | 'adventure' | 'affection';
  completed: boolean;
}

const CHALLENGES: Omit<DayChallenge, 'completed'>[] = [
  { day: 1, title: "Share your dreams", description: "Tell each other 3 dreams you have for your future", emoji: "🌟", category: 'communication' },
  { day: 2, title: "Morning surprise", description: "Surprise your partner with breakfast in bed", emoji: "☀️", category: 'romance' },
  { day: 3, title: "Dance party", description: "Have a 10-minute dance party together", emoji: "💃", category: 'fun' },
  { day: 4, title: "Nature walk", description: "Take a walk in nature and hold hands", emoji: "🌿", category: 'adventure' },
  { day: 5, title: "Gratitude sharing", description: "Share 5 things you're grateful for about each other", emoji: "🙏", category: 'communication' },
  { day: 6, title: "Cook together", description: "Prepare a meal together from start to finish", emoji: "🍳", category: 'fun' },
  { day: 7, title: "Week 1 reflection", description: "Discuss your first week of challenges", emoji: "📝", category: 'communication' },
  { day: 8, title: "Stargazing", description: "Stargaze together and make wishes", emoji: "✨", category: 'adventure' },
  { day: 9, title: "Love letter", description: "Write a short love letter to each other", emoji: "💌", category: 'romance' },
  { day: 10, title: "Spa night", description: "Give each other a relaxing massage", emoji: "💆", category: 'affection' },
  { day: 11, title: "Learn something", description: "Teach each other something new", emoji: "📚", category: 'fun' },
  { day: 12, title: "Silent connection", description: "Sit in silence holding hands for 10 minutes", emoji: "🤝", category: 'affection' },
  { day: 13, title: "New place", description: "Go somewhere neither of you has been", emoji: "🗺️", category: 'adventure' },
  { day: 14, title: "Halfway celebration!", description: "Celebrate 2 weeks of challenges", emoji: "🎉", category: 'fun' },
  { day: 15, title: "Deep talk", description: "Have an honest conversation about your relationship", emoji: "💬", category: 'communication' },
  { day: 16, title: "Photo walk", description: "Take photos of things that remind you of each other", emoji: "📸", category: 'fun' },
  { day: 17, title: "Sunset date", description: "Watch the sunset together with snacks", emoji: "🌅", category: 'romance' },
  { day: 18, title: "Fitness together", description: "Do a workout or yoga session together", emoji: "💪", category: 'adventure' },
  { day: 19, title: "Compliment spree", description: "Give each other 10 genuine compliments", emoji: "💖", category: 'affection' },
  { day: 20, title: "Goal setting", description: "Set shared goals for the next month", emoji: "🎯", category: 'communication' },
  { day: 21, title: "Taste test", description: "Try a food neither of you has tasted before", emoji: "👅", category: 'fun' },
  { day: 22, title: "Memory lane", description: "Look through photos from your relationship", emoji: "📷", category: 'romance' },
  { day: 23, title: "Baking together", description: "Bake something sweet together", emoji: "🧁", category: 'fun' },
  { day: 24, title: "Candlelit dinner", description: "Create a romantic dinner with candlelight", emoji: "🕯️", category: 'romance' },
  { day: 25, title: "Future planning", description: "Plan a trip or event you want to experience together", emoji: "✈️", category: 'adventure' },
  { day: 26, title: "Silly day", description: "Spend the whole day being goofy together", emoji: "🤪", category: 'fun' },
  { day: 27, title: "Reassurance", description: "Reassure each other about your commitment", emoji: "🤗", category: 'affection' },
  { day: 28, title: "Growth chat", description: "Discuss how you've grown as individuals and a couple", emoji: "🌱", category: 'communication' },
  { day: 29, title: "Bucket list", description: "Create a joint bucket list together", emoji: "📋", category: 'adventure' },
  { day: 30, title: "Celebration!", description: "Celebrate completing 30 days of connection!", emoji: "🏆", category: 'romance' },
];

const CAT_STYLE: Record<string, string> = {
  communication: 'bg-blue-100 text-blue-700',
  romance: 'bg-pink-100 text-pink-700',
  fun: 'bg-amber-100 text-amber-700',
  adventure: 'bg-green-100 text-green-700',
  affection: 'bg-rose-100 text-rose-700',
};

const STREAK_BONUS: Record<number, number> = { 3: 25, 7: 50, 14: 100, 21: 150, 30: 300 };

export default function CoupleGoals2Page() {
  const router = useRouter();
  const [days, setDays] = useState<DayChallenge[]>(CHALLENGES.map(c => ({ ...c, completed: false })));
  const [currentDay, setCurrentDay] = useState(1);
  const [score, setScore] = useState(0);
  const [showDay, setShowDay] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const completeDay = (day: number) => {
    setDays(d => d.map(x => x.day === day ? { ...x, completed: true } : x));
    const ns = currentStreak + 1;
    setCurrentStreak(ns);
    if (ns > bestStreak) setBestStreak(ns);
    const pts = 10 + (STREAK_BONUS[ns] || 0);
    setScore(s => s + pts);
    setShowDay(false);
  };

  const completedCount = days.filter(d => d.completed).length;
  const overallPercent = Math.round((completedCount / 30) * 100);

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
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-gray-700">30 Day Challenge</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-2">30-Day Connection Challenge</h1>
            <p className="text-gray-600 text-lg">Complete one challenge daily and build your relationship!</p>
            <p className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mt-4">{score} pts</p>
          </div>

          <div className="w-full h-4 bg-white/50 rounded-full mb-8 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${overallPercent}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white/70 rounded-2xl p-3 border border-pink-100 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900">{currentStreak}</p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
            <div className="bg-white/70 rounded-2xl p-3 border border-pink-100 text-center">
              <Medal className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900">{bestStreak}</p>
              <p className="text-xs text-gray-500">Best Streak</p>
            </div>
            <div className="bg-white/70 rounded-2xl p-3 border border-pink-100 text-center">
              <Star className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900">{completedCount}/30</p>
              <p className="text-xs text-gray-500">Done</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setView('calendar')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${view === 'calendar' ? 'bg-pink-500 text-white' : 'bg-white/70 text-gray-600'}`}>Calendar</button>
            <button onClick={() => setView('list')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${view === 'list' ? 'bg-pink-500 text-white' : 'bg-white/70 text-gray-600'}`}>List</button>
          </div>

          {view === 'calendar' && (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {days.map(d => (
                <button
                  key={d.day}
                  onClick={() => !d.completed && (setCurrentDay(d.day), setShowDay(true))}
                  disabled={d.completed}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition ${d.completed ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white' : 'bg-white/70 border border-pink-100 text-gray-700 hover:border-pink-300'}`}
                >
                  {d.completed ? '✓' : d.day}
                </button>
              ))}
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-3">
              {days.map(d => (
                <div key={d.day} className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border p-4 ${d.completed ? 'border-green-300 bg-green-50/50' : 'border-pink-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{d.completed ? '✅' : d.emoji}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold text-sm ${d.completed ? 'text-green-600' : 'text-gray-900'}`}>Day {d.day}: {d.title}</h3>
                      <p className="text-xs text-gray-500">{d.description}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${CAT_STYLE[d.category]}`}>{d.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showDay && (() => {
              const day = days.find(d => d.day === currentDay);
              if (!day || day.completed) return null;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDay(false)}>
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
                    <span className="text-5xl block mb-4">{day.emoji}</span>
                    <p className="text-sm text-gray-500 mb-2">Day {day.day}</p>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">{day.title}</h2>
                    <p className="text-gray-600 mb-2">{day.description}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${CAT_STYLE[day.category]}`}>{day.category}</span>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowDay(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-200 transition">Close</button>
                      <button onClick={() => completeDay(day.day)} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-bold hover:shadow-xl transition"><CheckCircle className="w-5 h-5 inline mr-1" /> Complete</button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}