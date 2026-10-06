'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function LoveMathPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState('+');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [guess, setGuess] = useState('');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboText, setComboText] = useState('');
  const timerRef = useRef<number | null>(null);

  const next = () => {
    const x = Math.floor(Math.random() * 20) + 1;
    const y = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '×'];
    setA(x); setB(y);
    setOp(ops[Math.floor(Math.random() * 3)]);
    setGuess('');
    setComboText('');
  };

  const answer = () => {
    let correct = 0;
    if (op === '+') correct = a + b;
    else if (op === '-') correct = a - b;
    else correct = a * b;
    const val = parseInt(guess);
    if (val === correct) {
      const pts = 10 + streak * 5;
      setScore(s => s + pts);
      setStreak(s => { const ns = s + 1; if (ns > bestStreak) setBestStreak(ns); return ns; });
      setComboText(ns > 1 ? `🔥 ${ns}x Combo! +${pts}` : `+${pts}`);
    } else {
      setStreak(0);
      setComboText(`😅 It was ${correct}`);
    }
    setTimeout(() => { next(); }, 800);
  };

  const start = () => {
    setScore(0); setTimeLeft(60); setStreak(0); setBestStreak(0); setPhase('playing'); next();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setPhase('result'); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Love Math</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">➕</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Love Math</h2>
                  <p className="text-gray-600">Solve math problems in 60 seconds! Build combos for bonus points!</p>
                  <div className="bg-pink-50 rounded-xl p-3 text-sm text-gray-600">
                    <p>🔥 Correct answers build combos for bonus points!</p>
                  </div>
                  <Button onClick={start} variant="primary" size="lg" className="w-full">Start Math 💕</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Score: {score}</span>
                <div className="flex gap-3">
                  {streak > 2 && <span className="text-sm font-bold text-amber-600">🔥 {streak}x</span>}
                  <span className={`text-sm font-bold ${timeLeft <= 15 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timeLeft}s</span>
                </div>
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-gray-800 mb-2">{a} {op} {b} = ?</div>
                    {comboText && <p className={`text-lg font-bold ${comboText.includes('🔥') ? 'text-amber-600' : 'text-red-500'}`}>{comboText}</p>}
                  </div>
                  <div className="flex gap-3">
                    <input type="number" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === 'Enter' && answer()} autoFocus placeholder="?"
                      className="flex-1 text-center text-4xl font-bold rounded-xl border-2 border-pink-200 p-4 focus:border-primary-400 outline-none" />
                    <Button onClick={answer} variant="primary" size="lg" disabled={!guess}>Go!</Button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{score >= 200 ? '🏆' : score >= 100 ? '⭐' : '💪'}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">{score >= 200 ? 'Math Genius!' : score >= 100 ? 'Great Job!' : 'Keep Practicing!'}</h2>
                  <div className="text-5xl font-black gradient-text">{score} pts</div>
                  <p className="text-amber-600 font-bold">Best combo: 🔥 {bestStreak}x</p>
                  <Button onClick={start} variant="primary" size="lg" className="w-full">Play Again ➕</Button>
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
