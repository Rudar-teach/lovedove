'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const STORIES = [
  { title: 'The Proposal', sequence: ['💍', '💬', '😭', '😍', '💍', '👰', '💒'], emoji: '💒' },
  { title: 'Date Night', sequence: ['💕', '💇', '🍝', '🎭', '😊', '💋', '🏠'], emoji: '🌃' },
  { title: 'A Dream Vacation', sequence: ['✈️', '🏖️', '🌊', '🍹', '🌅', '🤸', '🌅'], emoji: '🏝️' },
  { title: 'Cozy Night In', sequence: ['🏠', '🧸', '🍿', '📺', '😴', '💑', '😴'], emoji: '🛋️' },
  { title: 'Our Future', sequence: ['👶', '🏡', '🐕', '🎂', '🎉', '👨‍👩‍👦', '❤️'], emoji: '🌟' },
];

export default function EmojiStoryPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'picking' | 'guessing' | 'finished'>('idle');
  const [storyIndex, setStoryIndex] = useState(0);
  const [target, setTarget] = useState<string[]>([]);
  const [guess, setGuess] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(0);

  const start = () => {
    setScore(0);
    setHints(0);
    setState('picking');
  };

  const pickStory = () => {
    const s = STORIES[Math.floor(Math.random() * STORIES.length)];
    setStoryIndex(STORIES.indexOf(s));
    setTarget(s.sequence);
    setGuess(new Array(s.sequence.length).fill(''));
    setState('guessing');
  };

  const EMOJI_POOL = ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💓', '💋', '😘', '😍', '🥰', '😊', '☕', '🍝', '🎁', '🏠', '🌅', '🌟', '💍'];

  const place = (idx: number) => {
    if (state !== 'guessing') return;
    const emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    const updated = [...guess];
    updated[idx] = emoji;
    setGuess(updated);
  };

  const clearSlot = (idx: number) => {
    const updated = [...guess];
    updated[idx] = '';
    setGuess(updated);
  };

  const submit = () => {
    let s = 0;
    guess.forEach((g, i) => {
      if (g === target[i]) s += 20;
    });
    setScore((x) => x + s);
    setState('finished');
  };

  const current = STORIES[storyIndex];

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-8xl mb-6">📖</div>
            <h1 className="text-5xl font-bold text-white mb-4">Emoji Story</h1>
            <p className="text-white/80 mb-8 text-lg">Guess the correct emoji for each part of the love story. Match the sequence to score.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Story
            </button>
          </motion.div>
        )}

        {state === 'picking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center mt-10">
            <h2 className="text-3xl font-bold text-white mb-2">Choose a Story</h2>
            <p className="text-white/70 mb-6">Score: {score} | Hints used: {hints}</p>
            <div className="grid gap-3">
              {STORIES.map((s, i) => (
                <button key={i} onClick={() => { setStoryIndex(i); setTarget(s.sequence); setGuess(new Array(s.sequence.length).fill('')); setState('guessing'); }} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-5 text-left">
                  <span className="text-2xl mr-2">{s.emoji}</span>
                  <span className="text-white font-semibold text-lg">{s.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'guessing' && current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">{current.emoji} {current.title}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4 text-center">Fill in the emoji story:</h3>
              <div className="flex gap-2 justify-center flex-wrap mb-4">
                {target.map((_, i) => (
                  <button key={i} onClick={() => place(i)} className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-2xl transition-all">
                    {guess[i] || '+'}
                  </button>
                ))}
              </div>
              <p className="text-white/60 text-center text-sm">Click a slot, then it fills with a random love emoji. Match the target!</p>
            </div>
            <button onClick={submit} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold mb-6">
              Submit Story
            </button>
            {state === 'finished' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">Target Story:</h3>
                <div className="flex gap-2 justify-center mb-4">
                  {target.map((e, i) => <span key={i} className="text-4xl">{e}</span>)}
                </div>
                <h3 className="text-white font-semibold mb-2">Your Story:</h3>
                <div className="flex gap-2 justify-center">
                  {guess.map((e, i) => <span key={i} className="text-4xl">{e}</span>)}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center mt-8">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Story Told!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-purple-300">{score}</div>
              <div className="text-white/80 mt-2">Total Score</div>
              <p className="mt-6 text-white/80 italic">"An emoji says a thousand words — your story is priceless."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> New Story
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}