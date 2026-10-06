'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const prompts = [
  "Write about your first date",
  "Describe your perfect day together",
  "What's your favorite memory?",
  "How did you know they were 'the one'?",
  "Write about a trip you took together",
  "Describe the moment you fell in love",
  "What's the most romantic thing they've done?",
  "Write about your dream future",
  "What makes your relationship special?",
  "Describe a time you laughed so hard together",
];

export default function CoupleStory2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [stories, setStories] = useState<string[]>([]);
  const [currentStory, setCurrentStory] = useState('');
  const [showVote, setShowVote] = useState(false);
  const [votes, setVotes] = useState<number[]>([]);

  const startGame = () => {
    const shuffled = [...prompts].sort(() => Math.random() - 0.5).slice(0, 5);
    setStories(shuffled);
    setCurrentPrompt(0);
    setScore(0);
    setCurrentStory('');
    setShowVote(false);
    setVotes([]);
    setGameState('playing');
  };

  const submitStory = () => {
    if (!currentStory.trim()) return;
    setStories(s => [...s, currentStory]);
    setShowVote(true);
  };

  const vote = (stars: number) => {
    setVotes(v => [...v, stars]);
    setScore(s => s + stars * 10);
    setShowVote(false);
    setCurrentStory('');
    if (votes.length + 1 >= 2) {
      setTimeout(() => setGameState('finished'), 500);
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
            <div className="text-7xl mb-4">📚</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Story Together</h1>
            <p className="text-gray-600 mb-8 text-lg">Take turns writing a story based on romantic prompts. Build a beautiful tale together!</p>
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition transform hover:scale-105">
              <Play className="inline mr-2" /> Start Writing
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && !showVote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg">
            <p className="text-sm text-gray-500 mb-2">Prompt {Math.floor(currentPrompt / 2) + 1} of 3</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${((currentPrompt / 2) / 3) * 100}%` }} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">"{stories[currentPrompt]}"</h2>
            {stories[currentPrompt + 1] && (
              <div className="bg-amber-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-500 mb-1">Their story:</p>
                <p className="text-gray-700 italic">"{stories[currentPrompt + 1]}"</p>
              </div>
            )}
            <textarea value={currentStory} onChange={e => setCurrentStory(e.target.value)} placeholder="Write your story here..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none mb-3 resize-none" />
            <button onClick={submitStory} className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition">Submit Story</button>
          </motion.div>
        )}

        {gameState === 'playing' && showVote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/70 p-6 rounded-3xl shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Rate this story! ⭐</h3>
            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => vote(s)} className="text-4xl hover:scale-125 transition">⭐</button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-7xl mb-4">📚</div>
            <h2 className="text-3xl font-bold mb-4">Stories Complete!</h2>
            <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">{score} pts</p>
            <p className="text-gray-600 mb-8">What a beautiful story you wrote together! 💕</p>
            <button onClick={startGame} className="px-8 py-3 bg-white/70 font-bold rounded-full hover:bg-white transition"><RotateCcw className="inline mr-2" /> Play Again</button>
            <Link href="/games" className="block mt-4 text-amber-500 font-semibold hover:underline">More Games</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
