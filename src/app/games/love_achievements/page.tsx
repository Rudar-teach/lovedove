'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Timer, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const achievements = [
  { id: 'first_date', name: 'First Date', desc: 'Play your first game together', icon: '🌹', check: () => true },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 100% on any quiz', icon: '🧠', check: () => true },
  { id: 'word_finder', name: 'Word Finder', desc: 'Complete a word search', icon: '🔍', check: () => true },
  { id: 'storyteller', name: 'Storyteller', desc: 'Write a story together', icon: '📖', check: () => true },
  { id: 'bingo_winner', name: 'Bingo Winner', desc: 'Win a bingo round', icon: '🎯', check: () => true },
  { id: 'dare_devil', name: 'Dare Devil', desc: 'Complete 5 dares', icon: '😈', check: () => true },
  { id: 'truth_teller', name: 'Truth Teller', desc: 'Share 5 truths', icon: '💬', check: () => true },
  { id: 'wheel_spinner', name: 'Wheel Spinner', desc: 'Spin the love wheel', icon: '🎡', check: () => true },
];

export default function LoveAchievements() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const startGame = () => {
    const newUnlocked = new Set<string>();
    achievements.forEach(a => { if (a.check()) newUnlocked.add(a.id); });
    setUnlocked(newUnlocked);
    setScore(newUnlocked.size * 25);
    setSelected(null);
    setGameState('playing');
  };

  const viewAchievement = (id: string) => {
    setSelected(id);
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
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Achievements</h1>
            <p className="text-gray-600 mb-8 text-lg">Unlock achievements as you play games together! How many can you collect?</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> View Achievements
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-amber-600">Score: {score}</span>
              <span className="text-sm text-gray-500">{unlocked.size}/{achievements.length} unlocked</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${(unlocked.size / achievements.length) * 100}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(a => (
                <button key={a.id} onClick={() => viewAchievement(a.id)} className={`p-4 rounded-xl text-left transition ${unlocked.has(a.id) ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300' : 'bg-gray-100 opacity-60'}`}>
                  <span className="text-3xl block mb-1">{a.icon}</span>
                  <p className="font-bold text-sm">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </button>
              ))}
            </div>
            {selected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-yellow-50 rounded-xl text-center">
                <span className="text-4xl">{achievements.find(a => a.id === selected)?.icon}</span>
                <p className="font-bold mt-2">{achievements.find(a => a.id === selected)?.name}</p>
                <p className="text-sm text-gray-600">{achievements.find(a => a.id === selected)?.desc}</p>
                <p className="text-yellow-600 font-semibold mt-2">✓ Unlocked!</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Achievement Review!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-2">{unlocked.size}/{achievements.length}</p>
            <p className="text-gray-600 mb-8">{unlocked.size === achievements.length ? 'Achievement unlocked: Champion! 🏆' : 'Keep playing to unlock more badges!'}</p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Again</button>
            <Link href="/games" className="block mt-4 text-amber-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
