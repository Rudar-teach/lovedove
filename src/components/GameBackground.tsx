'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';

/**
 * GAME BACKGROUND — dark, neon, arcade.
 *
 * Every game page was authored against a DARK surface (white text, dark
 * cards, neon strokes) but was mounted on `PremiumBackground`, which paints
 * a light pink-to-white gradient. That made all that white text invisible.
 *
 * This component is the dark counterpart. It provides:
 *   - a deep plum/indigo base so white text has real contrast
 *   - slow-drifting neon orbs (pink / violet / cyan)
 *   - a faint perspective grid, for arcade depth
 *   - a soft vignette so content stays readable over the orbs
 *   - a sparse particle field, so large empty areas are not dead flat
 *
 * It deliberately does NOT render the doves. They are light-pink artwork
 * that disappears against this base, and the per-game `d`-path animation
 * threw SVG errors on every frame.
 */

interface GameBackgroundProps {
  children: React.ReactNode;
  /** Orbs are the main visual; some games want them quieter. */
  intensity?: 'full' | 'subtle';
}

const ORBS = [
  { size: 620, top: '-14%', left: '-10%', from: 'rgba(236,72,153,0.30)', to: 'transparent', dur: 17, delay: 0 },
  { size: 540, top: '58%', left: '68%', from: 'rgba(139,92,246,0.28)', to: 'transparent', dur: 21, delay: 2.5 },
  { size: 460, top: '30%', left: '28%', from: 'rgba(34,211,238,0.16)', to: 'transparent', dur: 25, delay: 5 },
  { size: 380, top: '82%', left: '6%', from: 'rgba(244,63,94,0.20)', to: 'transparent', dur: 19, delay: 1.2 },
];

export default function GameBackground({ children, intensity = 'full' }: GameBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0518] text-white">
      {/* Base wash — keeps it from reading as flat black */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(1200px 700px at 18% 8%, rgba(76,29,149,0.55), transparent 62%),' +
            'radial-gradient(1000px 640px at 86% 84%, rgba(190,24,93,0.32), transparent 60%),' +
            'linear-gradient(165deg, #12072a 0%, #0b0518 48%, #170a2c 100%)',
        }}
      />

      {/* Arcade perspective grid */}
      {intensity === 'full' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(236,72,153,0.55) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(139,92,246,0.55) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage: 'radial-gradient(ellipse 78% 62% at 50% 42%, #000 42%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 78% 62% at 50% 42%, #000 42%, transparent 100%)',
          }}
        />
      )}

      {/* Drifting neon orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {ORBS.map((o, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              background: `radial-gradient(circle, ${o.from} 0%, ${o.to} 70%)`,
              filter: 'blur(70px)',
            }}
            animate={{
              x: [0, 46, -32, 0],
              y: [0, -38, 26, 0],
              scale: [1, 1.13, 0.94, 1],
            }}
            transition={{
              duration: o.dur,
              delay: o.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Particle field — sparse, deterministic, never re-randomised */}
      {intensity === 'full' &&
        Array.from({ length: 16 }).map((_, i) => {
          // Deterministic pseudo-random from the index, so SSR and client agree
          const rnd = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) + 1) / 2);
          const size = 2 + rnd(1) * 3;
          const dur = 13 + rnd(2) * 14;
          const delay = rnd(3) * 12;
          return (
            <motion.div
              key={`p-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: size,
                height: size,
                left: `${rnd(4) * 100}%`,
                top: `${rnd(5) * 100}%`,
                background: i % 3 === 0 ? '#f9a8d4' : i % 3 === 1 ? '#c4b5fd' : '#a5f3fc',
                boxShadow: `0 0 ${6 + size * 2}px currentColor`,
                opacity: 0.5,
              }}
              animate={{ y: [0, -160], opacity: [0, 0.65, 0] }}
              transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
            />
          );
        })}

      {/* Decorative accents, kept faint so they never fight the game UI */}
      {intensity === 'full' && (
        <>
          <motion.div
            className="absolute top-[14%] left-[8%] pointer-events-none select-none text-rose-300/20"
            animate={{ y: [0, -22, 0], rotate: [0, 7, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={34} fill="currentColor" />
          </motion.div>
          <motion.div
            className="absolute top-[62%] right-[7%] pointer-events-none select-none text-violet-300/20"
            animate={{ y: [0, 24, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 11, delay: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={28} />
          </motion.div>
          <motion.div
            className="absolute top-[38%] right-[16%] pointer-events-none select-none text-pink-300/15"
            animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star size={20} fill="currentColor" />
          </motion.div>
        </>
      )}

      {/* Vignette — guarantees readable contrast under the content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 52%, rgba(4,2,10,0.62) 100%)' }}
      />

      {/* Content sits above every decorative layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}