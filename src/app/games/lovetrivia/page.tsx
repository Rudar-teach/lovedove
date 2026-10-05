'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Flame, Clock } from 'lucide-react';
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
}

const QUESTIONS: Question[] = [
  // History
  { q: "Which ancient Roman festival is considered the precursor to Valentine's Day?", options: ["Lupercalia", "Saturnalia", "Flora", "Bacchanalia"], answer: 0, category: "History", difficulty: "medium" },
  { q: "Who wrote the world's first known love poem?", options: ["Shakespeare", "A Sumerian priestess", "Rumi", "Casanova"], answer: 1, category: "History", difficulty: "medium" },
  { q: "In which country is St. Valentine believed to be buried?", options: ["Italy", "France", "Spain", "Ireland"], answer: 3, category: "History", difficulty: "hard" },
  { q: "Which Egyptian queen was known for her legendary romance with Mark Antony?", options: ["Nefertiti", "Cleopatra", "Hatshepsut", "Isis"], answer: 1, category: "History", difficulty: "easy" },
  { q: "What year did the first Valentine's Day card appear?", options: ["1500s", "1400s", "1600s", "1300s"], answer: 1, category: "History", difficulty: "hard" },
  { q: "Which famous emperor was known to have 365 wives in his harem?", options: ["Akbar", "Shah Jahan", "Genghis Khan", "Aurangzeb"], answer: 2, category: "History", difficulty: "medium" },
  { q: "The ancient Greeks believed there were how many types of love?", options: ["3", "4", "5", "6"], answer: 3, category: "History", difficulty: "hard" },
  { q: "Who was the Greek goddess of love and beauty?", options: ["Hera", "Athena", "Aphrodite", "Artemis"], answer: 2, category: "History", difficulty: "easy" },
  { q: "Which Indian emperor built the Taj Mahal for his wife?", options: ["Akbar", "Shah Jahan", "Humayun", "Aurangzeb"], answer: 1, category: "History", difficulty: "easy" },
  { q: "What did Victor Hugo tell his wife Cosette when she died?", options: ["I'll always love you", "She'll be back", "Now I can write freely", "Goodbye my love"], answer: 2, category: "History", difficulty: "hard" },

  // Movies
  { q: "In which movie does Jack build a snowman with Rose on the ship?", options: ["Ghost", "Titanic", "The Notebook", "Pearl Harbor"], answer: 1, category: "Movies", difficulty: "easy" },
  { q: "What is the name of the notebook in 'The Notebook'?", options: ["The Journal", "The Diary", "The Note", "The Story"], answer: 1, category: "Movies", difficulty: "medium" },
  { q: "Which song plays during the famous 'talking in the rain' scene from The Notebook?", options: ["I Will Always Love You", "I Don't Want to Miss a Thing", "Beauty and the Beast", "Unchained Melody"], answer: 3, category: "Movies", difficulty: "medium" },
  { q: "In 'Love Actually', who says 'To me, you are perfect'?", options: ["Harry", "Mark", "Billy", "Jamie"], answer: 1, category: "Movies", difficulty: "medium" },
  { q: "Which Disney movie features the song 'A Whole New World'?", options: ["Aladdin", "Beauty and the Beast", "The Little Mermaid", "Pocahontas"], answer: 0, category: "Movies", difficulty: "easy" },
  { q: "In 'La La Land', what profession does Sebastian have?", options: ["Actor", "Painter", "Jazz pianist", "Writer"], answer: 2, category: "Movies", difficulty: "medium" },
  { q: "Who played opposite Richard Gere in 'Pretty Woman'?", options: ["Julia Roberts", "Meg Ryan", "Michelle Pfeiffer", "Demi Moore"], answer: 0, category: "Movies", difficulty: "easy" },
  { q: "In '127 Hours', what tool does Aron use to free himself?", options: ["A knife", "A rock", "A multi-tool", "His teeth"], answer: 2, category: "Movies", difficulty: "hard" },
  { q: "Which film features the quote: 'Here's looking at you, kid'?", options: ["Casablanca", "Gone with the Wind", "Citizen Kane", "Maltese Falcon"], answer: 0, category: "Movies", difficulty: "medium" },
  { q: "In 'Dilwale Dulhania Le Jayenge', where do Raj and Simran first meet?", options: ["London", "Paris", "India", "New York"], answer: 0, category: "Movies", difficulty: "medium" },

  // Literature
  { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Emily Brontë"], answer: 1, category: "Literature", difficulty: "easy" },
  { q: "In which novel does Darcy declare his love for Elizabeth?", options: ["Wuthering Heights", "Pride and Prejudice", "Jane Eyre", "Sense and Sensibility"], answer: 1, category: "Literature", difficulty: "easy" },
  { q: "Who wrote 'The Great Gatsby', a novel about unrequited love?", options: ["Hemingway", "F. Scott Fitzgerald", "Faulkner", "Steinbeck"], answer: 1, category: "Literature", difficulty: "medium" },
  { q: "What novel features Heathcliff and Catherine's tragic love?", options: ["Pride and Prejudice", "Jane Eyre", "Wuthering Heights", "Rebecca"], answer: 2, category: "Literature", difficulty: "medium" },
  { q: "Who wrote 'Love in the Time of Cholera'?", options: ["Pablo Neruda", "Gabriel García Márquez", "Isabel Allende", "Mario Vargas Llosa"], answer: 1, category: "Literature", difficulty: "hard" },
  { q: "In 'The Notebook', what disease does Allie have?", options: ["Cancer", "Alzheimer's", "Heart disease", "Dementia"], answer: 1, category: "Literature", difficulty: "medium" },
  { q: "Who wrote the collection of love poems 'Sonnets from the Portuguese'?", options: ["Emily Dickinson", "Elizabeth Barrett Browning", "Sylvia Plath", "Maya Angelou"], answer: 1, category: "Literature", difficulty: "hard" },
  { q: "In 'Twilight', what color is Edward Cullen's car?", options: ["Red", "Silver", "Black", "Blue"], answer: 1, category: "Literature", difficulty: "easy" },
  { q: "Who wrote 'The Fault in Our Stars'?", options: ["John Green", "Nicholas Sparks", "J.K. Rowling", "Stephenie Meyer"], answer: 0, category: "Literature", difficulty: "medium" },
  { q: "What famous poet wrote 'Ruba'iyat' collection with love themes?", options: ["Hafez", "Rumi", "Omar Khayyam", "Saadi"], answer: 2, category: "Literature", difficulty: "hard" },

  // Science of Love
  { q: "Which hormone is known as the 'love hormone'?", options: ["Adrenaline", "Oxytocin", "Serotonin", "Dopamine"], answer: 1, category: "Science of Love", difficulty: "medium" },
  { q: "How long does it take for the brain to decide if someone is attractive?", options: ["1 minute", "100 milliseconds", "5 minutes", "1 second"], answer: 1, category: "Science of Love", difficulty: "hard" },
  { q: "Which neurotransmitter is most associated with romantic love?", options: ["Dopamine", "Serotonin", "Oxytocin", "Vasopressin"], answer: 0, category: "Science of Love", difficulty: "medium" },
  { q: "Studies show that couples who hold hands experience what?", options: ["Reduced pain", "Increased stress", "Lower immunity", "Faster heart rate"], answer: 0, category: "Science of Love", difficulty: "medium" },
  { q: "How long does the 'honeymoon phase' typically last?", options: ["6 months", "1 year", "18 months", "2 years"], answer: 2, category: "Science of Love", difficulty: "hard" },
  { q: "What does 'limerence' mean?", options: ["Deep friendship", "Obsessive romantic attraction", "Long-term commitment", "Physical attraction"], answer: 1, category: "Science of Love", difficulty: "hard" },
  { q: "Which part of the brain lights up when people see loved ones?", options: ["Amygdala", "Reward center (VTA)", "Prefrontal cortex", "Hippocampus"], answer: 1, category: "Science of Love", difficulty: "hard" },
  { q: "On average, how many dates do couples go on before defining their relationship?", options: ["3-5", "6-10", "10-15", "15+ dates"], answer: 1, category: "Science of Love", difficulty: "hard" },
  { q: "What does gazing into each other's eyes do to couples?", options: ["Increases distrust", "Synchronizes heartbeats", "Decreases attraction", "Causes stress"], answer: 1, category: "Science of Love", difficulty: "medium" },
  { q: "The '7-year itch' is based on what belief?", options: ["Marriage typically ends", "Couples naturally grow apart", "It's a mythical concept", "Statistics from divorce rates"], answer: 2, category: "Science of Love", difficulty: "medium" },
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
    const shuffledQ = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffled(shuffledQ.slice(0, 10));
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

  // Timer
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
          // Auto-mark as time out
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
                <Sparkles className="w-6 h-6 text-primary-500" />
                Love Trivia
              </h1>
              <div className="w-10" />
            </div>

            <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Love Trivia Challenge</h2>
                <p className="text-gray-600">10 questions about love, romance &amp; relationships</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['History', 'Movies', 'Literature', 'Science'].map(c => (
                    <span key={c} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">{c}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">15 seconds per question | ⏱️ Timer challenge</p>
                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">
                  Start Quiz 💡
                </Button>
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
                <Sparkles className="w-6 h-6 text-primary-500" />
                Results
              </h1>
              <div className="w-10" />
            </div>
            <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <div className="text-6xl mb-2">{title.split(' ')[1]}</div>
                <h2 className="text-3xl font-display font-bold text-gray-800">{title.split(' ')[0]}</h2>
                <p className="text-xl text-gray-700 font-semibold">{score}/{shuffled.length} correct ({pct}%)</p>
                <p className="text-sm text-gray-500">Best streak: {bestStreak}x</p>
                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">
                  Play Again 🧠
                </Button>
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
              <Sparkles className="w-4 h-4 text-primary-500" /> Love Trivia
            </h1>
            <div className="text-sm font-bold text-gray-600">
              {score}/{current}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/50 rounded-full h-2 mb-2 border border-pink-100">
            <motion.div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500" animate={{ width: `${((current) / shuffled.length) * 100}%` }} />
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <span className="text-gray-500 font-medium">Q{current + 1}/{shuffled.length}</span>
            <span className={`font-bold ${diffColor} capitalize`}>{q.difficulty}</span>
            <span className="text-gray-500">{q.category}</span>
          </div>

          {/* Timer */}
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

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5">
              <p className="text-lg font-semibold text-gray-800 leading-relaxed">{q.q}</p>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  let cls = 'bg-white border-gray-200 text-gray-700 hover:border-primary-300';
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
