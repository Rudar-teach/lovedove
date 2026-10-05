'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const VALID_WORDS = ['love', 'angel', 'elegant', 'tasty', 'yes', 'star', 'rose', 'echo', 'orange', 'egg', 'gift'];

export default function WordChainPage() {
  const [chain, setChain] = useState<string[]>(['love']);
  const [input, setInput] = useState('');
  const [turn, setTurn] = useState<'your' | 'partner'>('your');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const lastWord = chain[chain.length - 1];
    const word = input.trim().toLowerCase();

    if (!word) return;
    if (word.length < 3) { setError('Word must be at least 3 letters'); return; }
    if (word[0] !== lastWord[lastWord.length - 1]) {
      setError(`Word must start with "${lastWord[lastWord.length - 1].toUpperCase()}"`);
      return;
    }
    if (chain.includes(word)) { setError('Word already used!'); return; }

    setChain([...chain, word]);
    setInput('');
    setTurn(turn === 'your' ? 'partner' : 'your');

    // Simulate partner response
    setTimeout(() => {
      if (turn === 'partner') {
        setTurn('your');
      } else {
        const lastChar = word[word.length - 1];
        const partnerWord = VALID_WORDS.find(w => w[0] === lastChar && !chain.includes(w) && w !== word);
        if (partnerWord) {
          setChain(c => [...c, partnerWord]);
          setTurn('your');
        }
      }
    }, 1200);
  };

  const restart = () => {
    setChain(['love']);
    setInput('');
    setTurn('your');
    setError('');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Word Chain
            </h1>
            <button onClick={restart} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-5 text-primary-500" />
            </button>
          </div>

          <p className="text-center mb-6 text-gray-600">
            {turn === 'your' ? '✨ Your turn!' : '💭 Partner is thinking...'}
          </p>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8 mb-6">
              <div className="flex flex-wrap gap-3 items-center justify-center">
                {chain.map((word, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`px-4 py-2 rounded-full font-bold text-lg ${i % 2 === 0 ? 'bg-primary-100 text-primary-700' : 'bg-rose-100 text-rose-700'}`}>
                    {word}
                    {i < chain.length - 1 && <span className="ml-2 text-gray-400">→</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </TiltCard>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={turn === 'partner'}
              placeholder={`Enter a word starting with "${chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}"`}
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button type="submit" disabled={turn === 'partner'} variant="primary" className="w-full" size="lg">
              Submit Word
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">Build a chain where each word starts with the last letter of the previous one</p>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
