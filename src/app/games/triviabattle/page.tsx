'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Flame, Clock, Flame as FlameIcon, Zap } from 'lucide-react';
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
  points: number;
}

const QUESTIONS: Question[] = [
  { q: "What year was the first Valentine's Day card sent?", options: ['1340', '1847', '1605', '1901'], answer: 1, category: "History", difficulty: "medium", emoji: "💌", points: 100 },
  { q: "Which organ is the universal symbol of love?", options: ['Brain', 'Heart', 'Liver', 'Lungs'], answer: 1, category: "Culture", difficulty: "easy", emoji: "❤️", points: 50 },
  { q: "What color increases attraction scientifically?", options: ['Blue', 'Red', 'Green', 'Pink'], answer: 1, category: "Science", difficulty: "medium", emoji: "🔴", points: 100 },
  { q: "Who wrote 'Romeo and Juliet'?", options: ['Dickens', 'Shakespeare', 'Austen', 'Brontë'], answer: 1, category: "Literature", difficulty: "easy", emoji: "📖", points: 50 },
  { q: "The 'love hormone' is called...", options: ['Dopamine', 'Oxytocin', 'Serotonin', 'Adrenaline'], answer: 1, category: "Science", difficulty: "medium", emoji: "🧪", points: 100 },
  { q: "How many hearts does an octopus have?", options: ['1', '2', '3', '4'], answer: 2, category: "Nature", difficulty: "hard", emoji: "🐙", points: 200 },
  { q: "In Titanic, what's the name of the drawing?", options: ['My Heart', 'Dream of Me', 'Woman', 'The Portrait'], answer: 2, category: "Movies", difficulty: "medium", emoji: "🎬", points: 100 },
  { q: "Couples who laugh together are more...", options: ['Annoyed', 'Satisfied', 'Bored', 'Angry'], answer: 1, category: "Science", difficulty: "easy", emoji: "😂", points: 50 },
  { q: "Ancient Greeks had how many words for love?", options: ['3', '5', '7', '10'], answer: 1, category: "History", difficulty: "hard", emoji: "🏛️", points: 200 },
  { q: "The Taj Mahal was built as a monument to...", options: ['A king', 'A queen', 'A god', 'A city'], answer: 1, category: "History", difficulty: "easy", emoji: "🕌", points: 50 },
  { q: "Who said 'Love looks not with the eyes'?", options: ['Romeo', 'Shakespeare', 'Mark Antony', 'Orson Wells'], answer: 1, category: "Quotes", difficulty: "medium", emoji: "💬", points: 100 },
  { q: "What percentage of couples meet through friends?", options: ['10%', '22%', '35%', '50%'], answer: 1, category: "Statistics", difficulty: "hard", emoji: "📊", points: 200 },
  { q: "Traditional 1st anniversary gift is...", options: ['Gold', 'Paper', 'Cotton', 'Wood'], answer: 1, category: "Traditions", difficulty: "medium", emoji: "📝", points: 100 },
  { q: "Holding hands with a partner reduces...", options: ['Pain', 'Joy', 'Hunger', 'Sleepiness'], answer: 0, category: "Science", difficulty: "medium", emoji: "🤝", points: 100 },
  { q: "Which Disney movie features 'A Whole New World'?", options: ['Aladdin', 'Beauty and the Beast', 'Little Mermaid', 'Pocahontas'], answer: 0, category: "Movies", difficulty: "easy", emoji: "🎵", points: 50 },
  { q: "On average, how long to fall in love?", options: ['8 seconds', '8 minutes', '8 days', '8 weeks'], answer: 0, category: "Science", difficulty: "medium", emoji: "⏱️", points: 100 },
  { q: "Which color rose means 'love at first sight'?", options: ['Red', 'Pink', 'White', 'Yellow'], answer: 1, category: "Flowers", difficulty: "hard", emoji: "🌹", points: 200 },
  { q: "Who sang 'Can't Help Falling in Love'?", options: ['Elvis Presley', 'Frank Sinatra', 'Nat King Cole', 'Dean Martin'], answer: 0, category: "Music", difficulty: "easy", emoji: "🎤", points: 50 },
  { q: "The 7-year itch is based on what?", options: ['A real study', 'A movie title', 'A novel', 'Myth only'], answer: 2, category: "Culture", difficulty: "hard", emoji: "🎥", points: 200 },
  { q: "What flower symbolizes true love?", options: ['Daisy', 'Rose', 'Orchid', 'Lily'], answer: 1, category: "Flowers", difficulty: "easy", emoji: "🌺", points: 50 },
];

export default function TriviaBattlePage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timer, setTimer] = useState(10);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [toast, setToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 12);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setStreak(0);
    setBestStreak(0);
    setTimer(10);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' || showResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimer(10);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, showResult, currentQ]);

  const handleTimeout = () => {
    setSelected(null);
    setShowResult(true);
    setStreak(0);
    setTimeout(() => advanceQuestion(), 1500);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === questions[currentQ]?.answer) {
      const bonus = streak * 10;
      setScore(s => s + (questions[currentQ]?.points || 100) + bonus);
      setStreak(st => {
        const ns = st + 1;
        setBestStreak(bs => Math.max(bs, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setTimeout(() => advanceQuestion(), 1500);
  };

  const advanceQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setPhase('result');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const maxScore = questions.reduce((s, q) => s + q.points, 0);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
  const gradeEmoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '💪' : '📚';
  const gradeLabel = pct >= 90 ? 'Romance Genius!' : pct >= 70 ? 'Love Expert!' : pct >= 50 ? 'Good Romantic!' : 'Keep Learning!';

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
              <Zap className="w-4 h-4 text-amber-500" /> Trivia Battle
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-amber-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">⚔️💕</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Trivia Battle</h2>
                    <p className="text-gray-600">Rapid-fire 12 questions! Speed bonus for quick answers. Build streaks for multipliers!</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {['History', 'Science', 'Movies', 'Music', 'Flowers', 'Quotes'].map(c => (
                        <span key={c} className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">{c}</span>
                      ))}
                    </div>
                    <p className="text-sm text-amber-600 font-medium">10 seconds per question • Streak bonuses • Speed scoring</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Battle ⚔️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && questions[currentQ] && (
              <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">⚔️ Q {currentQ + 1}/{questions.length}</span>
                  <span className="text-sm font-bold text-amber-600">{score} pts</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                {streak >= 2 && !showResult && (
                  <div className="text-center mb-2">
                    <span className="text-orange-500 font-bold">🔥 {streak}x Streak! +{streak * 10} bonus</span>
                  </div>
                )}

                {!showResult && (
                  <div className="w-full bg-white/50 rounded-full h-3 mb-4 border border-pink-100 overflow-hidden">
                    <motion.div
                      className={`h-3 rounded-full ${timer > 6 ? 'bg-green-500' : timer > 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      animate={{ width: `${(timer / 10) * 100}%` }}
                    />
                  </div>
                )}

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <div className="text-center mb-3">
                      <span className="text-3xl">{questions[currentQ].emoji}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 mb-6 text-center">{questions[currentQ].q}</p>
                    <div className="space-y-3">
                      {questions[currentQ].options.map((opt, i) => {
                        const isCorrect = i === questions[currentQ].answer;
                        const isSelected = selected === i;
                        let btnClass = 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50';
                        if (showResult && isCorrect) btnClass = 'bg-green-100 border-green-400 text-green-800';
                        else if (showResult && isSelected && !isCorrect) btnClass = 'bg-red-100 border-red-400 text-red-800';
                        else if (showResult) btnClass = 'opacity-50 border-gray-200 text-gray-400';
                        return (
                          <motion.button key={i} whileHover={!showResult ? { scale: 1.02, x: 4 } : {}} whileTap={!showResult ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswer(i)} disabled={showResult}
                            className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${btnClass}`}>
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                              <span>{opt}</span>
                              {showResult && isCorrect && <span className="ml-auto">✅</span>}
                              {showResult && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {showResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2 mt-4">
                          <p className={`font-bold text-lg ${selected === questions[currentQ].answer ? 'text-green-600' : 'text-red-600'}`}>
                            {selected === questions[currentQ].answer ? '✅ Correct!' : `❌ Answer: ${String.fromCharCode(65 + questions[currentQ].answer)}`}
                          </p>
                          {streak >= 3 && <p className="text-orange-500 font-semibold text-sm">🔥 {streak}x Streak!</p>}
                          <Button onClick={advanceQuestion} variant="primary" className="w-full">
                            {currentQ + 1 < questions.length ? 'Next ⚔️' : 'See Results 🏆'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{gradeEmoji}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">{gradeLabel}</h2>
                    <div className="flex justify-center gap-2 items-end">
                      <span className="text-6xl font-black gradient-text">{score}</span>
                      <span className="text-xl text-gray-500 mb-2">/ {maxScore} pts</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-600">Grade</p>
                        <p className="text-2xl font-black text-amber-700">{grade}</p>
                      </div>
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-xs text-pink-600">Best Streak</p>
                        <p className="text-2xl font-black text-pink-700">🔥 {bestStreak}x</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-3">
                        <p className="text-xs text-rose-600">Accuracy</p>
                        <p className="text-2xl font-black text-rose-700">{pct}%</p>
                      </div>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto text-left">
                      {questions.map((q, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2 text-xs">
                          <span className="text-lg">{q.emoji}</span> {q.q}
                        </div>
                      ))}
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Battle Again ⚔️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games"><Button variant="ghost" size="sm">← Back to Games</Button></Link>
            </div>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Challenge a friend 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
