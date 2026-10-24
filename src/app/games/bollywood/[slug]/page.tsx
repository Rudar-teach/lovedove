'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, Users } from 'lucide-react';
import { getBollywoodGame } from '@/lib/bollywoodGames';
import BollywoodGame from '@/components/games/BollywoodGame';
import GameArt from '@/components/games/GameArt';
import GameArtPro, { PRO_ART_SLUGS } from '@/components/games/GameArtPro';
import GameShell from '@/components/games/GameShell';
import FriendPanel from '@/components/games/FriendPanel';

function HeroThumb({ game }: { game: NonNullable<ReturnType<typeof getBollywoodGame>> }) {
  if (PRO_ART_SLUGS.has(game.slug)) {
    return <GameArtPro title={game.name} subtitle={game.tagline} emoji={game.emoji} gradient={game.gradient} slug={game.slug} />;
  }
  return <GameArt title={game.name} subtitle={game.tagline} emoji={game.emoji} gradient={game.gradient} />;
}

const MODE_LABELS: Record<string, string> = {
  solo: 'Solo mode',
  '2p': '2 Players · pass & play',
  friend: 'With a friend',
};

export default function BollywoodGamePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const game = getBollywoodGame(slug);
  const [friendPanelOpen, setFriendPanelOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [playMode, setPlayMode] = useState<string | null>(null);

  // Read the mode chosen on the hub (step 2 of the 3-step flow).
  // "friend" mode auto-opens the friend panel.
  useEffect(() => {
    try {
      const m = sessionStorage.getItem('ld_bolly_mode');
      if (m) {
        setPlayMode(m);
        if (m === 'friend') setFriendPanelOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!game) setNotFound(true);
  }, [game]);

  if (notFound || !game) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-xl font-black text-gray-900 mb-2">Game not found</h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find that Bollywood game. Browse the full lineup instead.
          </p>
          <Link
            href="/games/bollywood"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Bollywood games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <GameShell type={game.type}>
    <div className="flex flex-col">
      <div className="max-w-3xl mx-auto w-full p-4 sm:p-6">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/games/bollywood"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Bollywood Games
            </Link>
            {playMode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-bold text-amber-700 shadow-sm">
                <Clapperboard className="w-3 h-3" />
                {MODE_LABELS[playMode] || playMode}
              </span>
            )}
          </div>
          <button
            onClick={() => setFriendPanelOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Clapperboard className="w-4 h-4" />
            Play with friend
          </button>
        </div>

        {/* Hero thumbnail */}
        <div className="mb-6 aspect-[16/6] sm:aspect-[16/5] rounded-3xl overflow-hidden shadow-xl">
          <HeroThumb game={game} />
        </div>

        <BollywoodGame game={game} />
      </div>

      <FriendPanel
        gameName={game.name}
        gameSlug={game.slug}
        open={friendPanelOpen}
        onPlayFriend={(f) => {
          alert(
            `You chose ${f.name} for ${game.name}!\n\n` +
            'In pass-and-play mode: Player 1 picks, then Player 2 picks. ' +
            'For quiz games, both answers reveal only after both finish.'
          );
          setFriendPanelOpen(false);
        }}
      />
    </div>
    </GameShell>
  );
}
