'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: "What's your partner's favorite food?", hint: "Think dinner!" },
  { q: "Where did you first meet?", hint: "A special place" },
  { q: "What's your partner's shoe size?", hint: "A number" },
  { q: "What's your partner's biggest fear?", hint: "Something scary" },
  { q: "What's your partner's dream job?", hint: "Career goals" },
  { q: "What's your favorite song together?", hint: "Music time" },
  { q: "What's your partner's middle name?", hint: "Birth certificate" },
  { q: "What's your partner's favorite season?", hint: "Spring, summer..." },
  { q: "How did your partner say 'I love you' first?", hint: "It was special" },
  { q: "What's your partner's go-to comfort food?", hint: "When sad" },
  { q: "What's your partner's pet peeve?", hint: "What annoys them" },
  { q: "What's your partner's dream vacation?", hint: "Beach or mountains?" },
];

export default function WordChainPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [chain, setChain] = useState<string[]>(['love']);
  const [input, setInput] = useState('');
  const [turn, setTurn] = useState<'your' | 'partner'>('your');
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(5);

  const validWords: Record<string, string[]> = {
    e: ['echo', 'ever', 'every'], s: ['star', 'soul', 'sun'], t: ['together', 'trust', 'true'],
    r: ['romance', 'rose', 'ring'], a: ['always', 'angel', 'adore'], m: ['marry', 'moon', 'me'],
    o: ['only', 'one', 'open'], v: ['very', 'valentine'], l: ['love', 'life', 'light'],
    n: ['now', 'never', 'nice'], y: ['you', 'yes', 'yearn'], g: ['girl', 'gift', 'gaze'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const lastWord = chain[chain.length - 1];
    const word = input.trim().toLowerCase();

    if (!word || word.length < 3) { setError('Word must be at least 3 letters'); return; }
    if (word[0] !== lastWord[lastWord.length - 1]) {
      setError(`Word must start with "${lastWord[lastWord.length - 1].toUpperCase()}"`);
      return;
    }
    if (chain.includes(word)) { setError('Word already used!'); return; }

    setScore(s => s + word.length);
    setChain(c => [...c, word]);
    setInput('');
    setTurn('partner');
    setRound(r => r + 1);

    setTimeout(() => {
      const lastChar = word[word.length - 1];
      const partners = validWords[lastChar] || [];
      const available = partners.filter(w => !chain.includes(w) && w !== word);
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)];
        setChain(c => [...c, pick]);
        setScore(s => s + pick.length);
      } else {
        setError('Partner can\'t continue! You win this round!');
      }
      setTurn('your');
    }, 1500);
  };

  const nextRound = () => {
    setChain(['love']);
    setInput('');
    setTurn('your');
    setError('');
    setRound(0);
    setScore(0);
    if (Math.random() > 0.5) setTurn('partner');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-3xl font-display font-black gradient-text-animated flex items-center gap-2"><Heart className="w-6 h-6 text-rose-500" /> Word Chain</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🔗</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Word Chain</h2>
                  <p className="text-gray-600">Build a chain of romantic words! Each word starts with the last letter of the previous one.</p>
                  <p className="text-sm text-pink-500 font-medium">Score = sum of all word lengths!</p>
                  <Button onClick={() => setPhase('playing')} variant="primary" size="lg" className="w-full">Start Chain 🔗</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center mb-4 text-gray-600">{turn === 'your' ? '✨ Your turn!' : '💭 Partner is thinking...'}</p>

              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8 mb-6">
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {chain.map((word, i) => (
                      <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`px-3 py-2 rounded-full font-bold text-base ${i % 2 === 0 ? 'bg-pink-100 text-pink-700' : 'bg-rose-100 text-rose-700'}`}>
                        {word}{i < chain.length - 1 && <span className="ml-1 text-gray-400">→</span>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TiltCard>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} disabled={turn === 'partner'} placeholder={`Enter a word starting with "${chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}"`}
                  className="w-full text-center text-lg font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" autoFocus />
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={turn === 'partner'} variant="primary" className="flex-1">Submit Word</Button>
                  <Button type="button" onClick={nextRound} variant="outline">New Chain</Button>
                </div>
              </form>

              <div className="flex justify-center gap-4 mt-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-bold text-primary-600">{score}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Chain Length</p>
                  <p className="text-xl font-bold text-gray-800">{chain.length}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
