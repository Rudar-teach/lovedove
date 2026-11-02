// ArcadeCarousel — Kufli-style horizontal "Game Arcade" slider.
// Large portrait cards slide in a loop; each card shows a styled game
// poster (gradient + emoji + name written on the card like Kufli posters),
// with prev/next arrows and dot indicators.
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clapperboard } from 'lucide-react';
import { BollywoodGameDef, ALL_BOLLYWOOD_GAMES } from '@/lib/bollywoodGames';
import GameArtPro, { PRO_ART_SLUGS } from '@/components/games/GameArtPro';

// Poster: bold "logo" text over a rich gradient + big emoji, matching
// the Kufli poster look (name written on the card).
function GamePoster({ game }: { game: BollywoodGameDef }) {
  const hasProArt = PRO_ART_SLUGS.has(game.slug);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient}`} />
      {/* subtle dotted texture */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Pro illustrated scene (if this game has one) */}
      {hasProArt && (
        <div className="absolute inset-0">
          <GameArtPro title="" subtitle="" emoji="" gradient="" slug={game.slug} />
        </div>
      )}
      {/* vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      {/* top row: category badge + emoji */}
      <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white border border-white/25">
        {game.category}
      </div>
      <div className="absolute top-3 right-3 z-20 w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-2xl shadow-lg">
        {game.emoji}
      </div>

      {/* Kufli-style poster text: game name written on the card */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 flex flex-col items-center text-center">
        <div
          className="text-white font-black leading-[0.95] tracking-tight select-none"
          style={{
            fontSize: 'clamp(1.5rem, 7vw, 2.5rem)',
            textShadow: '0 3px 0 rgba(0,0,0,0.45), 0 0 24px rgba(0,0,0,0.35)',
          }}
        >
          {game.name}
        </div>
        <div className="mt-1 text-white/85 text-[11px] sm:text-xs font-semibold drop-shadow">
          {game.tagline}
        </div>
      </div>
    </div>
  );
}

export default function ArcadeCarousel({
  title = 'Game Arcade',
  subtitle = 'Bollywood games, hand-drawn & playable',
  games,
}: {
  title?: string;
  subtitle?: string;
  games?: BollywoodGameDef[];
}) {
  const list = games && games.length ? games : ALL_BOLLYWOOD_GAMES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = (delta: number) =>
    setIndex((prev) => (prev + delta + list.length) % list.length);

  // Auto-advance unless paused (hover) or there are fewer than 2 items
  useEffect(() => {
    if (paused || list.length < 2) return;
    const id = setInterval(() => go(1), 4200);
    return () => clearInterval(id);
  }, [paused, list.length]);

  // Keep index in range when the list changes
  useEffect(() => {
    setIndex((i) => (i >= list.length ? 0 : i));
  }, [list.length]);

  // Card width + gap (matches the flex sizing below)
  const cardW = 288; // 18rem
  const gap = 20; // 1.25rem
  const offset = index * (cardW + gap);

  const arrows = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <section className="relative">
      {/* section header */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-black uppercase tracking-widest mb-2">
              <Clapperboard className="w-4 h-4" /> {title}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{subtitle}</h2>
          </div>
          <div className="hidden sm:block">{arrows}</div>
        </div>
      </div>

      {/* sliding track */}
      <div
        className="overflow-hidden px-4 sm:px-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${offset}px)`, gap: `${gap}px` }}
        >
          {list.map((game) => (
            <Link
              key={game.slug}
              href={`/games/bollywood/${game.slug}`}
              className="flex-shrink-0"
              style={{ width: cardW }}
            >
              <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden group">
                <div className="w-full h-full group-hover:scale-[1.04] transition-transform duration-300">
                  <GamePoster game={game} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* mobile controls */}
      <div className="flex sm:hidden items-center justify-center gap-3 py-5">
        {arrows}
        <div className="flex items-center gap-1.5 overflow-hidden max-w-[50%]">
          {list.map((g, i) => (
            <button
              key={g.slug}
              onClick={() => setIndex(i)}
              aria-label={g.name}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-amber-500' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
