'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = [
  { word: 'LOVE', hint: 'The strongest feeling' },
  { word: 'KISS', hint: 'A sweet gesture' },
  { word: 'HUG', hint: 'Warm embrace' },
  { word: 'SOULMATE', hint: 'Your perfect match' },
  { word: 'ROMANCE', hint: 'Love story' },
  { word: 'CUPID', hint: 'God of love' },
  { word: 'HEART', hint: 'Symbol of love' },
  { word: 'SWEETHEART', hint: 'Dear one' },
  { word: 'VALENTINE', hint: 'Day of love' },
  { word: 'CHOCOLATE', hint: 'Sweet gift' },
  { word: 'BUTTERFLY', hint: 'Stomach feeling' },
  { word: 'PASSION', hint: 'Intense feeling' },
  { word: 'DEVOTION', hint: 'Deep care' },
  { word: 'AFFECTION', hint: 'Warm feeling' },
  { word: 'CHERISH', hint: 'Hold dear' },
  { word: 'ADORATION', hint: 'Deep love' },
  { word: 'FOREVER', hint: 'Eternal' },
  { word: 'PARTNER', hint: 'Your companion' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function LoveHangmanPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentWord, setCurrentWord] = useState<typeof WORDS[0] | null>(null);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [round, setRound] = useState(0);
  const [best, setBest] = useState(0);
  const maxWrong = 7;

  useEffect(() => {
    const b = localStorage.getItem('lovehangman_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setWrong(0);
    setGuessed([]);
    setRound(0);
    setTimeLeft(120);
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setState('playing');
  }, []);

  const nextWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setGuessed([]);
    setWrong(0);
    setRound((r) => r + 1);
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      setState('finished');
      if (score > best) {
        setBest(score);
        localStorage.setItem('lovehangman_best', String(score));
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((tt) => tt - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state, score, best]);

  useEffect(() => {
    if (state !== 'playing' || !currentWord) return;
    const letters = currentWord.word.split('');
    if (letters.every((l) => guessed.includes(l))) {
      setScore((s) => s + Math.max(10, 50 - wrong * 5));
      setTimeout(() => {
        nextWord();
      }, 1200);
    } else if (wrong >= maxWrong) {
      setState('finished');
      if (score > best) {
        setBest(score);
        localStorage.setItem('lovehangman_best', String(score));
      }
    }
  }, [guessed, wrong, currentWord, state, score, best, nextWord]);

  const guess = (letter: string) => {
    if (state !== 'playing' || guessed.includes(letter)) return;
    setGuessed((prev) => [...prev, letter]);
    if (currentWord && !currentWord.word.includes(letter)) {
      setWrong((w) => w + 1);
    }
  };

  const displayWord = currentWord
    ? currentWord.word.split('').map((l) => (guessed.includes(l) ? l : '_')).join(' ')
    : '';

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Love Hangman
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
                <div className="text-2xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Time</div>
                <div className={`text-2xl font-bold ${timeLeft <= 20 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            {/* Heart Lives */}
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: maxWrong }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: i < wrong ? 0.5 : 1, opacity: i < wrong ? 0.4 : 1 }}
                  className="text-3xl"
                >
                  💖
                </motion.span>
              ))}
            </div>

            {/* Word Display */}
            <div className="bg-black/30 rounded-2xl p-4 mb-4 text-center">
              {currentWord && (
                <>
                  <p className="text-white/60 text-sm mb-2 italic">"{currentWord.hint}"</p>
                  <p className="text-3xl font-bold tracking-widest text-white font-mono">
                    {displayWord}
                  </p>
                </>
              )}
            </div>

            {/* Keyboard */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {ALPHABET.map((letter) => {
                const isGuessed = guessed.includes(letter);
                const isCorrect = currentWord?.word.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => guess(letter)}
                    disabled={isGuessed || state !== 'playing'}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                      isGuessed
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500/50 text-white/50 line-through'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {state === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <Play size={20} /> Start Game
              </motion.button>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 100 ? '🏆 Amazing!' : score >= 50 ? '💖 Great!' : '💕 Good Try!'}
                    </h2>
                    <p className="text-white/70">Score: <span className="text-pink-300 font-bold">{score}</span></p>
                    {currentWord && <p className="text-white/50 text-sm">Word was: {currentWord.word}</p>}
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