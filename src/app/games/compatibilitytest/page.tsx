'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

interface Question {
  q: string;
  options: string[];
  category: 'good' | 'better' | 'best';
}

const QUESTIONS: Question[] = [
  { q: "Favorite date activity?", options: ["Movie at home", "Dinner out", "Adventure trip", "Anything together"], category: 'best' },
  { q: "Dream vacation?", options: ["Staycation", "Beach resort", "European tour", "Worldwide journey"], category: 'best' },
  { q: "Favorite food?", options: ["Pizza", "Sushi", "Steak", "Homemade meal"], category: 'best' },
  { q: "Best way to relax?", options: ["Watch TV", "Read a book", "Take a walk", "Cuddle with partner"], category: 'best' },
  { q: "Favorite season?", options: ["Winter", "Spring", "Summer", "Fall"], category: 'best' },
  { q: "Love language?", options: ["Gifts", "Acts of Service", "Quality Time", "Physical Touch"], category: 'best' },
  { q: "Ideal Sunday?", options: ["Sleep in", "Brunch out", "Outdoor activity", "Coffee & cuddles"], category: 'best' },
  { q: "Favorite movie type?", options: ["Action", "Comedy", "Drama", "Romance"], category: 'best' },
  { q: "Music preference?", options: ["Pop", "Rock", "Classical", "Anything they sing"], category: 'best' },
  { q: "Communication style?", options: ["Text", "Call", "Video chat", "In person"], category: 'best' },
];

type Phase = 'intro' | 'p1' | 'p2' | 'reveal' | 'result';

export default function CompatibilityTestPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers1, setAnswers1] = useState<number[]>([]);
  const [answers2, setAnswers2] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [compatibility, setCompatibility] = useState(0);
  const [toast, setToast] = useState(false);

  const startGame = () => {
    setAnswers1([]);
    setAnswers2([]);
    setCurrentQ(0);
    setPhase('p1');
    setSelected(null);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    setTimeout(() => {
      if (phase === 'p1') {
        setAnswers1(prev => [...prev, idx]);
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
          setSelected(null);
        } else {
          setPhase('p2');
          setCurrentQ(0);
          setSelected(null);
        }
      } else if (phase === 'p2') {
        const newAnswers2 = [...answers2, idx];
        setAnswers2(newAnswers2);
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
          setSelected(null);
        } else {
          // Calculate compatibility
          let matches = 0;
          for (let i = 0; i < answers1.length && i < newAnswers2.length; i++) {
            if (answers1[i] === newAnswers2[i]) matches++;
            else if (Math.abs(answers1[i] - newAnswers2[i]) === 1) matches += 0.5;
          }
          const score = Math.round((matches / QUESTIONS.length) * 100);
          setCompatibility(score);
          setPhase('result');
        }
      }
    }, 600);
  };

  const reset = () => {
    setPhase('intro');
    setCurrentQ(0);
    setSelected(null);
    setCompatibility(0);
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const getCompatibilityMessage = (score: number) => {
    if (score >= 90) return { msg: "💕 Soulmates!", desc: "You're basically the same person!" };
    if (score >= 75) return { msg: "💖 Made to be!", desc: "You two have amazing chemistry!" };
    if (score >= 60) return { msg: "💗 Great Match!", desc: "You have lots in common!" };
    if (score >= 40) return { msg: "💘 Workable!", desc: "Opposites attract, you know!" };
    return { msg: "💝 Unique Pair!", desc: "Different but interesting!" };
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Compatibility Test
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Intro */}
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">💕✨</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">How Compatible Are You?</h2>
                    <p className="text-gray-600 mb-2">10 questions, 2 players, no peeking!</p>
                    <p className="text-sm text-gray-500 mb-6">Each player answers separately, then we reveal your compatibility score!</p>
                    <Button onClick={startGame} variant="primary" size="lg">Start Test 💖</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {/* Player Q&A */}
            {(phase === 'p1' || phase === 'p2') && QUESTIONS[currentQ] && (
              <motion.div key={`q-${currentQ}-${phase}`} initial={{ opacity: 0, x: phase === 'p1' ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: phase === 'p1' ? -50 : 50 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    {phase === 'p1' ? "👤 Player 1's turn" : "👤 Player 2's turn"}
                  </span>
                  <span className="text-sm text-gray-500">Q {currentQ + 1}/{QUESTIONS.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-2xl font-bold text-gray-800 mb-6 text-center">{QUESTIONS[currentQ].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[currentQ].options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: selected === null ? 1.02 : 1, x: selected === null ? 4 : 0 }}
                          whileTap={{ scale: selected === null ? 0.98 : 1 }}
                          onClick={() => handleAnswer(i)}
                          disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${
                            selected === i ? 'bg-primary-100 border-primary-500 text-primary-700 scale-105' : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
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

            {/* Result */}
            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">💕</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Compatibility Score</h2>

                    {/* Animated Meter */}
                    <div className="my-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="text-7xl font-black gradient-text-animated mb-2"
                      >
                        {compatibility}%
                      </motion.div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${compatibility}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 rounded-full"
                        />
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="text-2xl font-bold text-primary-600"
                      >
                        {getCompatibilityMessage(compatibility).msg}
                      </motion.p>
                      <p className="text-gray-600 mt-2">{getCompatibilityMessage(compatibility).desc}</p>
                    </div>

                    {/* Answer Comparison */}
                    <div className="text-left mt-6 space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Answer Comparison</p>
                      {QUESTIONS.map((q, i) => (
                        <div key={i} className={`flex justify-between items-center text-xs p-2 rounded-lg ${answers1[i] === answers2[i] ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <span className="flex-1 truncate text-gray-600">{q.q}</span>
                          <span className="font-bold text-primary-600">{q.options[answers1[i]] || '?'}</span>
                          <span className="mx-2">{answers1[i] === answers2[i] ? '✅' : '💕'}</span>
                          <span className="font-bold text-rose-600">{q.options[answers2[i]] || '?'}</span>
                        </div>
                      ))}
                    </div>

                    <Button onClick={reset} variant="primary" size="lg" className="mt-6">Take Test Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            <GameSharePanel gameSlug="compatibilitytest" />
      </PremiumBackground>
  );
}
