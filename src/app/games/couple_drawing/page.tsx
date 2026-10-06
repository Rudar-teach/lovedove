'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface Challenge {
  text: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  tips: string[];
}

const CHALLENGES: Challenge[] = [
  {
    text: 'Draw each other\'s portraits',
    emoji: '👤',
    difficulty: 'easy',
    points: 20,
    timeLimit: 60,
    tips: ['Focus on one distinctive feature', 'Exaggerate for fun', 'Use color to show personality'],
  },
  {
    text: 'Draw a love letter together',
    emoji: '💌',
    difficulty: 'easy',
    points: 25,
    timeLimit: 60,
    tips: ['Write something sweet', 'Add a doodle', 'Seal it with a kiss'],
  },
  {
    text: 'Draw your perfect home together',
    emoji: '🏠',
    difficulty: 'medium',
    points: 30,
    timeLimit: 90,
    tips: ['Include small details', 'Make it cozy', 'Add each other in the scene'],
  },
  {
    text: 'Draw your first memory together',
    emoji: '📷',
    difficulty: 'medium',
    points: 35,
    timeLimit: 90,
    tips: ['Don\'t worry about perfection', 'Focus on emotions', 'Use warm colors'],
  },
  {
    text: 'Draw your future wedding',
    emoji: '💍',
    difficulty: 'hard',
    points: 50,
    timeLimit: 120,
    tips: ['Include your favorite flowers', 'Add special moments', 'Make it uniquely yours'],
  },
  {
    text: 'Draw your relationship timeline',
    emoji: '📅',
    difficulty: 'hard',
    points: 45,
    timeLimit: 120,
    tips: ['Start from the beginning', 'Include milestones', 'Add hearts along the way'],
  },
];

export default function CoupleDrawingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTip, setShowTip] = useState(false);
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
    const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5);
    setChallenges(shuffled);
    setChallengeIdx(0);
    setScore(0);
    setShowTip(false);
    setPhase('playing');
    loadChallenge(shuffled[0]);
  };

  const loadChallenge = (c: Challenge) => {
    setTimeLeft(c.timeLimit);
    setTimerActive(true);
    setShowTip(false);
  };

  const currentChallenge = challenges[challengeIdx];

  const completeChallenge = () => {
    setScore(s => s + (currentChallenge?.points || 0));
    if (challengeIdx < challenges.length - 1) {
      setChallengeIdx(i => i + 1);
      loadChallenge(challenges[challengeIdx + 1]);
    } else {
      setTimerActive(false);
      setPhase('finished');
    }
  };

  const skipChallenge = () => {
    if (challengeIdx < challenges.length - 1) {
      setChallengeIdx(i => i + 1);
      loadChallenge(challenges[challengeIdx + 1]);
    } else {
      setPhase('finished');
    }
  };

  const getRatingText = (s: number) => {
    if (s >= 180) return 'Master Artist! 🎨';
    if (s >= 120) return 'Creative Couple! ✨';
    if (s >= 60) return 'Good Effort! 💝';
    return 'Keep Creating! 🌱';
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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Drawing</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Creative drawing challenges for couples! Draw together and discover your artistic side.</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Drawing
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentChallenge && (
              <motion.div key={challengeIdx} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/90 rounded-2xl p-8 shadow-xl text-center">
                <div className="text-sm text-rose-500 mb-2">
                  Challenge {challengeIdx + 1}/{challenges.length} • Score: {score}
                </div>
                <div className="text-5xl mb-3">{currentChallenge.emoji}</div>
                <h2 className="text-2xl font-bold text-rose-700 mb-2">{currentChallenge.text}</h2>
                <div className="text-3xl font-bold text-rose-600 mb-2">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                <div className="text-sm text-gray-500 mb-4">Difficulty: {currentChallenge.difficulty} • {currentChallenge.points} pts</div>

                {showTip ? (
                  <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                    <p className="text-yellow-700 font-semibold text-sm mb-2">💡 Tips:</p>
                    {currentChallenge.tips.map((tip, i) => (
                      <p key={i} className="text-sm text-gray-600">• {tip}</p>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setShowTip(true)} className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm mb-4">💡 Show Tips</button>
                )}

                <div className="flex gap-3 justify-center">
                  <button onClick={skipChallenge} className="bg-gray-100 text-gray-700 px-5 py-3 rounded-full font-semibold">Skip →</button>
                  <button onClick={completeChallenge} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                    ✅ Finished Drawing!
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Pencil className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Gallery Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-2xl text-pink-600 mb-6">{getRatingText(score)}</p>
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
