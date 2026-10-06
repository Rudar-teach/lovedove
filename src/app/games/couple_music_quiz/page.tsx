'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Music } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const QUESTIONS = [
  { q: 'Which artist sang "Perfect"?', options: ['Ed Sheeran', 'Bruno Mars', 'Shawn Mendes', 'Justin Bieber'], answer: 0, artist: 'Ed Sheeran' },
  { q: 'Who sang "All of Me"?', options: ['Sam Smith', 'John Legend', 'Ed Sheeran', 'Adele'], answer: 1, artist: 'John Legend' },
  { q: '"Thinking Out Loud" is by?', options: ['Coldplay', 'Ed Sheeran', 'Maroon 5', 'One Direction'], answer: 1, artist: 'Ed Sheeran' },
  { q: 'Which song has lyrics "Cause all of me loves all of you"?', options: ['Perfect', 'All of Me', 'Thinking Out Loud', 'At Last'], answer: 1, artist: 'John Legend' },
  { q: 'Who sang "Loves Me Like You Do"?', options: ['Taylor Swift', 'Ellie Goulding', 'Selena Gomez', 'Ariana Grande'], answer: 1, artist: 'Ellie Goulding' },
  { q: '"At Last" was made famous by?', options: ['Nat King Cole', 'Etta James', 'Ray Charles', 'Sam Cooke'], answer: 1, artist: 'Etta James' },
  { q: 'Which song is a classic wedding first dance?', options: ['Shape of You', 'At Last', 'Blinding Lights', 'Levitating'], answer: 1, artist: 'Etta James' },
  { q: 'Who sang "Just the Way You Are"?', options: ['Ed Sheeran', 'Bruno Mars', 'John Legend', 'Michael Buble'], answer: 1, artist: 'Bruno Mars' },
  { q: '"Make You Feel My Love" is by?', options: ['Adele', 'Bob Dylan', 'Garth Brooks', 'Both A & B'], answer: 3, artist: 'Bob Dylan' },
  { q: 'Who sang "Can\'t Help Falling in Love"?', options: ['Elvis Presley', 'Frank Sinatra', 'Dean Martin', 'Sam Cooke'], answer: 0, artist: 'Elvis Presley' },
  { q: '"Kiss Me" was a hit for?', options: ['Sixpence None The Richer', 'Ed Sheeran', 'Shawn Mendes', 'Maroon 5'], answer: 0, artist: 'Sixpence' },
  { q: 'Who sang "My Girl"?', options: ['The Temptations', 'Otis Redding', 'Stevie Wonder', 'Marvin Gaye'], answer: 0, artist: 'Temptations' },
  { q: '"A Thousand Years" is by?', options: ['Taylor Swift', 'Christina Perri', 'Adele', 'Selena Gomez'], answer: 1, artist: 'Christina Perri' },
  { q: 'Who performed "Marry You"?', options: ['Bruno Mars', 'Ed Sheeran', 'Justin Timberlake', 'Pharrell'], answer: 0, artist: 'Bruno Mars' },
  { q: '"XO" is a song by?', options: ['Beyonce', 'Ed Sheeran', 'The Weeknd', 'Drake'], answer: 2, artist: 'The Weeknd' },
];

export default function CoupleMusicQuizPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [best, setBest] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);

  useEffect(() => {
    const b = localStorage.getItem('musicquiz_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setState('playing');
  }, []);

  useEffect(() => {
    if (state !== 'playing' || selected === null || !showResult) return;
    if (currentQ >= questions.length - 1) {
      setTimeout(() => {
        setState('finished');
        const finalScore = score + (selected === questions[currentQ].answer ? 10 : 0);
        if (finalScore > best) {
          setBest(finalScore);
          localStorage.setItem('musicquiz_best', String(finalScore));
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
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="text-purple-400" /> Music Quiz
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
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Question</div>
                <div className="text-xl font-bold text-white">{questions.length > 0 ? `${currentQ + 1}/${questions.length}` : '-'}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Music className="text-purple-400 mx-auto mb-4" size={48} />
                <p className="text-white text-lg mb-2">Romantic Music Quiz</p>
                <p className="text-white/60 text-sm mb-4">Test your knowledge of love songs!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start
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
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-purple-300 text-xs uppercase mb-1">Artist: {questions[currentQ].artist}</p>
                  <h3 className="text-xl font-bold text-white">{questions[currentQ].q}</h3>
                </div>

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
                          if (selected !== null) return;
                          setSelected(idx);
                          setShowResult(true);
                          if (idx === questions[currentQ].answer) setScore((s) => s + 10);
                          setAnswers((a) => [...a, idx === questions[currentQ].answer]);
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
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 100 ? '🏆 Music Expert!' : score >= 60 ? '💖 Great!' : '💕 Good!'}
                    </h2>
                    <p className="text-white/70">
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
    </PremiumBackground>
  );
}