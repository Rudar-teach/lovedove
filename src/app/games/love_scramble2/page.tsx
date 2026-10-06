'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface SentencePuzzle {
  scrambled: string[];
  correct: string[];
  hint: string;
  emoji: string;
}

const SENTENCES: SentencePuzzle[] = [
  { scrambled: ['love', 'I', 'you'], correct: ['I', 'love', 'you'], hint: 'The classic 3 words', emoji: '❤️' },
  { scrambled: ['be', 'mine', 'will', 'you'], correct: ['Will', 'you', 'be', 'mine'], hint: 'A question of the heart', emoji: '💍' },
  { scrambled: ['are', 'my', 'you', 'everything'], correct: ['You', 'are', 'my', 'everything'], hint: 'You mean the world', emoji: '🌍' },
  { scrambled: ['kiss', 'a', 'me', 'give'], correct: ['Give', 'me', 'a', 'kiss'], hint: 'A sweet request', emoji: '💋' },
  { scrambled: ['always', 'love', 'I', 'will', 'you'], correct: ['I', 'will', 'always', 'love', 'you'], hint: 'A forever promise', emoji: '♾️' },
  { scrambled: ['together', 'grow', 'we', 'old', 'will'], correct: ['We', 'will', 'grow', 'old', 'together'], hint: 'Aging side by side', emoji: '👵' },
  { scrambled: ['hold', 'me', 'please', 'me'], correct: ['Please', 'hold', 'me'], hint: 'A comforting request', emoji: '🫂' },
  { scrambled: ['heart', 'you', 'have', 'my'], correct: ['You', 'have', 'my', 'heart'], hint: 'A gift of devotion', emoji: '💝' },
  { scrambled: ['soul', 'mate', 'you', 'are', 'my'], correct: ['You', 'are', 'my', 'soul', 'mate'], hint: 'A perfect match', emoji: '✨' },
  { scrambled: ['dreams', 'you', 'are', 'my', 'come', 'true'], correct: ['You', 'are', 'my', 'dreams', 'come', 'true'], hint: 'Wishes fulfilled', emoji: '🌟' },
];

const shuffleArr = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function LoveScramble2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [puzzles, setPuzzles] = useState<SentencePuzzle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tiles, setTiles] = useState<{ word: string; idx: number; used: boolean }[]>([]);
  const [placed, setPlaced] = useState<{ word: string; idx: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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
    const fixed = SENTENCES.map(s => ({ ...s, scrambled: shuffleArr(s.correct) }));
    const shuffled = [...fixed].sort(() => Math.random() - 0.5);
    setPuzzles(shuffled);
    setCurrentIdx(0);
    setTiles(shuffled[0].scrambled.map((w, i) => ({ word: w, idx: i, used: false })));
    setPlaced([]);
    setScore(0);
    setTimeLeft(120);
    setTimerActive(true);
    setFeedback(null);
    setPhase('playing');
  };

  const placeWord = (word: string, idx: number) => {
    if (placed.length >= puzzles[currentIdx].correct.length) return;
    setPlaced(p => [...p, { word, idx }]);
    setTiles(t => t.map(x => x.idx === idx ? { ...x, used: true } : x));
    setTimeout(checkAnswer, 200);
  };

  const removeWord = (idx: number) => {
    setPlaced(p => p.filter(x => x.idx !== idx));
    setTiles(t => t.map(x => x.idx === idx ? { ...x, used: false } : x));
  };

  const checkAnswer = () => {
    const current = puzzles[currentIdx];
    const isCorrect = placed.length === current.correct.length &&
      placed.every((p, i) => p.word.toLowerCase() === current.correct[i].toLowerCase());
    if (isCorrect) {
      setScore(s => s + current.correct.length * 10);
      setFeedback('correct');
      setTimeout(() => nextPuzzle(), 1200);
    } else if (placed.length === current.correct.length) {
      setFeedback('wrong');
      setTimeout(() => {
        setPlaced([]);
        setTiles(current.scrambled.map((w, i) => ({ word: w, idx: i, used: false })));
        setFeedback(null);
      }, 1000);
    }
  };

  const nextPuzzle = () => {
    if (currentIdx >= puzzles.length - 1) {
      setPhase('finished');
      return;
    }
    const next = currentIdx + 1;
    setCurrentIdx(next);
    setTiles(puzzles[next].scrambled.map((w, i) => ({ word: w, idx: i, used: false })));
    setPlaced([]);
    setFeedback(null);
  };

  const shuffleTiles = () => {
    setTiles(t => shuffleArr(t));
  };

  const skip = () => {
    setPlaced([]);
    setTiles(puzzles[currentIdx].scrambled.map((w, i) => ({ word: w, idx: i, used: false })));
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
                <div className="text-6xl mb-4">💬</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Sentence Scramble</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Rearrange word tiles to form romantic sentences. Each word unlocks the next part of the puzzle!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Unscrambling
                </button>
              </motion.div>
            )}

            {phase === 'playing' && puzzles[currentIdx] && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">⏱️ {timeLeft}s</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-purple-600 font-semibold">{currentIdx + 1}/{puzzles.length}</span>
                </div>

                <motion.div key={currentIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/90 rounded-2xl p-6 shadow-xl">
                  <div className="text-center text-3xl mb-2">{puzzles[currentIdx].emoji}</div>
                  <p className="text-center text-sm text-rose-500 italic mb-4">Hint: {puzzles[currentIdx].hint}</p>

                  <div className={`min-h-[80px] bg-gradient-to-r ${feedback === 'correct' ? 'from-green-100 to-emerald-100' : 'from-rose-50 to-pink-50'} rounded-xl p-3 mb-4 flex flex-wrap gap-2 justify-center items-center border-2 border-dashed border-rose-300`}>
                    {placed.length === 0 && <span className="text-rose-400 italic text-sm">Tap words below to build sentence...</span>}
                    {placed.map(p => (
                      <button key={p.idx} onClick={() => removeWord(p.idx)} className="bg-white border-2 border-rose-400 text-rose-700 font-semibold px-3 py-1.5 rounded-lg shadow">
                        {p.word}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {tiles.filter(t => !t.used).map(t => (
                      <button key={t.idx} onClick={() => placeWord(t.word, t.idx)} className="bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold px-3 py-1.5 rounded-lg shadow hover:scale-105 transition">
                        {t.word}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    <button onClick={shuffleTiles} className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm"><Shuffle className="w-3 h-3 inline mr-1" /> Shuffle</button>
                    <button onClick={skip} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm">Reset</button>
                  </div>

                  {feedback === 'correct' && <p className="text-center text-green-600 font-bold mt-3">✨ Perfect!</p>}
                </motion.div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Sentence Master!</h2>
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
