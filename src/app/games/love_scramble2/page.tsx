'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Lightbulb, Sparkles, Star, Zap, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Phrase {
  original: string;
  scrambled: string;
  hint: string;
  category: string;
  difficulty: number;
  points: number;
}

const PHRASES: Phrase[] = [
  { original: "love you forever", hint: "A promise that never ends", category: "Love", difficulty: 2, points: 35 },
  { original: "sweet dreams", hint: "What you say before bed", category: "Night", difficulty: 1, points: 25 },
  { original: "be my valentine", hint: "Feb 14 request", category: "Romance", difficulty: 2, points: 35 },
  { original: "falling in love", hint: "When your heart takes over", category: "Love", difficulty: 2, points: 30 },
  { original: "happily ever after", hint: "Fairy tale ending", category: "Romance", difficulty: 3, points: 45 },
  { original: "cupid arrow", hint: "What makes you fall in love", category: "Mythology", difficulty: 1, points: 20 },
  { original: "heart to heart", hint: "Honest conversation", category: "Communication", difficulty: 2, points: 30 },
  { original: "love at first sight", hint: "Instant attraction", category: "Love", difficulty: 3, points: 45 },
  { original: "my better half", hint: "Your perfect complement", category: "Romance", difficulty: 2, points: 30 },
  { original: "together always", hint: "A promise of forever", category: "Love", difficulty: 1, points: 25 },
  { original: "love is patient", hint: "From a famous letter", category: "Bible", difficulty: 2, points: 30 },
  { original: "kiss me goodnight", hint: "Before sleep ritual", category: "Night", difficulty: 2, points: 30 },
  { original: "you complete me", hint: "Movie quote about love", category: "Quotes", difficulty: 2, points: 35 },
  { original: "made for each other", hint: "Perfect match", category: "Romance", difficulty: 3, points: 45 },
  { original: "love never fails", hint: "True love lasts", category: "Love", difficulty: 2, points: 30 },
];

function scramblePhrase(phrase: string): string {
  const words = phrase.split(' ');
  const scrambled = words.map(w => {
    const arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.join('');
  });
  return scrambled.join(' ');
}

export default function LoveScramble2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [pool, setPool] = useState<Phrase[]>([]);
  const [current, setCurrent] = useState<Phrase | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(0);
  const [roundNum, setRoundNum] = useState(0);

  const maxRounds = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 8 : 6;
  const timeLimit = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 30 : 20;
  const [timer, setTimer] = useState(timeLimit);
  const [timerOn, setTimerOn] = useState(false);
  const intervalRef = useRef<any>(null);

  const startGame = () => {
    let available = difficulty === 'easy' ? PHRASES.filter(p => p.difficulty === 1) : difficulty === 'medium' ? PHRASES.filter(p => p.difficulty <= 2) : [...PHRASES];
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, maxRounds);
    const prepared = shuffled.map(p => ({ ...p, scrambled: scramblePhrase(p.original) }));
    setPool(prepared); setScore(0); setRoundNum(0); setHintsLeft(difficulty === 'easy' ? 3 : 2);
    nextWord(prepared);
    setTimer(timeLimit); setTimerOn(false);
    setPhase('playing');
  };

  const nextWord = (p: Phrase[]) => {
    if (roundNum + 1 >= p.length) { setPhase('finished'); return; }
    const next = p[roundNum + 1];
    setCurrent(next);
    setAnswer('');
    setFeedback('');
    setTimer(timeLimit); setTimerOn(false);
  };

  useEffect(() => {
    if (!timerOn || timer <= 0) return;
    const t = setInterval(() => { setTimer(t => { if (t <= 1) { handleSkip(); return 0; } return t - 1; }); }, 1000);
    intervalRef.current = t;
    return () => clearInterval(t);
  }, [timerOn, timer]);

  useEffect(() => {
    if (current && phase === 'playing') {
      setTimer(timeLimit);
      const updated = { ...current, scrambled: scramblePhrase(current.original) };
      setCurrent(updated);
    }
  }, [roundNum]);

  const handleSubmit = () => {
    if (!current) return;
    const correct = answer.trim().toLowerCase() === current.original.toLowerCase();
    if (correct) {
      const bonus = timer > 15 ? 15 : 0;
      setScore(s => s + current.points + bonus);
      setFeedback('correct');
      setRoundNum(r => r + 1);
      setTimeout(() => nextWord(pool), 1500);
    } else {
      setFeedback('wrong');
      setAnswer('');
    }
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || !current) return;
    setHintsLeft(h => h - 1);
    const words = current.scrambled.split(' ');
    const target = current.original.split(' ');
    const idx = Math.floor(Math.random() * words.length);
    words[idx] = target[idx];
    setCurrent({ ...current, scrambled: words.join(' ') });
  };

  const handleSkip = () => {
    setRoundNum(r => r + 1);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (roundNum + 1 >= pool.length) setPhase('finished');
    else {
      const next = pool[roundNum + 1];
      setCurrent(next);
      setAnswer('');
      setFeedback('');
      setTimer(timeLimit); setTimerOn(false);
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
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-amber-500" /><span className="font-bold text-gray-700">Phrase Scramble</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">📜</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Phrase Scramble</h1>
              <p className="text-gray-600 mb-8 text-lg">Unscramble romantic phrases!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Difficulty</h3>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize ${difficulty === d ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}>{d}</button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">Rounds: {maxRounds} | Time: {timeLimit}s</p>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && current && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">{roundNum + 1}/{pool.length}</span>
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
                <span className={`text-sm font-black ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timer}s</span>
              </div>

              <motion.div key={current.original} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{current.category}</div>
                <div className="text-3xl font-black text-gray-800 mb-4 break-words">{current.scrambled}</div>
                <p className="text-sm text-gray-500 mb-4">Hint: {current.hint}</p>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Type the phrase..." className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 text-center text-lg font-bold focus:border-amber-500 outline-none mb-3" autoFocus />
                {feedback === 'correct' && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-600 font-bold text-lg">Correct! +{current.points + (timer > 15 ? 15 : 0)}</motion.p>}
                {feedback === 'wrong' && <p className="text-red-500 font-bold">Try again!</p>}
              </motion.div>

              <div className="flex gap-3">
                <button onClick={handleSubmit} className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-xl transition">Submit</button>
                <button onClick={handleHint} disabled={hintsLeft <= 0} className="px-4 py-3 bg-amber-100 rounded-2xl font-bold text-amber-700 hover:bg-amber-200 disabled:opacity-50"><Lightbulb className="w-5 h-5" /></button>
                <button onClick={handleSkip} className="px-4 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Skip</button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}