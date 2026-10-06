'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, MessageCircle, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';
type Intensity = 'sweet' | 'deep' | 'spicy' | 'all';

type Question = { id: number; text: string; intensity: Intensity };

const QUESTIONS: Question[] = [
  { id: 1, text: 'What was your first impression of me?', intensity: 'sweet' },
  { id: 2, text: 'What is your favorite memory of us?', intensity: 'deep' },
  { id: 3, text: 'What\'s one thing you love about my personality?', intensity: 'deep' },
  { id: 4, text: 'What\'s a small thing I do that always makes you smile?', intensity: 'sweet' },
  { id: 5, text: 'If we could teleport anywhere right now, where would we go?', intensity: 'sweet' },
  { id: 6, text: 'What\'s something you\'ve never told anyone but me?', intensity: 'deep' },
  { id: 7, text: 'What makes you feel most loved by me?', intensity: 'deep' },
  { id: 8, text: 'What\'s the most romantic thing I\'ve ever done for you?', intensity: 'deep' },
  { id: 9, text: 'What\'s a fantasy you\'ve had about us?', intensity: 'spicy' },
  { id: 10, text: 'What part of my body do you find most attractive?', intensity: 'spicy' },
  { id: 11, text: 'What would you do if I dressed up for a surprise?', intensity: 'spicy' },
  { id: 12, text: 'Have you ever thought about our first kiss?', intensity: 'deep' },
  { id: 13, text: 'What song always reminds you of us?', intensity: 'sweet' },
  { id: 14, text: 'What\'s your idea of a perfect anniversary?', intensity: 'deep' },
  { id: 15, text: 'If you could relive one moment with me, which one?', intensity: 'sweet' },
  { id: 16, text: 'What\'s something you want us to try together?', intensity: 'spicy' },
  { id: 17, text: 'How do you imagine our life together in 10 years?', intensity: 'deep' },
  { id: 18, text: 'What\'s a secret wish you have for our relationship?', intensity: 'deep' },
  { id: 19, text: 'What makes you feel most connected to me?', intensity: 'deep' },
  { id: 20, text: 'If we won the lottery, what would we do first?', intensity: 'sweet' },
];

const INTENSITY_META: Record<Intensity, { label: string; emoji: string; color: string }> = {
  sweet: { label: 'Sweet', emoji: '🍬', color: 'bg-pink-100 text-pink-700' },
  deep: { label: 'Deep', emoji: '🌊', color: 'bg-purple-100 text-purple-700' },
  spicy: { label: 'Spicy', emoji: '🔥', color: 'bg-red-100 text-red-700' },
  all: { label: 'All', emoji: '💕', color: 'bg-rose-100 text-rose-700' },
};

export default function LoveQnAPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [intensity, setIntensity] = useState<Intensity>('all');
  const [queue, setQueue] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) { setTimerActive(false); setAnswered(true); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    let filtered = intensity === 'all' ? [...QUESTIONS] : QUESTIONS.filter(q => q.intensity === intensity);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setTimerActive(false);
    setCurrent(shuffled[0] || null);
    setTimeLeft(15);
    setPhase('playing');
  };

  const answerYes = () => {
    if (!current) return;
    setAnswered(true);
    setTimerActive(false);
    setStreak(s => s + 1);
    const pts = 10 + streak * 5 + Math.floor(timeLeft / 3) * 2;
    setScore(s => s + pts);
  };

  const nextQuestion = () => {
    const newQueue = queue.slice(1);
    if (newQueue.length === 0) {
      setPhase('finished');
    } else {
      setQueue(newQueue);
      setCurrent(newQueue[0]);
      setAnswered(false);
      setTimerActive(false);
      setTimeLeft(15);
    }
  };

  const currentIntensity = current?.intensity || 'sweet';
  const meta = INTENSITY_META[currentIntensity];

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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Q&A</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Answer romantic questions together! How well do you really know each other?</p>

                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Choose Intensity</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(Object.keys(INTENSITY_META) as Intensity[]).filter(k => k !== 'all').map(k => (
                      <button key={k} onClick={() => setIntensity(k)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${intensity === k ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>
                        {INTENSITY_META[k].emoji} {INTENSITY_META[k].label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Q&A
                </button>
              </motion.div>
            )}

            {phase === 'playing' && current && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}>{meta.emoji} {meta.label}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-rose-600 font-semibold">🔥 {streak} streak</span>
                  <span className="text-rose-700 font-semibold">⏱️ {timeLeft}s</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <MessageCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-rose-700 mb-6">{current.text}</h2>

                  {!answered ? (
                    <div>
                      <div className="w-full bg-rose-200 rounded-full h-2 mb-4">
                        <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${(timeLeft / 15) * 100}%` }} />
                      </div>
                      <div className="flex justify-center gap-3">
                        <button onClick={answerYes} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition">Yes! ❤️</button>
                        <button onClick={answerYes} className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition">Haha, exactly! 😂</button>
                        <button onClick={answerYes} className="bg-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition">100% agree! 💯</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-pink-600 font-semibold mb-4">+{10 + streak * 5 + Math.floor(timeLeft / 3) * 2} points! Great answer! 💕</p>
                      <button onClick={nextQuestion} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                        {queue.length > 1 ? 'Next Question' : 'See Results'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Flame className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Q&A Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">{streak} max streak</p>
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
