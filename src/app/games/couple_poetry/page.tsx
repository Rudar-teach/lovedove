'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Feather } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const POEM_TEMPLATES = [
  { name: 'Acrostic', emoji: '🔤', desc: 'Use your name as the first letter of each line' },
  { name: 'Haiku', emoji: '🌸', desc: '5-7-5 syllable structure' },
  { name: 'Free Verse', emoji: '🕊️', desc: 'Write from the soul, no rules' },
  { name: 'Cinquain', emoji: '🎋', desc: '5 lines, 2-4-6-8-2 syllables' },
  { name: 'Rhyming', emoji: '🎵', desc: 'Lines that end in rhyme' },
  { name: 'Sonnet', emoji: '📜', desc: '14 lines of love' },
];

const SAMPLE_LINES = [
  'Your smile outshines the morning sun',
  'In your eyes I see forever',
  'Every heartbeat whispers your name',
  'You are the poem I could never write',
  'Two souls entwined as one',
  'Love is the language we both speak',
];

const STYLES = ['Romantic 💕', 'Playful 😄', 'Deep 🌌', 'Whimsical ✨'];

export default function CouplePoetryPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'choosing' | 'writing' | 'finished'>('idle');
  const [template, setTemplate] = useState<typeof POEM_TEMPLATES[0] | null>(null);
  const [style, setStyle] = useState(STYLES[0]);
  const [name, setName] = useState('');
  const [lines, setLines] = useState<string[]>(['', '', '', '']);
  const [score, setScore] = useState(0);
  const [poems, setPoems] = useState(0);

  const start = () => {
    setScore(0);
    setPoems(0);
    setTemplate(null);
    setState('choosing');
  };

  const chooseTemplate = (t: typeof POEM_TEMPLATES[0]) => {
    setTemplate(t);
    const target = t.name === 'Haiku' ? 3 : t.name === 'Cinquain' ? 5 : t.name === 'Sonnet' ? 14 : 4;
    setLines(new Array(target).fill(''));
    setState('writing');
  };

  const updateLine = (i: number, val: string) => {
    const updated = [...lines];
    updated[i] = val;
    setLines(updated);
  };

  const submit = () => {
    const filled = lines.filter((l) => l.trim().length > 3).length;
    let s = filled * 10;
    const fullText = lines.join(' ');
    if (/love|heart|forever|kiss|soul|darling/i.test(fullText)) s += 25;
    setScore((sc) => sc + s);
    setPoems((p) => p + 1);
    setState('finished');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Feather className="w-20 h-20 text-amber-300 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Couple Poetry</h1>
            <p className="text-white/80 mb-8 text-lg">Write love poems together in beautiful styles. Choose a form, set a tone, weave your words.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Begin Poem
            </button>
          </motion.div>
        )}

        {state === 'choosing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto mt-8">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Choose a Poetry Form</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {POEM_TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => chooseTemplate(t)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 text-left transition-all hover:scale-105">
                  <div className="text-3xl mb-2">{t.emoji}</div>
                  <div className="text-xl font-bold text-white">{t.name}</div>
                  <div className="text-white/70 text-sm mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Whose name inspires you?"
                className="bg-white/10 text-white placeholder-white/50 rounded-2xl px-4 py-3 outline-none w-64 text-center"
              />
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {STYLES.map((s) => (
                  <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-full text-sm ${style === s ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white' : 'bg-white/10 text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {state === 'writing' && template && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">{template.emoji} {template.name}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Style: {style}</span>
            </div>
            <div className="bg-amber-50/95 text-gray-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-2xl font-serif font-bold text-rose-700 mb-2 text-center">"{name || 'Love'}"</h3>
              <p className="text-center text-rose-500 text-sm mb-4 italic">— a {style.toLowerCase()} {template.name.toLowerCase()}</p>
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <input
                    key={i}
                    value={line}
                    onChange={(e) => updateLine(i, e.target.value)}
                    placeholder={`Line ${i + 1}...`}
                    className="w-full bg-rose-50 rounded-xl px-4 py-3 outline-none font-serif italic"
                  />
                ))}
              </div>
            </div>
            <div className="text-center mt-4 text-white/70 text-sm">Need inspiration?</div>
            <div className="flex flex-wrap gap-2 justify-center my-3">
              {SAMPLE_LINES.slice(0, 3).map((sl, i) => (
                <button key={i} onClick={() => updateLine(i, sl)} className="text-xs bg-white/10 text-white/80 hover:bg-white/20 px-3 py-2 rounded-full">
                  {sl}
                </button>
              ))}
            </div>
            <button onClick={submit} className="w-full mt-2 py-4 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-2xl font-semibold">
              Publish Poem ✨
            </button>
          </motion.div>
        )}

        {state === 'finished' && template && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-amber-50/95 text-gray-800 rounded-3xl p-8 shadow-2xl mb-6">
              <h3 className="text-3xl font-serif font-bold text-rose-700 mb-2 text-center">"{name || 'Love'}"</h3>
              <p className="text-center text-rose-500 text-sm mb-6 italic">— a {style.toLowerCase()} {template.name.toLowerCase()}</p>
              <div className="space-y-2 text-center font-serif italic text-lg text-gray-700">
                {lines.map((l, i) => <p key={i}>{l || '—'}</p>)}
              </div>
            </div>
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-2" />
              <div className="text-white text-xl mb-1">+{score} points</div>
              <div className="text-white/60 text-sm mb-6">{poems} poem{poems !== 1 ? 's' : ''} written</div>
              <div className="flex gap-4 justify-center">
                <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-2xl flex items-center gap-2">
                  <RotateCcw size={18} /> Write Another
                </button>
                <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}