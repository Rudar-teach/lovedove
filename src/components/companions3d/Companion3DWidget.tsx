'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import Bear3D from './Bear3D';
import Panda3D from './Panda3D';
import { useCompanionBrain3D } from './useCompanionBrain3D';
import type { Companion3DProps } from './companion3d.types';

// ---- internal scene ---------------------------------------------------------
function Scene({
  bearProps,
  pandaProps,
}: {
  bearProps: Omit<Companion3DProps, 'clock'>;
  pandaProps: Omit<Companion3DProps, 'clock'>;
}) {
  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 5]} intensity={2.5} color="#fff5e6" />
      <pointLight position={[-2, 1.5, 2]} intensity={0.8} color="#ffe4c4" />

      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      <group position={[-0.55, 0.08, 0]}>
        <Bear3D props={{ ...bearProps, clock: 0 } as Companion3DProps} />
      </group>

      <group position={[0.55, 0.08, 0]}>
        <Panda3D props={{ ...pandaProps, clock: 0 } as Companion3DProps} />
      </group>
    </>
  );
}

// ---- exported Companion3DWidget ---------------------------------------------
export default function Companion3DWidget() {
  const pathname = usePathname() || '';
  const reduced = useReducedMotion() ?? false;
  const brain = useCompanionBrain3D();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  const [leftPx, setLeftPx] = useState(16);
  const [leftDur, setLeftDur] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ---- wander (setTimeout chains, clamped to viewport) ----------------------
  const wanderChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leftRef = useRef(leftPx);
  leftRef.current = leftPx;

  useEffect(() => {
    if (reduced) return;

    const range = () => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const min = 16;
      const max = Math.max(min, vw - 180);
      return { min, max };
    };

    const schedule = (ms?: number) => {
      if (wanderChain.current) clearTimeout(wanderChain.current);
      const wait = ms ?? 60000 + Math.random() * 60000;
      wanderChain.current = setTimeout(() => {
        if (document.hidden) return schedule(8000 + Math.random() * 4000);
        const { min, max } = range();
        const target = min + Math.random() * (max - min);
        const dist = Math.abs(target - leftRef.current);
        if (dist < 40) return schedule();
        const dur = Math.max(1.2, dist / 70);
        setLeftDur(dur);
        setLeftPx(target);
        if (walkTO.current) clearTimeout(walkTO.current);
        walkTO.current = setTimeout(() => {}, dur * 1000 + 200);
        schedule();
      }, wait);
    };

    schedule();

    const onVis = () => {
      if (walkTO.current) clearTimeout(walkTO.current);
      if (!document.hidden) setTimeout(schedule, 3000);
    };

    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (wanderChain.current) clearTimeout(wanderChain.current);
      if (walkTO.current) clearTimeout(walkTO.current);
    };
  }, [reduced]);

  // ---- build shared 3D props (clock is self-managed per component) ----------
  const common: Omit<Companion3DProps, 'clock'> = {
    mood: brain.mood,
    action: brain.action,
    gazeX: brain.gazeX,
    blink: brain.blink,
    crying: brain.crying,
    nod: brain.nod,
    shy: brain.shy,
    surprised: brain.surprised,
    winBounce: brain.winBounce,
    hovered: isHovered,
    walkDir: brain.walkDir,
    pawShift: brain.pawShift,
    tilt: brain.tilt,
    reduced: brain.reduced,
    clickTick: brain.clickTick,
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    brain.pushHover('bear');
  }, [brain]);

  const handleClick = useCallback(() => brain.click('bear'), [brain]);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      className="fixed bottom-4 left-0 z-40 pointer-events-auto select-none"
      style={{ left: 0 }}
      animate={{ left: leftPx }}
      transition={{ duration: leftDur, ease: 'linear' }}
      aria-hidden="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative" style={{ width: 150, height: 120 }}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, reduced ? 1 : 2]}
          frameloop="always"
          camera={{ position: [0, 0, 1.8], fov: 40 }}
        >
          <Scene bearProps={common} pandaProps={common} />
        </Canvas>
      </div>
    </motion.div>
  );
}
