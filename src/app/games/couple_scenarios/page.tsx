'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const SCENARIOS = [
  {
    scenario: 'You\'re walking on the beach and the waves splash your feet...',
    choices: [
      { text: 'Run into the water together', points: 35 },
      { text: 'Kiss right there', points: 40 },
      { text: 'Hold hands and laugh', points: 30 },
      { text: 'Build a sandcastle', points: 25 },
    ],
  },
  {
    scenario: 'Your partner plans a surprise date night...',
    choices: [
      { text: 'Get ready with excitement', points: 30 },
      { text: 'Return the surprise', points: 35 },
      { text: 'Write them a love note first', points: 40 },
      { text: 'Bring flowers to them', points: 25 },
    ],
  },
  {
    scenario: 'You\'re stuck in an elevator together...',
    choices: [
      { text: 'Tell them how you feel', points: 40 },
      { text: 'Play games to pass time', points: 30 },
      { text: 'Sing a love song', points: 35 },
      { text: 'Enjoy the quiet moment', points: 25 },
    ],
  },
  {
    scenario: 'You find a love letter they wrote years ago...',
    choices: [
      { text: 'Cry happy tears', points: 35 },
      { text: 'Write them one back', points: 40 },
      { text: 'Frame it together', points: 30 },
      { text: 'Plan a romantic evening', points: 25 },
    ],
  },
  {
    scenario: 'It starts raining while you\'re on a picnic...',
    choices: [
      { text: 'Dance in the rain', points: 40 },
      { text: 'Run for cover laughing', points: 30 },
      { text: 'Kiss in the rain', points: 35 },
      { text: 'Make it a memory', points: 25 },
    ],
  },
  {
    scenario: 'You\'re cooking together and it\'s going wrong...',
    choices: [
      { text: 'Order takeout and laugh', points: 30 },
      { text: 'Try again together', points: 25 },
      { text: 'Make it a funny memory', points: 35 },
      { text: 'Kiss and start over', points: 40 },
    ],
  },
  {
    scenario: 'You have a whole day with no plans...',
    choices: [
      { text: 'Road trip adventure', points: 35 },
      { text: 'Stay in bed all day', points: 30 },
      { text: 'Plan something creative', points: 40 },
      { text: 'Let them decide', points: 25 },
    ],
  },
  {
    scenario: 'You hear your song playing in a store...',
    choices: [
      { text: 'Slow dance right there', points: 40 },
      { text: 'Sing along loudly', points: 30 },
      { text: 'Hold them close', points: 35 },
      { text: 'Take a video', points: 25 },
    ],
  },
];

export default function CoupleScenariosPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentS, setCurrentS] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenarios = SCENARIOS;

  useEffect(() => {
    const b = localStorage.getItem('scenarios_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    setCurrentS(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setState('playing');
  }, []);

  const handleChoice = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setScore((s) => s + scenarios[currentS].choices[idx].points);
    setShowResult(true);

    setTimeout(() => {
      if (currentS >= scenarios.length - 1) {
        setState('finished');
        if (score + scenarios[currentS].choices[idx].points > best) {
          setBest(score + scenarios[currentS].choices[idx].points);
          localStorage.setItem('scenarios_best', String(score + scenarios[currentS].choices[idx].points));
        }
      } else {
        setCurrentS((s) => s + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Scenarios
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Scenario</div>
                <div className="text-xl font-bold text-white">{currentS + 1}/{scenarios.length}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Heart className="text-pink-400 mx-auto mb-4" size={48} />
                <p className="text-white text-lg mb-2">What Would You Do?</p>
                <p className="text-white/60 text-sm mb-4">
                  Choose how you'd respond to each scenario
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start
                </button>
              </motion.div>
            )}

            {state === 'playing' && scenarios[currentS] && (
              <motion.div
                key={currentS}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-pink-300 text-xs uppercase mb-2">Scenario {currentS + 1}</p>
                  <p className="text-white text-lg italic">"{scenarios[currentS].scenario}"</p>
                </div>

                <p className="text-white/60 text-sm text-center">What would you do?</p>

                <div className="space-y-2">
                  {scenarios[currentS].choices.map((choice, idx) => {
                    let bg = 'bg-white/10 hover:bg-white/20';
                    if (showResult) {
                      const maxPts = Math.max(...scenarios[currentS].choices.map((c) => c.points));
                      if (choice.points === maxPts) bg = 'bg-green-500/30 border border-green-400';
                      else if (idx === selected) bg = 'bg-blue-500/20 border border-blue-400';
                      else bg = 'bg-white/5 opacity-50';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleChoice(idx)}
                        disabled={selected !== null}
                        className={`w-full p-4 rounded-xl text-left text-white transition-all ${bg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{choice.text}</span>
                          {showResult && (
                            <span className="text-pink-300 text-sm">+{choice.points}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 300 ? '🏆 Perfect Partner!' : score >= 200 ? '💖 Romantic!' : '💕 Sweet!'}
                    </h2>
                    <p className="text-white/70">Score: <span className="text-pink-300 font-bold">{score}</span></p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}