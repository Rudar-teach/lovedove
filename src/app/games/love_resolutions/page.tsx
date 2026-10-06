'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const goals = [
  "Have a weekly date night",
  "Learn to cook a new meal together",
  "Take a vacation to a new place",
  "Write a love letter every month",
  "Do a random act of kindness daily",
  "Exercise together 3 times a week",
  "Create a photo album of memories",
  "Learn a new skill together",
  "Go stargazing once a month",
  "Volunteer together for a cause",
  "Have a phone-free dinner weekly",
  "Take a dance class together",
  "Visit 5 new restaurants this year",
  "Create a playlist of your favorite songs",
  "Plan a surprise date for each other",
  "Read a book together",
  "Go on a sunrise hike",
  "Plant a garden together",
  "Take a couples workshop",
  "Recreate your first date",
  "Learn to photograph together",
  "Go on a digital detox weekend",
  "Make a scrapbook",
  "Learn to meditate together",
  "Go to a live show",
  "Take a pottery class",
  "Go camping together",
  "Write a bucket list",
  "Create a family tradition",
  "Go on a road trip",
];

export default function LoveResolutions() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'adventure', 'romance', 'growth', 'fun'];
  const categoryColors: Record<string, string> = { all: 'from-green-500 to-emerald-500', adventure: 'from-blue-500 to-cyan-500', romance: 'from-pink-500 to-rose-500', growth: 'from-amber-500 to-yellow-500', fun: 'from-purple-500 to-violet-500' };

  const startGame = () => {
    setResolved(new Set());
    setScore(0);
    setSelectedCategory('all');
    setGameState('playing');
  };

  const toggleResolved = (idx: number) => {
    const newResolved = new Set(resolved);
    if (newResolved.has(idx)) {
      newResolved.delete(idx);
      setScore(s => s - 10);
    } else {
      newResolved.add(idx);
      setScore(s => s + 10);
    }
    setResolved(newResolved);
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
            <div className="text-7xl mb-4">🌱</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Love Resolutions</h1>
            <p className="text-gray-600 mb-8 text-lg">Make relationship goals together! Check them off as you achieve them throughout the year.</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-green-600">Score: {score}</span>
              <span className="text-sm text-gray-500">{resolved.size}/{goals.length} resolved</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(resolved.size / goals.length) * 100}%` }} />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {goals.map((goal, i) => (
                <button key={i} onClick={() => toggleResolved(i)} className={`w-full text-left px-4 py-3 rounded-xl transition ${resolved.has(i) ? 'bg-green-100 text-green-800 line-through' : 'bg-white hover:bg-green-50 text-gray-700'}`}>
                  <span className="mr-2">{resolved.has(i) ? '✅' : '🌱'}</span>
                  {goal}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">🌱</div>
            <h2 className="text-3xl font-bold mb-4">Resolution Year!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">{resolved.size}/{goals.length}</p>
            <p className="text-gray-600 mb-8">{resolved.size >= goals.length / 2 ? 'What a year ahead! Keep growing together! 💚' : 'Keep setting those goals together! 🌿'}</p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-green-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
