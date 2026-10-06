'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Star, Users, Zap, Timer, Target } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Dare {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  emoji: string;
}

const DARES: Dare[] = [
  { text: 'Write each other initials on your arms with a marker', difficulty: 'easy', points: 10, category: 'Affection', emoji: '✍️' },
  { text: 'Play a 2-minute staring contest (no laughing!)', difficulty: 'easy', points: 10, category: 'Fun', emoji: '👀' },
  { text: 'Send a voice note singing a love song', difficulty: 'easy', points: 10, category: 'Fun', emoji: '🎤' },
  { text: 'Give a compliment using only questions', difficulty: 'easy', points: 15, category: 'Communication', emoji: '💬' },
  { text: 'Do your best impression of your partner', difficulty: 'easy', points: 10, category: 'Fun', emoji: '🎭' },
  { text: 'Take a silly selfie together and keep it', difficulty: 'easy', points: 15, category: 'Fun', emoji: '📸' },
  { text: 'Describe your ideal date in 30 seconds', difficulty: 'easy', points: 10, category: 'Communication', emoji: '🗓️' },
  { text: 'Feed each other dessert blindfolded', difficulty: 'medium', points: 25, category: 'Teamwork', emoji: '🍰' },
  { text: 'Build a blanket fort together', difficulty: 'medium', points: 25, category: 'Teamwork', emoji: '⛺' },
  { text: 'Make up a story together, each adding one sentence', difficulty: 'medium', points: 25, category: 'Teamwork', emoji: '📖' },
  { text: 'Give each other a 5-minute massage', difficulty: 'medium', points: 30, category: 'Affection', emoji: '💆' },
  { text: 'Cook a meal together using 3 random ingredients', difficulty: 'medium', points: 30, category: 'Teamwork', emoji: '🍳' },
  { text: 'Draw a portrait of your partner blindfolded', difficulty: 'medium', points: 25, category: 'Fun', emoji: '🎨' },
  { text: 'Whisper a secret fantasy for 60 seconds', difficulty: 'medium', points: 30, category: 'Intimate', emoji: '🤫' },
  { text: 'Plan your dream wedding together in 2 minutes', difficulty: 'medium', points: 25, category: 'Communication', emoji: '💍' },
  { text: 'Act out your favorite movie scene', difficulty: 'medium', points: 25, category: 'Fun', emoji: '🎬' },
  { text: 'Create a secret handshake together', difficulty: 'medium', points: 20, category: 'Teamwork', emoji: '🤝' },
  { text: 'Write a love poem for each other', difficulty: 'hard', points: 50, category: 'Romance', emoji: '✍️' },
  { text: 'Do a trust fall exercise', difficulty: 'hard', points: 40, category: 'Teamwork', emoji: '🤸' },
  { text: 'Exchange back scratches for 10 minutes', difficulty: 'hard', points: 40, category: 'Affection', emoji: '👐' },
  { text: 'Write down your top 3 fantasies and share them', difficulty: 'hard', points: 50, category: 'Intimate', emoji: '🔥' },
  { text: 'Plan a surprise for each other within 1 week', difficulty: 'hard', points: 50, category: 'Teamwork', emoji: '🎁' },
  { text: 'Dance together for 5 minutes without music', difficulty: 'hard', points: 35, category: 'Fun', emoji: '💃' },
  { text: 'Recreate your first date', difficulty: 'hard', points: 50, category: 'Romance', emoji: '💫' },
  { text: 'Write a love letter and mail it', difficulty: 'hard', points: 50, category: 'Romance', emoji: '💌' },
];

const TIMES: Record<string, number> = { easy: 30, medium: 60, hard: 90 };
const COLORS: Record<string, { bg: string; text: string; grad: string; }> = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', grad: 'from-green-500 to-emerald-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', grad: 'from-amber-500 to-orange-500' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', grad: 'from-red-500 to-rose-500' },
};

export default function LoveDares2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [filter, setFilter] = useState<string>('all');
  const [pool, setPool] = useState<Dare[]>([]);
  const [current, setCurrent] = useState<Dare | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<Dare[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<any>(null);

  const startGame = (f: string) => {
    let p = f === 'all' ? [...DARES] : DARES.filter(d => d.category === f);
    const shuffled = p.sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setCurrent(shuffled[0] || null);
    setScore(0); setCompleted([]); setFilter(f); setStreak(0);
    setTimer(shuffled[0] ? TIMES[shuffled[0].difficulty] : 0);
    setTimerOn(false);
    setPhase('playing');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (timerOn && timer > 0 && phase === 'playing') {
      intervalRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { setTimerOn(false); return 0; } return t - 1; });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerOn, timer, phase]);

  useEffect(() => {
    if (current && phase === 'playing') {
      setTimer(TIMES[current.difficulty]);
      setTimerOn(false);
    }
  }, [current?.text]);

  const completeDare = () => {
    if (!current) return;
    const bonus = streak > 0 ? streak * 5 : 0;
    setScore(s => s + current.points + bonus);
    setStreak(s => s + 1);
    setCompleted(c => [...c, current!]);
    const idx = pool.indexOf(current);
    if (idx < pool.length - 1) { setPool(p => p.slice(idx + 1)); setCurrent(pool[idx + 1]); }
    else { setCurrent(null); setPhase('finished'); }
  };

  const skipDare = () => {
    setStreak(0);
    const idx = pool.indexOf(current!);
    if (idx < pool.length - 1) { setPool(p => p.slice(idx + 1)); setCurrent(pool[idx + 1]); }
    else { setCurrent(null); setPhase('finished'); }
  };

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
                <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /><span className="font-bold text-gray-700">Teamwork Dares</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🔥</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Teamwork Dares</h1>
              <p className="text-gray-600 mb-8 text-lg">25 dares that require teamwork and trust!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Score points based on dare difficulty</li>
                  <li>Teamwork dares require both to participate</li>
                  <li>Build streak for bonus points</li>
                  <li>Timer adds challenge</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {['all', ...DARES.map(d => d.category)].filter((v, i, a) => a.indexOf(v) === i).map(f => (
                  <button key={f} onClick={() => startGame(f)} className="px-4 py-2 rounded-full bg-white/70 text-sm font-bold text-gray-700 hover:bg-white transition">{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
              <button onClick={() => startGame('all')} className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">{completed.length}/{pool.length + completed.length} done</span>
                <span className="text-sm font-bold text-orange-600"><Flame className="w-3 h-3 inline mr-1" />{streak} streak</span>
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
              </div>

              <div className={`bg-gradient-to-br ${COLORS[current.difficulty].grad} rounded-[2rem] shadow-2xl p-8 mb-4 text-white text-center`}>
                <div className="text-5xl mb-4">{current.emoji}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-4 inline-block`}>{current.difficulty.toUpperCase()}</span>
                <p className="text-xl font-black leading-relaxed mb-3">{current.text}</p>
                <p className="text-sm text-white/70">+{current.points} pts{streak > 0 ? ` (+${streak * 5} streak bonus)` : ''}</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Timer className="w-5 h-5 text-gray-500" /><span className="font-bold text-gray-700">Time Limit</span></div>
                  <span className={`font-mono text-lg font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                  <button onClick={() => setTimerOn(!timerOn)} className="px-4 py-2 bg-pink-100 rounded-xl text-sm font-bold text-pink-700">{timerOn ? 'Pause' : 'Start'}</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={completeDare} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Done! +{current.points + streak * 5} pts</button>
                <button onClick={skipDare} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Amazing!</h2>
              <p className="text-gray-600 mb-4">Completed {completed.length} dares</p>
              <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => startGame(filter)} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}