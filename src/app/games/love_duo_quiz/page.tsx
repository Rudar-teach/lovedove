'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Heart, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GameSharePanel from '@/components/GameSharePanel';
import { celebrateWin } from '@/lib/winCelebrate';

/**
 * Love Duo Quiz — co-op, not vs.
 *
 * Original questions, each with one "chemistry answer" that a couple who
 * knows themselves will both pick. Answer the same question side by side
 * (or across devices via the share panel): when both hearts match, the
 * chemistry meter jumps. No losing — the meter IS the score.
 */

interface DuoQuestion {
  prompt: string;
  options: [string, string, string];
  /** Index of the "chemistry" option (0-2). Matching on it = +2, matching elsewhere = +1. */
  chemistry: number;
}

const QUESTIONS: DuoQuestion[] = [
  {
    prompt: 'Where do we always end up when we want to feel cozy?',
    options: ['Couch, blanket fort, one show on loop', 'Rooftop, watching the stars', 'Kitchen, making something with our hands'],
    chemistry: 0,
  },
  {
    prompt: 'Our go-to move on a rainy Sunday is…',
    options: ['Sleeping in + breakfast in bed', 'Movie marathon, door locked', 'Slow walk, coffee in hand'],
    chemistry: 0,
  },
  {
    prompt: 'How do we handle a big argument?',
    options: ['Talk it through till it hurts a little', 'Walk away, come back softer', 'One of us makes a terrible joke'],
    chemistry: 2,
  },
  {
    prompt: 'The sound of our love story is…',
    options: ['That one song we both hum without noticing', 'Your laugh, honestly, that counts', 'The quiet kind — no music needed'],
    chemistry: 0,
  },
  {
    prompt: 'Pick the thing we do best together:',
    options: ['Planning the impossible trip', 'Ordering more food than is reasonable', 'Finishing each other’s sentences'],
    chemistry: 2,
  },
  {
    prompt: 'A perfect night in looks like…',
    options: ['Candles, bare feet, no phones', 'Game on, snacks everywhere, zero chill', 'Cooking together, mess included'],
    chemistry: 0,
  },
  {
    prompt: 'Our team name would be…',
    options: ['Cute Chaos', 'The Heartbreakers', 'Pillow Fort Defenders'],
    chemistry: 2,
  },
  {
    prompt: 'When something good happens, our first instinct is to…',
    options: ['Screenshot it together', 'Text each other at the exact same time', 'Scream about it in the car'],
    chemistry: 1,
  },
  {
    prompt: 'The word that fits us most is…',
    options: ['Safe', 'Wild', 'Untranslatable'],
    chemistry: 2,
  },
  {
    prompt: 'On a 10-year version of us, the fridge still has…',
    options: ['Our inside jokes on sticky notes', 'Milk, mystery containers, one candle', 'A note that just says "us"'],
    chemistry: 2,
  },
];

type Phase = 'idle' | 'playing' | 'reveal' | 'done';

export default function LoveDuoQuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<number | null>(null);
  const [chemistry, setChemistry] = useState(0);
  const [matches, setMatches] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  const q = QUESTIONS[index];

  const start = () => {
    setIndex(0);
    setChemistry(0);
    setMatches(0);
    setCelebrated(false);
    setPhase('playing');
  };

  const reveal = () => {
    // Solo play (no partner across devices): the partner picks the chemistry
    // answer 70% of the time — the meter still tells the story.
    const effectivePartner =
      partnerChoice !== null
        ? partnerChoice
        : Math.random() < 0.7 ? q.chemistry : [0, 1, 2].filter((o) => o !== q.chemistry)[Math.floor(Math.random() * 2)];
    const isMatch = choice === effectivePartner;
    const gained = isMatch ? (choice === q.chemistry ? 2 : 1) : 0;
    setChemistry((c) => c + gained);
    if (isMatch) setMatches((m) => m + 1);
    setPhase('reveal');
    if (isMatch && gained === 2) celebrateWin();
  };

  const next = () => {
    setChoice(null);
    if (index + 1 >= QUESTIONS.length) {
      setPhase('done');
      if (!celebrated) {
        setCelebrated(true);
        celebrateWin();
      }
    } else {
      setIndex((i) => i + 1);
      setPhase('playing');
    }
  };

  const maxChemistry = QUESTIONS.length * 2;
  const meterPct = Math.round((chemistry / maxChemistry) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/games')}
          className="flex items-center gap-2 text-pink-700/80 hover:text-pink-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Games
        </button>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-12"
            >
              <div className="text-6xl mb-4">💞</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Love Duo Quiz
              </h1>
              <p className="text-gray-600 max-w-md mx-auto mb-2">
                Co-op, not vs. Pick the answer that feels like <em>us</em>.
                When your hearts match, the chemistry meter jumps.
              </p>
              <p className="text-xs text-gray-400 mb-8">
                Play side by side, or invite your partner to answer on their own device.
              </p>
              <button
                onClick={start}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-200/50 hover:scale-105 transition-transform"
              >
                <Play size={22} /> Start
              </button>
            </motion.div>
          )}

          {(phase === 'playing' || phase === 'reveal') && (
            <motion.div
              key={`q-${index}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {/* Chemistry meter */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-pink-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Chemistry {meterPct}%
                  </span>
                  <span>{index + 1} / {QUESTIONS.length}</span>
                </div>
                <div className="h-3 rounded-full bg-white/70 overflow-hidden border border-pink-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500"
                    animate={{ width: `${meterPct}%` }}
                    transition={{ type: 'spring', stiffness: 120 }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 leading-snug">
                {q.prompt}
              </h2>

              <div className="grid gap-4">
                {q.options.map((opt, i) => {
                  const isPicked = choice === i;
                  const isMatch = phase === 'reveal' && isPicked && partnerChoice === i;
                  const isChem = phase === 'reveal' && i === q.chemistry;
                  return (
                    <button
                      key={i}
                      disabled={phase === 'reveal'}
                      onClick={() => setChoice(i)}
                      className={`relative text-left rounded-2xl p-5 text-lg font-semibold transition-all border-2 ${
                        isPicked
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg scale-[1.02]'
                          : 'bg-white/80 text-gray-700 border-pink-100 hover:border-pink-300 hover:scale-[1.01]'
                      } ${phase === 'reveal' && !isPicked ? 'opacity-50' : ''}`}
                    >
                      {opt}
                      {isChem && phase === 'reveal' && (
                        <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-[10px] font-black rounded-full px-2 py-1 shadow">
                          CHEMISTRY ✨
                        </span>
                      )}
                      {isMatch && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-lg"
                        >
                          <Check size={16} strokeWidth={3} />
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>

              {phase === 'playing' ? (
                <button
                  onClick={reveal}
                  disabled={choice === null}
                  className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg disabled:opacity-40 transition-all"
                >
                  Reveal our hearts
                </button>
              ) : (
                <div className="mt-6">
                  <div
                    className={`text-center text-lg font-bold mb-4 ${
                      choice === partnerChoice ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {choice === partnerChoice ? (
                      choice === q.chemistry
                        ? '💞 Hearts matched — chemistry +2!'
                        : '💗 Hearts matched — +1'
                    ) : (
                      '😅 Different hearts this time — that’s okay, the meter tells the story'
                    )}
                  </div>
                  <button
                    onClick={next}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg shadow-lg"
                  >
                    {index + 1 >= QUESTIONS.length ? 'See our result' : 'Next question'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-10"
            >
              <div className="text-7xl mb-4">{meterPct >= 75 ? '💞' : meterPct >= 50 ? '💕' : '🌱'}</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {meterPct >= 75 ? 'In sync' : meterPct >= 50 ? 'Growing together' : 'Just getting started'}
              </h1>
              <p className="text-gray-600 mb-2">
                {matches} of {QUESTIONS.length} hearts matched · {meterPct}% chemistry
              </p>
              <p className="text-sm text-gray-400 mb-8">
                No score to lose here — only a meter that says: you two know each other.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={start}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-2xl font-bold shadow hover:scale-105 transition-transform"
                >
                  <RotateCcw size={18} /> Play again
                </button>
                <Link
                  href="/our-story"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  <Heart size={18} /> Save to Our Story
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12">
          <GameSharePanel gameSlug="love_duo_quiz" />
        </div>
      </div>
    </div>
  );
}
