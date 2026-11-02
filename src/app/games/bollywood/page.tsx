'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clapperboard, Search, Play, Sparkles, Users, Star, Film, Music, Heart, Trophy, ChevronDown, User, Swords, UserCheck, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ALL_BOLLYWOOD_GAMES, BollywoodGameDef } from '@/lib/bollywoodGames';
import GameArt from '@/components/games/GameArt';
import GameArtPro from '@/components/games/GameArtPro';
import { PRO_ART_SLUGS } from '@/components/games/GameArtPro';
import ArcadeCarousel from '@/components/games/ArcadeCarousel';

gsap.registerPlugin(ScrollTrigger);

type PlayMode = 'solo' | '2p' | 'friend';

const MODES: { id: PlayMode; label: string; sub: string; icon: typeof User; grad: string }[] = [
  { id: 'solo', label: 'Play Solo', sub: 'Race the clock, beat the grid', icon: User, grad: 'from-sky-500 to-blue-600' },
  { id: '2p', label: '2 Players', sub: 'Pass & play, take turns', icon: Swords, grad: 'from-fuchsia-500 to-purple-600' },
  { id: 'friend', label: 'With a Friend', sub: 'Challenge someone online', icon: UserCheck, grad: 'from-amber-500 to-orange-600' },
];

function GameThumb({ g }: { g: BollywoodGameDef }) {
  if (PRO_ART_SLUGS.has(g.slug)) {
    return <GameArtPro title={g.name} subtitle={g.category} emoji={g.emoji} gradient={g.gradient} slug={g.slug} />;
  }
  return <GameArt title={g.name} subtitle={typeLabels[g.type] || g.category} emoji={g.emoji} gradient={g.gradient} />;
}

const typeLabels: Record<string, string> = {
  quiz: 'Quiz',
  memory: 'Memory',
  rhythm: 'Dance',
  wouldRather: 'Choices',
  spotTheDiff: 'Spot It',
  wordSearch: 'Word Hunt',
  reaction: 'Reflex',
  charades: 'Charades',
  story: 'Story',
  riddle: 'Riddle',
};

export default function BollywoodHub() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [selectedGame, setSelectedGame] = useState<BollywoodGameDef | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // ── GSAP scroll-driven hero parallax ──────────────────────────────
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-parallax]', {
        y: 120,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.from('.bolly-reveal', {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.6,
        scrollTrigger: { trigger: '.bolly-grid', start: 'top 80%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const pickGame = (g: BollywoodGameDef) => setSelectedGame(g);
  const launchGame = (g: BollywoodGameDef, mode: PlayMode) => {
    try { sessionStorage.setItem('ld_bolly_mode', mode); } catch {}
    window.location.href = `/games/bollywood/${g.slug}`;
  };

  const filtered = ALL_BOLLYWOOD_GAMES.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || g.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const types = ['all', ...Array.from(new Set(ALL_BOLLYWOOD_GAMES.map(g => g.type)))];

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero banner — scroll-driven parallax */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 text-white">
        <div data-hero-parallax className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 left-10 text-8xl">🎬</div>
          <div className="absolute bottom-4 right-10 text-7xl">🎵</div>
          <div className="absolute top-1/2 left-1/4 text-6xl">💃</div>
          <div className="absolute top-10 right-1/3 text-5xl">🕺</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <Link href="/games" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> All games
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-6xl sm:text-7xl">🎞️</div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black mb-2">Bollywood Games</h1>
              <p className="text-white/80 text-base sm:text-lg">
                {ALL_BOLLYWOOD_GAMES.length} games inspired by Indian cinema — movies, songs,
                dance, and romance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold">
              <Star className="w-3.5 h-3.5" /> {ALL_BOLLYWOOD_GAMES.length} games
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold">
              <Users className="w-3.5 h-3.5" /> 2-player ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold">
              <Film className="w-3.5 h-3.5" /> 6 categories
            </span>
          </div>

          {/* 3-step flow */}
          <div className="mt-10 bolly-reveal">
            <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">How it works</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">1</div>
                <div>
                  <div className="text-sm font-bold">Pick a game</div>
                  <div className="text-[11px] text-white/60">Tap any card below</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">2</div>
                <div>
                  <div className="text-sm font-bold">Choose a mode</div>
                  <div className="text-[11px] text-white/60">Solo · 2 Players · With a friend</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">3</div>
                <div>
                  <div className="text-sm font-bold">Play &amp; win</div>
                  <div className="text-[11px] text-white/60">Enter the arcade</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center cursor-pointer"
            onClick={() => document.getElementById('bolly-grid')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Kufli-style sliding Game Arcade */}
      <div className="bg-gradient-to-b from-amber-50 via-white to-white pb-4">
        <ArcadeCarousel
          title="Game Arcade"
          subtitle="Sliding showcase — tap a card to play"
          games={ALL_BOLLYWOOD_GAMES.slice(0, 24)}
        />
      </div>

      <div id="bolly-grid" className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Bollywood games..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 border border-gray-200 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === t
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                }`}
              >
                {t === 'all' ? 'All' : typeLabels[t] || t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">No Bollywood games match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((game, i) => (
              <motion.div
                key={game.slug}
                className="bolly-reveal"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
              >
                <button
                  onClick={() => pickGame(game)}
                  className="w-full text-left bg-white rounded-3xl shadow-md hover:shadow-xl border border-pink-100 hover:border-amber-300 overflow-hidden group transition-all duration-300"
                >
                  {/* thumbnail */}
                  <div className="aspect-[16/10] overflow-hidden">
                    <GameThumb g={game} />
                  </div>
                  {/* body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                        {game.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                        {game.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{game.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> 2 Players
                      </span>
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3" /> Play
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Mode picker sheet */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <div className="w-full h-full">
                    <GameThumb g={selectedGame} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Step 2 of 3 · Choose a mode</div>
                  <h3 className="text-lg font-black text-gray-900 truncate">{selectedGame.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-3 mt-5">
                {MODES.map(m => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => launchGame(selectedGame, m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${m.grad} text-white shadow-lg text-left`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-base">{m.label}</div>
                      <div className="text-xs text-white/70">{m.sub}</div>
                    </div>
                    <Play className="w-5 h-5 opacity-80" />
                  </motion.button>
                ))}
              </div>

              <p className="text-[11px] text-gray-400 text-center mt-4">
                Pick a mode to jump straight into <span className="font-bold text-gray-600">{selectedGame.name}</span>.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
