'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Wand2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface MadLibsGame {
  title: string;
  emoji: string;
  difficulty: string;
  story: (blanks: string[]) => string;
  blanks: MadLibBlank[];
}

interface MadLibBlank {
  label: string;
  emoji: string;
  value: string;
  type: 'noun' | 'verb' | 'adj' | 'adv' | 'name' | 'place' | 'number' | 'color' | 'food';
}

const GAMES: MadLibsGame[] = [
  {
    title: 'Our Magical Date',
    emoji: '🌃',
    difficulty: 'Easy',
    blanks: [
      { label: 'Adjective', emoji: '✨', value: '', type: 'adj' },
      { label: 'Place', emoji: '🏰', value: '', type: 'place' },
      { label: 'Noun', emoji: '🎁', value: '', type: 'noun' },
      { label: 'Verb', emoji: '🕺', value: '', type: 'verb' },
      { label: 'Body Part', emoji: '❤️', value: '', type: 'noun' },
      { label: 'Food', emoji: '🍫', value: '', type: 'food' },
      { label: 'Number', emoji: '🔢', value: '', type: 'number' },
    ],
    story: (b) => `Tonight, my ${b[0]} date took me to ${b[1]}. They brought me a ${b[2]} and then we started to ${b[3]}. I could feel my ${b[4]} beating faster. For dessert, we shared ${b[5]} and we fell in love ${b[6]} times over. 💕`,
  },
  {
    title: 'Our Proposal',
    emoji: '💍',
    difficulty: 'Medium',
    blanks: [
      { label: 'Place', emoji: '🌅', value: '', type: 'place' },
      { label: 'Adjective', emoji: '💫', value: '', type: 'adj' },
      { label: 'Noun', emoji: '💍', value: '', type: 'noun' },
      { label: 'Verb (ed)', emoji: '🥺', value: '', type: 'verb' },
      { label: 'Flower', emoji: '🌹', value: '', type: 'noun' },
      { label: 'Body Part', emoji: '💧', value: '', type: 'noun' },
      { label: 'Adverb', emoji: '🤞', value: '', type: 'adv' },
    ],
    story: (b) => `At ${b[0]}, under a ${b[1]} sky, I knelt down and offered ${b[2]}. My voice shook as I ${b[3]} my love. A single ${b[4]} petal fell on my shoulder as ${b[5]} filled with tears. I knew they would ${b[6]} say yes. 💖`,
  },
  {
    title: 'The Honeymoon',
    emoji: '✈️',
    difficulty: 'Medium',
    blanks: [
      { label: 'Country', emoji: '🌍', value: '', type: 'place' },
      { label: 'Adjective', emoji: '🏖️', value: '', type: 'adj' },
      { label: 'Noun', emoji: '🍹', value: '', type: 'noun' },
      { label: 'Animal', emoji: '🦋', value: '', type: 'noun' },
      { label: 'Verb', emoji: '💃', value: '', type: 'verb' },
      { label: 'Number', emoji: '📅', value: '', type: 'number' },
    ],
    story: (b) => `We flew to ${b[0]} where the beaches were ${b[1]}. Every morning, we sipped ${b[2]} while ${b[3]}s danced above us. We would ${b[4]} all night long and every day felt like a new adventure. After ${b[5]} days, we never wanted to leave. ✈️`,
  },
];

export default function LoveMadlibsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [gameIdx, setGameIdx] = useState(0);
  const [blankValues, setBlankValues] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [funniest, setFunniest] = useState(0);

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
    setGameIdx(0);
    setBlankValues(Array(GAMES[0].blanks.length).fill(''));
    setScore(0);
    setTimeLeft(60);
    setTimerActive(true);
    setFunniest(0);
    setPhase('playing');
  };

  const currentGame = GAMES[gameIdx];
  const currentBlank = blankValues.findIndex(v => v === '');

  const updateBlank = (i: number, val: string) => {
    setBlankValues(b => { const n = [...b]; n[i] = val; return n; });
  };

  const allFilled = blankValues.every(v => v.trim() !== '');

  const generateStory = () => {
    const pts = blankValues.filter(v => v.trim()).length * 5;
    setScore(s => s + pts);
    setFunniest(f => f + 1);

    if (gameIdx < GAMES.length - 1) {
      const next = gameIdx + 1;
      setGameIdx(next);
      setBlankValues(Array(GAMES[next].blanks.length).fill(''));
      setTimeLeft(60);
    } else {
      setTimerActive(false);
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
                <div className="text-6xl mb-4">📝</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Mad Libs</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Fill in the blanks with romantic words to create hilarious love stories together!</p>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Wand2 className="w-5 h-5" /> Start Mad Libs
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentGame && (
              <motion.div key={gameIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/90 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-2">
                  <span className="text-sm text-rose-500">{currentGame.emoji} {currentGame.title} - {currentGame.difficulty}</span>
                  <span className="text-pink-600 text-sm ml-4">⭐ {score} pts</span>
                </div>

                <h2 className="text-2xl font-bold text-rose-700 mb-6 text-center">{currentGame.title}</h2>

                <div className="space-y-3 max-w-lg mx-auto">
                  {currentGame.blanks.map((blank, i) => (
                    <div key={i} className="flex items-center gap-2 bg-rose-50 rounded-lg p-2">
                      <span className="text-xl">{blank.emoji}</span>
                      <span className="text-sm text-rose-600 w-24">{blank.label}:</span>
                      <input
                        value={blankValues[i]}
                        onChange={e => updateBlank(i, e.target.value)}
                        placeholder={blank.label}
                        className="flex-1 px-3 py-1.5 border border-rose-200 rounded-lg text-sm focus:border-rose-500 focus:outline-none"
                        autoFocus={currentBlank === i}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-4">
                  <button onClick={generateStory} disabled={!allFilled} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50 hover:scale-105 transition">
                    ✨ Generate Story!
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Stories Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-2">{funniest} stories generated</p>
                <p className="text-gray-700 mb-6">{score >= 60 ? 'Master storyteller! 📚' : 'Loved your stories! 💖'}</p>
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
