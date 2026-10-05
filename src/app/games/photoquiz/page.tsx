'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Heart, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

type Question = {
  q: string;
  options: string[];
  answer: number;
  feedback: string[];
};

const QUESTIONS: Question[] = [
  { q: "What's my favorite color?", options: ['Pink', 'Blue', 'Purple', 'Red'], answer: 0, feedback: ['Spot on! 💖', 'Not quite! Try pink 💕', 'Hmm, close but no!', 'Wrong! Pink is the answer'] },
  { q: 'My go-to comfort snack?', options: ['Chocolate 🍫', 'Chips', 'Ice Cream 🍦', 'Popcorn'], answer: 0, feedback: ['Yes! Sweet like us 🍫', 'Surprisingly no!', 'Cold but no!', 'Nope!'] },
  { q: 'My dream vacation spot?', options: ['Beach 🏖️', 'Mountains', 'Paris', 'Tokyo'], answer: 0, feedback: ['You know me! 🌊', 'Not my vibe', 'A close second!', 'Wrong country!'] },
  { q: 'My love language?', options: ['Words of Affirmation', 'Quality Time', 'Gifts', 'Acts of Service'], answer: 1, feedback: ['Quality time, always! ⏰', 'Time together > everything!', 'Surprise me!', 'Show me, don\'t say!'] },
  { q: 'My favorite season?', options: ['Winter ❄️', 'Spring 🌷', 'Summer ☀️', 'Autumn 🍁'], answer: 1, feedback: ['Bloom with love! 🌸', 'Snow? Closely!', 'Sun? Out of season!', 'Nope!'] },
  { q: 'What makes me happiest?', options: ['Travel', 'Music', 'You 💖', 'Food'], answer: 2, feedback: ['You guessed it right! 💕', 'So close!', 'Hmm', 'You always!'] },
  { q: 'My morning drink?', options: ['Coffee ☕', 'Tea 🍵', 'Juice', 'Water'], answer: 0, feedback: ['Coffee lover! ☕', 'Nope!', 'Wrong!', 'No'] },
  { q: 'My favorite flower?', options: ['Rose 🌹', 'Tulip', 'Sunflower', 'Lily'], answer: 0, feedback: ['Roses are red! 🌹', 'No tulip here!', 'Sunny but no!', 'Wrong!'] },
  { q: 'My idea of romance?', options: ['Candlelit dinner', 'Stargazing', 'Long walks', 'All of the above 💕'], answer: 3, feedback: ['Romance is everything! 💖', 'Just one?', 'A favorite yes!', 'ALL the romance!'] },
  { q: 'My pet peeve?', options: ['Lateness', 'Loud chewing', 'Messiness', 'Bad texts'], answer: 0, feedback: ['Always on time! ⏰', 'Nope!', 'Wrong!', 'No!'] },
];

type Mode = 'solo' | 'together';

export default function PhotoQuizPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Turn, setP1Turn] = useState(true);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'fail'; msg: string } | null>(null);
  const [done, setDone] = useState(false);

  const startGame = (m: Mode) => {
    setMode(m);
    setCurrent(0);
    setScore(0);
    setP1Score(0);
    setP2Score(0);
    setP1Turn(true);
    setDone(false);
  };

  const handleAnswer = (idx: number) => {
    const q = QUESTIONS[current];
    const correct = idx === q.answer;
    const fb = q.feedback[correct ? 0 : idx] || (correct ? 'Wrong!' : 'Wrong!');
    setFeedback({ kind: correct ? 'success' : 'fail', msg: fb });
    if (correct) {
      if (mode === 'solo') setScore(s => s + 10);
      else if (p1Turn) setP1Score(s => s + 10);
      else setP2Score(s => s + 10);
    }
    setTimeout(() => {
      setFeedback(null);
      if (mode === 'together') {
        if (p1Turn) setP1Turn(false);
        else {
          if (current + 1 >= QUESTIONS.length) setDone(true);
          else setCurrent(c => c + 1);
          setP1Turn(true);
        }
      } else {
        if (current + 1 >= QUESTIONS.length) setDone(true);
        else setCurrent(c => c + 1);
      }
    }, 1400);
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Photo Quiz', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Photo Quiz
            </h1>
            <div className="w-10" />
          </div>

          {!mode && (
            <TiltCard>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Heart className="w-20 h-20 text-primary-500 mx-auto fill-primary-500" />
                </motion.div>
                <p className="text-gray-700 font-semibold">How well do you know your partner? 💕</p>
                <p className="text-sm text-gray-500">Answer fun questions about each other!</p>
                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={() => startGame('solo')} variant="primary">Solo Mode (You Guess)</Button>
                  <Button onClick={() => startGame('together')} variant="outline">Together Mode (Compare)</Button>
                </div>
              </div>
            </TiltCard>
          )}

          {mode && !done && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100">
                  Question {current + 1}/{QUESTIONS.length}
                </div>
                {mode === 'solo' && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
                    Score: {score}
                  </div>
                )}
                {mode === 'together' && (
                  <>
                    <div className={`bg-white/70 backdrop-blur rounded-xl px-3 py-1.5 shadow border ${p1Turn ? 'border-primary-400 text-primary-600' : 'border-pink-100 text-gray-500'}`}>
                      💙 P1: {p1Score}
                    </div>
                    <div className={`bg-white/70 backdrop-blur rounded-xl px-3 py-1.5 shadow border ${!p1Turn ? 'border-rose-400 text-rose-600' : 'border-pink-100 text-gray-500'}`}>
                      💗 P2: {p2Score}
                    </div>
                  </>
                )}
              </div>

              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4 min-h-[400px] relative">
                  {mode === 'together' && (
                    <div className="text-center text-sm font-bold">
                      <span className={p1Turn ? 'text-primary-600' : 'text-rose-600'}>
                        {p1Turn ? "💙 Player 1's turn" : "💗 Player 2's turn"}
                      </span>
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current + (p1Turn ? 'p1' : 'p2') + (mode === 'together' ? '' : '')}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                        {QUESTIONS[current].q}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {QUESTIONS[current].options.map((opt, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAnswer(i)}
                            className="bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-2xl p-3 text-left font-semibold text-gray-700 border-2 border-pink-100 hover:border-primary-300 transition-colors"
                          >
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-[2rem] ${
                          feedback.kind === 'success' ? 'bg-pink-100/95' : 'bg-rose-100/95'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-7xl mb-2">{feedback.kind === 'success' ? '💖' : '💔'}</div>
                          <p className={`text-2xl font-bold ${feedback.kind === 'success' ? 'text-pink-700' : 'text-rose-700'}`}>
                            {feedback.msg}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TiltCard>
            </>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                  <h2 className="text-3xl font-display font-black gradient-text-animated">
                    {mode === 'solo' ? `You scored ${score}!` : 'Results!'}
                  </h2>
                  {mode === 'solo' && (
                    <p className="text-gray-600">
                      {score === 100 ? 'Soulmates! 💖' : score >= 70 ? 'You know them well! 💕' : score >= 40 ? 'Get to know them more! 💗' : 'Time for date nights! 💌'}
                    </p>
                  )}
                  {mode === 'together' && (
                    <>
                      <div className="flex justify-around text-lg">
                        <div>
                          <div className="text-3xl font-bold text-primary-600">{p1Score}</div>
                          <div className="text-sm text-gray-500">Player 1 💙</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-rose-600">{p2Score}</div>
                          <div className="text-sm text-gray-500">Player 2 💗</div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {p1Score === p2Score ? "It's a tie! 💖" : p1Score > p2Score ? 'Player 1 knows more! 💙' : 'Player 2 knows more! 💗'}
                      </p>
                    </>
                  )}
                  <Button onClick={() => setMode(null)} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="photoquiz" />
      </PremiumBackground>
  );
}
