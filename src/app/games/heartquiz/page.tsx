'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Timer, Clock } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface HeartQuestion {
  q: string;
  opts: string[];
  a: number;
  emoji: string;
  funFact: string;
}

const QUESTIONS: HeartQuestion[] = [
  {
    q: 'Which ancient Roman festival is considered the precursor to Valentine\'s Day?',
    opts: ['Lupercalia', 'Saturnalia', 'Flora', 'Bacchanalia'],
    a: 0,
    emoji: '🏛️',
    funFact: 'Lupercalia was celebrated in mid-February and involved pairing couples by lottery!',
  },
  {
    q: 'Who wrote the world\'s first known love poem?',
    opts: ['A Sumerian priestess', 'William Shakespeare', 'Rumi', 'Ovid'],
    a: 0,
    emoji: '📜',
    funFact: 'Enheduanna, a Sumerian high priestess, wrote a love poem to the moon god Nanna around 2030 BCE!',
  },
  {
    q: 'Which organ has been associated with love in virtually every culture?',
    opts: ['Liver', 'Heart', 'Brain', 'Lungs'],
    a: 1,
    emoji: '❤️',
    funFact: 'The heart\'s connection to love dates back over 5,000 years to ancient Egyptian beliefs.',
  },
  {
    q: 'How many hearts does an octopus have?',
    opts: ['1', '2', '3', '4'],
    a: 2,
    emoji: '🐙',
    funFact: 'Two pump blood to the gills, and one pumps blood to the rest of the body!',
  },
  {
    q: 'Which hormone is known as the "love hormone"?',
    opts: ['Dopamine', 'Oxytocin', 'Serotonin', 'Adrenaline'],
    a: 1,
    emoji: '🧪',
    funFact: 'Oxytocin is released during hugs, kisses, and orgasms — it deepens emotional bonds!',
  },
  {
    q: 'What color has been scientifically proven to increase attraction?',
    opts: ['Blue', 'Red', 'Green', 'Pink'],
    a: 1,
    emoji: '🔴',
    funFact: 'Studies show that wearing red makes people appear more attractive and sexually desirable.',
  },
  {
    q: 'Who wrote "Romeo and Juliet"?',
    opts: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Emily Brontë'],
    a: 1,
    emoji: '📖',
    funFact: 'The play was written around 1594-1596 and is considered one of the greatest love stories ever told.',
  },
  {
    q: 'Which emperor built the Taj Mahal as a monument to his wife?',
    opts: ['Akbar', 'Shah Jahan', 'Aurangzeb', 'Humayun'],
    a: 1,
    emoji: '🕌',
    funFact: 'Shah Jahan built the Taj Mahal over 22 years with 20,000 workers. It\'s a UNESCO World Heritage site!',
  },
  {
    q: 'On average, how long does it take to fall in love?',
    opts: ['8 seconds', '8 minutes', '8 days', '8 weeks'],
    a: 0,
    emoji: '⏱️',
    funFact: 'Research from Syracuse University found it takes about 1/5 of a second to fall in love!',
  },
  {
    q: 'The ancient Greeks had how many words for different types of love?',
    opts: ['3', '4', '6', '8'],
    a: 2,
    emoji: '🇬🇷',
    funFact: 'Eros (romantic), Philia (friendship), and Agape (selfless) — three distinct kinds of love!',
  },
];

export default function HeartquizPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [timer, setTimer] = useState(12);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    setIdx(0);
    setScore(0);
    setSelected(null);
    setShowFact(false);
    setTimer(12);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' || showFact) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handleTimeout();
          return 12;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, showFact, selected]);

  const handleTimeout = () => {
    setShowFact(true);
    setTimeout(() => advanceQuestion(), 2000);
  };

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === QUESTIONS[idx].a) setScore(s => s + 1);
    setShowFact(true);
    setTimeout(() => advanceQuestion(), 2000);
  };

  const advanceQuestion = () => {
    if (idx + 1 >= QUESTIONS.length) {
      setPhase('result');
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setShowFact(false);
      setTimer(12);
    }
  };

  const pct = QUESTIONS.length > 0 ? Math.round((score / QUESTIONS.length) * 100) : 0;
  const title = pct >= 80 ? '🏆 Romance Scholar!' : pct >= 60 ? '⭐ Love Expert!' : pct >= 40 ? '💖 Amateur Romantic!' : '💕 Keep Learning!';

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Heart Quiz
            </h1>
            <div className="w-10" />
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">❤️</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Heart Quiz</h2>
                    <p className="text-gray-600">Test your knowledge of love history, romance, and the heart! 12 seconds per question.</p>
                    <p className="text-sm text-rose-500 font-medium">Learn fun facts along the way!</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Quiz ❤️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && QUESTIONS[idx] && (
              <motion.div key={`q-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">Q {idx + 1}/{QUESTIONS.length}</span>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${timer <= 4 ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600'}`}>
                    <Clock className="w-4 h-4" /> {timer}s
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                    animate={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }} />
                </div>

                <div className="flex justify-center gap-3 mb-4">
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100 text-center">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-xl font-bold text-rose-600">{score}/{idx + (selected !== null ? 1 : 0)}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100 text-center">
                    <p className="text-xs text-gray-500">Question</p>
                    <p className="text-xl font-bold text-gray-800">{idx + 1}</p>
                  </div>
                </div>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-3xl mb-3">{QUESTIONS[idx].emoji}</p>
                    <p className="text-lg font-bold text-gray-800 mb-6 text-center">{QUESTIONS[idx].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[idx].opts.map((opt, i) => {
                        const isCorrect = i === QUESTIONS[idx].a;
                        const isSelected = selected === i;
                        let btnClass = 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50';
                        if (showFact && isCorrect) btnClass = 'bg-green-100 border-green-400 text-green-800';
                        else if (showFact && isSelected && !isCorrect) btnClass = 'bg-red-100 border-red-400 text-red-800';
                        else if (showFact) btnClass = 'opacity-50 border-gray-200 text-gray-400';
                        return (
                          <motion.button key={i} whileHover={!showFact ? { scale: 1.02, x: 4 } : {}} whileTap={!showFact ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswer(i)} disabled={showFact}
                            className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${btnClass}`}>
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                              <span>{opt}</span>
                              {showFact && isCorrect && <span className="ml-auto">✅</span>}
                              {showFact && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {showFact && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-gray-600">
                          <span className="font-bold text-yellow-700">💡 Fun Fact:</span> {QUESTIONS[idx].funFact}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem} shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{title.split(' ')[1] || '💕'}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">{title.split(' ').slice(1).join(' ') || 'Great Job!'}</h2>
                    <p className="text-6xl font-black gradient-text">{score}/{QUESTIONS.length}</p>
                    <p className="text-gray-600">{pct}% correct</p>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {QUESTIONS.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-left bg-gray-50 rounded-xl p-3">
                          <span className="text-xl">{q.emoji}</span>
                          <p className="text-sm text-gray-700">{q.q}</p>
                        </div>
                      ))}
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again ❤️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games"><Button variant="ghost" size="sm">← Back to Games</Button></Link>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
