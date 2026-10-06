'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, PenTool } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type Word = { hint: string; answer: string; category: string; emoji: string };

const WORDS: Word[] = [
  { hint: 'The feeling when your heart races', answer: 'LOVE', category: 'Feelings', emoji: '💕' },
  { hint: 'Kissed with a flower', answer: 'ROSE', category: 'Flowers', emoji: '🌹' },
  { hint: 'Symbol of eternal commitment', answer: 'RING', category: 'Gifts', emoji: '💍' },
  { hint: 'Flying messenger of love', answer: 'DOVE', category: 'Symbols', emoji: '🕊️' },
  { hint: 'Warm fuzzy feeling', answer: 'FLIRT', category: 'Actions', emoji: '😊' },
  { hint: 'Sweet talk to woo someone', answer: 'DATE', category: 'Actions', emoji: '🍽️' },
  { hint: 'Two hearts joined', answer: 'SOUL', category: 'Feelings', emoji: '✨' },
  { hint: 'Bouquet of romantic flowers', answer: 'BLOOM', category: 'Flowers', emoji: '🌸' },
  { hint: 'Lover's promise', answer: 'KISS', category: 'Actions', emoji: '💋' },
  { hint: 'Shining star of affection', answer: 'ADORE', category: 'Feelings', emoji: '⭐' },
];

const CATEGORIES = ['Feelings', 'Flowers', 'Gifts', 'Symbols', 'Actions'];

export default function LoveCrosswordPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);

  const shuffleWords = () => {
    return [...WORDS].sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    setShuffledWords(shuffleWords());
    setCurrentWordIdx(0);
    setGuesses([]);
    setScore(0);
    setHintsUsed(0);
    setPhase('playing');
  };

  const currentWord = shuffledWords[currentWordIdx];
  const displayHint = currentWord ? currentWord.hint : '';

  const submitGuess = (guess: string) => {
    if (!currentWord) return;
    const g = guess.toUpperCase().trim();
    if (!g) return;
    setGuesses(prev => [...prev, g]);
    if (g === currentWord.answer) {
      const hintPenalty = hintsUsed * 5;
      const pts = Math.max(10, 30 - hintsUsed * 5);
      setScore(s => s + pts);
      if (currentWordIdx < shuffledWords.length - 1) {
        setTimeout(() => {
          setCurrentWordIdx(i => i + 1);
          setGuesses([]);
          setHintsUsed(0);
        }, 800);
      } else {
        setScore(s => s + Math.max(0, 50 - hintsUsed * 10));
        setTimeout(() => setPhase('finished'), 600);
      }
    }
  };

  const useHint = () => {
    if (!currentWord) return;
    setHintsUsed(h => h + 1);
  };

  const revealLetter = () => {
    if (!currentWord) return;
    const unrevealed = currentWord.answer.split('').filter((_, i) => guesses.length === 0 ? true : i < guesses.length);
    if (unrevealed.length > 0) {
      setGuesses(prev => [...prev, unrevealed[0]]);
      setHintsUsed(h => h + 1);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">✏️</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Crossword</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Guess romantic words from hints. Type the correct answer to fill in the crossword!</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {CATEGORIES.map(cat => (
                      <span key={cat} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium">{cat}</span>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Game
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentWord && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">{currentWord.category} {currentWord.emoji}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-rose-600 font-semibold">{currentWordIdx + 1}/{shuffledWords.length}</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <h3 className="text-lg text-gray-600 mb-2">Hint:</h3>
                  <p className="text-2xl font-semibold text-rose-700 mb-4">{displayHint}</p>

                  <div className="flex justify-center gap-2 mb-4">
                    {currentWord.answer.split('').map((letter, i) => (
                      <div key={i} className="w-10 h-12 border-2 border-rose-300 rounded flex items-center justify-center text-xl font-bold text-rose-700 bg-rose-50">
                        {guesses.length > 0 && i < guesses.length ? guesses[i] : ''}
                      </div>
                    ))}
                  </div>

                  {guesses.length > 0 && guesses[guesses.length - 1] !== currentWord.answer && (
                    <p className="text-red-500 mb-3">Not quite! Try again.</p>
                  )}

                  <GuessInput onSubmit={submitGuess} />
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={revealLetter} className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm hover:bg-rose-200 transition">Reveal Letter (-10 pts)</button>
                  <button onClick={useHint} className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm hover:bg-pink-200 transition">Show Hint (-5 pts)</button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <PenTool className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Crossword Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-2">{hintsUsed} hints used</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link href="/games" className="bg-pink-100 text-rose-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-200 transition">More Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}

function GuessInput({ onSubmit }: { onSubmit: (g: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(val); setVal(''); }} className="flex justify-center gap-2">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Type your guess..."
        maxLength={20}
        className="border-2 border-rose-200 rounded-full px-4 py-2 text-center focus:outline-none focus:border-rose-500"
      />
      <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-rose-600 transition">Guess</button>
    </form>
  );
}
