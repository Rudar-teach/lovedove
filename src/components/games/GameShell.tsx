// GameShell — wraps a game with a themed, full-page background so each
// game feels like its own place. Reads the game's gradient + type and
// renders an ambient backdrop (gradient wash + floating particles + vignette).
import React from 'react';
import { motion } from 'framer-motion';

// Map each game type to an ambient particle set + backdrop treatment
const THEME_BY_TYPE: Record<
  string,
  { bg: string; particles: string[]; glow: string }
> = {
  quiz: {
    bg: 'radial-gradient(ellipse at 30% 20%, #fbbf24 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #f59e0b 0%, transparent 50%), #fffbeb',
    particles: ['🎬', '⭐', '💡'],
    glow: '#f59e0b',
  },
  memory: {
    bg: 'radial-gradient(ellipse at 20% 30%, #f472b6 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #ec4899 0%, transparent 50%), #fdf2f8',
    particles: ['💖', '🃏', '✨'],
    glow: '#ec4899',
  },
  rhythm: {
    bg: 'radial-gradient(ellipse at 50% 30%, #10b981 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #059669 0%, transparent 50%), #ecfdf5',
    particles: ['🎵', '🥁', '💃'],
    glow: '#10b981',
  },
  wouldRather: {
    bg: 'radial-gradient(ellipse at 30% 30%, #8b5cf6 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #d946ef 0%, transparent 50%), #faf5ff',
    particles: ['⚡', '🎯', '💫'],
    glow: '#8b5cf6',
  },
  spotTheDiff: {
    bg: 'radial-gradient(ellipse at 40% 40%, #06b6d4 0%, transparent 50%), radial-gradient(ellipse at 60% 60%, #3b82f6 0%, transparent 50%), #ecfeff',
    particles: ['🔍', '👀', '💎'],
    glow: '#06b6d4',
  },
  wordSearch: {
    bg: 'radial-gradient(ellipse at 30% 30%, #14b8a6 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #0ea5e9 0%, transparent 50%), #f0fdfa',
    particles: ['🔤', '📜', '✨'],
    glow: '#14b8a6',
  },
  reaction: {
    bg: 'radial-gradient(ellipse at 50% 30%, #ef4444 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #f97316 0%, transparent 50%), #fef2f2',
    particles: ['⚡', '🏃', '🔥'],
    glow: '#ef4444',
  },
  charades: {
    bg: 'radial-gradient(ellipse at 30% 30%, #f43f5e 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #e11d48 0%, transparent 50%), #fff1f2',
    particles: ['🎭', '💃', '🕺'],
    glow: '#f43f5e',
  },
  story: {
    bg: 'radial-gradient(ellipse at 30% 30%, #8b5cf6 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #ec4899 0%, transparent 50%), #f5f3ff',
    particles: ['📖', '💌', '✨'],
    glow: '#a855f7',
  },
  riddle: {
    bg: 'radial-gradient(ellipse at 30% 30%, #f97316 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #ef4444 0%, transparent 50%), #fff7ed',
    particles: ['🧠', '🧩', '💭'],
    glow: '#f97316',
  },
};

export default function GameShell({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  const theme = THEME_BY_TYPE[type] || THEME_BY_TYPE.quiz;

  // Generate deterministic particle positions
  const particles = Array.from({ length: 10 }).map((_, i) => ({
    emoji: theme.particles[i % theme.particles.length],
    left: (i * 37 + 5) % 100,
    top: (i * 23 + 10) % 100,
    size: 18 + (i % 4) * 6,
    delay: i * 0.8,
    duration: 8 + (i % 5) * 2,
  }));

  return (
    <div
      className="relative min-h-[calc(100vh-5rem)] overflow-hidden"
      style={{ background: theme.bg }}
    >
      {/* ambient glow pulse */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.glow} 0%, transparent 60%)`,
        }}
      />

      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: p.size,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
