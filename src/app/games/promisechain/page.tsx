'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Link2, Send } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SUGGESTED = [
  "I promise to always listen when you need to talk",
  "I promise to surprise you once a month",
  "I promise to remember the little things about you",
  "I promise to always celebrate your wins",
  "I promise to hold your hand through hard times",
  "I promise to say 'I love you' often",
  "I promise to plan at least one date a week",
  "I promise to be patient when things are tough",
  "I promise to dance with you in the kitchen",
  "I promise to always be your biggest fan",
  "I promise to take care of you when you're sick",
  "I promise to make you laugh every day",
  "I promise to never go to bed angry",
  "I promise to remember your favorite things",
  "I promise to keep choosing you, every day",
];

type Phase = 'start' | 'add' | 'read' | 'chain';

export default function PromiseChainPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [promises, setPromises] = useState<{ from: string; to: string; text: string }[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const addPromise = () => {
    if (!from.trim() || !to.trim() || !text.trim()) return;
    setPromises(p => [...p, { from, to, text }]);
    setFrom('');
    setTo('');
    setText('');
    setSuggestion('');
  };

  const removePromise = (i: number) => setPromises(p => p.filter((_, idx) => idx !== i));

  const reset = () => { setPromises([]); setPhase('start'); };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Link2 className="w-5 h-5 text-rose-500" /> Promise Chain
            </h1>
            <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">⛓️</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Promise Chain</h2>
                    <p className="text-gray-600">Each of you writes promises to the other. Build a beautiful chain of love and commitment together.</p>
                    <div className="bg-pink-50 rounded-2xl p-4 text-left text-sm text-pink-700">
                      <p className="font-bold mb-1">How to play:</p>
                      <p>1. Player 1 writes a promise</p>
                      <p>2. Player 2 writes a promise</p>
                      <p>3. Keep going — build your chain!</p>
                    </div>
                    <Button onClick={() => setPhase('add')} variant="primary" size="lg" className="w-full">Start Chain 💕</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'add' && (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.05)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-3">
                    <h3 className="font-bold text-gray-800 text-center">Write a Promise</h3>
                    <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From (e.g. Alex)"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <input value={to} onChange={e => setTo(e.target.value)} placeholder="To (e.g. Sam)"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="I promise to..."
                      rows={3} className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-pink-400 outline-none resize-none text-sm" />
                    <Button onClick={addPromise} variant="primary" className="w-full">
                      <Send className="w-4 h-4 mr-2" /> Add Promise
                    </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Need inspiration?</p>
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED.slice(0, 6).map((s, i) => (
                          <button key={i} onClick={() => setSuggestion(s)} className="text-[10px] px-2 py-1 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100">
                            {s.split(' ').slice(0, 3).join(' ')}...
                          </button>
                        ))}
                      </div>
                    </div>
                    {suggestion && (
                      <Button onClick={() => { setText(suggestion); setSuggestion(''); }} variant="outline" size="sm" className="w-full">
                        Use: "{suggestion.slice(0, 30)}..."
                      </Button>
                    )}
                  </div>
                </TiltCard>
                {promises.length > 0 && (
                  <Button onClick={() => setPhase('chain')} variant="primary" size="lg" className="w-full mt-4">
                    View Chain 🔗
                  </Button>
                )}
              </motion.div>
            )}

            {phase === 'chain' && (
              <motion.div key="chain" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-5xl">⛓️</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Your Promise Chain</h2>
                    <p className="text-gray-600">{promises.length} promises linking you together</p>
                  </div>
                </TiltCard>
                <div className="space-y-2 mt-4">
                  {promises.map((p, i) => (
                    <div key={i} className="relative p-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60">
                      {i > 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🔗</div>}
                      <div className="flex items-start gap-3">
                        <div className="text-center">
                          <div className="text-2xl">💌</div>
                          <p className="text-xs font-bold text-gray-600">{p.from}</p>
                          <p className="text-xs text-gray-400">→</p>
                          <p className="text-xs font-bold text-gray-600">{p.to}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 italic">"{p.text}"</p>
                        </div>
                        <button onClick={() => removePromise(i)} className="text-red-300 hover:text-red-500 text-xs">×</button>
                      </div>
                    </div>
                  ))}
                </div>
                {promises.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No promises yet. Start your chain!</p>
                  </div>
                )}
                <Button onClick={() => setPhase('add')} variant="primary" className="w-full mt-4">Add More Promises 💕</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
