'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: "What's your ideal first date?", options: ['Netflix at home', 'Fancy dinner', 'Sunset picnic', 'Adventure activity'] },
  { q: "Which love language do you value most?", options: ['Gifts', 'Quality Time', 'Physical Touch', 'Words of Affirmation'] },
  { q: "How do you show you care when they're stressed?", options: ['Give space', 'Buy snacks', 'Hug them', 'Solve the problem'] },
  { q: "Your dream vacation together?", options: ['Beach resort', 'City exploration', 'Mountain cabin', 'Road trip'] },
  { q: "Morning person or night owl?", options: ['Early bird always', 'Night owl always', 'Depends on the day', 'I adjust for them'] },
  { q: "Biggest turn-off in a relationship?", options: ['Dishonesty', 'Lack of effort', 'Bad hygiene', 'Being controlling'] },
  { q: "Best way to resolve a fight?", options: ['Talk it out immediately', 'Cool off first', 'Write a letter', 'Make up with humor'] },
  { q: "What makes you feel most loved?", options: ['Grand gestures', 'Small daily acts', 'Verbal compliments', 'Undivided attention'] },
];

type Phase = 'start' | 'player1' | 'player2' | 'result';

export default function CoupleQuiz2Page() {
  const [phase, setPhase] = useState<Phase>('start');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers1, setAnswers1] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [answers2, setAnswers2] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [matchPercent, setMatchPercent] = useState(0);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setAnswers1(Array(shuffled.length).fill(null));
    setAnswers2(Array(shuffled.length).fill(null));
    setCurrentQ(0);
    setSelected(null);
    setPhase('player1');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (phase === 'player1') {
      setAnswers1(a => { const n = [...a]; n[currentQ] = idx; return n; });
      setTimeout(() => {
        setSelected(null);
        if (currentQ < questions.length - 1) {
          setCurrentQ(q => q + 1);
        } else {
          setCurrentQ(0);
          setSelected(null);
          setPhase('player2');
        }
      }, 600);
    } else {
      setAnswers2(a => { const n = [...a]; n[currentQ] = idx; return n; });
      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ(q => q + 1);
          setSelected(null);
        } else {
          calculateResults();
        }
      }, 600);
    }
  };

  const calculateResults = () => {
    let matches = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers1[i] !== null && answers1[i] === answers2[i]) matches++;
    }
    setMatchPercent(Math.round((matches / questions.length) * 100));
    setPhase('result');
  };

  const getResultEmoji = () => {
    if (matchPercent >= 80) return '💑';
    if (matchPercent >= 60) return '💕';
    if (matchPercent >= 40) return '💗';
    if (matchPercent >= 20) return '💓';
    return '💔';
  };

  const getResultText = () => {
    if (matchPercent >= 80) return "Soulmates! You're perfectly in sync!";
    if (matchPercent >= 60) return "Great match! You know each other well!";
    if (matchPercent >= 40) return "Good connection! Keep learning about each other!";
    if (matchPercent >= 20) return "Getting there! Communication is key!";
    return "Opposites attract? Time to ask more questions!";
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Heart className="w-5 h-5 text-rose-500" /> Couple Quiz
            </h1>
            <div className="w-16" />
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💑</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple Quiz</h2>
                    <p className="text-gray-600">Both partners answer {QUESTIONS.length} questions independently, then discover your match percentage!</p>
                    <p className="text-sm text-pink-500 font-medium">Player 1 goes first, then Player 2</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Quiz 💑</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {(phase === 'player1' || phase === 'player2') && questions[currentQ] && (
              <motion.div key={`q-${currentQ}-${phase}`} initial={{ opacity: 0, x: phase === 'player1' ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    {phase === 'player1' ? "👤 Player 1's Turn" : "💖 Player 2's Turn"}
                  </span>
                  <span className="text-sm text-gray-500">Q {currentQ + 1}/{questions.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-lg font-bold text-gray-800 mb-6 text-center">{questions[currentQ].q}</p>
                    <div className="space-y-3">
                      {questions[currentQ].options.map((opt, i) => (
                        <motion.button key={i} whileHover={selected === null ? { scale: 1.02, x: 4 } : {}} whileTap={selected === null ? { scale: 0.98 } : {}}
                          onClick={() => handleAnswer(i)} disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${
                            selected === i ? 'bg-pink-100 border-pink-400 text-pink-800' : 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                          } ${selected !== null && selected !== i ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{getResultEmoji()}</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Your Match Result</h2>

                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#fce7f3" strokeWidth="10" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#heartGrad)" strokeWidth="10"
                          strokeDasharray={`${matchPercent * 3.27} 327`} strokeLinecap="round" />
                        <defs><linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#e11d48" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-800">{matchPercent}%</span>
                        <span className="text-xs text-gray-500">match</span>
                      </div>
                    </div>

                    <p className="text-lg font-semibold text-pink-600">{getResultText()}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-pink-500 font-medium">Player 1</p>
                        <p className="text-2xl font-black text-gray-800">{QUESTIONS.length - answers1.filter((a, i) => a === answers2[i]).length} diff.</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-3">
                        <p className="text-rose-500 font-medium">Player 2</p>
                        <p className="text-2xl font-black text-gray-800">{QUESTIONS.length - answers1.filter((a, i) => a === answers2[i]).length} diff.</p>
                      </div>
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games">
                <Button variant="ghost" size="sm">← Back to Games</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
