'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, BookOpen } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const PROMPTS = [
  "Today I felt most loved when...",
  "My favorite memory of us is...",
  "The thing I love most about you is...",
  "When we first met, I thought...",
  "You make me smile when...",
  "I'm grateful for...",
  "My favorite thing to do with you is...",
  "I love the way you...",
  "The best date we ever had was...",
  "I can't wait to...",
  "When you hold my hand, I feel...",
  "I fell in love with you when...",
  "You're my favorite...",
  "The sound of your voice makes me...",
  "I promise to always...",
];

export default function LoveJournal() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [entries, setEntries] = useState<{ prompt: string; text: string; date: string }[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [currentEntry, setCurrentEntry] = useState('');
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    setPrompts([...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 8));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setEntries([]);
    setCurrentPrompt(0);
    setCurrentEntry('');
    setPrompts([...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 8));
  };

  const saveEntry = () => {
    if (!currentEntry.trim()) return;
    setEntries(prev => [...prev, {
      prompt: prompts[currentPrompt],
      text: currentEntry.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }]);
    setCurrentEntry('');
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(p => p + 1);
    } else {
      setGameState('finished');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">📖</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Journal</h1>
              <p className="text-gray-600 mb-8 text-lg">Write daily love notes together!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📝 Get a romantic writing prompt</li>
                  <li>💕 Write from your heart</li>
                  <li>💌 Share entries together</li>
                  <li>📖 Build a collection of love notes</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start Writing
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && prompts[currentPrompt] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Prompt {currentPrompt + 1}/{prompts.length}</span>
                <span className="text-sm font-medium text-rose-600 font-bold">{entries.length} entries saved</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                  style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }} />
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6 sm:p-8 mb-6">
                <div className="text-4xl text-center mb-4">📝</div>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Writing Prompt</h2>
                <p className="text-2xl font-display font-black text-rose-600 text-center">{prompts[currentPrompt]}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your love note:</label>
                <textarea
                  value={currentEntry}
                  onChange={e => setCurrentEntry(e.target.value)}
                  placeholder="Write from your heart..."
                  rows={5}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none resize-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={saveEntry} disabled={!currentEntry.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                    Save Entry 💌
                  </button>
                </div>
              </div>

              {entries.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">📖 Your Journal</h3>
                  {entries.map((entry, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-rose-100/60 p-4">
                      <p className="text-xs text-gray-400 mb-2">{entry.date}</p>
                      <p className="text-sm font-semibold text-rose-600 mb-1">{entry.prompt}</p>
                      <p className="text-gray-700 text-sm">{entry.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Journal Complete!</h2>
              <p className="text-5xl font-black gradient-text mb-2">{entries.length}</p>
              <p className="text-gray-600 mb-8">Beautiful love notes written! 💕</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Write More
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
