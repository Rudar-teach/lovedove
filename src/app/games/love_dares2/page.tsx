'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';
type Level = 'sweet' | 'romantic' | 'spicy';

interface Dare {
  text: string;
  level: Level;
  duration: number;
  emoji: string;
}

const DARES: Dare[] = [
  { text: "Give your partner a 60-second hug. No talking, just presence.", level: 'sweet', duration: 60, emoji: '🫂' },
  { text: "Whisper three things you love about them.", level: 'sweet', duration: 30, emoji: '💕' },
  { text: "Slow dance together to the first song that comes to mind.", level: 'sweet', duration: 180, emoji: '💃' },
  { text: "Write a love note and read it aloud.", level: 'sweet', duration: 60, emoji: '✍️' },
  { text: "Trace a heart on their back with your finger.", level: 'sweet', duration: 30, emoji: '💝' },
  { text: "Kiss your partner on each of their favorite spots.", level: 'romantic', duration: 90, emoji: '💋' },
  { text: "Recreate your first kiss together.", level: 'romantic', duration: 30, emoji: '💏' },
  { text: "Feed each other something delicious.", level: 'romantic', duration: 60, emoji: '🍓' },
  { text: "Look into each other's eyes for 2 minutes without breaking.", level: 'romantic', duration: 120, emoji: '👀' },
  { text: "Draw a portrait of your partner blindfolded.", level: 'romantic', duration: 120, emoji: '🎨' },
  { text: "Massage your partner's shoulders for 3 minutes.", level: 'romantic', duration: 180, emoji: '💆' },
  { text: "Whisper your favorite fantasy in their ear.", level: 'spicy', duration: 60, emoji: '🔥' },
  { text: "Give your partner a kiss on a place they've been wanting.", level: 'spicy', duration: 30, emoji: '💋' },
  { text: "Reenact your most romantic memory in slow motion.", level: 'spicy', duration: 120, emoji: '🎬' },
  { text: "Cuddle for 5 minutes without phones allowed.", level: 'spicy', duration: 300, emoji: '🛋️' },
  { text: "Share a piece of clothing and wear it for the next hour.", level: 'spicy', duration: 60, emoji: '👕' },
];

const LEVEL_COLORS: Record<Level, string> = {
  sweet: 'from-pink-400 to-rose-500',
  romantic: 'from-rose-500 to-red-500',
  spicy: 'from-red-500 to-orange-600',
};

const LEVEL_LABELS: Record<Level, string> = {
  sweet: '🍯 Sweet',
  romantic: '🌹 Romantic',
  spicy: '🔥 Spicy',
};

export default function LoveDares2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentDare, setCurrentDare] = useState<Dare | null>(null);
  const [deck, setDeck] = useState<Dare[]>([]);
  const [completed, setCompleted] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) {
      if (timerRunning && timeLeft <= 0) setTimerRunning(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerRunning]);

  const startGame = (lvl: Level) => {
    const pool = DARES.filter(d => d.level === lvl);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentDare(shuffled[0]);
    setCompleted(0);
    setSkipped(0);
    setTimeLeft(shuffled[0].duration);
    setTimerRunning(false);
    setPhase('playing');
  };

  const nextDare = () => {
    if (completed + skipped >= deck.length - 1) {
      setPhase('finished');
      return;
    }
    const next = deck[completed + skipped + 1];
    setCurrentDare(next);
    setTimeLeft(next.duration);
    setTimerRunning(false);
  };

  const completeDare = () => {
    setCompleted(c => c + 1);
    nextDare();
  };

  const skipDare = () => {
    setSkipped(s => s + 1);
    nextDare();
  };

  const startTimer = () => setTimerRunning(true);

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">💋</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Dares 2</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Sweet, romantic, or spicy challenges to deepen your bond. Pick a level and let the connection unfold.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Choose Your Heat</h3>
                  <div className="space-y-3">
                    <button onClick={() => startGame('sweet')} className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white p-3 rounded-xl hover:scale-105 transition">🍯 Sweet & Tender</button>
                    <button onClick={() => startGame('romantic')} className="w-full bg-gradient-to-r from-rose-500 to-red-500 text-white p-3 rounded-xl hover:scale-105 transition">🌹 Romantic & Passionate</button>
                    <button onClick={() => startGame('spicy')} className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white p-3 rounded-xl hover:scale-105 transition">🔥 Spicy & Bold</button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && currentDare && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-4 text-rose-700 text-sm flex justify-around">
                  <span>✅ {completed} Done</span>
                  <span>⏭️ {skipped} Skipped</span>
                </div>
                <motion.div key={currentDare.text} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`bg-gradient-to-br ${LEVEL_COLORS[currentDare.level]} rounded-3xl p-10 shadow-2xl text-white text-center`}>
                  <div className="text-6xl mb-4">{currentDare.emoji}</div>
                  <div className="text-sm uppercase tracking-widest mb-3 opacity-90">{LEVEL_LABELS[currentDare.level]}</div>
                  <p className="text-2xl font-medium leading-relaxed mb-6">{currentDare.text}</p>
                  <div className="text-5xl font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                </motion.div>
                <div className="flex gap-3 mt-6 justify-center flex-wrap">
                  {!timerRunning ? (
                    <button onClick={startTimer} className="bg-pink-500 text-white px-5 py-3 rounded-full font-semibold hover:scale-105 transition">▶ Start Timer</button>
                  ) : (
                    <button onClick={() => setTimerRunning(false)} className="bg-yellow-500 text-white px-5 py-3 rounded-full font-semibold">⏸ Pause</button>
                  )}
                  <button onClick={skipDare} className="bg-white/80 px-5 py-3 rounded-full text-rose-600 hover:bg-white transition">⏭️ Skip</button>
                  <button onClick={completeDare} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">✅ Completed!</button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Flame className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Adventure Complete!</h2>
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-green-600">{completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-xl">
                    <div className="text-3xl font-bold text-pink-600">{skipped}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">You completed {Math.round((completed / (completed + skipped || 1)) * 100)}% of dares!</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setPhase('idle')} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link href="/games" className="bg-pink-100 text-rose-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-200 transition">More Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
