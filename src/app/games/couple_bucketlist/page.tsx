'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const items = [
  "Watch a sunset together",
  "Cook a fancy dinner",
  "Stargaze and make wishes",
  "Write love letters to each other",
  "Take a dance class",
  "Go on a spontaneous road trip",
  "Have a picnic in the park",
  "Watch all your favorite childhood movies",
  "Build a blanket fort",
  "Go horseback riding",
  "Visit a museum together",
  "Take a couples photo shoot",
  "Learn a new recipe together",
  "Go camping under the stars",
  "Visit a botanical garden",
  "Take a pottery class",
  "Go wine tasting",
  "Write a song together",
  "Plant a garden",
  "Go skydiving together",
  "Visit a new city",
  "Go scuba diving",
  "Build something together",
  "Go to a concert",
  "Take a cooking class",
  "Go on a hot air balloon ride",
  "Volunteer together",
  "Go to a drive-in movie",
  "Make a time capsule",
  "Learn to surf together",
];

export default function CoupleBucketlist() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const startGame = () => {
    setChecked(new Set());
    setScore(0);
    setGameState('playing');
  };

  const toggleItem = (idx: number) => {
    const newChecked = new Set(checked);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
      setScore(s => s - 10);
    } else {
      newChecked.add(idx);
      setScore(s => s + 10);
    }
    setChecked(newChecked);
  };

  const resetChecked = () => {
    setChecked(new Set());
    setScore(0);
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
            <div className="text-7xl mb-4">✅</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">Bucket List</h1>
            <p className="text-gray-600 mb-8 text-lg">Check off your dream experiences as a couple! How many have you done?</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-teal-600">Score: {score}</span>
              <span className="text-sm text-gray-500">{checked.size}/{items.length} checked</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${(checked.size / items.length) * 100}%` }} />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {items.map((item, i) => (
                <button key={i} onClick={() => toggleItem(i)} className={`w-full text-left px-4 py-3 rounded-xl transition ${checked.has(i) ? 'bg-teal-100 text-teal-800 line-through' : 'bg-white hover:bg-teal-50 text-gray-700'}`}>
                  <span className="mr-2">{checked.has(i) ? '✅' : '⬜'}</span>
                  {item}
                </button>
              ))}
            </div>
            <button onClick={resetChecked} className="w-full mt-4 px-4 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition">Reset</button>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-3xl font-bold mb-4">Bucket List!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">{checked.size}/{items.length}</p>
            <p className="text-gray-600 mb-8">
              {checked.size === items.length ? 'Bucket list complete! You\'re dream couple goals! 🌟' : checked.size >= items.length / 2 ? 'Halfway there! Keep checking those dreams! 💙' : 'Start checking off your dreams together! ✨'}
            </p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-teal-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
