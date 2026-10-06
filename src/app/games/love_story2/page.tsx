'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, BookOpen } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const STORY_PARTS = [
  {
    title: "The Beginning",
    parts: [
      "Once upon a time, in a {0} little town, there lived two souls named {1}.",
      "It all started on a {2} day when {3} first laid eyes on {4}.",
      "The moment they met, it felt like {5} in the air.",
    ],
    blanks: ['adjective', 'name', 'adjective', 'name', 'name', 'noun'],
  },
  {
    title: "The Journey",
    parts: [
      "Together, they {0}ed through the {1} seasons of life.",
      "Their love grew stronger with every {2} they shared.",
      "They built a world where {3} was the only language.",
    ],
    blanks: ['verb', 'adjective', 'noun', 'noun'],
  },
  {
    title: "The Adventure",
    parts: [
      "One day, they decided to {0} to a faraway {1}.",
      "Along the way, they discovered the secret to {2}.",
      "The journey taught them that love is the greatest {3} of all.",
    ],
    blanks: ['verb', 'place', 'noun', 'noun'],
  },
];

const PLACEHOLDER_TEXT: Record<string, string> = {
  adjective: 'an adjective (e.g. magical, cozy)',
  name: 'a name',
  verb: 'a verb (e.g. dance, travel)',
  noun: 'a noun (e.g. adventure, treasure)',
  place: 'a place (e.g. Paris, Bali)',
};

export default function LoveStory2() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'writing' | 'reading' | 'finished'>('idle');
  const [partIdx, setPartIdx] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);

  const startGame = () => {
    setPartIdx(0);
    setInputs([]);
    setStories([]);
    setGameState('writing');
  };

  const currentPart = STORY_PARTS[partIdx];

  const handleInput = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const allFilled = currentPart.blanks.every((_, i) => inputs[i]?.trim());

  const buildStory = (): string => {
    const text = currentPart.parts.join(' ');
    let result = text;
    inputs.forEach((val, i) => {
      result = result.replace(`{${i}}`, val || `[???]`);
    });
    return result;
  };

  const submitPart = () => {
    setStories(prev => [...prev, buildStory()]);
    if (partIdx < STORY_PARTS.length - 1) {
      setPartIdx(i => i + 1);
      setInputs([]);
    } else {
      setGameState('reading');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">📚</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Story Builder 2</h1>
              <p className="text-gray-600 mb-8 text-lg">Write your own unique love story chapter by chapter!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><BookOpen className="w-5 h-5 inline mr-2" /> Start Story</button>
            </motion.div>
          )}
          {gameState === 'writing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">Chapter {partIdx + 1}: {currentPart.title}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${((partIdx + 1) / STORY_PARTS.length) * 100}%` }} />
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{currentPart.title}</h3>
                {currentPart.blanks.map((blank, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i + 1}. Enter {PLACEHOLDER_TEXT[blank]}:
                    </label>
                    <input
                      type="text"
                      value={inputs[i] || ''}
                      onChange={e => handleInput(i, e.target.value)}
                      placeholder={PLACEHOLDER_TEXT[blank]}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none bg-white/80"
                    />
                  </motion.div>
                ))}
                <button onClick={submitPart} disabled={!allFilled} className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold disabled:opacity-50">
                  {partIdx < STORY_PARTS.length - 1 ? 'Next Chapter →' : 'Finish Story ✨'}
                </button>
              </div>
            </motion.div>
          )}
          {gameState === 'reading' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-5xl mb-6">📖</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-8">Your Love Story</h2>
              <div className="space-y-6 mb-8 text-left">
                {stories.map((story, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-100/60">
                    <h3 className="font-bold text-amber-600 mb-2">Chapter {i + 1}: {STORY_PARTS[i]?.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{story}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setGameState('finished')} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold">The End 🎉</button>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">The End!</h2>
              <p className="text-gray-600 mb-8">What a beautiful love story you wrote!</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> New Story</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
