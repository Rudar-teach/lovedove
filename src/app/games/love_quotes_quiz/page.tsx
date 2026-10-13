'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Quote {
  q: string;
  a: string;
}

const QUOTES: Quote[] = [
  { q: "Who said 'The best thing to hold onto in life is each other'?", a: "Audrey Hepburn" },
  { q: "Who wrote 'I love you without knowing how, when, or from where'?", a: "Pablo Neruda" },
  { q: "Who said 'Love is composed of a single soul inhabiting two bodies'?", a: "Aristotle" },
  { q: "Who wrote 'You are my heart, my life, my one and only thought'?", a: "Arthur Conan Doyle" },
  { q: "Who said 'I would rather share one lifetime with you than face all the ages of this world alone'?", a: "Arwen (LOTR)" },
  { q: "Who wrote 'You are my heart, my life, my one and only thought'?", a: "Arthur Conan Doyle" },
  { q: "Who said 'The best thing to hold onto in life is each other'?", a: "Audrey Hepburn" },
  { q: "Who wrote 'I love you without knowing how, when, or from where'?", a: "Pablo Neruda" },
];

const ALL_OPTIONS = ["Audrey Hepburn", "Pablo Neruda", "Aristotle", "Arwen (LOTR)", "Arthur Conan Doyle"];

export default function LoveQuotesQuiz() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Quote[]>([]);

  useEffect(() => {
    setQuestions([...QUOTES].sort(() => Math.random() - 0.5));
  }, []);

  const getShuffledOptions = (answer: string): string[] => {
    const others = ALL_OPTIONS.filter(o => o !== answer);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffled, answer].sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (idx: number, option: string) => {
    setSelected(idx);
    setTimeout(() => {
      if (option === questions[current]?.a) {
        setScore(s => s + 20);
      }
      setSelected(null);
      if (current < questions.length - 1) {
        setCurrent(i => i + 1);
      } else {
        setGameState('finished');
      }
    }, 600);
  };

  const start = () => {
    setGameState('playing');
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setQuestions([...QUOTES].sort(() => Math.random() - 0.5));
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 px-4 py-2 rounded-xl hover:bg-white/60">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">💬</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Quotes Quiz</h1>
              <p className="text-gray-600 mb-8 text-lg">Guess who said these love quotes!</p>
              <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState !== 'idle' && questions[current] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-center text-sm font-medium text-gray-600 mb-4">
                Q {current + 1}/{questions.length} • Score: {score}
              </p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-lg font-medium text-gray-900 text-center italic">
                  "{questions[current].q}"
                </p>
              </div>
              <div className="space-y-3">
                {getShuffledOptions(questions[current].a).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i, opt)}
                    disabled={selected !== null}
                    className={`w-full p-4 rounded-2xl font-semibold transition-all ${
                      selected === i
                        ? opt === questions[current].a
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-white/70 text-gray-700 hover:bg-white'
                    } ${selected !== null ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Complete!</h2>
              <p className="text-5xl font-black gradient-text mb-4">{score}</p>
              <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold">
                <RotateCcw className="w-5 h-5 inline mr-2" /> Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
