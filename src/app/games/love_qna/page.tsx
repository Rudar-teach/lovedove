'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer, Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const QA_QUESTIONS = [
  { id: 1, question: "What was your FIRST impression of me when we met?", category: "First Impression" },
  { id: 2, question: "Where did we FIRST meet each other?", category: "First Meeting" },
  { id: 3, question: "What were you thinking on our very first day together?", category: "First Day" },
  { id: 4, question: "What was the first thing you noticed about me?", category: "First Impression" },
  { id: 5, question: "Where was our first date?", category: "First Date" },
  { id: 6, question: "What did you feel when we first held hands?", category: "First Moment" },
  { id: 7, question: "What was your favorite moment from our first meeting?", category: "First Meeting" },
  { id: 8, question: "What did you think I would be like before meeting me?", category: "First Impression" },
  { id: 9, question: "What was the first meal we shared together?", category: "First Date" },
  { id: 10, question: "Did you believe in love at first sight with me?", category: "First Feeling" },
  { id: 11, question: "What was your biggest fear on our first date?", category: "First Date" },
  { id: 12, question: "What did you love most about our first conversation?", category: "First Meeting" },
  { id: 13, question: "Where did you want to go on our first date?", category: "First Date" },
  { id: 14, question: "What made you smile the most when we first met?", category: "First Impression" },
  { id: 15, question: "What song was playing when you first thought of me?", category: "First Feeling" },
];

type AnswerMode = 'select' | 'answer' | 'reveal' | 'finished';

export default function LoveQnAGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [mode, setMode] = useState<AnswerMode>('select');
  const [answers, setAnswers] = useState<{ partner1: string; partner2: string; question: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showPartnerAnswer, setShowPartnerAnswer] = useState<string | null>(null);
  const [phase, setPhase] = useState<'p1' | 'p2'>('p1');
  const [questions, setQuestions] = useState<typeof QA_QUESTIONS>([]);

  useEffect(() => {
    setQuestions([...QA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || mode !== 'answer') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, mode, timeLeft]);

  const handleTimeout = () => {
    if (mode === 'answer') {
      if (phase === 'p1') {
        setAnswers(prev => [...prev, { partner1: currentAnswer || '⏰ No answer', partner2: '', question: questions[currentIndex].question }]);
        setPhase('p2');
        setCurrentAnswer('');
        setTimeLeft(20);
      } else {
        setAnswers(prev => {
          const updated = [...prev];
          if (updated[currentIndex]) {
            updated[currentIndex] = { ...updated[currentIndex], partner2: currentAnswer || '⏰ No answer' };
          }
          return updated;
        });
        nextQuestion();
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setPhase('p1');
      setCurrentAnswer('');
      setTimeLeft(20);
      setMode('answer');
    } else {
      setMode('finished');
      setGameState('finished');
    }
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setTimeLeft(20);
    setMode('answer');
    setPhase('p1');
    setAnswers([]);
    setCurrentAnswer('');
  };

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    if (phase === 'p1') {
      setAnswers(prev => [...prev, { partner1: currentAnswer.trim(), partner2: '', question: questions[currentIndex].question }]);
      setPhase('p2');
      setCurrentAnswer('');
      setTimeLeft(20);
    } else {
      setAnswers(prev => {
        const updated = [...prev];
        if (updated[currentIndex]) {
          updated[currentIndex] = { ...updated[currentIndex], partner2: currentAnswer.trim() };
        }
        return updated;
      });
      nextQuestion();
    }
  };

  const skipQuestion = () => {
    if (phase === 'p1') {
      setAnswers(prev => [...prev, { partner1: '⏭️ Skipped', partner2: '', question: questions[currentIndex].question }]);
      setPhase('p2');
      setCurrentAnswer('');
      setTimeLeft(20);
    } else {
      setAnswers(prev => {
        const updated = [...prev];
        if (updated[currentIndex]) {
          updated[currentIndex] = { ...updated[currentIndex], partner2: '⏭️ Skipped' };
        }
        return updated;
      });
      nextQuestion();
    }
  };

  const showResults = () => {
    setMode('reveal');
    setCurrentIndex(0);
    setShowPartnerAnswer(null);
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
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
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Q&A</h1>
              <p className="text-gray-600 mb-3 text-lg">Answer questions about when you first met!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>💑 Both partners answer the same questions</li>
                  <li>⏱️ You have 20 seconds per answer</li>
                  <li>📝 Write your honest answer</li>
                  <li>👀 Then see how your answers match!</li>
                  <li>💕 Questions about your first meeting</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && mode === 'answer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full bg-white/70 text-sm font-semibold text-gray-700">
                  {phase === 'p1' ? "💕 Partner 1's Turn" : "💖 Partner 2's Turn"}
                </span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white/70 text-gray-700'}`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-rose-600">{phase === 'p1' ? 'Partner 1' : 'Partner 2'} answering</span>
              </div>

              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8 mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-4">
                  {questions[currentIndex]?.category}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center leading-relaxed">
                  {questions[currentIndex]?.question}
                </h2>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {phase === 'p1' ? '💕 Your answer (Partner 1):' : '💖 Your answer (Partner 2):'}
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={phase === 'p1' ? "Partner 1, write your answer..." : "Partner 2, write your answer..."}
                  rows={3}
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none resize-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={skipQuestion} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                    Skip
                  </button>
                  <button onClick={handleSubmit} disabled={!currentAnswer.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                    {phase === 'p1' ? 'Partner 2 Answer →' : 'See Results 💕'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && mode === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">💕</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Q&A Complete!</h2>
              <p className="text-gray-600 mb-8">Here are your answers — see how well you know each other!</p>
              <button onClick={showResults} className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl font-bold shadow-lg mb-8">
                Reveal Answers 💕
              </button>
            </motion.div>
          )}

          {gameState === 'finished' && mode === 'reveal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-black text-gray-900 mb-2">💕 Your Answers</h2>
                <p className="text-gray-600">See how you both answered!</p>
              </div>
              {answers.map((ans, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
                  <div className="text-sm font-semibold text-rose-600 mb-2">Q{i + 1}: {ans.question}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-4">
                      <div className="text-xs font-bold text-rose-600 mb-1">💕 Partner 1</div>
                      <p className="text-gray-800 text-sm">{ans.partner1}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4">
                      <div className="text-xs font-bold text-blue-600 mb-1">💖 Partner 2</div>
                      <p className="text-gray-800 text-sm">{ans.partner2}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="flex gap-4 justify-center pt-4">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl text-white font-bold shadow-lg">
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
