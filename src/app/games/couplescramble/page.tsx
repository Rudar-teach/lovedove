'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface ScrambleWord {
  word: string;
  hint: string;
  emoji: string;
  difficulty: number;
}

const WORDS: ScrambleWord[] = [
  { word: 'LOVE', hint: 'The greatest of these', emoji: '❤️', difficulty: 1 },
  { word: 'KISS', hint: 'On the lips', emoji: '💋', difficulty: 1 },
  { word: 'HUG', hint: 'A warm embrace', emoji: '🫂', difficulty: 1 },
  { word: 'ROSE', hint: 'A romantic flower', emoji: '🌹', difficulty: 1 },
  { word: 'DATE', hint: 'A romantic outing', emoji: '🌃', difficulty: 1 },
  { word: 'COZY', hint: 'Warm and comfortable together', emoji: '🛋️', difficulty: 2 },
  { word: 'MUSIC', hint: 'What you dance to', emoji: '🎵', difficulty: 2 },
  { word: 'CANDLE', hint: 'Sets the mood', emoji: '🕯️', difficulty: 2 },
  { word: 'SMILE', hint: 'What they make you do', emoji: '😊', difficulty: 1 },
  { word: 'SERENADE', hint: 'Singing to impress', emoji: '🎤', difficulty: 3 },
  { word: 'BABY', hint: 'Sweet term of endearment', emoji: '👶', difficulty: 1 },
  { word: 'MARRY', hint: 'Forever together', emoji: '💍', difficulty: 2 },
  { word: 'ENCHANTED', hint: 'Spellbound by love', emoji: '✨', difficulty: 3 },
  { word: 'DIVINE', hint: 'Heavenly connection', emoji: '👼', difficulty: 3 },
];

const mixUp = (w: string) => {
  const chars = w.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const result = chars.join('');
  return result === w ? mixUp(w) : result;
};

export default function CouplescramblePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [deck, setDeck] = useState<ScrambleWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setPhase('finished');
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIdx(0);
    setScrambled(mixUp(shuffled[0].word));
    setGuess('');
    setScore(0);
    setFeedback(null);
    setHintsUsed(0);
    setTimeLeft(60);
    setTimerActive(true);
    setPhase('playing');
  };

  const word = deck[idx];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word || feedback) return;
    if (guess.toUpperCase() === word.word) {
      const pts = word.difficulty * 10 - hintsUsed * 3;
      setScore(s => s + Math.max(pts, 1));
      setFeedback('correct');
      setTimeout(() => nextWord(), 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const nextWord = () => {
    if (idx >= deck.length - 1) {
      setPhase('finished');
      return;
    }
    const n = idx + 1;
    setIdx(n);
    setScrambled(mixUp(deck[n].word));
    setGuess('');
    setFeedback(null);
    setHintsUsed(0);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">🔤</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Scramble</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Unscramble love words together. Type the correct answer to score points!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Game
                </button>
              </motion.div>
            )}

            {phase === 'playing' && word && (
              <motion.div key={idx} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className="bg-white/90 rounded-2xl p-8 shadow-xl text-center">
                <div className="text-5xl mb-2">{word.emoji}</div>
                <p className="text-sm text-rose-500 mb-4">{word.hint}</p>
                <div className="text-4xl font-bold tracking-[0.3em] text-rose-700 mb-6">{scrambled}</div>
                <form onSubmit={handleSubmit} className="mb-4">
                  <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())} disabled={feedback === 'correct'} placeholder="TYPE THE WORD" autoFocus className={`w-full text-center text-3xl font-bold tracking-[0.2em] p-3 border-2 rounded-xl uppercase ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : feedback === 'wrong' ? 'bg-red-100 border-red-500 text-red-700' : 'border-rose-300'}`} />
                </form>
                <div className="flex justify-center gap-3 flex-wrap">
                  <button onClick={() => { if (hintsUsed < 3) { setHintsUsed(h => h + 1); } }} className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">💡 Hint ({hintsUsed}/3)</button>
                  <button onClick={nextWord} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">Skip →</button>
                  {feedback === 'correct' && <span className="text-green-600 font-bold">✨ Nice!</span>}
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Word Master!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">points earned</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link href="/games" className="bg-pink-100 text-rose-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-200 transition">More Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
