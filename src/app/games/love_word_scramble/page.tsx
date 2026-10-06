'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Lightbulb, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface WordPuzzle {
  word: string;
  hint: string;
  emoji: string;
}

const WORDS: WordPuzzle[] = [
  { word: 'ROMANCE', hint: 'Love in its most passionate form', emoji: '💕' },
  { word: 'KISSES', hint: 'Sweet pecks on the lips', emoji: '💋' },
  { word: 'HEARTS', hint: 'Symbols of love', emoji: '❤️' },
  { word: 'FOREVER', hint: 'Eternity, always', emoji: '♾️' },
  { word: 'CUDDLE', hint: 'Cozy embrace on the couch', emoji: '🛋️' },
  { word: 'DREAM', hint: 'What you build together', emoji: '✨' },
  { word: 'COUPLE', hint: 'Two people in love', emoji: '💑' },
  { word: 'FLOWER', hint: 'A romantic gift', emoji: '🌹' },
  { word: 'BUTTERFLY', hint: 'What you feel in your stomach', emoji: '🦋' },
  { word: 'SUNSET', hint: 'A romantic view', emoji: '🌅' },
  { word: 'CANDLE', hint: 'Sets a romantic mood', emoji: '🕯️' },
  { word: 'LETTER', hint: 'A written love note', emoji: '✉️' },
  { word: 'BELOVED', hint: 'Your dearest person', emoji: '💖' },
  { word: 'CHERISH', hint: 'To treasure deeply', emoji: '🌟' },
  { word: 'DEVOTION', hint: 'Deep love and loyalty', emoji: '💝' },
];

const scrambleWord = (word: string) => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (arr[i] === word[i] || arr[j] === word[j]) continue;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
  return scrambled === word ? scrambleWord(word) : scrambled;
};

export default function LoveWordScramblePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [puzzles, setPuzzles] = useState<WordPuzzle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
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
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 8);
    setPuzzles(shuffled);
    setCurrentIdx(0);
    setScrambled(scrambleWord(shuffled[0].word));
    setGuess('');
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setHintUsed(false);
    setTimeLeft(90);
    setTimerActive(true);
    setPhase('playing');
  };

  const currentPuzzle = puzzles[currentIdx];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentPuzzle || feedback) return;
    if (guess.toUpperCase() === currentPuzzle.word) {
      const basePoints = currentPuzzle.word.length * 5;
      const streakBonus = streak * 5;
      const hintPenalty = hintUsed ? 5 : 0;
      setScore(s => s + basePoints + streakBonus - hintPenalty);
      setStreak(s => s + 1);
      setFeedback('correct');
      setTimeout(() => nextWord(), 1000);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const nextWord = () => {
    if (currentIdx >= puzzles.length - 1) {
      setPhase('finished');
      return;
    }
    const next = currentIdx + 1;
    setCurrentIdx(next);
    setScrambled(scrambleWord(puzzles[next].word));
    setGuess('');
    setFeedback(null);
    setHintUsed(false);
  };

  const skipWord = () => {
    setStreak(0);
    nextWord();
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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Word Scramble</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Unscramble romantic words to score points. Build a streak for bonus love!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Unscrambling
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentPuzzle && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {timeLeft}s</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-orange-600 font-semibold">🔥 {streak} streak</span>
                </div>
                <div className="w-full bg-rose-100 h-2 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all" style={{ width: `${((currentIdx + 1) / puzzles.length) * 100}%` }} />
                </div>

                <motion.div key={currentIdx} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className="bg-white/90 rounded-2xl p-8 shadow-xl text-center">
                  <div className="text-5xl mb-2">{currentPuzzle.emoji}</div>
                  <div className="text-3xl font-bold tracking-widest text-rose-700 mb-6">{scrambled}</div>
                  <form onSubmit={handleSubmit} className="mb-4">
                    <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())} disabled={feedback === 'correct'} placeholder="Type the word..." autoFocus className={`w-full text-center text-2xl font-bold uppercase tracking-widest p-3 border-2 rounded-xl ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : feedback === 'wrong' ? 'bg-red-100 border-red-500 text-red-700' : 'border-rose-300'}`} />
                  </form>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button onClick={() => { if (!hintUsed) { setHintUsed(true); setGuess(g => g + currentPuzzle.word[0]); } }} disabled={hintUsed} className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50">
                      <Lightbulb className="w-4 h-4 inline mr-1" /> {hintUsed ? 'Hint Used' : 'First Letter'}
                    </button>
                    <button onClick={skipWord} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">Skip →</button>
                    {feedback === 'correct' && <span className="text-green-600 font-bold flex items-center"><Check className="inline w-4 h-4 mr-1" /> Correct!</span>}
                    {feedback === 'wrong' && <span className="text-red-600 font-bold flex items-center"><X className="inline w-4 h-4 mr-1" /> Try again!</span>}
                  </div>
                  {hintUsed && <p className="text-xs text-yellow-600 mt-3">💡 {currentPuzzle.hint}</p>}
                </motion.div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Scramble Master!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">
                  {score >= 200 ? 'Word Wizard! 🧙‍♂️' : score >= 100 ? 'Spelling Star! ⭐' : 'Good try! 💪'}
                </p>
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
