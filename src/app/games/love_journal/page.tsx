'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, BookOpen, Smile } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const PROMPTS = {
  gratitude: [
    "Name one thing your partner did today that made you smile.",
    "What is a quality of your partner you're grateful for?",
    "What's a small moment together you treasure?",
    "What does your partner bring to your life that nobody else does?",
    "What's a challenge you faced together that made you stronger?",
    "What's something your partner sacrificed for you?",
    "What habit of your partner secretly makes you happy?",
    "What do you appreciate most about your relationship?",
    "When did your partner last make you feel truly seen?",
    "What's a lesson you've learned from this relationship?",
  ],
  reflection: [
    "How did I show love today?",
    "When did I feel most connected to my partner today?",
    "What was a difficult moment and how did we handle it?",
    "What do I want to improve in how I show up?",
    "What made me feel loved this week?",
    "Did I miss an opportunity to be kinder?",
    "What's one thing I want more of in our relationship?",
    "How has my partner grown recently?",
    "What boundaries do I need to communicate?",
    "Am I spending enough quality time together?",
  ],
  appreciation: [
    "I love how you...",
    "I feel most connected when we...",
    "I appreciate your...",
    "You make me feel...",
    "One thing I want to do more of with you is...",
    "I'm proud of us for...",
    "What I admire most about you is...",
    "Thank you for...",
    "I love our tradition of...",
    "I feel safe when you...",
  ],
};

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
  { emoji: '😌', label: 'Peaceful', color: 'bg-blue-100 border-blue-300' },
  { emoji: '💕', label: 'Loving', color: 'bg-pink-100 border-pink-300' },
  { emoji: '🥰', label: 'Grateful', color: 'bg-purple-100 border-purple-300' },
  { emoji: '🤗', label: 'Cuddly', color: 'bg-orange-100 border-orange-300' },
  { emoji: '🥺', label: 'Vulnerable', color: 'bg-indigo-100 border-indigo-300' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-red-100 border-red-300' },
  { emoji: '🥺', label: 'Needy', color: 'bg-teal-100 border-teal-300' },
];

type PromptType = 'gratitude' | 'reflection' | 'appreciation';
type Phase = 'mood' | 'write' | 'entries' | 'insights';

export default function LoveJournalEnhanced() {
  const [phase, setPhase] = useState<Phase>('mood');
  const [entries, setEntries] = useState<{ text: string; mood: typeof MOODS[0]; date: string; type: PromptType }[]>([]);
  const [mood, setMood] = useState<typeof MOODS[0] | null>(null);
  const [promptType, setPromptType] = useState<PromptType>('gratitude');
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('love-journal-entries');
    if (saved) { try { setEntries(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (entries.length > 0) localStorage.setItem('love-journal-entries', JSON.stringify(entries));
  }, [entries]);

  const getPrompt = () => {
    const pool = PROMPTS[promptType];
    setPrompt(pool[Math.floor(Math.random() * pool.length)]);
  };

  useEffect(() => { if (phase === 'write') getPrompt(); }, [phase, promptType]);

  const saveEntry = () => {
    if (!text.trim()) return;
    setEntries(e => [...e, { text, mood: mood!, date: new Date().toLocaleDateString(), type: promptType }]);
    setText('');
    setMood(null);
    setPhase('entries');
  };

  const moodDistribution = entries.length === 0 ? [] :
    Object.entries(entries.reduce<Record<string, number>>((acc, e) => { acc[e.mood.label] = (acc[e.mood.label] || 0) + 1; return acc; }, {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <BookOpen className="w-5 h-5 text-rose-500" /> Love Journal
            </h1>
            <button onClick={() => setPhase('mood')} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'mood' && (
              <motion.div key="mood" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">📔</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">How are you feeling?</h2>
                    <p className="text-gray-600">Check in with your emotions before writing.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {MOODS.map(m => (
                        <button key={m.label} onClick={() => { setMood(m); setPhase('write'); }}
                          className={`p-3 rounded-2xl text-center border-2 transition-all hover:scale-105 ${m.color}`}>
                          <span className="text-2xl block">{m.emoji}</span>
                          <span className="text-[10px] font-bold text-gray-700">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TiltCard>
                {entries.length > 0 && (
                  <Button onClick={() => setPhase('entries')} variant="outline" className="w-full mt-4">View Past Entries ({entries.length})</Button>
                )}
              </motion.div>
            )}

            {phase === 'write' && (
              <motion.div key="write" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-3">
                  <span className="text-3xl">{mood?.emoji}</span>
                  <span className="text-sm text-gray-600 ml-2">{mood?.label}</span>
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                    <div className="flex gap-2">
                      {(['gratitude', 'reflection', 'appreciation'] as PromptType[]).map(t => (
                        <button key={t} onClick={() => { setPromptType(t); }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                            promptType === t ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {t === 'gratitude' ? '🙏' : t === 'reflection' ? '🤔' : '💌'} {t}
                        </button>
                      ))}
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3">
                      <p className="text-sm text-pink-700 italic">"{prompt}"</p>
                    </div>
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Let your thoughts flow..."
                      rows={5} className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 outline-none resize-none text-sm" />
                    <Button onClick={saveEntry} variant="primary" className="w-full">Save Entry 💕</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'entries' && (
              <motion.div key="entries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {moodDistribution.length > 0 && (
                  <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.05)">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-4">
                      <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2"><Smile className="w-4 h-4 text-pink-500" /> Mood Patterns</h3>
                      <div className="flex gap-2">
                        {moodDistribution.map(([label, count]) => {
                          const m = MOODS.find(m => m.label === label);
                          return (
                            <div key={label} className="flex-1 text-center p-2 rounded-xl bg-gray-50">
                              <span className="text-xl">{m?.emoji}</span>
                              <p className="text-[10px] font-bold text-gray-700">{label}</p>
                              <p className="text-xs text-gray-500">{count}x</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TiltCard>
                )}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {entries.map((e, i) => (
                    <div key={i} className="p-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{e.mood.emoji}</span>
                        <span className="text-xs text-gray-500">{e.date}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-pink-100 rounded-full text-pink-700 capitalize">{e.type}</span>
                      </div>
                      <p className="text-sm text-gray-700">{e.text}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setPhase('mood')} variant="primary" className="w-full mt-4">New Entry 💕</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
