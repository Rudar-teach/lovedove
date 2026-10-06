'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const STARTERS = [
  { line: 'Every morning I wake up grateful for you.', emoji: '🌅' },
  { line: 'You make ordinary days feel like magic.', emoji: '✨' },
  { line: 'My favorite place is next to you.', emoji: '🏡' },
  { line: 'I fall in love with you a little more each day.', emoji: '💕' },
  { line: 'You are my today and all of my tomorrows.', emoji: '🌹' },
  { line: 'In a world of chaos, you are my peace.', emoji: '🕊️' },
];

const TONES = ['Sweet 💗', 'Passionate 🔥', 'Funny 😄', 'Poetic 📜', 'Adventurous 🌍'];

export default function LoveLettersPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'picking' | 'writing' | 'finished'>('idle');
  const [starter, setStarter] = useState<typeof STARTERS[0] | null>(null);
  const [tone, setTone] = useState(TONES[0]);
  const [letter, setLetter] = useState('');
  const [score, setScore] = useState(0);
  const [sent, setSent] = useState(0);

  const start = () => {
    setScore(0);
    setSent(0);
    setState('picking');
  };

  const pickStarter = () => {
    const s = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setStarter(s);
    setLetter(s.line);
    setState('writing');
  };

  const send = () => {
    let s = 10 + letter.length / 4;
    if (/love|heart|forever|kiss|darling/i.test(letter)) s += 20;
    s = Math.round(s);
    setScore((sc) => sc + s);
    setSent((x) => x + 1);
    setStarter(null);
    setLetter('');
    setState('picking');
  };

  const finish = () => setState('finished');

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-8xl mb-6">✉️</div>
            <h1 className="text-5xl font-bold text-white mb-4">Love Letters Express</h1>
            <p className="text-white/80 mb-8 text-lg">Send quick love letters to your sweetheart. Choose a starter, set a tone, pour your heart out.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Writing
            </button>
          </motion.div>
        )}

        {state === 'picking' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center mt-10">
            <div className="text-white/80 mb-6">Sent: {sent} • Score: {score}</div>
            <h2 className="text-3xl font-bold text-white mb-6">Choose a Tone</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tone === t ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={pickStarter} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold">
              Draw a Starter ✨
            </button>
            <div className="mt-6">
              <button onClick={finish} className="text-white/60 hover:text-white underline text-sm">End session</button>
            </div>
          </motion.div>
        )}

        {state === 'writing' && starter && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Tone: {tone}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-3xl p-8 shadow-2xl">
              <div className="text-3xl mb-2">{starter.emoji}</div>
              <p className="italic text-rose-600 border-l-4 border-rose-400 pl-3 mb-4">{starter.line}</p>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={8}
                className="w-full bg-rose-50 text-gray-800 rounded-2xl p-4 outline-none resize-none"
                placeholder="Continue the love letter..."
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">{letter.length} characters</span>
                <Heart className="text-rose-500" fill="currentColor" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={send} className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2">
                <Send size={18} /> Send Letter
              </button>
              <button onClick={() => setState('picking')} className="px-6 py-4 bg-white/20 text-white rounded-2xl">Cancel</button>
            </div>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Letters Delivered!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-rose-300">{score}</div>
              <div className="text-white/80 mt-2">Total Score</div>
              <div className="text-white/60 mt-2">{sent} letters sent</div>
              <p className="mt-6 text-white/80 italic">"Every letter is a small piece of forever."</p>
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