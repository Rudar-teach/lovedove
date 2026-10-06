'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const challenges = [
  "Share your most embarrassing childhood memory",
  "What's the wildest dream you've had?",
  "Name one thing you've never told anyone",
  "What would you do if we won the lottery?",
  "Describe your ideal romantic evening",
  "What's a secret talent you have?",
  "If you could travel anywhere together, where?",
  "What song reminds you of us?",
  "What's your biggest fear in relationships?",
  "What's the most romantic thing you've ever done?",
  "Describe your perfect morning together",
  "What would you change about your first date?",
  "What's a habit of theirs that you secretly love?",
  "If we had to survive on an island...",
  "What's your love language?",
  "What makes you feel most appreciated?",
  "Describe your dream proposal",
  "What's the best gift you've ever received?",
  "What's one thing you can't live without?",
  "If we could time travel, what era?",
];

export default function LoveWheel() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'spinning' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [wheelItems] = useState(challenges.slice(0, 8));

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  const spinWheel = () => {
    const spins = 5 + Math.floor(Math.random() * 5);
    const deg = spins * 360 + Math.floor(Math.random() * 360);
    setRotation(r => r + deg);
    setGameState('spinning');

    setTimeout(() => {
      const idx = Math.floor(Math.random() * wheelItems.length);
      setCurrentChallenge(wheelItems[idx]);
      setGameState('playing');
    }, 3000);
  };

  const completeChallenge = () => {
    setScore(s => s + 20);
    setCompleted(c => [...c, currentChallenge]);
    setCurrentChallenge('');
    setGameState('spinning');
    setTimeout(() => {
      const idx = Math.floor(Math.random() * wheelItems.length);
      setCurrentChallenge(wheelItems[idx]);
      setGameState('playing');
    }, 500);
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
            <div className="text-7xl mb-4">💞</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">Love Wheel</h1>
            <p className="text-gray-600 mb-8 text-lg">Spin the wheel and complete romantic challenges together! How many can you do?</p>
            <button onClick={() => { setGameState('spinning'); spinWheel(); }} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Spin!
            </button>
          </motion.div>
        )}

        {gameState === 'spinning' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="relative w-64 h-64 mx-auto mb-8">
              <motion.div animate={{ rotate: rotation }} transition={{ duration: 3, ease: 'easeOut' }} className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center shadow-2xl border-4 border-white">
                <div className="grid grid-cols-2 gap-2 p-4 w-full h-full">
                  {wheelItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-center text-xs text-white font-medium text-center p-1">{item.substring(0, 15)}...</div>
                  ))}
                </div>
              </motion.div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-3xl">🔺</div>
            </div>
            <p className="text-lg text-gray-600">Spinning... 🎡</p>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-purple-600">Score: {score}</span>
              <span className="text-sm text-purple-500 flex items-center gap-1"><Timer className="w-4 h-4" /> {timeLeft}s</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl mb-4">
              <p className="text-sm text-purple-500 mb-2">Your Challenge:</p>
              <p className="text-xl font-bold text-center text-gray-800">"{currentChallenge}"</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {completed.map((c, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs line-through">{c.substring(0, 20)}...</span>
              ))}
            </div>
            <button onClick={completeChallenge} className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-lg transition">✓ Complete Challenge</button>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">💞</div>
            <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent mb-2">{score} pts</p>
            <p className="text-gray-600 mb-8">{completed.length} challenges completed! 🎡</p>
            <button onClick={() => { setRotation(r => r + 1080); spinWheel(); setScore(0); setCompleted([]); setTimeLeft(120); }} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-purple-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
