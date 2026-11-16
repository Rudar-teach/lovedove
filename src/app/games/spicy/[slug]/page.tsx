'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SPICY_GAMES } from '@/lib/spicyGames';
import SpicyGameRenderer from '@/components/games/SpicyGameRenderer';

export default function SpicyGamePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params?.slug as string;

  const game = SPICY_GAMES.find(g => g.slug === slug);

  useEffect(() => {
    if (!game) router.replace('/games/spicy');
  }, [game, router]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">🔥</div>
          <p className="text-purple-300">Loading game…</p>
        </div>
      </div>
    );
  }

  return (
    <SpicyGameRenderer game={game} onBack={() => router.replace('/games/spicy')} />
  );
}
