'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const CHALLENGES = [
  { day: 1, text: "Write 3 things you love about each other" },
  { day: 2, text: "Take a cute photo together" },
  { day: 3, text: "Cook a meal together" },
  { day: 4, text: "Have a movie night with snacks" },
  { day: 5, text: "Go for a walk and hold hands" },
  { day: 6, text: "Write love notes to each other" },
  { day: 7, text: "Dance to your favorite song together" },
  { day: 8, text: "Share your favorite childhood memory" },
  { day: 9, text: "Plan your dream vacation together" },
  { day: 10, text: "Watch the sunset/sunrise together" },
  { day: 11, text: "Give each other compliments all day" },
  { day: 12, text: "Play your favorite game together" },
  { day: 13, text: "Make a playlist of your favorite songs together" },
  { day: 14, text: "Write down your relationship goals" },
  { day: 15, text: "Recreate your first date" },
  { day: 16, text: "Learn a new skill together online" },
  { day: 17, text: "Exchange favorite childhood stories" },
  { day: 18, text: "Have a picnic indoors or outdoors" },
  { day: 19, text: "Make each other a special drink" },
  { day: 20, text: "Write each other a love letter" },
  { day: 21, text: "Take a bubble bath together" },
  { day: 22, text: "Watch each other's favorite show" },
  { day: 23, text: "Do a random act of kindness for each other" },
  { day: 24, text: "Have a spa day at home" },
  { day: 25, text: "Share your dreams and aspirations" },
  { day: 26, text: "Make a bucket list together" },
  { day: 27, text: "Have a cooking competition" },
  { day: 28, text: "Write down reasons you're grateful for each other" },
  { day: 29, text: "Have a stargazing night" },
  { day: 30, text: "Celebrate your love journey!" },
];

export default function LoveChallenges() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [completed, setCompleted] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(1);

  const toggleDay = (day: number) => {
    setCompleted(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    if (completed.length === CHALLENGES.length - 1 && !completed.includes(day)) setGameState('finished');
  };
  const start = () => { setGameState('playing'); setCompleted([]); setCurrentDay(1); };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div><span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span></Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-6xl mb-6">🔥</div><h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Challenges</h1><p className="text-gray-600 mb-3 text-lg">30 days of love challenges for couples!</p>
            <p className="text-sm text-gray-500 mb-8">Complete one challenge each day together</p>
            <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl"><Play className="w-5 h-5 inline mr-2" /> Start Challenge</button>
          </motion.div>)}
          {gameState === 'playing' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-gray-600">Day {currentDay}/30</span>
              <span className="text-sm font-medium text-orange-600">{completed.length}/30 completed</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
              {CHALLENGES.map(c => (
                <button key={c.day} onClick={() => setCurrentDay(c.day)} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${completed.includes(c.day) ? 'bg-green-500 text-white' : currentDay === c.day ? 'bg-orange-500 text-white ring-4 ring-orange-200' : 'bg-white/70 text-gray-600 hover:bg-white'}`}>
                  {completed.includes(c.day) ? '✓' : c.day}
                </button>
              ))}
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-[2rem] shadow-2xl p-8 text-white mb-6">
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">Day {currentDay}</span>
                <p className="text-xl font-medium leading-relaxed">{CHALLENGES[currentDay - 1]?.text}</p>
              </div>
            </div>
            <button onClick={() => toggleDay(currentDay)} className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all ${completed.includes(currentDay) ? 'bg-red-100 text-red-600' : 'bg-white/70 text-gray-700'}`}>
              {completed.includes(currentDay) ? '✓ Completed - Click to undo' : 'Mark as Complete ✓'}
            </button>
          </motion.div>)}
          {gameState === 'finished' && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-6">🏆</div><h2 className="text-3xl font-display font-black text-gray-900 mb-2">All 30 Days Complete!</h2><p className="text-gray-600 mb-8">You're amazing couple! 💕</p>
            <div className="flex gap-4 justify-center"><button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Start Again</button><Link href="/games" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link></div>
          </motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}