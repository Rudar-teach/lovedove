'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const RIDDLES = [
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow. I have water, but no fish swim. What am I?", answer: "a map", hint: "You use me when you plan your trip!" },
  { q: "I'm tall when I'm young, and short when I'm old. What am I?", answer: "a candle", hint: "Think about birthdays..." },
  { q: "What has hands but can't clap?", answer: "a clock", hint: "It tells you the time" },
  { q: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?", answer: "a keyboard", hint: "You're using one right now!" },
  { q: "The more you take, the more you leave behind. What am I?", answer: "footsteps", hint: "Every walk creates these" },
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", answer: "an echo", hint: "It repeats what you say" },
  { q: "What has a head and a tail but no body?", answer: "a coin", hint: "Flip me to make a decision" },
  { q: "What goes up but never comes down?", answer: "age", hint: "It's always increasing" },
  { q: "I'm light as a feather, yet the strongest person can't hold me for much more than a minute. What am I?", answer: "breath", hint: "You do it without thinking" },
  { q: "What gets wetter the more it dries?", answer: "a towel", hint: "After a shower..." },
  { q: "What has many needles but doesn't sew?", answer: "a pine tree", hint: "Christmas decoration" },
  { q: "What can you hold in your right hand but never in your left?", answer: "your left hand", hint: "Think about your body" },
  { q: "What has a neck but no head, wears a cap but no hair?", answer: "a bottle", hint: "Contains your drink" },
  { q: "What disappears as soon as you say its name?", answer: "silence", hint: "The opposite of noise" },
  { q: "I have branches but no fruit, trunk, or leaves. What am I?", answer: "a bank", hint: "Where you keep your money" },
];

export default function CoupleRiddlesPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [riddles, setRiddles] = useState<typeof RIDDLES>([]);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p2Answers, setP2Answers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [p1Turn, setP1Turn] = useState(true);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 8);
    setRiddles(shuffled);
    setCurrentIdx(0);
    setP1Answers([]);
    setP2Answers([]);
    setInput('');
    setP1Turn(true);
    setScore(0);
    setTimeLeft(90);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0 && currentIdx >= riddles.length) {
      setPhase('result');
    }
  }, [timeLeft, currentIdx, riddles.length, phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || currentIdx >= riddles.length) return;
    const guess = input.trim().toLowerCase();
    const correct = riddles[currentIdx].answer.toLowerCase();

    if (p1Turn) {
      const isCorrect = guess === correct;
      setP1Answers(a => [...a, guess]);
      if (isCorrect) setScore(s => s + 10);
      setP1Turn(false);
      setInput('');
    } else {
      const isCorrect = guess === correct;
      setP2Answers(a => [...a, guess]);
      if (isCorrect) setScore(s => s + 10);
      if (currentIdx + 1 < riddles.length) {
        setCurrentIdx(i => i + 1);
        setP1Turn(true);
      } else {
        setPhase('result');
      }
      setInput('');
    }
  };

  const totalQuestions = riddles.length;
  const totalPossible = totalQuestions * 2;
  const p1Correct = p1Answers.filter((a, i) => a === riddles[i]?.answer.toLowerCase()).length;
  const p2Correct = p2Answers.filter((a, i) => a === riddles[i]?.answer.toLowerCase()).length;
  const combinedPercent = totalPossible > 0 ? Math.round(((p1Correct + p2Correct) / totalPossible) * 100) : 0;

  const getGrade = () => {
    if (combinedPercent >= 80) return { emoji: '🧠', text: 'Riddle Masters!', color: 'text-green-600' };
    if (combinedPercent >= 60) return { emoji: '💡', text: 'Clever Couple!', color: 'text-blue-600' };
    if (combinedPercent >= 40) return { emoji: '🤔', text: 'Good Thinkers!', color: 'text-amber-600' };
    return { emoji: '😅', text: 'Keep Puzzling!', color: 'text-rose-600' };
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Couple Riddles</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🧩</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Couple Riddles</h2>
                  <p className="text-gray-600">Solve 8 riddles together! Player 1 answers first, then Player 2. See who's the riddle master!</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Riddles 🧩</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && riddles[currentIdx] && (
            <motion.div initial={{ opacity: 0, x: p1Turn ? 40 : -40 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">
                  {p1Turn ? '💙 Player 1\'s Turn' : '💗 Player 2\'s Turn'}
                </span>
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500">Riddle {currentIdx + 1}/{riddles.length}</span>
                  <span className={`text-sm font-bold ${timeLeft <= 15 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timeLeft}s</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / riddles.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-lg font-bold text-gray-800 mb-6 text-center italic leading-relaxed">"{riddles[currentIdx].q}"</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Your answer..." autoFocus
                      className="w-full text-center text-lg font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" />
                    <Button type="submit" variant="primary" className="w-full" disabled={!input.trim()}>Submit Answer</Button>
                  </form>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{getGrade().emoji}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">{getGrade().text}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-blue-500 font-medium">💙 Player 1</p>
                      <p className="text-3xl font-black text-gray-800">{p1Correct}/{totalQuestions}</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4">
                      <p className="text-rose-500 font-medium">💗 Player 2</p>
                      <p className="text-3xl font-black text-gray-800">{p2Correct}/{totalQuestions}</p>
                    </div>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
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
