'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameScene3D from './GameScene3D';

export default function PlayTogetherPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId') || 'default';

  const userIdA = useMemo(() => `user-${matchId}-a`, [matchId]);
  const userIdB = useMemo(() => `user-${matchId}-b`, [matchId]);

  return (
    <GameScene3D matchId={matchId} userIdA={userIdA} userIdB={userIdB} />
  );
}
