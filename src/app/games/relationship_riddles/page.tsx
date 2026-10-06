'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const riddles = [
  { q: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", a: "A map", hint: "Think of something you hold in your hands..." },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps", hint: "Every step you make..." },
  { q: "I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?", a: "An echo", hint: "Found in mountains..." },
  { q: "What has keys but no locks? Space but no room? You can enter, but you can't go outside?", a: "A keyboard", hint: "You're using one right now!" },
  { q: "I'm light as a feather, yet the strongest person can't hold me for five minutes. What am I?", a: "Breath", hint: "Essential for life..." },
  { q: "What gets wet while drying?", a: "A towel", hint: "Found in the bathroom..." },
  { q: "What can you break, even if you never pick it up or touch it?", a: "A promise", hint: "Think about relationships..." },
  { q: "What has a head and a tail but no body?", a: "A coin", hint: "It has two sides..." },
  { q: "I have branches, but no fruit, trunk, or leaves. What am I?", a: "A bank", hint: "Financial institution..." },
  { q: "What goes up but never comes down?", a: "Age", hint: "We all have it..." },
  { q: "What has many needles but doesn't sew?", a: "A pine tree / compass", hint: "Depends on which kind..." },
  { q: "What is full of holes but still holds water?", a: "A sponge", hint: "Used in the kitchen..." },
  { q: "What has legs but cannot walk?", a: "A table / chair", hint: "Found in every home..." },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter M", hint: "Think about letters..." },
  { q: "I'm tall when I'm young and short when I'm old. What am I?", a: "A candle", hint: "Produces light..." },
];

export default function RelationshipRiddles() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [shuffled, setShuffled] = useState(riddles);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    const s = [...riddles].sort(() => Math.random() - 0.5).slice(0, 8);
    setShuffled(s);
    setCurrentQ(0);
    setScore(0);
    setAnswer('');
    setShowHint(false);
    setFeedback('');
    setAnswered(false);
    setTimeLeft(120);
    setGameState('playing');
  };

  const checkAnswer = () => {
    if (answered) return;
    const correct = shuffled[currentQ].a.toLowerCase();
    const userAns = answer.trim().toLowerCase();
    if (correct.includes(userAns) || userAns.includes(correct.split(' ')[0])) {
      setScore(s => s + 1);
      setFeedback('Correct! 🧩');
    } else {
      setFeedback(`It was "${shuffled[currentQ].a}"!`);
    }
    setAnswered(true);
  };

  const nextQ = () => {
    if (currentQ + 1 >= shuffled.length) {
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
            <div className="text-7xl mb-4">🧩</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Riddles</h1>
            <p className="text-gray-600 mb-8 text-lg">Solve brain-teasing riddles together! Can you figure them all out?</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start Game
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500">Riddle {currentQ + 1}/{shuffled.length}</span>
              <span className="text-sm font-semibold text-indigo-500 flex items-center gap-1"><Timer className="w-4 h-4" /> {timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${(currentQ / shuffled.length) * 100}%` }} />
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl mb-4">
              <p className="text-xl font-bold text-center text-gray-800">{shuffled[currentQ].q}</p>
            </div>
            {feedback && <p className="text-center text-lg font-semibold mb-3">{feedback}</p>}
            {!answered ? (
              <>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Your answer..." className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none mb-3" />
                <button onClick={() => setShowHint(h => !h)} className="text-sm text-indigo-500 mb-2 hover:underline">💡 {showHint ? 'Hide' : 'Show'} Hint</button>
                {showHint && <p className="text-sm text-gray-500 mb-3">Hint: {shuffled[currentQ].hint}</p>}
                <button onClick={checkAnswer} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition">Submit Answer</button>
              </>
            ) : (
              <button onClick={nextQ} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition">
                {currentQ + 1 >= shuffled.length ? 'Finish' : 'Next Riddle →'}
              </button>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">🧩</div>
            <h2 className="text-3xl font-bold mb-4">Riddles Complete!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">{score}/{shuffled.length}</p>
            <p className="text-gray-600 mb-8">
              {score === shuffled.length ? 'Riddle master! 🏆' : score >= shuffled.length / 2 ? 'Great solving! 🧩' : 'Keep puzzling! 💜'}
            </p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-indigo-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
