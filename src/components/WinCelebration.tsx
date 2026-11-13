'use client';

import { useEffect, useRef } from 'react';
import { WIN_EVENT, playWinChime } from '@/lib/winCelebrate';

/**
 * Mounted once in the root layout. Fires a themed confetti burst
 * (hearts + petals + gold) across the top of the viewport plus a
 * soft chime, every time the app-level "win" event is dispatched
 * (see celebrateWin() in @/lib/winCelebrate).
 *
 * Zero dependencies: canvas particles, no extra packages.
 */

const PALETTE = ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24', '#f9a8d4', '#ffffff'];
const PARTICLE_COUNT = 140;
const DURATION_MS = 2600;

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'heart' | 'petal';
  rot: number;
  vrot: number;
  born: number;
};

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  const t = s * 0.5;
  ctx.moveTo(0, t * 0.35);
  ctx.bezierCurveTo(-t, -t * 0.45, -t * 1.4, t * 0.5, 0, t * 1.35);
  ctx.bezierCurveTo(t * 1.4, t * 0.5, t, -t * 0.45, 0, t * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function WinCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onWin = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      void detail; // message reserved for a future toast integration
      playWinChime();

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Size the canvas to the viewport.
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Spawn from the top third, biased toward the center.
      const cx = canvas.width / 2;
      const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
        const shapeRoll = Math.random();
        const shape: Particle['shape'] =
          shapeRoll < 0.45 ? 'rect' : shapeRoll < 0.7 ? 'heart' : 'petal';
        return {
          x: cx + (Math.random() - 0.5) * canvas.width * 0.7,
          y: -20 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 4,
          vy: 2 + Math.random() * 4,
          size: 5 + Math.random() * 8,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          shape,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.25,
          born: performance.now(),
        };
      });

      const start = performance.now();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const tick = (now: number) => {
        const elapsed = now - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let alive = 0;
        for (const p of particles) {
          const pAge = (now - p.born) / 1000;
          p.vy += 0.12; // gravity
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vrot;
          if (p.y > canvas.height + 30) continue;
          alive++;

          const fade = elapsed > DURATION_MS * 0.7
            ? Math.max(0, 1 - (elapsed - DURATION_MS * 0.7) / (DURATION_MS * 0.3))
            : 1;
          ctx.globalAlpha = fade;

          if (p.shape === 'heart') {
            drawHeart(ctx, p.x, p.y, p.size, p.rot, p.color);
          } else if (p.shape === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.9, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            void pAge;
          } else {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;

        if (alive > 0 && elapsed < DURATION_MS + 400) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener(WIN_EVENT, onWin);
    return () => {
      window.removeEventListener(WIN_EVENT, onWin);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}
