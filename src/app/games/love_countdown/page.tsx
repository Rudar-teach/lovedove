'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoveCountdown() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [milestones, setMilestones] = useState<{ date: string; label: string; passed: boolean }[]>([]);

  useEffect(() => {
    if (gameState !== 'playing' || !anniversaryDate) return;
    const interval = setInterval(() => {
      const target = new Date(anniversaryDate);
      const now = new Date();
      let diff = target.getTime() - now.getTime();
      if (diff < 0) diff = Math.abs(diff);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, anniversaryDate]);

  const startGame = () => {
    if (!anniversaryDate) return;
    setScore(100);
    const future = new Date(anniversaryDate);
    const ms: { date: string; label: string; passed: boolean }[] = [];
    for (let y = 1; y <= 5; y++) {
      const d = new Date(future);
      d.setFullYear(d.getFullYear() + y);
      ms.push({ date: d.toLocaleDateString(), label: `${y} Year${y > 1 ? 's' : ''} Together`, passed: false });
    }
    setMilestones(ms);
    setGameState('playing');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/70 hover:bg-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="font-bold">Love Dove</span>
          </Link>
          <Link href="/games" className="text-sm text-gray-600 hover:text-pink-500 transition">All Games</Link>
        </nav>

        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-7xl mb-4">⏰</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Love Countdown</h1>
            <p className="text-gray-600 mb-8 text-lg">Set your anniversary date and watch the countdown tick down to your special day!</p>
            <input type="date" value={anniversaryDate} onChange={e => setAnniversaryDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none mb-4" />
            <button onClick={startGame} disabled={!anniversaryDate} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <Play className="inline mr-2" /> Start Countdown
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { v: countdown.days, l: 'Days' },
                { v: countdown.hours, l: 'Hours' },
                { v: countdown.minutes, l: 'Minutes' },
                { v: countdown.seconds, l: 'Seconds' },
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl text-center">
                  <p className="text-3xl font-black text-emerald-600">{item.v}</p>
                  <p className="text-xs text-gray-500">{item.l}</p>
                </div>
              ))}
            </div>
            <h3 className="text-lg font-bold text-center mb-4 text-gray-800">Future Milestones</h3>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${m.passed ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div>
                    <p className="font-medium">{m.label}</p>
                    <p className="text-sm text-gray-500">{m.date}</p>
                  </div>
                  <span className="text-2xl">{m.passed ? '🎉' : '📅'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setGameState('finished')} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition">End Countdown</button>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">⏰</div>
            <h2 className="text-3xl font-bold mb-4">Countdown Complete!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">Forever</p>
            <p className="text-gray-600 mb-8">Love has no expiration date! 💚</p>
            <button onClick={() => { setGameState('idle'); setScore(0); }} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Start Over</button>
            <Link href="/games" className="block mt-4 text-emerald-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
