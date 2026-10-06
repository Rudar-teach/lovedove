'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const PROMPTS = [
  { title: 'My Dearest...', body: 'I love the way you', emoji: '💌' },
  { title: 'When I think of you...', body: 'My heart feels', emoji: '💕' },
  { title: 'You are my favorite...', body: 'Because', emoji: '🌹' },
  { title: 'My favorite memory with you...', body: 'Was when we', emoji: '✨' },
  { title: 'If I could give you...', body: 'I would give you', emoji: '🎁' },
  { title: 'I will love you...', body: 'Until', emoji: '💖' },
];

const ENVELOPES = ['from-rose-400 to-pink-500', 'from-pink-500 to-fuchsia-500', 'from-fuchsia-500 to-purple-500', 'from-red-400 to-rose-500'];

export default function LoveLetterPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'writing' | 'finished'>('idle');
  const [promptIndex, setPromptIndex] = useState(0);
  const [letter, setLetter] = useState('');
  const [score, setScore] = useState(0);
  const [opened, setOpened] = useState(false);

  const start = () => {
    setPromptIndex(0);
    setLetter('');
    setScore(0);
    setOpened(false);
    setState('writing');
  };

  const scoreLetter = () => {
    let s = 0;
    if (letter.length > 20) s += 10;
    if (letter.length > 50) s += 20;
    if (letter.length > 100) s += 30;
    if (/love|heart|kiss|darling|forever/i.test(letter)) s += 15;
    return s;
  };

  const submit = () => {
    setScore((s) => s + scoreLetter());
    if (promptIndex + 1 >= PROMPTS.length) {
      setOpened(true);
      setState('finished');
    } else {
      setPromptIndex((i) => i + 1);
      setLetter('');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-8xl mb-6">💌</div>
            <h1 className="text-5xl font-bold text-white mb-4">Love Letter Studio</h1>
            <p className="text-white/80 mb-8 text-lg">Write romantic love letters guided by heartfelt prompts. Pour your feelings onto the page.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Pencil size={20} /> Begin Writing
            </button>
          </motion.div>
        )}

        {state === 'writing' && (
          <motion.div key={promptIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Prompt {promptIndex + 1}/{PROMPTS.length}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className={`bg-gradient-to-br ${ENVELOPES[promptIndex % ENVELOPES.length]} rounded-3xl p-8 mb-6 shadow-2xl`}>
              <div className="text-5xl mb-2">{PROMPTS[promptIndex].emoji}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{PROMPTS[promptIndex].title}</h2>
              <p className="text-white/90 text-lg italic">"{PROMPTS[promptIndex].body}..."</p>
            </div>
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Pour your heart out..."
              rows={8}
              className="w-full bg-white/95 text-gray-800 rounded-2xl p-5 outline-none resize-none shadow-xl"
            />
            <div className="text-right text-white/60 text-sm mt-2">{letter.length} characters</div>
            <button onClick={submit} className="w-full mt-4 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold text-lg">
              {promptIndex + 1 >= PROMPTS.length ? 'Seal & Send 💌' : 'Save & Next →'}
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Letters Sealed with Love</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-rose-300">{score}</div>
              <div className="text-white/80 mt-2">Total Love Score</div>
              <p className="mt-6 text-white/80 italic">"Words are the voice of the heart. You wrote beautifully."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Write More
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}