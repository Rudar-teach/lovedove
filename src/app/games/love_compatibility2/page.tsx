'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type Question = {
  question: string;
  options: string[];
  correct: number;
};

const COMPAT_QUESTIONS: Question[] = [
  {
    question: "You both prefer spending weekends...",
    options: ["Adventuring outdoors", "Cozy at home", "Socializing with friends", "Exploring new places"],
    correct: -1
  },
  {
    question: "How do you show affection?",
    options: ["Physical touch", "Gifts", "Words of affirmation", "Acts of service"],
    correct: -1
  },
  {
    question: "Your ideal vacation is...",
    options: ["Beach relaxation", "City adventure", "Mountain hiking", "Cultural exploration"],
    correct: -1
  },
  {
    question: "What matters most in a relationship?",
    options: ["Trust and honesty", "Shared interests", "Emotional connection", "Independence"],
    correct: -1
  },
  {
    question: "How do you handle conflict?",
    options: ["Talk it out immediately", "Need some space first", "Make up with humor", "Write it down"],
    correct: -1
  },
  {
    question: "Your love language is...",
    options: ["Quality time", "Receiving gifts", "Words of affirmation", "Physical touch"],
    correct: -1
  },
  {
    question: "Date night preference?",
    options: ["Fancy dinner", "Movie night", "Home cooking", "Outdoor adventure"],
    correct: -1
  },
  {
    question: "Communication style?",
    options: ["Talk a lot", "Listen more", "Text constantly", "In-person only"],
    correct: -1,
  },
];

export default function LoveCompatibility2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [player1Answers, setPlayer1Answers] = useState<number[]>([]);
  const [player2Answers, setPlayer2Answers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<'p1' | 'p2' | 'result'>('p1');
  const [compatibility, setCompatibility] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setPlayer1Answers([]);
    setPlayer2Answers([]);
    setCurrent(0);
    setPhase('p1');
    setCompatibility(0);
  };

  const handleAnswer = (optionIndex: number) => {
    if (phase === 'p1') {
      setPlayer1Answers(prev => [...prev, optionIndex]);
      setTimeout(() => {
        if (current < COMPAT_QUESTIONS.length - 1) {
          setCurrent(c => c + 1);
        } else {
          setCurrent(0);
          setPhase('p2');
        }
      }, 400);
    } else {
      setPlayer2Answers(prev => [...prev, optionIndex]);
      setTimeout(() => {
        if (current < COMPAT_QUESTIONS.length - 1) {
          setCurrent(c => c + 1);
        } else {
          calculateCompatibility();
          setPhase('result');
          setGameState('finished');
        }
      }, 400);
    }
  };

  const calculateCompatibility = () => {
    let matches = 0;
    for (let i = 0; i < COMPAT_QUESTIONS.length; i++) {
      if (player1Answers[i] === player2Answers[i]) {
        matches++;
      }
    }
    setCompatibility(Math.round((matches / COMPAT_QUESTIONS.length) * 100));
  };

  const getCompatibilityMessage = () => {
    if (compatibility >= 80) return { emoji: "💞", title: "Perfect Match!", msg: "You two are soulmates! Your answers align beautifully." };
    if (compatibility >= 60) return { emoji: "💕", title: "Great Match!", msg: "You have strong compatibility with wonderful chemistry!" };
    if (compatibility >= 40) return { emoji: "💗", title: "Good Match!", msg: "You complement each other well!" };
    return { emoji: "💖", title: "Unique Couple!", msg: "Your differences make your relationship special!" };
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">💞</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Compatibility 2</h1>
              <p className="text-gray-600 mb-8 text-lg">Discover how well you match!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>💞 Both partners answer questions</li>
                  <li>🤔 Be honest with your choices</li>
                  <li>📊 See your compatibility %</li>
                  <li>💕 Fun way to learn about each other!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && phase !== 'result' && COMPAT_QUESTIONS[current] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold text-gray-700">
                  {phase === 'p1' ? "💕 Partner 1" : "💖 Partner 2"}
                </span>
                <span className="text-sm font-medium text-pink-600">Q {current + 1}/{COMPAT_QUESTIONS.length}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ width: `${((current + 1) / COMPAT_QUESTIONS.length) * 100}%` }} />
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center leading-relaxed">
                  {COMPAT_QUESTIONS[current].question}
                </h2>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMPAT_QUESTIONS[current].options.map((option, i) => (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className="p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-pink-400 text-gray-700 font-semibold text-sm transition-all hover:shadow-md">
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-4">{getCompatibilityMessage().emoji}</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">{getCompatibilityMessage().title}</h2>
              <p className="text-5xl font-black gradient-text mb-4">{compatibility}%</p>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{getCompatibilityMessage().msg}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
