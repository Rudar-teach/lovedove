'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Lock, Unlock, Stars } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface PatternItem {
  id: number;
  emoji: string;
  found: boolean;
}

const LEVELS = [
  { sequence: ['💕', '💖', '💗', '💕'], answer: '💗', hint: 'Colors of love getting deeper' },
  { sequence: ['🌹', '🌷', '🌻', '🌹'], answer: '🌻', hint: 'Flowers in a garden' },
  { sequence: ['😊', '🥰', '😍', '😊'], answer: '😍', hint: 'Levels of adoration' },
  { sequence: ['⭐', '🌟', '✨', '⭐'], answer: '🌟', hint: 'Stars getting brighter' },
  { sequence: ['🥇', '🥈', '🥉', '🥇'], answer: '🥈', hint: 'Medals in order' },
  { sequence: ['💑', '💏', '👨‍👩‍👧', '💑'], answer: '💏', hint: 'Relationship milestones' },
  { sequence: ['🍀', '🌿', '🌱', '🍀'], answer: '🌱', hint: 'Plant growth stages' },
  { sequence: ['☀️', '⛅', '🌧️', '☀️'], answer: '⛅', hint: 'Weather cycle' },
];

export default function CouplePatternsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [displaySeq, setDisplaySeq] = useState<PatternItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showing, setShowing] = useState(true);
  const [levelScore, setLevelScore] = useState(0);

  const loadLevel = (levelIdx: number) => {
    const level = LEVELS[levelIdx];
    const items: PatternItem[] = level.sequence.map((emoji, i) => ({ id: i, emoji, found: false }));
    setDisplaySeq(items);
    setSelectedIdx(null);
    setShowing(true);
    setTimeout(() => {
      setShowing(false);
    }, 2000 + levelIdx * 200);
  };

  const startGame = () => {
    setCurrentLevel(0);
    setScore(0);
    setLevelScore(0);
    setPhase('playing');
    loadLevel(0);
  };

  const handleSelect = (idx: number) => {
    if (showing) return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    const expectedIdx = LEVELS[currentLevel].sequence.length - 1;
    if (idx === expectedIdx) {
      setLevelScore(s => s + 10);
      setScore(s => s + 10);
      if (currentLevel < LEVELS.length - 1) {
        setCurrentLevel(l => l + 1);
        loadLevel(currentLevel + 1);
      } else {
        setTimerActive(false);
        setPhase('finished');
      }
    } else {
      setLevelScore(0);
      if (currentLevel < LEVELS.length - 1) {
        setCurrentLevel(l => l + 1);
        loadLevel(currentLevel + 1);
      } else {
        setTimerActive(false);
        setPhase('finished');
      }
    }
    setSelectedIdx(null);
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
                <div className="text-6xl mb-4">🧩</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Patterns</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">A memory-challenge for couples! Watch the pattern, then tap the next emoji in the sequence.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">How to Play</h3>
                  <ul className="text-sm text-gray-700 space-y-1 text-left">
                    <li>• Watch the emoji pattern carefully</li>
                    <li>• Tap the next emoji in the sequence</li>
                    <li>• {LEVELS.length} levels to master</li>
                    <li>• Build your streak!</li>
                  </ul>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Pattern
                </button>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-rose-700 font-semibold mb-2">Level {currentLevel + 1} / {LEVELS.length} • Score: {score}</div>

                {showing && (
                  <motion.div className="bg-white/90 rounded-2xl p-6 shadow-xl mb-4 inline-block">
                    <p className="text-rose-500 mb-4 text-sm">Watch the pattern... 👀</p>
                    <div className="flex gap-3 justify-center">
                      {displaySeq.map((item, i) => (
                        <motion.div key={item.id} animate={{ scale: 1.1 }} className="w-16 h-16 flex items-center justify-center text-4xl bg-rose-50 rounded-xl border-2 border-rose-200">
                          {item.emoji}
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Hint: {LEVELS[currentLevel].hint}</p>
                  </motion.div>
                )}

                {!showing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/90 rounded-2xl p-6 shadow-xl mb-4 inline-block">
                    <p className="text-rose-500 mb-4 text-sm">Your turn! Tap the next emoji 🔄</p>
                    <div className="flex gap-3 justify-center">
                      {displaySeq.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(i)}
                          className={`w-16 h-16 flex items-center justify-center text-4xl rounded-xl border-2 transition hover:scale-110 ${selectedIdx === i ? 'bg-rose-200 border-rose-500 scale-110' : 'bg-rose-50 border-rose-200'}`}
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{LEVELS[currentLevel].hint}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Stars className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Pattern Master!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-6">Reached level {currentLevel + 1}!</p>
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
