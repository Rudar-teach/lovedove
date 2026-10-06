'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const WORDS = ['LOVE', 'HEART', 'ROMANCE', 'KISS', 'PASSION', 'DATING', 'CRUSH', 'WEDDING', 'VALENTINE', 'CUDDLE'];

const GALLOWS = [
  '',
  '<line x1="50" y1="100" x2="150" y2="100" stroke="currentColor" stroke-width="3" />',
  '<line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" />',
  '<line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" /><line x1="160" y1="30" x2="200" y2="30" stroke="currentColor" stroke-width="3" />',
  '<line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" /><line x1="160" y1="30" x2="200" y2="30" stroke="currentColor" stroke-width="3" /><circle cx="180" cy="45" r="10" fill="none" stroke="currentColor" stroke-width="2" />',
  '<line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" /><line x1="160" y1="30" x2="200" y2="30" stroke="currentColor" stroke-width="3" /><circle cx="180" cy="45" r="10" fill="none" stroke="currentColor" stroke-width="2" /><line x1="180" y1="55" x2="180" y2="75" stroke="currentColor" stroke-width="2" />',
  '<line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" /><line x1="160" y1="30" x2="200" y2="30" stroke="currentColor" stroke-width="3" /><circle cx="180" cy="45" r="10" fill="none" stroke="currentColor" stroke-width="2" /><line x1="180" y1="55" x2="180" y2="75" stroke="currentColor" stroke-width="2" /><line x1="170" y1="60" x2="150" y2="50" stroke="currentColor" stroke-width="2" /><line x1="190" y1="60" x2="210" y2="50" stroke="currentColor" stroke-width="2" />',
  '<line x1="100" y1="100" x2="150" y2="100" stroke="currentColor" stroke-width="3" /><line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" stroke-width="3" /><line x1="100" y1="10" x2="180" y2="10" stroke="currentColor" stroke-width="3" /><line x1="180" y1="10" x2="180" y2="30" stroke="currentColor" stroke-width="3" /><line x1="160" y1="30" x2="200" y2="30" stroke="currentColor" stroke-width="3" /><circle cx="180" cy="45" r="10" fill="none" stroke="currentColor" stroke-width="2" /><line x1="180" y1="55" x2="180" y2="75" stroke="currentColor" stroke-width="2" /><line x1="170" y1="60" x2="150" y2="50" stroke="currentColor" stroke-width="2" /><line x1="190" y1="60" x2="210" y2="50" stroke="currentColor" stroke-width="2" /><line x1="170" y1="75" x2="150" y2="85" stroke="currentColor" stroke-width="2" /><line x1="190" y1="75" x2="210" y2="85" stroke="currentColor" stroke-width="2" />',
];

export default function LoveHangman2Page() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [hint, setHint] = useState('');

  const HINTS: Record<string, string> = {
    LOVE: 'The most powerful feeling in the world',
    HEART: 'It beats faster when you see them',
    ROMANCE: 'Candlelight dinners and sweet gestures',
    KISS: 'The sweetest form of affection',
    PASSION: 'When attraction becomes intense',
    DATING: 'Getting to know someone special',
    CRUSH: 'That butterflies feeling',
    WEDDING: 'The big day two become one',
    VALENTINE: 'February 14th celebration',
    CUDDLE: 'Cozy close embrace',
  };

  const startGame = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setHint(HINTS[w]);
    setGuessed([]);
    setMistakes(0);
    setWon(false);
    setScore(0);
    setWordIndex(0);
    setPhase('playing');
  };

  const handleGuess = (letter: string) => {
    if (guessed.includes(letter) || mistakes >= GALLOWS.length - 1) return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);
    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= GALLOWS.length - 1) {
        setTimeout(() => {
          if (wordIndex < WORDS.length - 1) {
            const w = WORDS[wordIndex + 1];
            setWord(w);
            setHint(HINTS[w]);
            setWordIndex(i => i + 1);
            setGuessed([]);
            setMistakes(0);
            setWon(false);
          } else {
            setPhase('result');
          }
        }, 1500);
      }
    } else {
      if (word.split('').every(l => newGuessed.includes(l))) {
        setWon(true);
        setScore(s => s + (GALLOWS.length - 1 - mistakes));
        setTimeout(() => {
          if (wordIndex < WORDS.length - 1) {
            const w = WORDS[wordIndex + 1];
            setWord(w);
            setHint(HINTS[w]);
            setWordIndex(i => i + 1);
            setGuessed([]);
            setMistakes(0);
            setWon(false);
          } else {
            setPhase('result');
          }
        }, 1500);
      }
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const displayWord = word.split('').map(l => guessed.includes(l) ? l : '_').join(' ');

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
              <Heart className="w-5 h-5 text-rose-500" /> Love Hangman
            </h1>
            <div className="w-16" />
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💔</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Love Hangman</h2>
                    <p className="text-gray-600">Guess romantic words before the hangman is complete! 10 words to solve.</p>
                    <p className="text-sm text-pink-500 font-medium">6 mistakes and the game is over</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Game 💕</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center gap-4 mb-4">
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-xl font-bold text-pink-600">{score}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                    <p className="text-xs text-gray-500">Word</p>
                    <p className="text-xl font-bold text-gray-800">{wordIndex + 1}/{WORDS.length}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                    <p className="text-xs text-gray-500">Mistakes</p>
                    <p className="text-xl font-bold text-red-500">{mistakes}/{GALLOWS.length - 1}</p>
                  </div>
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center">
                    <p className="text-sm text-pink-500 font-medium mb-2">{hint}</p>
                    <svg viewBox="0 0 250 120" className="w-56 h-28 mx-auto mb-4 text-gray-700">
                      {GALLOWS.map((g, i) => i === 0 ? <g key={i} dangerouslySetInnerHTML={{ __html: GALLOWS[0] }} /> : <motion.g key={i} dangerouslySetInnerHTML={{ __html: GALLOWS[i] }}
                        initial={{ opacity: 0 }} animate={{ opacity: mistakes >= i ? 1 : 0 }} />)}
                    </svg>

                    <p className="text-3xl font-mono font-bold tracking-[0.3em] text-gray-800 mb-6">
                      {displayWord}
                    </p>

                    <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                      {alphabet.split('').map(letter => (
                        <button key={letter} onClick={() => handleGuess(letter)}
                          disabled={guessed.includes(letter) || phase !== 'playing'}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                            guessed.includes(letter)
                              ? word.includes(letter) ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                          }`}>
                          {letter}
                        </button>
                      ))}
                    </div>

                    {won && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-2xl">🎉</motion.p>}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🏆</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Game Complete!</h2>
                    <p className="text-6xl font-black text-pink-500">{score}</p>
                    <p className="text-gray-600">total points</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games">
                <Button variant="ghost" size="sm">← Back to Games</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
