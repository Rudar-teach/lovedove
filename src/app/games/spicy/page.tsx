'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Play, Flame, Film, Clapperboard, ArrowLeft } from 'lucide-react';
import { SPICY_GAMES } from '@/lib/spicyGames';
import GameArt from '@/components/games/GameArt';

type SpicyCategory = 'all' | 'Spicy' | 'Truth' | 'Dare' | 'Romance' | 'Party' | 'Couple';

const CATEGORIES: { id: SpicyCategory; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'Spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'Truth', label: 'Truth', emoji: '💣' },
  { id: 'Dare', label: 'Dare', emoji: '💋' },
  { id: 'Romance', label: 'Romance', emoji: '🌹' },
  { id: 'Party', label: 'Party', emoji: '🎭' },
  { id: 'Couple', label: 'Couple', emoji: '💖' },
];

export default function SpicyGamesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SpicyCategory>('all');

  const filtered = useMemo(() => {
    let games = SPICY_GAMES;
    if (category !== 'all') games = games.filter(g => g.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      games = games.filter(g => g.name.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }
    return games;
  }, [search, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
      <header className="bg-black/60 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/games" className="text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">🔥 Spicy Games</h1>
              <p className="text-xs text-purple-300">{SPICY_GAMES.length} games for adventurous couples</p>
            </div>
          </div>
          <Link href="/games" className="text-sm text-purple-300 hover:text-white">← All Games</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 rounded-3xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-6 text-8xl">🔥</div>
            <div className="absolute bottom-2 left-6 text-6xl">💋</div>
          </div>
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">18+ Only</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">Spicy Games</h2>
            <p className="text-white/80 text-sm max-w-xl">Truths, dares, quizzes, and challenges for couples who want to turn up the heat.</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-4 mb-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search spicy games..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 border border-purple-500/30 text-white placeholder:text-purple-300" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat.id ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-purple-300 text-lg">No games found</p>
            <button onClick={() => { setCategory('all'); setSearch(''); }} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((game, i) => (
              <motion.div key={game.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/games/spicy/${game.slug}`}
                  className="group block bg-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transition-all border border-purple-500/20 hover:border-pink-400/50 hover:-translate-y-1">
                  <div className="relative">
                    <GameArt title={game.name} subtitle={game.tagline} emoji={game.emoji} gradient={game.gradient} />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur">{game.category}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">{game.name}</h3>
                    <p className="text-xs text-purple-300 line-clamp-2 mb-3">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 font-medium">{game.type}</span>
                      <span className="text-xs text-pink-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">Play <Play className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
