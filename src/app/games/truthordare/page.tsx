'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Shield, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const DARES = [
  "Give your partner 5 genuine compliments right now",
  "Write a love poem and read it aloud",
  "Recreate your partner's most charming pose",
  "Cook their favorite meal together tonight",
  "Plan a surprise date for this weekend",
  "Dance in the kitchen to your song",
  "Make a list of 10 things you love about them",
  "Take a silly couples selfie and frame it",
  "Give them a 5-minute full-body massage",
  "Plant a kiss on every fingertip",
  "Send 3 flirty texts they'll receive later today",
  "Draw a heart on their hand with a marker",
  "Look into each other's eyes for 60 seconds without laughing",
  "Slow dance in the living room",
  "Feed each other chocolate-covered strawberries",
  "Write and mail a real love letter",
  "Cook breakfast together tomorrow morning",
  "Create a new couple tradition tonight",
  "Make a scrapbook page of your favorite memory",
  "Tell them 5 things you'd miss if they weren't here",
  "Do your best impression of them and ask for feedback",
  "Create a playlist together of your top 10 songs",
  "Give them a shoulder massage with lavender oil",
  "Plan an imaginary dream vacation together",
  "Recreate your first date at home tonight",
  "Hold hands and don't let go for 10 full minutes",
  "Teach each other your favorite board game",
  "Stargaze together on a blanket outside tonight",
  "Create a 'reasons I love you' jar",
  "Have a 20-minute no-phones deep conversation",
];

const SPICY_DARES = [
  ...DARES,
  "Whisper 3 things you've been thinking about but haven't said",
  "Give your partner a 30-second slow kiss",
  "Create a short couple TikTok dance together",
  "Roleplay meeting for the first time at a bar",
  "Take turns giving each other neck/shoulder massages",
  "Write down a secret fantasy and share it with each other",
];

type Mode = 'soft' | 'spicy';
type Phase = 'start' | 'dare' | 'result';

export default function TruthOrDarePage() {
  const [mode, setMode] = useState<Mode>('soft');
  const [phase, setPhase] = useState<Phase>('start');
  const [dares, setDares] = useState(DARES);
  const [current, setCurrent] = useState('');
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [toast, setToast] = useState(false);

  const softMode = () => {
    const shuffled = [...DARES].sort(() => Math.random() - 0.5);
    setDares(shuffled);
    setMode('soft');
    setDone([]);
    setScore(0);
    setIdx(0);
    setCurrent(shuffled[0]);
    setTimer(30);
    setPhase('dare');
  };

  const spicyMode = () => {
    const shuffled = [...SPICY_DARES].sort(() => Math.random() - 0.5);
    setDares(shuffled);
    setMode('spicy');
    setDone([]);
    setScore(0);
    setIdx(0);
    setCurrent(shuffled[0]);
    setTimer(45);
    setPhase('dare');
  };

  useEffect(() => {
    if (phase !== 'dare' || timer <= 0) return;
    const t = setTimeout(() => setTimer(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timer]);

  const next = () => {
    setDone(d => [...d, current]);
    setScore(s => s + (mode === 'soft' ? 10 : 25));
    if (idx < dares.length - 1) {
      setIdx(i => i + 1);
      setCurrent(dares[idx + 1]);
      setTimer(mode === 'spicy' ? 45 : 30);
    } else {
      setPhase('result');
    }
  };

  const skip = () => {
    if (idx < dares.length - 1) {
      setIdx(i => i + 1);
      setCurrent(dares[idx + 1]);
      setTimer(mode === 'spicy' ? 45 : 30);
    } else {
      setPhase('result');
    }
  };

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Flame className="w-5 h-5 text-rose-500" /> Truth or Dare</h1>
            <button onClick={() => setPhase('start')} className="p-2 hover:bg-white rounded-full transition-colors"><RotateCcw className="w-6 h-6 text-gray-600" /></button>
          </div>

          <div className="flex justify-center mb-4">
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full shadow border border-pink-100/60 text-sm font-medium text-gray-700">
              <Heart className="w-4 h-4" /> Share Game
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🔥</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Truth or Dare</h2>
                    <p className="text-gray-600">Fun challenges to deepen your bond!</p>
                    <p className="text-sm text-gray-500">Choose your comfort level:</p>
                    <div className="space-y-3">
                      <button onClick={softMode} className="w-full p-5 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-200 hover:border-pink-400 text-left transition-all">
                        <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-pink-500" /><span className="font-bold text-gray-800">Soft Mode</span></div>
                        <p className="text-sm text-gray-600">Sweet, romantic dares — {DARES.length} challenges</p>
                      </button>
                      <button onClick={spicyMode} className="w-full p-5 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-200 hover:border-red-400 text-left transition-all">
                        <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-red-500" /><span className="font-bold text-gray-800">Spicy Mode</span></div>
                        <p className="text-sm text-gray-600">Extra passionate dares — {SPICY_DARES.length} challenges</p>
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'dare' && (
              <motion.div key={`dare-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Dare {idx + 1}/{dares.length}</span>
                  <span className={`text-sm font-bold ${timer <= 10 ? 'text-red-500' : 'text-gray-500'}`}>Score: {score}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full" animate={{ width: `${((idx + 1) / dares.length) * 100}%` }} />
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 bg-gradient-to-r from-rose-500 to-red-500">
                      DARE #{idx + 1}
                    </div>
                    <p className="text-xl font-bold text-gray-800 leading-relaxed">{current}</p>
                  </div>
                </TiltCard>
                <div className="flex gap-3 mt-6">
                  <Button onClick={next} variant="primary" size="lg" className="flex-1">Completed! +{mode === 'soft' ? '10' : '25'} pts</Button>
                  <Button onClick={skip} variant="outline">Skip</Button>
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🏆</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Dare Master!</h2>
                    <p className="text-5xl font-black gradient-text">{score} pts</p>
                    <p className="text-gray-600">You completed {done.length} dares!</p>
                    <div className="space-y-2 text-left max-h-80 overflow-y-auto">
                      {done.map((d, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                          <span className="text-lg">✅</span>
                          <p className="text-sm text-gray-700">{d}</p>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setPhase('start')} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
