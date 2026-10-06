'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Lightbulb, Sparkles, Star, Zap, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Word {
  original: string;
  hint: string;
  category: string;
  difficulty: number;
}

const WORDS: Word[] = [
  { original: "cuddle", hint: "Physical closeness and affection", category: "Affection", difficulty: 1 },
  { original: "cherish", hint: "To hold dear and protect", category: "Love", difficulty: 2 },
  { original: "embrace", hint: "To hold someone tightly", category: "Affection", difficulty: 2 },
  { original: "romance", hint: "Love and passion", category: "Love", difficulty: 1 },
  { original: "devoted", hint: "Extremely loyal and loving", category: "Love", difficulty: 2 },
  { original: "hearts", hint: "Symbol of love, plural", category: "Symbols", difficulty: 1 },
  { original: "passion", hint: "Intense romantic desire", category: "Love", difficulty: 2 },
  { original: "tender", hint: "Gentle and loving", category: "Affection", difficulty: 2 },
  { original: "adorable", hint: "Extremely cute and lovable", category: "Compliments", difficulty: 3 },
  { original: "honeymoon", hint: "Post-wedding trip", category: "Events", difficulty: 3 },
  { original: "valentine", hint: "Your sweetheart on Feb 14", category: "Events", difficulty: 2 },
  { original: "butterflies", hint: "Nervous excitement in love", category: "Feelings", difficulty: 3 },
  { original: "sweetheart", hint: "Term of endearment", category: "Love", difficulty: 2 },
  { original: "together", hint: "In each other's company", category: "Love", difficulty: 1 },
  { original: "enchanting", hint: "Delightfully charming", category: "Compliments", difficulty: 3 },
  { original: "blushing", hint: "Face turns pink from love", category: "Feelings", difficulty: 2 },
  { original: "kisses", hint: "Expressions of affection", category: "Affection", difficulty: 1 },
  { original: "wedding", hint: "Marriage ceremony", category: "Events", difficulty: 2 },
  { original: "forever", hint: "Eternity in love", category: "Love", difficulty: 1 },
  { original: "romantic", hint: "Conducive to love", category: "Love", difficulty: 2 },
  { original: "dazzling", hint: "Extremely impressive and attractive", category: "Compliments", difficulty: 3 },
  { original: "embraced", hint: "Past tense of held close", category: "Affection", difficulty: 3 },
  { original: "yearning", hint: "Deep longing for someone", category: "Feelings", difficulty: 3 },
  { original: "darling", hint: "Dear one, beloved", category: "Love", difficulty: 1 },
  { original: "sunshine", hint: "Your partner brightens your day", category: "Compliments", difficulty: 2 },
];

const shuffleWord = (word: string): string => {
  const chars = word.split('');
  const shuffled = [...chars].sort(() => Math.random() - 0.5);
  if (shuffled.join('') === word) return shuffleWord(word);
  return shuffled.join('');
};

export default function LoveWordScramblePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [pool, setPool] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<{ word: Word; attempts: number; time: number }[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [gameState, startTime]);

  const startGame = () => {
    const p = WORDS.filter(w => difficulty.includes(w.difficulty)).sort(() => Math.random() - 0.5).slice(0, 8);
    setPool(p);
    setCurrent(p[0]);
    setScrambled(shuffleWord(p[0].original));
    setInput('');
    setScore(0);
    setCompleted([]);
    setHintUsed(false);
    setStartTime(Date.now());
    setElapsed(0);
    setGameState('playing');
  };

  const submitAnswer = () => {
    if (!current) return;
    const correct = input.trim().toLowerCase() === current.original.toLowerCase();
    if (correct) {
      const timeBonus = Math.max(0, 50 - elapsed);
      const hintPenalty = hintUsed ? 5 : 0;
      const diffBonus = current.difficulty * 5;
      const pts = 30 + diffBonus + timeBonus - hintPenalty;
      setScore(s => s + Math.max(pts, 5));
      setCompleted(c => [...c, { word: current, attempts: 1, time: elapsed }]);
      const idx = pool.indexOf(current);
      if (idx < pool.length - 1) {
        setCurrent(pool[idx + 1]);
        setScrambled(shuffleWord(pool[idx + 1].original));
      } else { setCurrent(null); setGameState('finished'); }
      setInput('');
      setHintUsed(false);
      setStartTime(Date.now());
      setElapsed(0);
    }
  };

  const useHint = () => {
    setHintUsed(true);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-gray-700">Word Scramble</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🔤</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Word Scramble</h1>
              <p className="text-gray-600 mb-8 text-lg">Unscramble romantic words and test your vocabulary!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Difficulty</h3>
                <div className="flex gap-2">
                  {[{ d: [1], label: 'Easy' }, { d: [1, 2], label: 'Medium' }, { d: [1, 2, 3], label: 'Hard' }].map(opt => (
                    <button key={opt.label} onClick={() => setDifficulty(opt.d)} className={`flex-1 py-2 rounded-xl text-sm font-bold ${difficulty.join(',') === opt.d.join(',') ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {gameState === 'playing' && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Word {completed.length + 1}/{pool.length}</span>
                <span className="text-sm text-gray-500 font-medium">Score: {score}</span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${(completed.length / pool.length) * 100}%` }} />
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-[2rem] shadow-2xl p-8 mb-6 text-white text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 mb-4">{current.category}</span>
                <div className="text-5xl font-black tracking-[0.5em] mb-4">{scrambled.toUpperCase()}</div>
                <p className="text-sm text-white/70">{current.hint}</p>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                  placeholder="Type your answer..."
                  className="flex-1 px-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl text-lg font-bold text-center focus:border-pink-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={submitAnswer} className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Submit</button>
                {!hintUsed && (
                  <button onClick={useHint} className="px-6 py-4 bg-amber-100 rounded-2xl font-bold text-amber-700 hover:bg-amber-200 transition">
                    <Lightbulb className="w-5 h-5 inline mr-1" /> Hint
                  </button>
                )}
              </div>

              {hintUsed && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-4">
                  <p className="text-sm text-amber-800">💡 Hint: The word starts with "{current.original[0]}" and has {current.original.length} letters</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {formatTime(elapsed)}</span>
                <span>Difficulty: {current.difficulty === 1 ? 'Easy' : current.difficulty === 2 ? 'Medium' : 'Hard'}</span>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Great Job!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-8">{score} pts</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Words Unscrambled</h3>
                {completed.map((c, i) => (
                  <div key={i} className="flex items-center justify-between mb-2 p-2 bg-white/50 rounded-xl">
                    <span className="text-gray-700">{c.word.original}</span>
                    <span className="text-xs text-gray-500">{formatTime(c.time)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}