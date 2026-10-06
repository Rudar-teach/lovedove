'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Brain, Sparkles, Lightbulb, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface Scenario {
  situation: string;
  options: { id: string; text: string; points: number }[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    situation: 'You\'re on a surprise date night. Your partner planned something but is nervous. What do you do?',
    options: [
      { id: 'a', text: 'Pretend to be surprised even if you knew 😊', points: 25 },
      { id: 'b', text: 'Be genuinely surprised and express gratitude 💖', points: 30 },
      { id: 'c', text: 'Suggest something else you\'d rather do 🙈', points: 10 },
      { id: 'd', text: 'Help them relax by saying you love surprises ✨', points: 30 },
    ],
    explanation: 'Showing appreciation for their effort strengthens your bond!',
  },
  {
    situation: 'Your partner made you a gift that isn\'t perfect. How do you react?',
    options: [
      { id: 'a', text: 'Say it\'s perfect and hug them tightly 🤗', points: 30 },
      { id: 'b', text: 'Thank them sincerely and tell them why it matters 💕', points: 30 },
      { id: 'c', text: 'Suggest improvements for next time 💡', points: 5 },
      { id: 'd', text: 'Frame it and keep it forever 🖼️', points: 30 },
    ],
    explanation: 'The thought and effort behind a gift is what truly matters!',
  },
  {
    situation: 'You had a fight before a party. What do you do?',
    options: [
      { id: 'a', text: 'Talk it out privately before going together 🗣️', points: 30 },
      { id: 'b', text: 'Put it aside and have fun at the party 🎉', points: 15 },
      { id: 'c', text: 'Don\'t go to the party, focus on each other 🏠', points: 25 },
      { id: 'd', text: 'Go separately and deal with it later ⏰', points: 10 },
    ],
    explanation: 'Addressing conflicts together builds trust and intimacy.',
  },
  {
    situation: 'Your partner surprises you with breakfast in bed on a busy morning. What\'s your reaction?',
    options: [
      { id: 'a', text: 'Jump up immediately to help them! ❤️', points: 20 },
      { id: 'b', text: 'Stay in bed, enjoy it, and say thank you 😋', points: 25 },
      { id: 'c', text: 'Take photos and post them online 📸', points: 15 },
      { id: 'd', text: 'Plan a special breakfast for them in return 🔄', points: 30 },
    ],
    explanation: 'Reciprocating kindness keeps the love flowing both ways!',
  },
  {
    situation: 'Your partner has a bad day at work. How do you cheer them up?',
    options: [
      { id: 'a', text: 'Give them space to decompress first 🧘', points: 20 },
      { id: 'b', text: 'Plan their favorite activity tonight 🎮', points: 30 },
      { id: 'c', text: 'Send cute texts throughout the day 💌', points: 25 },
      { id: 'd', text: 'Surprise them with their favorite snack 🍫', points: 30 },
    ],
    explanation: 'Small gestures of care mean the world on bad days!',
  },
];

export default function LoveScenarioPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startGame = () => {
    setScenarioIdx(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setPhase('playing');
  };

  const current = SCENARIOS[scenarioIdx];

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelected(optionId);
    const option = current.options.find(o => o.id === optionId);
    if (option) {
      setScore(s => s + option.points);
    }
    setShowResult(true);
  };

  const nextScenario = () => {
    if (scenarioIdx < SCENARIOS.length - 1) {
      setScenarioIdx(i => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setScore(s => s + 25);
      setPhase('finished');
    }
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
                <div className="text-6xl mb-4">🎭</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Scenarios</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Test your relationship skills by answering romantic scenarios. Choose the best response for each situation!</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">How to Play</h3>
                  <div className="space-y-2 text-left text-sm text-gray-700">
                    <p>• Read each romantic scenario carefully</p>
                    <p>• Choose the best response</p>
                    <p>• Higher points = better relationship moves!</p>
                    <p>• Complete all 5 scenarios</p>
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Game
                </button>
              </motion.div>
            )}

            {phase === 'playing' && current && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">Scenario {scenarioIdx + 1}/{SCENARIOS.length}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <Brain className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-rose-700 mb-6">{current.situation}</h2>

                  <div className="space-y-3 max-w-md mx-auto">
                    {current.options.map(opt => {
                      const isSelected = selected === opt.id;
                      const isCorrect = showResult && opt.points >= 25;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          disabled={showResult}
                          className={`w-full p-4 rounded-xl text-left font-medium transition ${
                            isSelected
                              ? 'bg-rose-500 text-white ring-4 ring-rose-300'
                              : showResult
                                ? isCorrect
                                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                : 'bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-700'
                          }`}
                        >
                          {opt.text}
                          {showResult && isSelected && <span className="block text-sm mt-1">+{opt.points} points</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-pink-50 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-pink-700 font-medium mb-2">💡 {current.explanation}</p>
                    <button onClick={nextScenario} className="mt-3 bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
                      {scenarioIdx < SCENARIOS.length - 1 ? 'Next Scenario' : 'See Results'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Trophy className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Great Relationship Skills!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">
                  {score >= 120 ? 'Relationship expert! 💑' : score >= 80 ? 'Great communicator! 💖' : 'Keep learning together! 💕'}
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
