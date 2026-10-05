'use client';

import { motion } from 'framer-motion';

export function FlyingDove({ delay = 0, duration = 20, top = '10%', scale = 1, opacity = 0.6 }: { delay?: number; duration?: number; top?: string; scale?: number; opacity?: number }) {
  return (
    <motion.div
      initial={{ x: '-10vw', opacity: 0 }}
      animate={{
        x: ['-10vw', '110vw'],
        y: [0, -40, 0, -60, 0],
        opacity: [0, opacity, opacity, opacity, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute pointer-events-none"
      style={{ top, transform: `scale(${scale})` }}
    >
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="doveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0.85" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.g
          animate={{ rotate: [0, -8, 0, 8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          filter="url(#glow)"
        >
          {/* Body */}
          <ellipse cx="50" cy="55" rx="14" ry="22" fill="url(#doveGrad)" />
          {/* Left wing */}
          <motion.path
            animate={{ d: [
              'M40 50 Q20 35 10 50 Q25 55 40 60 Z',
              'M40 50 Q15 25 5 45 Q22 50 40 55 Z',
              'M40 50 Q20 35 10 50 Q25 55 40 60 Z',
            ] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            fill="url(#doveGrad)"
            stroke="#f9a8d4"
            strokeWidth="0.5"
          />
          {/* Right wing */}
          <motion.path
            animate={{ d: [
              'M60 50 Q80 35 90 50 Q75 55 60 60 Z',
              'M60 50 Q85 25 95 45 Q78 50 60 55 Z',
              'M60 50 Q80 35 90 50 Q75 55 60 60 Z',
            ] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            fill="url(#doveGrad)"
            stroke="#f9a8d4"
            strokeWidth="0.5"
          />
          {/* Head */}
          <circle cx="50" cy="32" r="10" fill="url(#doveGrad)" />
          {/* Beak */}
          <path d="M50 32 L58 28 L50 36 Z" fill="#f59e0b" />
          {/* Eye */}
          <circle cx="48" cy="30" r="1.5" fill="#831843" />
          {/* Tail */}
          <path d="M40 75 L50 90 L60 75 Z" fill="url(#doveGrad)" />
          {/* Heart trail */}
          <motion.text
            animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            x="20" y="80" fontSize="12" fill="#ec4899"
          >
            💕
          </motion.text>
        </motion.g>
      </svg>
    </motion.div>
  );
}
