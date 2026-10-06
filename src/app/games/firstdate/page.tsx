'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const SCENARIOS = [
  { scene: 'The Meet-Cute', desc: 'Imagine how you first met in a magical place...', emoji: '☕' },
  { scene: 'First Date', desc: 'Describe the very first date you went on together...', emoji: '🍽️' },
  { scene: 'The Big Question', desc: 'Recreate the moment one of you asked the other out...', emoji: '💭' },
  { scene: 'I Love You', desc: 'Describe when you first said those three words...', emoji: '💬' },
  { scene: 'Future Together', desc: 'Paint a picture of your life together in 5 years...', emoji: '🏡' },
  { scene: 'Dream Vacation', desc: 'Where do you want to go on your first vacation?', emoji: '✈️' },
  { scene: 'Home Cooking', desc: 'What does your perfect Sunday brunch look like?', emoji: '🍳' },
  { scene: 'Anniversary', desc: 'How would you celebrate your 50th anniversary?', emoji: '💍' },
  { scene: 'Next Adventure', desc: 'Describe your next adventure together...', emoji: '🧭' },
  { scene: 'The Proposal', desc: 'Write the perfect proposal story for your future...', emoji: '💍' },
];

const QUESTIONS = [
  'Who?',
  'Where?',
  'What happened?',
  'What did you say?',
  'How did it feel?',
  'What happened next?',
  'The best part was...',
  'Looking back...',
];

export default function FirstDatePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [score, setScore] = useState(0);

  const start = () => {
    setSceneIndex(0);
    setAnswers({});
    setScore(0);
    setState('playing');
  };

  const setAnswer = (key: string, val: string) => {
    setAnswers((a) => ({ ...a, [key]: val }));
  };

  const nextScene = () => {
    const scene = SCENARIOS[sceneIndex];
    const answered = QUESTIONS.filter((q) => answers[q]).length;
    setScore((s) => s + answered * 10);
    if (sceneIndex + 1 >= SCENARIOS.length) setState('finished');
    else setSceneIndex((i) => i + 1);
  };

  const current = SCENARIOS[sceneIndex];

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-8xl mb-6">💕</div>
            <h1 className="text-5xl font-bold text-white mb-4">First Date</h1>
            <p className="text-white/80 mb-8 text-lg">Relive and recreate the magic of your first date, one scene at a time.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Relive the Magic
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div key={sceneIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Scene {sceneIndex + 1}/{SCENARIOS.length}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="bg-gradient-to-br from-rose-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl p-6 mb-6 border border-rose-300/40">
              <div className="text-5xl mb-2 text-center">{current.emoji}</div>
              <h2 className="text-2xl font-bold text-white mb-1">{current.scene}</h2>
              <p className="text-white/70 italic text-center">{current.desc}</p>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="font-bold text-rose-600 mb-4">Fill in the blanks:</h3>
              <div className="space-y-4">
                {QUESTIONS.map((q) => (
                  <div key={q}>
                    <label className="block text-gray-700 font-semibold text-sm mb-1">{q}</label>
                    <input
                      value={answers[q] || ''}
                      onChange={(e) => setAnswer(q, e.target.value)}
                      className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none"
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={nextScene} className="w-full mt-4 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold">
              {sceneIndex + 1 >= SCENARIOS.length ? 'See Our Story ✨' : 'Next Scene →'}
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Your Love Story</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-rose-300">{score}</div>
              <div className="text-white/80 mt-2">Story Score</div>
              <p className="mt-6 text-white/80 italic">"Every love story is beautiful, but yours is our favorite."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Retell the Story
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}