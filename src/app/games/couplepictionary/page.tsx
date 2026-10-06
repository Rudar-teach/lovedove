'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Palette } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface DrawPrompt {
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  emoji: string;
  timeLimit: number;
}

const PROMPTS: DrawPrompt[] = [
  { prompt: 'Draw a heart', difficulty: 'easy', points: 10, emoji: '❤️', timeLimit: 30 },
  { prompt: 'Draw a flower with a smile', difficulty: 'easy', points: 15, emoji: '🌷', timeLimit: 45 },
  { prompt: 'Draw your partner holding a rose', difficulty: 'medium', points: 25, emoji: '🌹', timeLimit: 60 },
  { prompt: 'Draw your dream date', difficulty: 'medium', points: 30, emoji: '🌃', timeLimit: 60 },
  { prompt: 'Draw a wedding scene', difficulty: 'hard', points: 40, emoji: '💍', timeLimit: 90 },
  { prompt: 'Draw a cozy couple on the couch', difficulty: 'hard', points: 45, emoji: '🛋️', timeLimit: 90 },
  { prompt: 'Draw your pet as a couple', difficulty: 'medium', points: 25, emoji: '🐾', timeLimit: 60 },
  { prompt: 'Draw the two of you as superheroes', difficulty: 'hard', points: 40, emoji: '🦸', timeLimit: 90 },
];

const CATEGORIES = [
  { name: 'All Prompts', filter: () => true },
  { name: 'Easy', filter: (p: DrawPrompt) => p.difficulty === 'easy' },
  { name: 'Medium', filter: (p: DrawPrompt) => p.difficulty === 'medium' },
  { name: 'Hard', filter: (p: DrawPrompt) => p.difficulty === 'hard' },
];

export default function CouplePictionaryPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [filterIdx, setFilterIdx] = useState(0);
  const [deck, setDeck] = useState<DrawPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<DrawPrompt | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [rating, setRating] = useState('');

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setPhase('finished');
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    const filtered = CATEGORIES[filterIdx].filter;
    const pool = PROMPTS.filter(filtered);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    nextPrompt(shuffled);
    setScore(0);
    setCompleted(0);
    setPhase('playing');
  };

  const nextPrompt = (d?: DrawPrompt[]) => {
    const useDeck = d || deck;
    if (completed >= useDeck.length) {
      setTimerActive(false);
      setPhase('finished');
      return;
    }
    const prompt = useDeck[completed];
    setCurrentPrompt(prompt);
    setTimeLeft(prompt.timeLimit);
    setTimerActive(true);
  };

  const completePrompt = () => {
    setScore(s => s + (currentPrompt?.points || 0));
    setCompleted(c => c + 1);
    setTimerActive(false);
    setTimeout(() => nextPrompt(), 500);
  };

  const skipPrompt = () => {
    setCompleted(c => c + 1);
    setTimerActive(false);
    setTimeout(() => nextPrompt(), 500);
  };

  const getRating = (s: number) => {
    if (s >= 150) return { text: 'Michelangelo! 🎨', emoji: '🏆' };
    if (s >= 100) return { text: 'Great Artist! 🖌️', emoji: '⭐' };
    if (s >= 50) return { text: 'Creative Couple! 💝', emoji: '✨' };
    return { text: 'Keep Drawing! 🌱', emoji: '💪' };
  };

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
                <div className="text-6xl mb-4">🎨</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Pictionary</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Draw romantic prompts together! Take turns as the artist and see if your partner can guess.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Difficulty</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c, i) => (
                      <button key={i} onClick={() => setFilterIdx(i)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${filterIdx === i ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Drawing
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentPrompt && (
              <motion.div key={completed} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/90 rounded-2xl p-8 shadow-xl text-center">
                <div className="text-sm text-rose-500 mb-2">
                  Prompt {completed + 1} • Score: {score}
                </div>
                <div className="text-5xl mb-3">{currentPrompt.emoji}</div>
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Draw this:</h2>
                <p className="text-2xl font-bold text-rose-600 mb-6">{currentPrompt.prompt}</p>
                <div className="text-4xl font-bold mb-6">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                <div className="flex gap-3 justify-center">
                  <button onClick={skipPrompt} className="bg-gray-100 text-gray-700 px-5 py-3 rounded-full font-semibold">Skip →</button>
                  <button onClick={completePrompt} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                    ✅ Partner Guessed It!
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Palette className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Drawing Session Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-2xl text-pink-600 mb-6">{getRating(score).emoji} {getRating(score).text}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
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
