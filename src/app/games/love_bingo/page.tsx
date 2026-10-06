'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Sparkles, Star, Shuffle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const ITEMS = [
  "Cook together", "Hold hands", "Watch a sunset", "Dance together", "Cuddle for 30 min",
  "Send a love text", "Compliment deeply", "Slow dance", "Stargaze", "Read together",
  "Play a game", "Take a walk", "Share a dessert", "Picnic date", "Make art together",
  "Phone-free hour", "Massage each other", "Tell a story", "Sing together", "Plant something",
  "Visit a new place", "Cook a new recipe", "Take a selfie", "Laugh until crying", "Write a love note",
];

const WIN_PATTERNS = [
  { name: "First Row", check: (i: number) => i < 5 },
  { name: "Second Row", check: (i: number) => i >= 5 && i < 10 },
  { name: "Third Row", check: (i: number) => i >= 10 && i < 15 },
  { name: "Fourth Row", check: (i: number) => i >= 15 && i < 20 },
  { name: "Fifth Row", check: (i: number) => i >= 20 },
  { name: "First Column", check: (i: number) => i % 5 === 0 },
  { name: "Last Column", check: (i: number) => i % 5 === 4 },
  { name: "Top-Left to Bottom-Right Diagonal", check: (i: number) => i % 5 === Math.floor(i / 5) },
  { name: "Top-Right to Bottom-Left Diagonal", check: (i: number) => (4 - i % 5) === Math.floor(i / 5) },
  { name: "Four Corners", check: (i: number) => i === 0 || i === 4 || i === 20 || i === 24 },
  { name: "Full Card", check: (i: number) => i >= 0 && i < 25 },
];

export default function LoveBingo() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'called' | 'finished'>('idle');
  const [card, setCard] = useState<string[]>([]);
  const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false));
  const [centerIdx] = useState(12);
  const [calledItems, setCalledItems] = useState<string[]>([]);
  const [wins, setWins] = useState<string[]>([]);
  const [currentCall, setCurrentCall] = useState('');

  const setupNewCard = () => {
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    setCard(shuffled);
    setMarked(Array(25).fill(false));
    setMarked(prev => {
      const newMarked = [...prev];
      newMarked[centerIdx] = true; // Free space
      return newMarked;
    });
    setCalledItems([]);
    setWins([]);
    setCurrentCall('');
  };

  const startGame = () => {
    setupNewCard();
    setGameState('playing');
  };

  const callRandomItem = () => {
    const unmarked = card.filter((item, i) => !marked[i] && i !== centerIdx);
    if (unmarked.length === 0) return;
    const randomItem = unmarked[Math.floor(Math.random() * unmarked.length)];
    setCurrentCall(randomItem);
    setCalledItems(prev => [...prev, randomItem]);
    setGameState('called');
  };

  const confirmAndContinue = () => {
    if (currentCall) {
      const idx = card.indexOf(currentCall);
      if (idx !== -1) {
        const newMarked = [...marked];
        newMarked[idx] = true;
        setMarked(newMarked);

        // Check for win patterns
        const newWins = [...wins];
        for (const pattern of WIN_PATTERNS) {
          const allMarked = card.every((_, i) => pattern.check(i) ? newMarked[i] : true);
          if (allMarked && !newWins.includes(pattern.name)) {
            newWins.push(pattern.name);
          }
        }
        setWins(newWins);

        if (newMarked.every(m => m)) {
          setGameState('finished');
          return;
        }
      }
    }
    setCurrentCall('');
    setGameState('playing');
  };

  const markFromCard = (idx: number) => {
    if (idx === centerIdx) return;
    const newMarked = [...marked];
    newMarked[idx] = !newMarked[idx];
    setMarked(newMarked);
  };

  const getMarkedCount = () => marked.filter(m => m).length;
  const getWinEmoji = (name: string) => {
    if (name.includes('Row')) return '↔️';
    if (name.includes('Column')) return '↕️';
    if (name.includes('Diagonal')) return '✖️';
    if (name.includes('Corners')) return '🔲';
    return '🎉';
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <span className="font-bold text-gray-700">Love Bingo</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎲</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Bingo</h1>
              <p className="text-gray-600 mb-8 text-lg">Mark off romantic activities as you complete them!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Win Patterns</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>↔️ 5 Rows</li>
                  <li>↕️ 2 Columns</li>
                  <li>✖️ 2 Diagonals</li>
                  <li>🔲 4 Corners</li>
                  <li>🎉 Full Card</li>
                </ul>
              </div>

              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Generate Card
              </button>
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'called') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-bold text-gray-700">{getMarkedCount()}/25 marked</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-violet-700">{wins.length} wins!</span>
                </div>
              </div>

              {gameState === 'called' && currentCall && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-2xl p-5 mb-4 text-white text-center">
                  <p className="text-xs uppercase tracking-wider mb-1">Now playing...</p>
                  <p className="text-2xl font-black">{currentCall}</p>
                  <button onClick={confirmAndContinue} className="mt-3 px-6 py-2 bg-white text-violet-600 rounded-xl font-bold text-sm hover:shadow-lg transition">
                    Mark on Card →
                  </button>
                </motion.div>
              )}

              <div className="grid grid-cols-5 gap-2 mb-4">
                {card.map((item, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => markFromCard(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={idx === centerIdx}
                    className={`aspect-square rounded-2xl p-2 text-xs font-bold transition-all border-2 flex items-center justify-center text-center ${marked[idx] ? 'bg-violet-500 text-white border-violet-600' : 'bg-white/70 text-gray-700 border-pink-100 hover:bg-white'} ${idx === centerIdx ? 'bg-amber-200 text-amber-800 border-amber-300 cursor-default' : ''}`}
                  >
                    {idx === centerIdx ? '⭐ FREE' : marked[idx] ? '✓ ' + item.substring(0, 10) : item.substring(0, 12)}
                  </motion.button>
                ))}
              </div>

              {wins.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60 p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">Wins!</h3>
                  <div className="flex flex-wrap gap-2">
                    {wins.map((w, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{getWinEmoji(w)} {w}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={callRandomItem} className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-xl transition">
                  <Shuffle className="w-5 h-5 inline mr-2" /> Call Next Item
                </button>
                <button onClick={() => setGameState('finished')} className="px-6 py-4 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  End
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">BINGO!</h2>
              <p className="text-gray-600 mb-8">You marked {getMarkedCount()}/25 squares and won {wins.length} patterns!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Achievements</h3>
                {wins.length === 0 ? (
                  <p className="text-sm text-gray-500">No wins yet, but every moment counts!</p>
                ) : wins.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-2xl">{getWinEmoji(w)}</span>
                    <span className="font-medium text-amber-900">{w}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> New Card
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
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