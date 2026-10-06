'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const quotes = [
  { q: "You had me at hello", author: "Jerry Maguire", hint: "A classic 90s movie line" },
  { q: "I love you, you know", author: "The Princess Bride", hint: "A beloved fantasy adventure film" },
  { q: "To me, you are perfect", author: "Love Actually", hint: "A Christmas romance movie" },
  { q: "Here's looking at you, kid", author: "Casablanca", hint: "A classic wartime romance" },
  { q: "Love means never having to say you're sorry", author: "Love Story", hint: "A 70s romance film" },
  { q: "You make me want to be a better man", author: "As Good as It Gets", hint: "A romantic comedy with Jack Nicholson" },
  { q: "You complete me", author: "Jerry Maguire", hint: "Same movie as the first one!" },
  { q: "Love is a many-splendored thing", author: "Song", hint: "A classic song from the 1950s" },
  { q: "The greatest thing you'll ever learn is to love and be loved", author: "Moulin Rouge", hint: "A colorful musical film" },
  { q: "I would rather share one lifetime with you than face all the ages of this world alone", author: "Lord of the Rings", hint: "A fantasy epic by Tolkien" },
];

export default function LoveQuotes() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  const checkAnswer = () => {
    if (answered) return;
    const correct = quotes[currentQ].author.toLowerCase();
    const userAns = answer.trim().toLowerCase();
    if (correct.includes(userAns) || userAns.includes(correct.split(' ')[0])) {
      setScore(s => s + 1);
      setFeedback('Correct! 💕');
    } else {
      setFeedback(`It was "${quotes[currentQ].author}" ❤️`);
    }
    setAnswered(true);
  };

  const nextQ = () => {
    if (currentQ + 1 >= quotes.length) {
      setGameState('finished');
    } else {
      setCurrentQ(c => c + 1);
      setAnswer('');
      setShowHint(false);
      setFeedback('');
      setAnswered(false);
    }
  };

  const reset = () => {
    setGameState('idle');
    setScore(0);
    setCurrentQ(0);
    setAnswer('');
    setShowHint(false);
    setFeedback('');
    setTimeLeft(60);
    setAnswered(false);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/70 hover:bg-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="font-bold">Love Dove</span>
          </Link>
          <Link href="/games" className="text-sm text-gray-600 hover:text-pink-500 transition">All Games</Link>
        </nav>

        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-7xl mb-4">💬</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent">Love Quotes</h1>
            <p className="text-gray-600 mb-8 text-lg">Guess who said these famous love quotes from movies and songs! Test your romantic movie knowledge.</p>
            <button onClick={() => setGameState('playing')} className="px-8 py-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-rose-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start Game
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500">Question {currentQ + 1}/{quotes.length}</span>
              <span className="text-sm font-semibold text-rose-500 flex items-center gap-1"><Timer className="w-4 h-4" /> {timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-rose-500 to-red-500 h-2 rounded-full transition-all" style={{ width: `${((currentQ) / quotes.length) * 100}%` }} />
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl mb-4">
              <p className="text-2xl font-bold text-center italic text-gray-800">"{quotes[currentQ].q}"</p>
            </div>
            {feedback && <p className="text-center text-lg font-semibold mb-3">{feedback}</p>}
            {!answered ? (
              <>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Who said this quote?" className="w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 focus:outline-none mb-3" />
                <button onClick={() => setShowHint(h => !h)} className="text-sm text-rose-500 mb-2 hover:underline">💡 {showHint ? 'Hide' : 'Show'} Hint</button>
                {showHint && <p className="text-sm text-gray-500 mb-3">Hint: {quotes[currentQ].hint}</p>}
                <button onClick={checkAnswer} className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition">Submit Answer</button>
              </>
            ) : (
              <button onClick={nextQ} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition">
                {currentQ + 1 >= quotes.length ? 'Finish' : 'Next Question →'}
              </button>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">💬</div>
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent mb-2">{score}/{quotes.length}</p>
            <p className="text-gray-600 mb-8">
              {score === quotes.length ? 'Perfect! You\'re a romance movie expert! 🏆' : score >= quotes.length / 2 ? 'Great job! You know your romantic quotes! 💕' : 'Keep watching those rom-coms! 😊'}
            </p>
            <button onClick={reset} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-rose-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
