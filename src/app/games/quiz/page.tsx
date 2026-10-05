'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

interface Question {
  question: string;
  options: string[];
  hint: string;
}

const QUESTIONS: Question[] = [
  { question: 'What is your partner\'s favorite color?', options: ['Red', 'Blue', 'Pink', 'Purple'], hint: 'Pink is the favorite of 70% of couples 💕' },
  { question: 'What is your favorite memory together?', options: ['First date', 'First kiss', 'Vacation', 'Cooking together'], hint: 'The little moments matter most 🌟' },
  { question: 'What does your partner love most about you?', options: ['Your smile', 'Your humor', 'Your kindness', 'Your eyes'], hint: 'Inside job! 🎭' },
  { question: 'Where do you want to travel next?', options: ['Paris', 'Beach', 'Mountains', 'Tokyo'], hint: 'The City of Love is always romantic 💝' },
  { question: 'What\'s your partner\'s favorite food?', options: ['Pizza', 'Pasta', 'Sushi', 'Chocolate'], hint: 'Sweet tooth win 🍫' },
  { question: 'How do you say "I love you" most often?', options: ['In words', 'In hugs', 'In gifts', 'In actions'], hint: 'Love languages! 💬' },
  { question: 'What makes you both laugh?', options: ['Inside jokes', 'Movies', 'Songs', 'Memes'], hint: 'Inside jokes are unique 🗣️' },
  { question: 'What is the best part of your relationship?', options: ['Trust', 'Fun', 'Communication', 'Everything'], hint: 'All of the above! 💖' },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [yourAnswer, setYourAnswer] = useState<string | null>(null);
  const [scoreState, setScoreState] = useState({ match: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [phase, setPhase] = useState<'partner' | 'you' | 'compare'>('partner');

  const handleAnswer = (answer: string) => {
    if (phase === 'partner') {
      setPartnerAnswer(answer);
      setPhase('you');
    } else if (phase === 'you') {
      setYourAnswer(answer);
      setPhase('compare');
    }
  };

  const checkAnswer = () => {
    const isMatch = yourAnswer === partnerAnswer;
    setScoreState({ match: scoreState.match + (isMatch ? 1 : 0), total: scoreState.total + 1 });
    setTimeout(() => {
      if (currentQuestion + 1 < QUESTIONS.length) {
        setCurrentQuestion(currentQuestion + 1);
        setPartnerAnswer(null);
        setYourAnswer(null);
        setPhase('partner');
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setPartnerAnswer(null);
    setYourAnswer(null);
    setShowResult(false);
    setPhase('partner');
    setScoreState({ match: 0, total: 0 });
  };

  if (showResult) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-3xl font-display font-bold gradient-text mb-4">Quiz Complete!</h2>
            <p className="text-5xl font-bold text-gray-900 mb-2">{scoreState.match}/{scoreState.total}</p>
            <p className="text-gray-600 mb-6">You matched on {scoreState.match} out of {scoreState.total} questions!</p>
            <p className="text-lg mb-6">
              {scoreState.match >= 6 ? '💖 Perfect Match! You know each other well!' :
                scoreState.match >= 4 ? '💕 Great Match! Pretty good compatibility!' :
                  '💛 Keep learning about each other!'}
            </p>
            <Button onClick={restart} variant="primary" size="lg">Play Again</Button>
            <div className="mt-4">
              <Link href="/games">
                <Button variant="outline">← Back to Games</Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <GameSharePanel gameSlug="quiz" />
      </PremiumBackground>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Couple Quiz
            </h1>
            <button onClick={restart} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-5 text-primary-500" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} / {QUESTIONS.length}
            </div>
            <div className="text-sm font-bold text-primary-600">
              Score: {scoreState.match}/{scoreState.total}
            </div>
          </div>

          <div className="bg-gray-200 h-2 rounded-full mb-8">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }} className="bg-gradient-to-r from-primary-500 to-rose-500 h-2 rounded-full" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion + phase}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  {phase === 'partner' && (
                    <div className="text-center mb-6">
                      <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                        Round 1: Partner&apos;s Turn
                      </span>
                    </div>
                  )}
                  {phase === 'you' && (
                    <div className="text-center mb-6">
                      <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
                        Round 2: Your Turn
                      </span>
                    </div>
                  )}
                  {phase === 'compare' && (
                    <div className="text-center mb-6">
                      <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium mb-4">
                        Compare!
                      </span>
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{question.question}</h2>

                  {phase === 'compare' ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                        <p className="text-sm text-blue-600 font-medium mb-1">Partner said:</p>
                        <p className="text-xl font-bold text-blue-900">{partnerAnswer}</p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-2xl border-2 border-pink-200">
                        <p className="text-sm text-pink-600 font-medium mb-1">You said:</p>
                        <p className="text-xl font-bold text-pink-900">{yourAnswer}</p>
                      </div>
                      <div className="text-center pt-4">
                        <p className="text-2xl font-bold mb-2">
                          {yourAnswer === partnerAnswer ? '💕 You Matched!' : '💛 Different answers!'}
                        </p>
                        <p className="text-sm text-gray-500 italic">{question.hint}</p>
                        <Button onClick={checkAnswer} variant="primary" className="mt-4">
                          Next Question <ChevronRight className="inline w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <Button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          variant="outline"
                          className="w-full justify-start text-left py-4"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            </motion.div>
          </AnimatePresence>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
