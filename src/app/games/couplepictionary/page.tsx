'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Palette } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type Prompt = { id: number; prompt: string; hint: string; keywords: string[]; emoji: string };

const PROMPTS: Prompt[] = [
  { id: 1, prompt: 'Draw "Our First Date"', hint: 'Coffee shop, park, or restaurant', keywords: ['date', 'first', 'together', 'meet'], emoji: '☕' },
  { id: 2, prompt: 'Draw "Our Dream Vacation"', hint: 'Beach, mountains, or city', keywords: ['beach', 'ocean', 'sun', 'travel'], emoji: '🏖️' },
  { id: 3, prompt: 'Draw "A Romantic Dinner"', hint: 'Candlelight, wine, roses', keywords: ['dinner', 'candle', 'food', 'wine'], emoji: '🕯️' },
  { id: 4, prompt: 'Draw "Our Wedding Day"', hint: 'White dress, rings, celebration', keywords: ['wedding', 'dress', 'ring', 'church'], emoji: '💒' },
  { id: 5, prompt: 'Draw "A Surprise Proposal"', hint: 'Knee, ring box, happy tears', keywords: ['propose', 'ring', 'knee', 'yes'], emoji: '💍' },
  { id: 6, prompt: 'Draw "Future Us"', hint: 'Growing old together happily', keywords: ['old', 'future', 'together', 'love'], emoji: '👴👵' },
  { id: 7, prompt: 'Draw "A Cozy Night In"', hint: 'Pajamas, couch, movie, blanket', keywords: ['couch', 'movie', 'blanket', 'warm'], emoji: '🛋️' },
  { id: 8, prompt: 'Draw "Our Pet"', hint: 'A fluffy animal that represents us', keywords: ['cat', 'dog', 'pet', 'fluffy'], emoji: '🐕' },
];

export default function CouplePictionaryPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [partnerGuessed, setPartnerGuessed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [votes, setVotes] = useState<number[]>([]);
  const [roundResult, setRoundResult] = useState<string | null>(null);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) { setTimerActive(false); handleTimeUp(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 5);
    setPrompts(shuffled);
    setCurrentRound(0);
    setScore(0);
    setVotes([]);
    setRoundResult(null);
    setPhase('playing');
  };

  const startRound = () => {
    setPartnerGuessed(false);
    setTimeLeft(60);
    setTimerActive(true);
    setRoundResult(null);
  };

  const handleTimeUp = () => {
    if (!partnerGuessed) {
      setRoundResult("Time's up! Partner didn't guess. 0 points this round.");
    }
  };

  const partnerGuess = () => {
    setPartnerGuessed(true);
    setTimerActive(false);
    const bonus = Math.floor(timeLeft / 10) * 5;
    const base = 25;
    const pts = base + bonus;
    setScore(s => s + pts);
    setRoundResult(`Partner guessed in ${60 - timeLeft}s! +${pts} points!`);
  };

  const nextRound = () => {
    if (currentRound < prompts.length - 1) {
      setCurrentRound(r => r + 1);
      startRound();
    } else {
      setTimerActive(false);
      setPhase('finished');
    }
  };

  const currentPrompt = prompts[currentRound];

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
                <div className="text-6xl mb-4">🎨</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Pictionary</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Draw romantic prompts for your partner to guess! More points for faster guesses.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">How to Play</h3>
                  <div className="space-y-2 text-left text-sm text-gray-700">
                    <p>1. One person draws the prompt</p>
                    <p>2. Partner guesses within 60 seconds</p>
                    <p>3. Faster guesses = more points!</p>
                    <p>4. Complete 5 rounds together</p>
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Drawing
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentPrompt && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">Round {currentRound + 1}/{prompts.length}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-rose-600 font-semibold">⏱️ {timeLeft}s</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <h2 className="text-3xl font-bold text-rose-700 mb-2">{currentPrompt.emoji} {currentPrompt.prompt}</h2>
                  <p className="text-gray-500 mb-4">Hint: {currentPrompt.hint}</p>

                  <div className="w-full h-64 bg-rose-50 rounded-xl border-2 border-dashed border-rose-200 flex items-center justify-center mb-4">
                    <p className="text-gray-400 text-lg">🎨 Your canvas here — draw away!</p>
                  </div>

                  {!partnerGuessed && timerActive && (
                    <div className="flex justify-center gap-3">
                      <button onClick={partnerGuess} className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                        Partner Guessed! ✅
                      </button>
                    </div>
                  )}

                  {!partnerGuessed && !timerActive && timeLeft <= 0 && (
                    <div className="text-red-500 text-lg font-semibold">Time's up! Partner didn't guess.</div>
                  )}
                </div>

                {roundResult && (
                  <div className="bg-pink-50 rounded-xl p-4 mb-4">
                    <p className="text-pink-700 font-semibold">{roundResult}</p>
                    <button onClick={nextRound} className="mt-3 bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
                      {currentRound < prompts.length - 1 ? 'Next Round' : 'See Results'}
                    </button>
                  </div>
                )}

                {!timerActive && !roundResult && !partnerGuessed && (
                  <button onClick={startRound} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                    Start Round Timer
                  </button>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Palette className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Pictionary Done!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">Total Score</p>
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
