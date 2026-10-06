'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Flame, Users, Zap, Star, Medal } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Word {
  word: string;
  category: string;
  difficulty: number;
}

const WORDS: Word[] = [
  { word: "cuddle", category: "Affection", difficulty: 1 },
  { word: "cherish", category: "Love", difficulty: 2 },
  { word: "embrace", category: "Affection", difficulty: 2 },
  { word: "romance", category: "Love", difficulty: 1 },
  { word: "hearts", category: "Symbols", difficulty: 1 },
  { word: "passion", category: "Love", difficulty: 2 },
  { word: "together", category: "Love", difficulty: 1 },
  { word: "adorable", category: "Compliments", difficulty: 3 },
  { word: "valentine", category: "Events", difficulty: 2 },
  { word: "sweetheart", category: "Love", difficulty: 2 },
  { word: "kisses", category: "Affection", difficulty: 1 },
  { word: "darling", category: "Love", difficulty: 1 },
  { word: "forever", category: "Love", difficulty: 1 },
  { word: "butterflies", category: "Feelings", difficulty: 3 },
  { word: "sunshine", category: "Compliments", difficulty: 2 },
  { word: "enchanting", category: "Compliments", difficulty: 3 },
  { word: "blushing", category: "Feelings", difficulty: 2 },
  { word: "wedding", category: "Events", difficulty: 2 },
  { word: "romantic", category: "Love", difficulty: 2 },
  { word: "yearning", category: "Feelings", difficulty: 3 },
  { word: "devoted", category: "Love", difficulty: 2 },
  { word: "honeymoon", category: "Events", difficulty: 3 },
  { word: "tender", category: "Affection", difficulty: 2 },
  { word: "dazzling", category: "Compliments", difficulty: 3 },
  { word: "lovers", category: "Love", difficulty: 1 },
];

const shuffleWord = (word: string): string => {
  const chars = word.split('');
  const shuffled = [...chars].sort(() => Math.random() - 0.5);
  return shuffled.join('') === word ? shuffleWord(word) : shuffled.join('');
};

type GameState = 'setup' | 'roundStart' | 'playing' | 'roundEnd' | 'finished';

export default function CoupleScramblePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('setup');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [pool, setPool] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [p1Input, setP1Input] = useState('');
  const [p2Input, setP2Input] = useState('');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const [difficulty, setDifficulty] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    if (gameState !== 'playing' || timer <= 0) return;
    const t = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, timer]);

  const startGame = () => {
    const p = WORDS.filter(w => difficulty.includes(w.difficulty)).sort(() => Math.random() - 0.5).slice(0, totalRounds);
    setPool(p);
    setP1Score(0);
    setP2Score(0);
    setP1Wins(0);
    setP2Wins(0);
    setRound(0);
    startRound(p[0]);
  };

  const startRound = (word: Word) => {
    setCurrentWord(word);
    setScrambled(shuffleWord(word.word));
    setP1Input('');
    setP2Input('');
    setRoundWinner(null);
    setTimer(15);
    setGameState('roundStart');
  };

  const checkAnswer = (player: 1 | 2, input: string) => {
    if (!currentWord || roundWinner) return;
    const correct = input.trim().toLowerCase() === currentWord.word.toLowerCase();
    if (correct) {
      const speedBonus = timer * 2;
      const pts = 50 + speedBonus;
      if (player === 1) { setP1Score(s => s + pts); setP1Wins(w => w + 1); }
      else { setP2Score(s => s + pts); setP2Wins(w => w + 1); }
      setRoundWinner(player === 1 ? (p1Name || 'Partner 1') : (p2Name || 'Partner 2'));

      setTimeout(() => {
        if (round + 1 < pool.length) {
          const nextRound = round + 1;
          setRound(nextRound);
          startRound(pool[nextRound]);
        } else {
          setGameState('finished');
        }
      }, 2500);
    }
  };

  const getScrambleStatus = () => {
    if (roundWinner === null) return null;
    if (p1Wins > p2Wins) return { emoji: '👑', text: `${p1Name || 'P1'} Wins!`, color: 'text-blue-600' };
    if (p2Wins > p1Wins) return { emoji: '👑', text: `${p2Name || 'P2'} Wins!`, color: 'text-pink-600' };
    return { emoji: '🤝', text: "It's a Tie!", color: 'text-purple-600' };
  };

  const overall = getScrambleStatus();

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
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-700">Word Scramble Race</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {gameState === 'setup' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">⚡</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Scramble Race!</h1>
              <p className="text-gray-600 mb-8 text-lg">Same scrambled word, first to solve wins the round!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Rounds</h3>
                <div className="flex gap-2">
                  {[3, 5, 8].map(r => (
                    <button key={r} onClick={() => setTotalRounds(r)} className={`flex-1 py-2 rounded-xl text-sm font-bold ${totalRounds === r ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}>{r}</button>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 mt-4 mb-3">Difficulty</h3>
                <div className="flex gap-2">
                  {[{ d: [1], l: 'Easy' }, { d: [1, 2], l: 'Medium' }, { d: [1, 2, 3], l: 'Hard' }].map(opt => (
                    <button key={opt.l} onClick={() => setDifficulty(opt.d)} className={`flex-1 py-2 rounded-xl text-sm font-bold ${difficulty.join(',') === opt.d.join(',') ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}>{opt.l}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Player Names</h3>
                <input type="text" value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Player 1 name" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl font-bold mb-2 focus:border-blue-400 focus:outline-none" />
                <input type="text" value={p2Name} onChange={e => setP2Name(e.target.value)} placeholder="Player 2 name" className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl font-bold focus:border-pink-400 focus:outline-none" />
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start!</button>
            </motion.div>
          )}

          {gameState === 'roundStart' && currentWord && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">Round {round + 1}/{pool.length}</span>
                <span className="text-sm text-gray-500 font-medium">{timer}s</span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${(timer / 15) * 100}%` }} />
              </div>
              <p className="text-lg text-gray-600 mb-2">Ready... Set... Unscramble!</p>
            </motion.div>
          )}

          {gameState === 'playing' && currentWord && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Round {round + 1}/{pool.length}</span>
                <span className={`text-2xl font-black ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timer}s</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] shadow-xl p-6 text-white text-center">
                  <p className="text-sm text-blue-100 mb-2">{p1Name || 'Player 1'}</p>
                  <p className="text-4xl font-black">{p1Score}</p>
                  <p className="text-xs text-blue-200">pts</p>
                  <div className="mt-2"><Medal className="w-5 h-5 inline text-blue-200" /> {p1Wins} wins</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-[2rem] shadow-xl p-6 text-white text-center">
                  <p className="text-sm text-pink-100 mb-2">{p2Name || 'Player 2'}</p>
                  <p className="text-4xl font-black">{p2Score}</p>
                  <p className="text-xs text-pink-200">pts</p>
                  <div className="mt-2"><Medal className="w-5 h-5 inline text-pink-200" /> {p2Wins} wins</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[2rem] shadow-2xl p-8 mb-6 text-white text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 mb-4">{currentWord.category}</span>
                <div className="text-4xl font-black tracking-[0.3em] mb-4">{scrambled.toUpperCase()}</div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={p1Input}
                  onChange={(e) => setP1Input(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer(1, p1Input)}
                  placeholder={`${p1Name || 'Player 1'}: Type answer and press Enter`}
                  disabled={!!roundWinner}
                  className="w-full px-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl text-lg font-bold text-center focus:border-blue-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={p2Input}
                  onChange={(e) => setP2Input(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer(2, p2Input)}
                  placeholder={`${p2Name || 'Player 2'}: Type answer and press Enter`}
                  disabled={!!roundWinner}
                  className="w-full px-6 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl text-lg font-bold text-center focus:border-pink-400 focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && overall && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">{overall.emoji}</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Game Over!</h2>
              <p className={`text-xl font-bold mb-6 ${overall.color}`}>{overall.text}</p>

              <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] shadow-xl p-6 text-white text-center">
                  <p className="text-sm text-blue-100 mb-2">{p1Name || 'Player 1'}</p>
                  <p className="text-4xl font-black">{p1Score}</p>
                  <p className="text-xs text-blue-200">pts</p>
                  <p className="text-sm mt-2">🏆 {p1Wins} wins</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-[2rem] shadow-xl p-6 text-white text-center">
                  <p className="text-sm text-pink-100 mb-2">{p2Name || 'Player 2'}</p>
                  <p className="text-4xl font-black">{p2Score}</p>
                  <p className="text-xs text-pink-200">pts</p>
                  <p className="text-sm mt-2">🏆 {p2Wins} wins</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}