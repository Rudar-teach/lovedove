'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard"><button className="p-2 hover:bg-white rounded-full"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
          <h1 className="text-2xl font-display font-bold text-gray-900">Word Chain</h1>
          <button onClick={restart} className="p-2 hover:bg-white rounded-full"><RefreshCw className="w-6 h-5 text-primary-500" /></button>
        </div>

        <p className="text-center mb-6 text-gray-600">
          {turn === 'your' ? '✨ Your turn!' : '💭 Partner is thinking...'}
        </p>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {chain.map((word, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`px-4 py-2 rounded-full font-bold text-lg ${i % 2 === 0 ? 'bg-primary-100 text-primary-700' : 'bg-rose-100 text-rose-700'}`}>
                {word}
                {i < chain.length - 1 && <span className="ml-2 text-gray-400">→</span>}
              </motion.div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={turn === 'partner'}
            placeholder={`Enter a word starting with "${chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}"`}
            className="w-full p-4 rounded-2xl border-2 border-pink-200 focus:border-primary-500 outline-none text-lg font-medium bg-white"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={turn === 'partner'} className="w-full bg-gradient-to-r from-primary-500 to-rose-500 text-white py-4 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50">
            Submit Word
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">Build a chain where each word starts with the last letter of the previous one</p>
      </div>
    </div>
  );
}