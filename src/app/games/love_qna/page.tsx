'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, MessageCircle, Flame } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';
type Intensity = 'sweet' | 'deep' | 'spicy' | 'all';

interface QA {
  q: string;
  intensity: 'sweet' | 'deep' | 'spicy';
  emoji: string;
}

const QUESTIONS: QA[] = [
  { q: 'What\'s your favorite childhood memory of love?', intensity: 'deep', emoji: '🧸' },
  { q: 'When did you first know you loved me?', intensity: 'deep', emoji: '💖' },
  { q: 'What do I do that makes you feel safe?', intensity: 'deep', emoji: '🛡️' },
  { q: 'Describe our love in one word.', intensity: 'sweet', emoji: '✨' },
  { q: 'What\'s your favorite thing about kissing me?', intensity: 'spicy', emoji: '💋' },
  { q: 'What\'s the most romantic thing we\'ve ever done?', intensity: 'sweet', emoji: '🌹' },
  { q: 'What would you do if I was feeling low?', intensity: 'deep', emoji: '🤗' },
  { q: 'What makes you smile when you think of us?', intensity: 'sweet', emoji: '😊' },
  { q: 'What\'s a fantasy you\'d love to make real?', intensity: 'spicy', emoji: '🔥' },
  { q: 'What do I say that makes you melt?', intensity: 'sweet', emoji: '💝' },
  { q: 'What\'s your biggest fear about love?', intensity: 'deep', emoji: '🌙' },
  { q: 'Where would you want to go on our next trip?', intensity: 'sweet', emoji: '✈️' },
  { q: 'What do you love most about my touch?', intensity: 'spicy', emoji: '✋' },
  { q: 'What\'s the biggest risk you\'d take for us?', intensity: 'deep', emoji: '💪' },
  { q: 'What song makes you think of me?', intensity: 'sweet', emoji: '🎵' },
  { q: 'Describe your perfect day with me.', intensity: 'deep', emoji: '☀️' },
  { q: 'What\'s something small I do that drives you wild?', intensity: 'spicy', emoji: '💦' },
  { q: 'What does \"home\" mean to you?', intensity: 'deep', emoji: '🏠' },
  { q: 'What\'s your love language with me?', intensity: 'deep', emoji: '💬' },
  { q: 'What would you put on our perfect date menu?', intensity: 'sweet', emoji: '🍽️' },
  { q: 'What would you like to try in the bedroom?', intensity: 'spicy', emoji: '🛏️' },
  { q: 'What\'s the sweetest thing I\'ve ever done for you?', intensity: 'sweet', emoji: '🍬' },
  { q: 'How do you want to grow together?', intensity: 'deep', emoji: '🌱' },
  { q: 'What do you love about my laugh?', intensity: 'sweet', emoji: '😂' },
  { q: 'What\'s something adventurous we should do?', intensity: 'spicy', emoji: '🏄' },
  { q: 'How do you want me to comfort you?', intensity: 'deep', emoji: '🫂' },
  { q: 'What makes our connection special?', intensity: 'deep', emoji: '✨' },
  { q: 'What do I wear that drives you crazy?', intensity: 'spicy', emoji: '👗' },
  { q: 'What kind of parent do I make you?', intensity: 'deep', emoji: '👶' },
  { q: 'What\'s your go-to when you miss me?', intensity: 'sweet', emoji: '💌' },
];

const INTENSITY_COLORS: Record<string, { from: string; to: string; label: string }> = {
  sweet: { from: 'from-pink-400 to-rose-400', to: 'from-pink-500 to-rose-500', label: '💕 Sweet' },
  deep: { from: 'from-indigo-400 to-purple-400', to: 'from-indigo-500 to-purple-500', label: '💭 Deep' },
  spicy: { from: 'from-red-400 to-orange-400', to: 'from-red-500 to-orange-500', label: '🔥 Spicy' },
};

export default function LoveQnaPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [intensity, setIntensity] = useState<Intensity>('all');
  const [deck, setDeck] = useState<QA[]>([]);
  const [currentQ, setCurrentQ] = useState<QA | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [completed, setCompleted] = useState(0);

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

  const startGame = (int: Intensity) => {
    setIntensity(int);
    const pool = int === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.intensity === int);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentQ(shuffled[0]);
    setAnswers([]);
    setCurrentAnswer('');
    setScore(0);
    setCompleted(0);
    setTimeLeft(180);
    setTimerActive(true);
    setPhase('playing');
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const words = currentAnswer.trim().split(/\s+/);
    const pts = Math.min(words.length * 3, 20);
    setScore(s => s + pts);
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (completed < deck.length - 1) {
      setCompleted(c => c + 1);
      setCurrentQ(deck[completed + 1]);
    } else {
      setTimerActive(false);
      setPhase('finished');
    }
  };

  const getRating = (s: number) => {
    if (s >= 200) return { text: 'Soul Mates 💞', emoji: '🏆' };
    if (s >= 150) return { text: 'Deep Connectors 💖', emoji: '⭐' };
    if (s >= 100) return { text: 'Heart Talkers 💕', emoji: '✨' };
    return { text: 'Getting Closer 🌱', emoji: '💪' };
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
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Q&A</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Answer thought-provoking love questions together. Discover what makes your relationship special.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Choose Your Intensity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => startGame('all')} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3 rounded-xl hover:scale-105 transition">All Questions 💝</button>
                    <button onClick={() => startGame('sweet')} className="bg-gradient-to-r from-pink-400 to-rose-400 text-white p-3 rounded-xl hover:scale-105 transition">Sweet 💕</button>
                    <button onClick={() => startGame('deep')} className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white p-3 rounded-xl hover:scale-105 transition">Deep 💭</button>
                    <button onClick={() => startGame('spicy')} className="bg-gradient-to-r from-red-400 to-orange-500 text-white p-3 rounded-xl hover:scale-105 transition">Spicy 🔥</button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && currentQ && (
              <motion.div key={completed} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/90 rounded-2xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-4 text-sm flex-wrap gap-2">
                  <span className="text-rose-500">Question {completed + 1}/{deck.length}</span>
                  <span className="text-pink-600">⭐ {score} pts</span>
                  <span className="text-rose-700 font-semibold">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                </div>

                <div className={`bg-gradient-to-r ${INTENSITY_COLORS[currentQ.intensity].from} to ${INTENSITY_COLORS[currentQ.intensity].to} rounded-xl p-4 mb-4 text-white text-center`}>
                  <span className="text-sm opacity-90">{INTENSITY_COLORS[currentQ.intensity].label}</span>
                  <div className="text-3xl my-2">{currentQ.emoji}</div>
                  <h3 className="text-xl font-semibold">{currentQ.q}</h3>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Type your honest answer..."
                  className="w-full p-4 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:outline-none min-h-[120px] resize-y"
                  autoFocus
                />
                <div className="text-xs text-gray-500 mt-1">{currentAnswer.split(/\s+/).filter(Boolean).length} words</div>

                <button onClick={submitAnswer} disabled={!currentAnswer.trim()} className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-full font-semibold disabled:opacity-50 hover:scale-105 transition">
                  <MessageCircle className="inline w-4 h-4 mr-1" /> Send Answer
                </button>

                {answers.length > 0 && (
                  <div className="mt-6 bg-rose-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-rose-700 mb-2">💕 Your Journey</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {answers.map((a, i) => (
                        <div key={i} className="text-sm text-gray-700 bg-white p-2 rounded-lg">{a}</div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Flame className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Q&A Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-2xl text-pink-600 mb-2">{getRating(score).emoji} {getRating(score).text}</p>
                <p className="text-gray-700 mb-6">{answers.length} questions answered</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setPhase('idle')} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
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
