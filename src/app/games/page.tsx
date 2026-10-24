'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Heart, Gamepad2, Users, Search, Filter, Flame, Sparkles, Zap, Crown, Film, Clapperboard } from 'lucide-react';
import { ALL_BOLLYWOOD_GAMES } from '@/lib/bollywoodGames';
import GameArt from '@/components/games/GameArt';
import GameArtPro, { PRO_ART_SLUGS } from '@/components/games/GameArtPro';
import { STATIC_GAMES } from '@/lib/staticGames';

// Showcase the first 12 Bollywood games on the main catalog page
const BOLLYWOOD_GAMES_SHOWCASE = ALL_BOLLYWOOD_GAMES.slice(0, 12);
const BOLLYWOOD_GAME_COUNT = ALL_BOLLYWOOD_GAMES.length;

type GameCategory = 'all' | 'puzzle' | 'strategy' | 'action' | 'quiz' | 'romantic' | 'multiplayer' | 'creative';

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  difficulty: string;
  min_players: number;
  max_players: number;
  is_featured: boolean;
  play_count: number;
  route_path: string;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  puzzle: { label: 'Puzzle', icon: '🧩', color: 'from-blue-400 to-cyan-400' },
  strategy: { label: 'Strategy', icon: '♟️', color: 'from-purple-400 to-indigo-400' },
  action: { label: 'Action', icon: '⚡', color: 'from-red-400 to-orange-400' },
  quiz: { label: 'Quiz', icon: '💡', color: 'from-green-400 to-emerald-400' },
  romantic: { label: 'Romantic', icon: '💕', color: 'from-pink-400 to-rose-400' },
  multiplayer: { label: 'Multiplayer', icon: '👥', color: 'from-amber-400 to-yellow-400' },
  creative: { label: 'Creative', icon: '🎨', color: 'from-violet-400 to-purple-400' },
};

export default function GamesCatalog() {
  const [games, setGames] = useState<Game[]>(STATIC_GAMES as any);
  const [filteredGames, setFilteredGames] = useState<Game[]>(STATIC_GAMES as any);
  const [category, setCategory] = useState<GameCategory>('all');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('games_catalog')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('play_count', { ascending: false });

        if (!error && data) {
          setGames(data);
          setFilteredGames(data);
        }
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    let filtered = games;

    if (category !== 'all') {
      filtered = filtered.filter(g => g.category === category);
    }

    if (search) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter(g => g.difficulty === difficulty);
    }

    setFilteredGames(filtered);
  }, [category, search, difficulty, games]);

  const featuredGames = games.filter(g => g.is_featured);
  const totalPlays = games.reduce((sum, g) => sum + g.play_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Love Dove Games
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Flame className="w-4 h-4 text-orange-400" />
                {totalPlays.toLocaleString()} total plays
              </div>
              <Link href="/" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bollywood Hub Banner */}
        <Link href="/games/bollywood"
          className="block mb-10 group bg-gradient-to-r from-amber-500 via-orange-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-2 right-6 text-8xl">🎬</div>
            <div className="absolute bottom-2 left-6 text-6xl">🎵</div>
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1 flex items-center gap-1.5">
                <Film className="w-4 h-4" /> New
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-1">Bollywood Games</h2>
              <p className="text-white/80 text-sm">41 games inspired by Indian cinema — movies, songs, dance & romance.</p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-bold rounded-2xl group-hover:scale-105 transition-all flex-shrink-0">
              Play now <Clapperboard className="w-5 h-5" />
            </span>
          </div>
        </Link>

        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 text-[200px] leading-none">🎮</div>
            <div className="absolute bottom-0 left-0 text-[150px] leading-none">💕</div>
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {games.length} Couple Games 💕
              </h1>
              <p className="text-purple-100 text-lg">
                Play together, laugh together, grow together
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{games.filter(g => g.is_featured).length}</p>
                <p className="text-sm text-purple-200">Featured</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{games.filter(g => g.max_players >= 2).length}</p>
                <p className="text-sm text-purple-200">Multiplayer</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{new Set(games.map(g => g.category)).size}</p>
                <p className="text-sm text-purple-200">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-purple-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', ...Object.keys(categoryConfig)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as GameCategory)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                  }`}
                >
                  {cat === 'all' ? 'All Games' : `${categoryConfig[cat]?.icon} ${categoryConfig[cat]?.label}`}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-200 text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Featured Games */}
        {category === 'all' && search === '' && difficulty === 'all' && featuredGames.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Featured Games
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGames.map(game => (
                <Link key={game.id} href={game.route_path || `/games/${game.slug}`}
                  className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-amber-200 hover:border-amber-400 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{game.emoji}</div>
                  <h3 className="font-bold text-gray-800 mb-1">{game.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${categoryConfig[game.category]?.color || 'from-gray-400 to-gray-500'} text-white`}>
                      {categoryConfig[game.category]?.label || game.category}
                    </span>
                    <span className="text-xs text-gray-400">{game.play_count} plays</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bollywood Games Section */}
        {category === 'all' && search === '' && difficulty === 'all' && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Film className="w-6 h-6 text-amber-500" />
                Bollywood Games
                <span className="text-sm font-normal text-gray-500">({BOLLYWOOD_GAME_COUNT})</span>
              </h2>
              <Link href="/games/bollywood" className="text-sm font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1">
                See all <Clapperboard className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {BOLLYWOOD_GAMES_SHOWCASE.map(g => (
                <Link key={g.slug} href={`/games/bollywood/${g.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-amber-100 hover:border-amber-300">
                  {PRO_ART_SLUGS.has(g.slug)
                    ? <GameArtPro title={g.name} subtitle={g.category} emoji={g.emoji} gradient={g.gradient} slug={g.slug} />
                    : <GameArt title={g.name} subtitle={g.category} emoji={g.emoji} gradient={g.gradient} pattern="auto" />}
                  <div className="p-3">
                    <div className="text-xs font-bold text-gray-800 mb-1 truncate">{g.name}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{g.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Games Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-500" />
            {category === 'all' ? 'All Games' : `${categoryConfig[category]?.label} Games`}
            <span className="text-sm font-normal text-gray-500">({filteredGames.length})</span>
          </h2>

          {filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No games found matching your filters</p>
              <button onClick={() => { setCategory('all'); setSearch(''); setDifficulty('all'); }}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGames.map(game => (
                <Link key={game.id} href={game.route_path || `/games/${game.slug}`}
                  className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 relative overflow-hidden">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{game.emoji}</div>
                  <h3 className="font-bold text-gray-800 mb-1">{game.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${categoryConfig[game.category]?.color || 'from-gray-400 to-gray-500'} text-white`}>
                        {categoryConfig[game.category]?.label || game.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        game.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      {game.min_players === game.max_players ? game.min_players : `${game.min_players}-${game.max_players}`}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{game.play_count} plays</span>
                    <span className="text-xs text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                      Play Now →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
