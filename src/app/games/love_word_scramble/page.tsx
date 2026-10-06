'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Sparkles, Lightbulb, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Word {
  original: string;
  hint: string;
  category: string;
  difficulty: number;
  points: number;
}

const WORDS: Word[] = [
  { original: "LOVE", hint: "The most beautiful feeling", category: "Basic", difficulty: 1, points: 20 },
  { original: "KISS", hint: "What lips are for", category: "Basic", difficulty: 1, points: 20 },
  { original: "HEART", hint: "Symbol of love", category: "Basic", difficulty: 2, points: 30 },
  { original: "HUG", hint: "Warm embrace", category: "Basic", difficulty: 1, points: 20 },
  { original: "SOUL", hint: "Deep connection", category: "Deep", difficulty: 2, points: 30 },
  { original: "PASSION", hint: "Intense emotion", category: "Deep", difficulty: 3, points: 40 },
  { original: "CHERISH", hint: "Hold dear", category: "Romance", difficulty: 3, points: 40 },
  { original: "TENDER", hint: "Gentle and loving", category: "Romance", difficulty: 2, points: 30 },
  { original: "FOREVER", hint: "Eternal promise", category: "Vows", difficulty: 3, points: 40 },
  { original: "CUDDLE", hint: "Close comfort", category: "Affection", difficulty: 2, points: 30 },
  { original: "ADORE", hint: "Deeply love", category: "Romance", difficulty: 2, points: 30 },
  { original: "DREAM", hint: "Wish for future", category: "Deep", difficulty: 2, points: 30 },
  { original: "ENCHANT", hint: "Cast a spell", category: "Magic", difficulty: 3, points: 40 },
  { original: "BLOSSOM", hint: "Flower opening", category: "Nature", difficulty: 2, points: 30 },
  { original: "AFFECTION", hint: "Warm feeling", category: "Romance", difficulty: 3, points: 40 },
];

function scramble(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

export default function LoveWordScramblePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [pool, setPool] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(0);
  const [skips, setSkips] = useState(0);

  const maxRounds = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 8 : 6;
  const timeLimit = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15;
  const [timer, setTimer] = useState(timeLimit);
  const [timerOn, setTimerOn] = useState(false);
  const intervalRef = useRef<any>(null);

  const startGame = () => {
    let available = difficulty === 'easy' ? WORDS.filter(w => w.difficulty === 1) : difficulty === 'medium' ? WORDS.filter(w => w.difficulty <= 2) : [...WORDS];
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, maxRounds);
    setPool(shuffled); setScore(0); setRounds(0); setSkips(0); setHintsLeft(difficulty === 'easy' ? 3 : 2); setAnswer('');
    setTimer(timeLimit); setTimerOn(false);
    nextWord(shuffled);
    setPhase('playing');
  };

  const nextWord = (p: Word[]) => {
    const remaining = p.filter(w => w !== current);
    if (remaining.length === 0) { if (intervalRef.current) clearInterval(intervalRef.current); setPhase('finished'); return; }
    const next = remaining[0];
    setCurrent(next);
    setScrambled(scramble(next.original));
    setAnswer('');
    setFeedback('');
    setTimer(timeLimit); setTimerOn(false);
  };

  const nextRound = () => {
    setRounds(r => r + 1);
    nextWord(pool);
  };

  useEffect(() => {
    if (!timerOn || timer <= 0) return;
    const t = setInterval(() => { setTimer(t => { if (t <= 1) { clearInterval(t); handleSkip(); return 0; } return t - 1; }); }, 1000);
    intervalRef.current = t;
    return () => clearInterval(t);
  }, [timerOn, timer]);

  useEffect(() => { if (current && phase === 'playing') setTimer(timeLimit); }, [current?.original]);

  const handleSubmit = () => {
    if (!current) return;
    const correct = answer.trim().toUpperCase() === current.original;
    if (correct) {
      const bonus = timer > 10 ? 10 : 0;
      setScore(s => s + current.points + bonus);
      setFeedback('correct');
      setTimeout(nextRound, 1000);
    } else {
      setFeedback('wrong');
      setAnswer('');
    }
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || !current) return;
    setHintsLeft(h => h - 1);
    setScrambled(s => {
      const correct = current.original;
      let result = s;
      for (let i = 0; i < correct.length; i++) {
        if (result[i] !== correct[i]) {
          const j = result.indexOf(correct[i], i);
          if (j !== -1) { const arr = result.split(''); [arr[i], arr[j]] = [arr[j], arr[i]]; result = arr.join(''); break; }
        }
      }
      return result;
    });
  };

  const handleSkip = () => {
    setSkips(s => s + 1);
    setRounds(r => r + 1);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rounds + 1 >= maxRounds) { setPhase('finished'); return; }
    nextWord(pool);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /><span className="font-bold text-gray-700">Word Scramble</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🧩</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Word Scramble</h1>
              <p className="text-gray-600 mb-8 text-lg">Unscramble romantic words!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Difficulty</h3>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize ${difficulty === d ? 'bg-purple-500 text-white' : 'bg-white text-gray-600'}`}>{d}</button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">Rounds: {maxRounds} | Time: {timeLimit}s</p>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">{rounds + 1}/{maxRounds}</span>
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
                <span className={`text-sm font-black ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timer}s</span>
              </div>

              <motion.div key={current.original} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-4 text-center">
                <div className="text-5xl font-black tracking-widest text-gray-800 mb-4 break-all">{scrambled}</div>
                <p className="text-sm text-gray-500 mb-2">Hint: {current.hint}</p>
                <div className="flex gap-2 max-w-xs mx-auto mb-4">
                  {current.original.split('').map((_, i) => (
                    <div key={i} className="w-10 h-12 bg-white border-2 border-pink-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700">{answer[i]?.toUpperCase() || ''}</div>
                  ))}
                </div>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Type answer..." className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-pink-200 text-center text-lg font-bold uppercase focus:border-pink-500 outline-none mb-3" autoFocus />
                {feedback === 'correct' && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-600 font-bold text-lg">Correct! +{current.points + (timer > 10 ? 10 : 0)}</motion.p>}
                {feedback === 'wrong' && <p className="text-red-500 font-bold">Try again!</p>}
              </motion.div>

              <div className="flex gap-3">
                <button onClick={handleSubmit} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Submit</button>
                <button onClick={handleHint} disabled={hintsLeft <= 0} className="px-4 py-3 bg-amber-100 rounded-2xl font-bold text-amber-700 hover:bg-amber-200 disabled:opacity-50"><Lightbulb className="w-5 h-5" /></button>
                <button onClick={handleSkip} className="px-4 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">{score} pts</p>
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