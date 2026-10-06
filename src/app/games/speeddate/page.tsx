'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: 'Would you rather', opts: ['Travel the world', 'Build a home together'], type: 'would' },
  { q: 'Would you rather', opts: ['Cook together', 'Eat out every day'], type: 'would' },
  { q: 'Would you rather', opts: ['Beach vacation', 'Mountain retreat'], type: 'would' },
  { q: 'Would you rather', opts: ['Surprise me', 'Plan it together'], type: 'would' },
  { q: "What's your", opts: ['Dream date night', 'Morning routine'], type: 'what' },
  { q: "What's your", opts: ['Love language', 'Ideal weekend'], type: 'what' },
  { q: "What's your", opts: ['Most romantic gesture', 'Fun fact about me'], type: 'what' },
  { q: "What's your", opts: ['Biggest pet peeve', 'Guilty pleasure'], type: 'what' },
  { q: 'Do you believe', opts: ['Love at first sight', 'Destiny brought us together'], type: 'believe' },
  { q: 'Do you believe', opts: ['Soulmates exist', 'Love grows over time'], type: 'believe' },
  { q: 'Do you believe', opts: ['We are perfect together', 'We make each other better'], type: 'believe' },
  { q: 'Do you believe', opts: ['Memories matter most', 'The future matters most'], type: 'believe' },
  { q: 'Would you rather', opts: ['Romantic candlelit dinner', 'Adventure under the stars'], type: 'would' },
  { q: 'Do you believe', opts: ['Opposites attract', 'Similarities last'], type: 'believe' },
  { q: "What's your", opts: ['Best memory together', 'Favorite tradition'], type: 'what' },
  { q: "What's your", opts: ['Favorite way to say "I love you"', 'How to cheer me up'], type: 'what' },
];

type Compatibility = { label: string; min: number; emoji: string };
const RESULTS: Compatibility[] = [
  { label: 'Soulmates!', min: 90, emoji: '💖' },
  { label: 'Made for Each Other!', min: 75, emoji: '💕' },
  { label: 'Perfect Match!', min: 60, emoji: '💗' },
  { label: 'Great Connection!', min: 40, emoji: '💌' },
  { label: 'Worth Getting to Know!', min: 20, emoji: '🌹' },
  { label: 'Keep Dating!', min: 0, emoji: '💘' },
];

export default function SpeedDatePage() {
  const [mode, setMode] = useState<'mode-select' | 'playing' | 'result'>('mode-select');
  const [current, setCurrent] = useState(0);
  const [p1Answers, setP1Answers] = useState<number[]>([]);
  const [p2Answers, setP2Answers] = useState<number[]>([]);
  const [p1Turn, setP1Turn] = useState(true);
  const [compat, setCompat] = useState(0);
  const [timer, setTimer] = useState(10);
  const [activeQs, setActiveQs] = useState<typeof QUESTIONS>([]);
  const timerRef = useRef<number | null>(null);

  const getQuestions = () => {
    const indices: number[] = [];
    while (indices.length < 8) {
      const r = Math.floor(Math.random() * QUESTIONS.length);
      if (!indices.includes(r)) indices.push(r);
    }
    return indices.map(i => QUESTIONS[i]);
  };

  const startGame = () => {
    const qs = getQuestions();
    setActiveQs(qs);
    setCurrent(0);
    setP1Answers([]);
    setP2Answers([]);
    setP1Turn(true);
    setMode('playing');
  };

  useEffect(() => {
    if (mode !== 'playing' || timer <= 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setTimer(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, timer]);

  useEffect(() => {
    if (mode !== 'playing' || timer > 0) return;
    handleAnswer(0);
  }, [timer, mode]);

  const handleAnswer = (idx: number) => {
    if (mode !== 'playing') return;
    if (p1Turn) {
      setP1Answers(a => [...a, idx]);
    } else {
      setP2Answers(a => [...a, idx]);
    }

    if (p1Turn) {
      setP1Turn(false);
      setTimer(10);
    } else {
      if (current + 1 >= 8) {
        let same = 0;
        const all = [...p1Answers, idx];
        for (let i = 0; i < 8; i++) { if (all[i] === p2Answers[i]) same++; }
        const score = Math.round((same / 8) * 100);
        setCompat(score);
        setMode('result');
      } else {
        setCurrent(c => c + 1);
        setP1Turn(true);
        setTimer(10);
      }
    }
  };

  const result = RESULTS.find(r => compat >= r.min)!;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2"><Flame className="w-5 h-5 text-rose-500" /> Speed Date</h1>
            <div className="w-10" />
          </div>

          {mode === 'mode-select' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Heart className="w-20 h-20 text-primary-500 mx-auto fill-primary-500" />
                  </motion.div>
                  <p className="text-gray-700 font-semibold text-lg">8 rapid-fire questions 💕</p>
                  <p className="text-sm text-gray-500">10 seconds each. See how compatible you really are!</p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button onClick={startGame} variant="primary">💑 Play Together</Button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {mode === 'playing' && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                <div className={`bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 shadow border ${timer <= 3 ? 'border-rose-400 text-rose-600' : 'border-pink-100 text-primary-600'}`}>
                  ⏱️ {timer}s
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
                  Q{current + 1}/8
                </div>
                <div className={`bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 shadow border ${p1Turn ? 'border-primary-400 text-primary-600' : 'border-rose-400 text-rose-600'}`}>
                  {p1Turn ? '💙 Your Turn' : '💗 Their Turn'}
                </div>
              </div>

              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                  <div className="text-center mb-2">
                    <span className="inline-block bg-pink-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                      {activeQs[current]?.type === 'would' ? 'Would you rather...' : activeQs[current]?.type === 'what' ? "What's your..." : 'Do you believe...'}
                    </span>
                  </div>

                  <motion.div key={current + (p1Turn ? 'p1' : 'p2')} initial={{ opacity: 0, x: p1Turn ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: p1Turn ? -50 : 50 }} className="space-y-3">
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-4">{activeQs[current]?.q}...</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {activeQs[current]?.opts.map((opt, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(i)}
                          className="bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-2xl p-4 text-left font-semibold text-gray-700 border-2 border-pink-100 hover:border-primary-300 transition-colors">
                          {(p1Turn ? '💙' : '💗') + ' '}{opt}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </TiltCard>
            </>
          )}

          {mode === 'result' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                  <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-7xl">{result.emoji}</span>
                  </motion.div>
                  <h2 className="text-3xl font-display font-black gradient-text-animated">{compat}% Compatible!</h2>
                  <p className="text-xl text-primary-600 font-bold">{result.label}</p>
                  <div className="max-w-xs mx-auto">
                    <div className="h-4 bg-pink-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${compat}%` }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" />
                    </div>
                  </div>
                  <Button onClick={() => { setMode('mode-select'); setCompat(0); }} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
