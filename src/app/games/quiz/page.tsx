'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  { q: 'What was our first date?', options: ['Movie', 'Dinner', 'Coffee', 'Park'], answer: 2 },
  { q: 'My favorite food is?', options: ['Sushi', 'Pizza', 'Pasta', 'Burgers'], answer: 1 },
  { q: 'What makes me smile?', options: ['Money', 'Your texts', 'Good weather', 'Shopping'], answer: 1 },
  { q: 'My dream vacation?', options: ['Beach', 'Mountains', 'City', 'Desert'], answer: 0 },
  { q: 'What color do I love?', options: ['Blue', 'Green', 'Pink', 'Purple'], answer: 2 },
  { q: 'My biggest fear?', options: ['Heights', 'Spiders', 'Dark', 'Loneliness'], answer: 3 },
  { q: 'My go-to comfort food?', options: ['Ice cream', 'Chocolate', 'Noodles', 'All of the above'], answer: 3 },
  { q: 'How do I like to relax?', options: ['Read', 'Watch shows', 'Sleep', 'Music'], answer: 1 },
  { q: 'My morning routine starts with?', options: ['Coffee', 'Exercise', 'Shower', 'Checking phone'], answer: 0 },
  { q: 'What gift would I love?', options: ['Jewelry', 'Flowers', 'Handwritten note', 'Experience'], answer: 3 },
  { q: 'My pet peeve?', options: ['Lateness', 'Messiness', 'Loud chewing', 'All'], answer: 3 },
  { q: 'I could eat this every day?', options: ['Salad', 'Tacos', 'Rice', 'Soup'], answer: 1 },
  { q: 'My favorite season?', options: ['Spring', 'Summer', 'Autumn', 'Winter'], answer: 2 },
  { q: 'What makes me cry?', options: ['Sad movies', 'Onions', 'Karaoke', 'All of the above'], answer: 3 },
  { q: 'My hidden talent?', options: ['Singing', 'Cooking', 'Drawing', 'Dancing'], answer: 0 },
  { q: 'My love language?', options: ['Words of affirmation', 'Quality time', 'Acts of service', 'Gifts'], answer: 1 },
  { q: 'How do I text you?', options: ['Long paragraphs', 'Short & sweet', 'Memes only', 'Endless emojis'], answer: 3 },
  { q: 'Our go-to date night at home?', options: ['Movie & snacks', 'Cook together', 'Game night', 'Dance party'], answer: 0 },
  { q: 'Song that is basically our anthem?', options: ['A slow ballad', 'A road-trip jam', 'A duet', 'A sing-along'], answer: 2 },
  { q: 'My guilty-pleasure show?', options: ['Reality TV', 'Crime dramas', 'Sitcoms', 'K-dramas'], answer: 3 },
  { q: 'My ideal Saturday?', options: ['Sleep in', 'Hike', 'Brunch', 'Errands with you'], answer: 1 },
  { q: 'How do I like to resolve disagreements?', options: ['Talk it out', 'Take a break', 'Laugh it off', 'Compromise'], answer: 0 },
  { q: 'My lucky number?', options: ['7', '3', '13', '100'], answer: 0 },
  { q: 'The best compliment you have ever given me?', options: ["You're amazing", "You're funny", "You're home", "You're my favorite"], answer: 3 },
  { q: 'What can I not live without?', options: ['Phone', 'Coffee', 'Music', 'You'], answer: 3 },
  { q: 'My dream travel buddy trait?', options: ['Spontaneous', 'The planner', 'The foodie', 'The photographer'], answer: 0 },
  { q: 'My best friend would say I am…', options: ['Loud', 'Thoughtful', 'Chaotic', 'All of the above'], answer: 3 },
  { q: 'My go-to move when I am upset?', options: ['Quiet time', 'Talk it out', 'A big hug', 'Distract me'], answer: 2 },
  { q: 'Our group chat inside joke is about?', options: ['Too embarrassing', 'A meme series', 'A song', 'A nickname'], answer: 1 },
];

export default function CoupleQuizPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [best, setBest] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);

  const generateQuestions = useCallback(() => {
    setQuestions([...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  }, []);

  useEffect(() => {
    const b = localStorage.getItem('couplequiz_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    generateQuestions();
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setState('playing');
  }, [generateQuestions]);

  useEffect(() => {
    if (state !== 'playing' || selected === null) return;
    if (!showResult) return;
    if (currentQ >= questions.length - 1) {
      setTimeout(() => {
        setState('finished');
        const finalScore = score + (selected === questions[currentQ].answer ? 10 : 0);
        if (finalScore > best) {
          setBest(finalScore);
          localStorage.setItem('couplequiz_best', String(finalScore));
        }
      }, 1200);
    } else {
      setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setSelected(null);
        setShowResult(false);
      }, 1200);
    }
  }, [showResult, currentQ, questions, selected, score, best, state]);

  return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-pink-700/80 hover:text-pink-500 transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-pink-700 flex items-center gap-2">
              <Heart className="text-pink-400" /> Couple Quiz
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-pink-700/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-pink-700/60 text-xs uppercase">Question</div>
                <div className="text-xl font-bold text-white">{questions.length > 0 ? `${currentQ + 1}/${questions.length}` : '-'}</div>
              </div>
              <div>
                <div className="text-pink-700/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-600">{best}</div>
              </div>
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Heart className="text-pink-400 mx-auto mb-4" size={48} />
                <p className="text-pink-700 text-lg mb-2">How well do you know each other?</p>
                <p className="text-pink-700/60 text-sm mb-4">
                  {QUESTIONS.length} questions about each other
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start Quiz
                </button>
              </motion.div>
            )}

            {state === 'playing' && questions[currentQ] && (
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white">{questions[currentQ].q}</h3>

                <div className="space-y-2">
                  {questions[currentQ].options.map((opt, idx) => {
                    let bg = 'bg-white/10 hover:bg-white/20';
                    if (showResult) {
                      if (idx === questions[currentQ].answer) bg = 'bg-green-500/30 border border-green-400';
                      else if (idx === selected && idx !== questions[currentQ].answer) bg = 'bg-red-500/30 border border-red-400';
                      else bg = 'bg-white/5 opacity-50';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (selected === null) {
                            setSelected(idx);
                            setShowResult(true);
                            const correct = idx === questions[currentQ].answer;
                            if (correct) setScore((s) => s + 10);
                            setAnswers((a) => [...a, correct]);
                          }
                        }}
                        disabled={selected !== null}
                        className={`w-full p-4 rounded-xl text-left text-white font-medium transition-all ${bg}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-pink-700 mb-1">
                      {score >= 80 ? '🏆 Soulmates!' : score >= 50 ? '💖 Great Match!' : '💕 Getting There!'}
                    </h2>
                    <p className="text-pink-700/70">
                      {answers.filter((a) => a).length}/{answers.length} correct
                    </p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    
);
}