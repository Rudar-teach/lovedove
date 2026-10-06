'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type StoryPart = { text: string; options: { label: string; value: number }[]; result: { text: string; score: number } };

const STORY_PARTS: StoryPart[] = [
  {
    text: 'You and your partner are planning a weekend getaway. Where do you want to go?',
    options: [
      { label: 'A cozy cabin in the mountains 🏔️', value: 1 },
      { label: 'A beachfront resort 🏖️', value: 2 },
      { label: 'A romantic city break 🌆', value: 3 },
    ],
    result: { text: 'You both chose the perfect escape! Your bond grows stronger.', score: 10 },
  },
  {
    text: 'It\'s your anniversary. What surprise does your partner have planned?',
    options: [
      { label: 'A candlelit dinner at home 🕯️', value: 1 },
      { label: 'A surprise trip to Paris 🇫🇷', value: 2 },
      { label: 'A handwritten love letter + stargazing ✨', value: 3 },
    ],
    result: { text: 'The surprise melts your heart. Love is in the air!', score: 15 },
  },
  {
    text: 'You find a mysterious box in your closet. What\'s inside?',
    options: [
      { label: 'Old love notes from school 💌', value: 1 },
      { label: 'A photo album of your journey 📸', value: 2 },
      { label: 'A key to a secret garden 🌿', value: 3 },
    ],
    result: { text: 'Memories unlocked! Your love story deepens.', score: 10 },
  },
  {
    text: 'A storm traps you both inside. What do you do?',
    options: [
      { label: 'Build a blanket fort 🏕️', value: 1 },
      { label: 'Dance to your favorite songs 💃', value: 2 },
      { label: 'Tell ghost stories by candlelight 👻', value: 3 },
    ],
    result: { text: 'Best storm ever! Laughter and warmth fill the room.', score: 10 },
  },
  {
    text: 'You wake up to find...',
    options: [
      { label: 'Breakfast in bed 🍳', value: 1 },
      { label: 'A surprise serenade 🎵', value: 2 },
      { label: 'A sunrise walk invitation 🌅', value: 3 },
    ],
    result: { text: 'This is what true love feels like. Pure magic.', score: 15 },
  },
];

const ROMANCE_ADJECTIVES = ['sweet', 'tender', 'devoted', 'passionate', 'affectionate', 'warm', 'gentle', 'loving'];
const ROMANCE_NOUNS = ['embrace', 'whisper', 'promise', 'heartbeat', 'kiss', 'glance', 'smile', 'touch'];

export default function CoupleStoryPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [story, setStory] = useState<string[]>([]);

  const startGame = () => {
    setRound(0);
    setScore(0);
    setChoices([]);
    setStory([]);
    setPhase('playing');
  };

  const makeChoice = (val: number) => {
    setChoices(prev => [...prev, val]);
    const part = STORY_PARTS[round];
    const adj = ROMANCE_ADJECTIVES[Math.floor(Math.random() * ROMANCE_ADJECTIVES.length)];
    const noun = ROMANCE_NOUNS[Math.floor(Math.random() * ROMANCE_NOUNS.length)];
    setStory(prev => [...prev, `${part.result.text} (${adj} ${noun})`]);
    setScore(s => s + part.result.score);

    if (round < STORY_PARTS.length - 1) {
      setTimeout(() => setRound(r => r + 1), 600);
    } else {
      setTimeout(() => setScore(s => s + 25), 600);
      setTimeout(() => setPhase('finished'), 800);
    }
  };

  const currentPart = STORY_PARTS[round];

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
                <div className="text-6xl mb-4">📖</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Our Love Story</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Build your own romantic tale by making choices together. Each choice adds a beautiful chapter to your love story!</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Story Chapters</h3>
                  <div className="space-y-2">
                    {STORY_PARTS.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-rose-50 p-2 rounded-lg">
                        <span className="text-xl">📝</span>
                        <span className="text-sm text-rose-700">{p.text.substring(0, 50)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Begin Our Story
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentPart && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">Chapter {round + 1}/{STORY_PARTS.length}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <h2 className="text-2xl font-bold text-rose-700 mb-4">{currentPart.text}</h2>
                  <div className="space-y-3">
                    {currentPart.options.map(opt => (
                      <button key={opt.value} onClick={() => makeChoice(opt.value)} className="w-full bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 rounded-xl p-4 text-left font-medium text-rose-700 hover:border-rose-400 transition">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {story.length > 0 && (
                  <div className="bg-pink-50 rounded-xl p-4">
                    <h3 className="font-semibold text-pink-700 mb-2">Your Story So Far:</h3>
                    <div className="space-y-1">
                      {story.map((s, i) => (
                        <p key={i} className="text-sm text-pink-600">📖 {s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Your Love Story</h2>
                <div className="text-left bg-rose-50 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
                  {story.map((s, i) => (
                    <p key={i} className="text-sm text-rose-700 mb-1">📖 Chapter {i + 1}: {s}</p>
                  ))}
                  {choices.length === STORY_PARTS.length && (
                    <p className="text-sm text-pink-700 font-semibold mt-2">And they lived happily ever after... 💕</p>
                  )}
                </div>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Write New Story
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
