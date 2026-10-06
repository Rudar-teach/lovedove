'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const emojis = [
  { e: "🌹", a: "Rose", hint: "A flower of love" },
  { e: "💍", a: "Ring", hint: "Given in marriage proposals" },
  { e: "💘", a: "Love Letter", hint: "A romantic message" },
  { e: "🦋", a: "Butterfly Kisses", hint: "Fluttering feelings" },
  { e: "🌙", a: "Moon", hint: "Romantic night sky" },
  { e: "🎵", a: "Love Song", hint: "Music for lovers" },
  { e: "🍫", a: "Chocolate", hint: "A sweet gift" },
  { e: "🕯️", a: "Candlelight", hint: "Romantic dinner setting" },
  { e: "🚀", a: "Blast Off", hint: "Space related phrase" },
  { e: "⏰", a: "Alarm", hint: "Wakes you up" },
];

export default function LoveEmoji2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [answered, setAnswered] = useState(false);
  const [shuffledEmojis, setShuffledEmojis] = useState(emojis);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    const shuffled = [...emojis].sort(() => Math.random() - 0.5);
    setShuffledEmojis(shuffled);
    setGameState('playing');
    setTimeLeft(90);
    setCurrentQ(0);
    setScore(0);
    setAnswer('');
    setShowHint(false);
    setFeedback('');
    setAnswered(false);
  };

  const checkAnswer = () => {
    if (answered) return;
    const correct = shuffledEmojis[currentQ].a.toLowerCase();
    if (answer.trim().toLowerCase() === correct) {
      setScore(s => s + 1);
      setFeedback('Correct! 🎉');
    } else {
      setFeedback(`It was "${shuffledEmojis[currentQ].a}"!`);
    }
    setAnswered(true);
  };

  const nextQ = () => {
    if (currentQ + 1 >= shuffledEmojis.length) {
      setGameState('finished');
    } else {
      setCurrentQ(c => c + 1);
      setAnswer('');
      setShowHint(false);
      setFeedback('');
      setAnswered(false);
    }
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
            <div className="text-7xl mb-4">😀</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Emoji Quiz 2</h1>
            <p className="text-gray-600 mb-8 text-lg">Decode these emoji phrases! Can you guess what each emoji combination means?</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-pink-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start Game
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500">Question {currentQ + 1}/{shuffledEmojis.length}</span>
              <span className="text-sm font-semibold text-pink-500 flex items-center gap-1"><Timer className="w-4 h-4" /> {timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all" style={{ width: `${((currentQ) / shuffledEmojis.length) * 100}%` }} />
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl mb-4">
              <p className="text-6xl text-center">🎵</p>
              <p className="text-center text-sm text-gray-500 mt-2">Emoji to guess</p>
            </div>
            {feedback && <p className="text-center text-lg font-semibold mb-3">{feedback}</p>}
            {!answered ? (
              <>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="What does this mean?" className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none mb-3" />
                <button onClick={() => setShowHint(h => !h)} className="text-sm text-pink-500 mb-2 hover:underline">💡 {showHint ? 'Hide' : 'Show'} Hint</button>
                {showHint && <p className="text-sm text-gray-500 mb-3">Hint: {shuffledEmojis[currentQ].hint}</p>}
                <button onClick={checkAnswer} className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition">Submit Answer</button>
              </>
            ) : (
              <button onClick={nextQ} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition">
                {currentQ + 1 >= shuffledEmojis.length ? 'Finish' : 'Next →'}
              </button>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">😀</div>
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">{score}/{shuffledEmojis.length}</p>
            <p className="text-gray-600 mb-8">
              {score === shuffledEmojis.length ? 'Emoji master! 🏆' : score >= shuffledEmojis.length / 2 ? 'Great emoji decoding! 💕' : 'Keep practicing your emoji skills! 😊'}
            </p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-pink-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
