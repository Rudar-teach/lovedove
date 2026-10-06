'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const memories = [
  { year: 2025, q: "What's your favorite memory from this year?", icon: "🎉" },
  { year: 2024, q: "What was the best meal you shared?", icon: "🍽️" },
  { year: 2024, q: "What made you laugh the hardest?", icon: "😂" },
  { year: 2023, q: "What adventure should we do again?", icon: "🗺️" },
  { year: 2023, q: "What song was playing on your first dance?", icon: "💃" },
  { year: 2022, q: "Where did you go on your best date?", icon: "📍" },
];

export default function CoupleTimecapsule() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [memory, setMemory] = useState('');
  const [entries, setEntries] = useState<{ question: string; answer: string; icon: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setCurrentQ(0);
    setScore(0);
    setMemory('');
    setEntries([]);
    setTimeLeft(180);
    setGameState('playing');
  };

  const saveMemory = () => {
    if (!memory.trim()) return;
    setEntries(e => [...e, { question: memories[currentQ].q, answer: memory, icon: memories[currentQ].icon }]);
    setScore(s => s + 20);
    setMemory('');
    if (currentQ + 1 >= memories.length) {
      setTimeout(() => setGameState('finished'), 500);
    } else {
      setCurrentQ(c => c + 1);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
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
            <div className="text-7xl mb-4">⏳</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Time Capsule</h1>
            <p className="text-gray-600 mb-8 text-lg">Create a love time capsule! Answer questions about your relationship that you can look back on in the future.</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && currentQ < memories.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500">Memory {currentQ + 1}/{memories.length}</span>
              <span className="text-sm font-semibold text-amber-500 flex items-center gap-1"><Timer className="w-4 h-4" /> {formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${(currentQ / memories.length) * 100}%` }} />
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl mb-4 text-center">
              <span className="text-5xl block mb-2">{memories[currentQ].icon}</span>
              <p className="text-sm text-amber-600 mb-1">{memories[currentQ].year}</p>
              <p className="text-xl font-bold text-gray-800">"{memories[currentQ].q}"</p>
            </div>
            <textarea value={memory} onChange={e => setMemory(e.target.value)} placeholder="Write your memory here..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none mb-3 resize-none" />
            <button onClick={saveMemory} className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition">Save Memory</button>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">⏳</div>
            <h2 className="text-3xl font-bold mb-4">Capsule Sealed!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">{entries.length} Memories</p>
            <div className="bg-white/70 p-4 rounded-2xl mb-8 text-left max-h-64 overflow-y-auto">
              {entries.map((e, i) => (
                <div key={i} className="mb-3 pb-3 border-b last:border-0">
                  <p className="text-sm text-amber-600">{e.icon} {e.question}</p>
                  <p className="text-gray-700 italic">"{e.answer}"</p>
                </div>
              ))}
            </div>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> New Capsule</button>
            <Link href="/games" className="block mt-4 text-amber-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
