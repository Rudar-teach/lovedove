'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Flame, Clock, Flame as FlameIcon, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

interface Question {
  q: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
}

const QUESTIONS: Question[] = [
  { q: "Which ancient Roman festival is considered the precursor to Valentine's Day?", options: ["Lupercalia", "Saturnalia", "Flora", "Bacchanalia"], answer: 0, category: "History", difficulty: "medium", emoji: "🏛️" },
  { q: "Who wrote the world's first known love poem?", options: ["Shakespeare", "A Sumerian priestess", "Rumi", "Casanova"], answer: 1, category: "History", difficulty: "medium", emoji: "📜" },
  { q: "In which country is St. Valentine believed to be buried?", options: ["Italy", "France", "Spain", "Ireland"], answer: 3, category: "History", difficulty: "hard", emoji: "⚰️" },
  { q: "Which Egyptian queen was known for her legendary romance with Mark Antony?", options: ["Nefertiti", "Cleopatra", "Hatshepsut", "Isis"], answer: 1, category: "History", difficulty: "easy", emoji: "👑" },
  { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Emily Brontë"], answer: 1, category: "Literature", difficulty: "easy", emoji: "📖" },
  { q: "In which novel does Darcy declare his love for Elizabeth?", options: ["Wuthering Heights", "Pride and Prejudice", "Jane Eyre", "Sense and Sensibility"], answer: 1, category: "Literature", difficulty: "easy", emoji: "💌" },
  { q: "Which hormone is known as the 'love hormone'?", options: ["Adrenaline", "Oxytocin", "Serotonin", "Dopamine"], answer: 1, category: "Science", difficulty: "medium", emoji: "🧬" },
  { q: "How long does the 'honeymoon phase' typically last?", options: ["6 months", "1 year", "18 months", "2 years"], answer: 2, category: "Science", difficulty: "hard", emoji: "💘" },
  { q: "In which movie does Jack build a snowman with Rose?", options: ["Ghost", "Titanic", "The Notebook", "Pearl Harbor"], answer: 1, category: "Movies", difficulty: "easy", emoji: "❄️" },
  { q: "In 'Love Actually', who says 'To me, you are perfect'?", options: ["Harry", "Mark", "Billy", "Jamie"], answer: 1, category: "Movies", difficulty: "medium", emoji: "🎬" },
  { q: "Which flower is most associated with Valentine's Day?", options: ["Rose", "Lily", "Tulip", "Daisy"], answer: 0, category: "Traditions", difficulty: "easy", emoji: "🌹" },
  { q: "What color scientifically increases attraction?", options: ["Blue", "Red", "Green", "Pink"], answer: 1, category: "Science", difficulty: "medium", emoji: "🔴" },
  { q: "Couples who hold hands experience what?", options: ["Reduced pain", "Increased stress", "Lower immunity", "Faster heart rate"], answer: 0, category: "Science", difficulty: "medium", emoji: "🤝" },
  { q: "What's the traditional 1st anniversary gift?", options: ["Silver", "Paper", "Cotton", "Wood"], answer: 1, category: "Traditions", difficulty: "medium", emoji: "📝" },
  { q: "Which Greek goddess is love and beauty?", options: ["Hera", "Athena", "Aphrodite", "Artemis"], answer: 2, category: "History", difficulty: "easy", emoji: "🏺" },
];

export default function LoveTriviaPage() {
  const [shuffled, setShuffled] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timer, setTimer] = useState(15);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startQuiz = useCallback(() => {
    const shuffledQ = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setShuffled(shuffledQ);
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setSelected(null);
    setShowResult(false);
    setStreak(0);
    setBestStreak(0);
    setTimer(15);
    setDone(false);
    setQuizStarted(true);
  }, []);

  useEffect(() => {
    if (!quizStarted || answered || done) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimer(15);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setAnswered(true);
          setStreak(0);
          setTimeout(() => setShowResult(true), 400);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizStarted, answered, done, current]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(idx);
    if (idx === shuffled[current].answer) {
      setScore(s => s + 1);
      setStreak(st => {
        const ns = st + 1;
        setBestStreak(bs => Math.max(bs, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setTimeout(() => setShowResult(true), 400);
  };

  const next = () => {
    if (current + 1 >= shuffled.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setAnswered(false);
      setSelected(null);
      setShowResult(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (!quizStarted) {
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link href="/games">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
              <h1 className="text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-500" />
                Love Trivia
              </h1>
              <div className="w-10" />
            </div>

            <TiltCard intensity={5}>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <span className="text-6xl">🧠</span>
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Love Trivia Challenge</h2>
                <p className="text-gray-600">10 questions about love, romance & relationships across history, science, movies & literature</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['History', 'Movies', 'Literature', 'Science', 'Traditions'].map(c => (
                    <span key={c} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold">{c}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">15 seconds per question | ⏱️ Timer challenge | Build streaks!</p>
                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">Start Quiz 💡</Button>
              </div>
            </TiltCard>

            <div className="text-center mt-4">
              <Button onClick={copyLink} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" /> Invite Friend
              </Button>
            </div>
          </div>
        </div>
        <GameSharePanel gameSlug="lovetrivia" />
      </PremiumBackground>
    );
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100);
    const title = pct >= 90 ? 'Genius! 🏆' : pct >= 70 ? 'Amazing! 🌟' : pct >= 50 ? 'Great Job! 💕' : 'Keep Learning! 📚';
    const titleEmoji = pct >= 90 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '💕' : '📚';
    const titleText = pct >= 90 ? 'Love Scholar!' : pct >= 70 ? 'Amazing!' : pct >= 50 ? 'Great Job!' : 'Keep Learning!';

    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link href="/games">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
              <h1 className="text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-500" /> Results
              </h1>
              <div className="w-10" />
            </div>

            <TiltCard intensity={5}>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <div className="text-6xl mb-2">{titleEmoji}</div>
                <h2 className="text-3xl font-display font-bold text-gray-800">{titleText}</h2>
                <p className="text-xl text-gray-700 font-semibold">{score}/{shuffled.length} correct ({pct}%)</p>
                <p className="text-sm text-gray-500">Best streak: {bestStreak}x</p>

                {score >= 7 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm text-amber-700">🔥 {bestStreak}x best streak!</p>
                  </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto text-left">
                  {shuffled.map((q, i) => {
                    const correct = selected !== null && i === current;
                    return (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                        <p className="font-semibold text-gray-700">{i + 1}. {q.q}</p>
                        <p className="text-xs text-gray-500 mt-1">{q.emoji} {q.category} • {q.difficulty}</p>
                      </div>
                    );
                  })}
                </div>

                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">Play Again 🧠</Button>
              </div>
            </TiltCard>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  const q = shuffled[current];
  const isCorrect = selected === q.answer;
  const diffColor = q.difficulty === 'easy' ? 'text-green-600' : q.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600';

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
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-pink-500" /> Love Trivia
            </h1>
            <div className="text-sm font-bold text-gray-600">{score}/{current}</div>
          </div>

          <div className="w-full bg-white/50 rounded-full h-2 mb-2 border border-pink-100">
            <motion.div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" animate={{ width: `${((current) / shuffled.length) * 100}%` }} />
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <span className="text-gray-500 font-medium">Q{current + 1}/{shuffled.length}</span>
            <span className={`font-bold ${diffColor} capitalize`}>{q.difficulty}</span>
            <span className="text-gray-500">{q.category} {q.emoji}</span>
          </div>

          {!answered && (
            <div className="w-full bg-white/50 rounded-full h-3 mb-4 border border-pink-100 overflow-hidden">
              <motion.div
                className={`h-3 rounded-full ${timer > 5 ? 'bg-green-500' : timer > 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                animate={{ width: `${(timer / 15) * 100}%` }}
              />
            </div>
          )}
          {!answered && (
            <p className="text-center text-sm text-gray-500 mb-3 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" /> {timer}s remaining
            </p>
          )}

          {streak >= 3 && !answered && (
            <div className="text-center mb-2">
              <span className="text-orange-500 font-bold text-sm">🔥 {streak}x Streak!</span>
            </div>
          )}

          <TiltCard intensity={5}>
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5">
              <div className="text-center">
                <span className="text-4xl mb-2 block">{q.emoji}</span>
                <p className="text-lg font-semibold text-gray-800 leading-relaxed">{q.q}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  let cls = 'bg-white border-gray-200 text-gray-700 hover:border-pink-300';
                  if (answered) {
                    if (i === q.answer) cls = 'bg-green-50 border-green-400 text-green-700';
                    else if (i === selected) cls = 'bg-red-50 border-red-400 text-red-700';
                    else cls = 'opacity-50 border-gray-200 text-gray-400';
                  }
                  return (
                    <motion.button
                      key={i}
                      whileTap={answered ? {} : { scale: 0.98 }}
                      onClick={() => handleAnswer(i)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all ${cls}`}
                    >
                      <span className="mr-2 text-lg">{String.fromCharCode(65 + i)}.</span> {opt}
                    </motion.button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                  <p className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✅ Correct!' : `❌ Answer: ${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}`}
                  </p>
                  {streak >= 3 && <p className="text-orange-500 font-semibold text-sm">🔥 {streak}x Streak!</p>}
                  <Button onClick={next} variant="primary" className="w-full">
                    {current + 1 < shuffled.length ? 'Next ➡️' : 'See Results 🏆'}
                  </Button>
                </motion.div>
              )}
            </div>
          </TiltCard>

          <div className="flex justify-center mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
