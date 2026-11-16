'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGameSync } from '@/components/companions3d/useGameSync';
import Bear3D from '@/components/companions3d/Bear3D';
import Panda3D from '@/components/companions3d/Panda3D';
import type { Companion3DProps } from '@/components/companions3d/companion3d.types';

// ---- game board with tictactoe cells ----------------------------------------
function GameBoard({
  board,
  winner,
  turn,
}: {
  board: (null | 'bear' | 'panda')[];
  winner: string | null;
  turn: string;
}) {
  const groupRef = useRef<any>(null);
  const glowRefs = useRef<(any | null)[]>([]);

  const winLines: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const winLine = useMemo(() => {
    if (!winner || winner === 'draw') return null;
    return winLines.find((l) => {
      const [a, b, c] = l;
      return board[a] && board[a] === board[b] && board[a] === board[c];
    }) ?? null;
  }, [board, winner]);

  useFrame((state) => {
    const group = groupRef.current;
    if (group) {
      group.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
    if (winLine) {
      winLine.forEach((_, i) => {
        const m = glowRefs.current[i];
        if (!m) return;
        m.visible = true;
        m.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.2;
      });
    }
    if (!winLine) {
      glowRefs.current.forEach((m) => { if (m) m.visible = false; });
    }
  });

  const cellSize = 0.22;
  const gap = 0.04;
  const start = -cellSize - gap / 2;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.85, 0.03, 0.85]} />
        <meshToonMaterial color="#f5f0eb" />
      </mesh>

      {board.map((cell, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = start + col * (cellSize + gap);
        const z = start + row * (cellSize + gap);

        return (
          <group key={i} position={[x, 0.01, z]}>
            <mesh>
              <cylinderGeometry args={[cellSize / 2, cellSize / 2, 0.06, 24]} />
              <meshToonMaterial color="#e8e0d8" />
            </mesh>
            <mesh ref={(el: any) => { glowRefs.current[i] = el; }} visible={false} position={[0, 0.04, 0]}>
              <cylinderGeometry args={[cellSize / 2 + 0.01, cellSize / 2 + 0.01, 0.02, 24]} />
              <meshBasicMaterial color={cell === 'bear' ? '#a16b45' : '#1f2937'} transparent opacity={0.5} />
            </mesh>
            {cell === 'bear' && (
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[cellSize / 3, 16, 16]} />
                <meshToonMaterial color="#a16b45" />
              </mesh>
            )}
            {cell === 'panda' && (
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[cellSize / 3, 16, 16]} />
                <meshToonMaterial color="#1f2937" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ---- turn indicator ----------------------------------------------------------
function TurnIndicator({ turn }: { turn: string }) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    mesh.material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
  });

  return (
    <mesh ref={ref} position={[turn === 'bear' ? -0.55 : 0.55, 0.35, 0]}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshBasicMaterial color={turn === 'bear' ? '#a16b45' : '#1f2937'} transparent opacity={0.7} />
    </mesh>
  );
}

// ---- game scene ------------------------------------------------------------
function GameSceneInner({ userIdA, userIdB }: { userIdA: string; userIdB: string }) {
  const { localState } = useGameSync(userIdA, userIdB);
  const state = localState;

  if (!state) {
    return (
      <>
        <ambientLight intensity={1.2} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#e8e0d8" />
        </mesh>
      </>
    );
  }

  const isBearWinner = state.winner === 'bear';
  const isPandaWinner = state.winner === 'panda';

  const bearProps: Omit<Companion3DProps, 'clock'> = {
    mood: isBearWinner ? 'celebrating' : isPandaWinner ? 'pouting' : state.turn === 'bear' ? 'cheering' : 'idle',
    action: null,
    gazeX: 0,
    blink: false,
    crying: isPandaWinner,
    nod: false,
    shy: false,
    surprised: false,
    winBounce: isBearWinner,
    hovered: false,
    walkDir: 0,
    pawShift: 0,
    tilt: 0,
    reduced: false,
    clickTick: 0,
  };

  const pandaProps: Omit<Companion3DProps, 'clock'> = {
    ...bearProps,
    mood: isPandaWinner ? 'celebrating' : isBearWinner ? 'pouting' : state.turn === 'panda' ? 'cheering' : 'idle',
    crying: isBearWinner,
    winBounce: isPandaWinner,
  };

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 5, 5]} intensity={2.5} color="#fff5e6" />
      <spotLight position={[0, 4, 0]} intensity={1.5} angle={0.4} penumbra={0.5} color="#ffe4c4" />

      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial color="#faf5f0" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      <GameBoard board={state.board} winner={state.winner} turn={state.turn} />
      <TurnIndicator turn={state.turn} />

      <group position={[-0.55, 0.08, -0.5]} rotation={[0, Math.PI / 6, 0]}>
        <Bear3D props={{ ...bearProps, clock: 0 } as Companion3DProps} />
      </group>

      <group position={[0.55, 0.08, -0.5]} rotation={[0, -Math.PI / 6, 0]}>
        <Panda3D props={{ ...pandaProps, clock: 0 } as Companion3DProps} />
      </group>
    </>
  );
}

// ---- exported wrapper -------------------------------------------------------
export default function GameScene3D({ matchId, userIdA, userIdB }: { matchId: string; userIdA: string; userIdB: string }) {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 1.2, 1.8], fov: 40 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <GameSceneInner userIdA={userIdA} userIdB={userIdB} />
        </Suspense>
      </Canvas>
    </div>
  );
}
