'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Flame, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GOAL_QUESTIONS = [
  {
    category: '🏖️ Vacations',
    question: 'We plan our vacations...',
    options: [
      { text: '2 weeks in advance (plan everything!)', rating: 4 },
      { text: '1-2 months ahead', rating: 3 },
      { text: 'Spontaneously, last minute', rating: 2 },
      { text: 'One plans, one shows up', rating: 1 },
    ],
  },
  {
    category: '🍽️ Dining',
    question: 'When trying a new restaurant...',
    options: [
      { text: 'Both research reviews', rating: 3 },
      { text: 'One decides completely', rating: 2 },
      { text: 'Pick based on ambiance', rating: 4 },
      { text: 'We argue for 30 mins', rating: 1 },
    ],
  },
  {
    category: '💤 Sleep',
    question: 'Our bedtime routine...',
    options: [
      { text: 'Both early birds', rating: 4 },
      { text: 'Night owl + early bird', rating: 2 },
      { text: 'We pull all nighters', rating: 3 },
      { text: 'Different schedules', rating: 1 },
    ],
  },
  {
    category: '🎬 Entertainment',
    question: 'Movie night preferences...',
    options: [
      { text: 'Same taste always', rating: 3 },
      { text: 'Compromise every time', rating: 4 },
      { text: 'Separate rooms', rating: 1 },
      { text: 'We binge series together', rating: 3 },
    ],
  },
  {
    category: '🏋️ Fitness',
    question: 'Working out together...',
    options: [
      { text: 'Gym buddies daily', rating: 4 },
      { text: 'Weekend hikes', rating: 3 },
      { text: 'One motivates the other', rating: 2 },
      { text: 'Different gyms', rating: 1 },
    ],
  },
  {
    category: '💰 Money',
    question: 'Managing finances together...',
    options: [
      { text: 'Joint account, transparency', rating: 4 },
      { text: 'Split everything 50/50', rating: 3 },
      { text: 'One manages money', rating: 2 },
      { text: 'Never discuss money', rating: 1 },
    ],
  },
  {
    category: '👨‍👩‍👧 Family',
    question: 'Holidays with family...',
    options: [
      { text: 'Alternate each year', rating: 4 },
      { text: 'Both families together', rating: 3 },
      { text: 'Skip and travel alone', rating: 2 },
      { text: 'It\'s stressful', rating: 1 },
    ],
  },
  {
    category: '📱 Tech',
    question: 'Phone usage on dates...',
    options: [
      { text: 'Phones away', rating: 4 },
      { text: 'Occasional checks OK', rating: 3 },
      { text: 'Both on phones', rating: 1 },
      { text: 'One is worse than other', rating: 2 },
    ],
  },
];

export default function CoupleGoals_2Page() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(12);

  useEffect(() => {
    const b = localStorage.getItem('goals2_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setAnswers([]);
    setTimeLeft(12);
    setState('playing');
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      if (selected === null) {
        setAnswers((a) => [...a, 0]);
      }
      if (currentQ >= GOAL_QUESTIONS.length - 1) {
        setState('finished');
        const finalScore = score;
        if (finalScore > best) {
          setBest(finalScore);
          localStorage.setItem('goals2_best', String(finalScore));
        }
      } else {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(12);
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((tt) => tt - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state, currentQ, selected, score, best]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const pts = GOAL_QUESTIONS[currentQ].options[idx].rating * 10;
    setScore((s) => s + pts);
    setAnswers((a) => [...a, GOAL_QUESTIONS[currentQ].options[idx].rating]);

    setTimeout(() => {
      if (currentQ >= GOAL_QUESTIONS.length - 1) {
        setState('finished');
        const finalScore = score + pts;
        if (finalScore > best) {
          setBest(finalScore);
          localStorage.setItem('goals2_best', String(finalScore));
        }
      } else {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(12);
      }
    }, 1200);
  };

  const avgRating = answers.length > 0 ? (answers.reduce((a, b) => a + b, 0) / answers.length).toFixed(1) : '0';

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="text-orange-400" /> Goals Match
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase">Compatibility</div>
                <div className={`text-xl font-bold ${avgRating >= 3 ? 'text-green-400' : avgRating >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {avgRating}/4 ⭐
                </div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Flame className="text-orange-400 mx-auto mb-4" size={48} />
                <p className="text-white text-lg mb-2">How Compatible Are You?</p>
                <p className="text-white/60 text-sm mb-4">
                  Answer questions about your relationship to find your compatibility score!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start
                </button>
              </motion.div>
            )}

            {state === 'playing' && GOAL_QUESTIONS[currentQ] && (
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-black/30 rounded-xl p-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                    {GOAL_QUESTIONS[currentQ].category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{GOAL_QUESTIONS[currentQ].question}</h3>

                <div className="space-y-2">
                  {GOAL_QUESTIONS[currentQ].options.map((opt, idx) => {
                    let bg = 'bg-white/10 hover:bg-white/20';
                    if (showResult) {
                      if (opt.rating >= 4) bg = 'bg-green-500/30 border border-green-400';
                      else if (idx === selected && opt.rating < 3) bg = 'bg-red-500/30 border border-red-400';
                      else bg = 'bg-white/5 opacity-50';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selected !== null}
                        className={`w-full p-4 rounded-xl text-left text-white font-medium transition-all ${bg}`}
                      >
                        {opt.text}
                        {showResult && (
                          <span className="ml-2 text-sm">{'⭐'.repeat(opt.rating)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    ⏱️ {timeLeft}s
                  </div>
                  <div className="text-white/40 text-sm">
                    {currentQ + 1}/{GOAL_QUESTIONS.length}
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {avgRating >= 3.5 ? '🏆 Perfect Match!' : avgRating >= 2.5 ? '💖 Great Match!' : '💕 Still Compatible!'}
                    </h2>
                    <p className="text-white/70">
                      Compatibility: <span className="text-pink-300 font-bold">{avgRating}/4</span>
                    </p>
                    <p className="text-white/50 text-sm">
                      {answers.filter((a) => a >= 3).length}/{answers.length} great answers
                    </p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}