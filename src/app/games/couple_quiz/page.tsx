'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Check } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const QUESTIONS = [
  { q: "What's your partner's favorite color?", options: ["Red", "Blue", "Pink", "Green"] },
  { q: "Where did you first meet?", options: ["At school", "At work", "Online", "Through friends", "At a cafe"] },
  { q: "What's your partner's favorite food?", options: ["Pizza", "Sushi", "Pasta", "Tacos", "Salad"] },
  { q: "What's your anniversary date?", options: ["January", "March", "June", "September", "December"] },
  { q: "What's your partner's biggest fear?", options: ["Heights", "Spiders", "Public speaking", "The dark", "Clowns"] },
  { q: "What's your partner's dream vacation?", options: ["Beach", "Mountains", "City", "Countryside", "Space"] },
  { q: "What makes your partner laugh the most?", options: ["Dad jokes", "Slapstick", "Puns", "Memes", "Roasting"] },
  { q: "What's your partner's go-to drink?", options: ["Coffee", "Tea", "Soda", "Water", "Smoothie"] },
  { q: "What's your partner's favorite season?", options: ["Spring", "Summer", "Fall", "Winter"] },
  { q: "What's your partner's hidden talent?", options: ["Singing", "Cooking", "Drawing", "Dancing", "Gaming"] },
  { q: "How does your partner show love?", options: ["Words", "Touch", "Gifts", "Time", "Actions"] },
  { q: "What's your partner's comfort food?", options: ["Mac & cheese", "Ice cream", "Chocolate", "Soup", "Pizza"] },
];

export default function CoupleQuiz() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const startGame = () => {
    setAnswers({});
    setSubmitted(false);
    setGameState('playing');
  };

  const selectAnswer = (qi: number, opt: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: opt }));
  };

  const submitQuiz = () => {
    setSubmitted(true);
    const answered = Object.keys(answers).length;
    if (answered === QUESTIONS.length) {
      setTimeout(() => setGameState('finished'), 1500);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">❓</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Quiz</h1>
              <p className="text-gray-600 mb-8 text-lg">How well do you know your partner?</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Play className="w-5 h-5 inline mr-2" /> Test My Knowledge</button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">{Object.keys(answers).length} / {QUESTIONS.length} answered</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: `${(Object.keys(answers).length / QUESTIONS.length) * 100}%` }} />
              </div>
              {QUESTIONS.map((q, qi) => (
                <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-100/60">
                  <p className="font-bold text-gray-900 mb-4">{qi + 1}. {q.q}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map(opt => (
                      <button key={opt} onClick={() => selectAnswer(qi, opt)} className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${answers[qi] === opt ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        {answers[qi] === opt && <Check className="w-4 h-4 inline mr-2" />}{opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
              {Object.keys(answers).length === QUESTIONS.length && !submitted && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="text-center mt-6">
                  <button onClick={submitQuiz} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl text-white font-bold text-lg"><Trophy className="w-5 h-5 inline mr-2" /> Submit Answers</button>
                </motion.div>
              )}
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500 mb-8">You answered all {QUESTIONS.length} questions!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4">Your Answers:</h3>
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                    <p className="text-sm text-gray-600">Q{i + 1}: {q.q}</p>
                    <p className="text-sm font-medium text-amber-600 mt-1">{answers[i]}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
