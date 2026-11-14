import type { Transition } from 'framer-motion';
import type { Mood } from './types';

/** Shared spring for mood transitions (snappy but soft). */
export const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 18 };

export interface Pose {
  /** Whole-body offset + base rotation. */
  pose: { x: number; y: number; rotate: number };
  /** Eyelid closedness 0 (open) .. 1 (fully shut). */
  eyelids: number;
  /** Horizontal eye shift (looking away). */
  eyeShift: number;
  /** Blush opacity. */
  blush: number;
  pawL: { x: number; y: number; rotate: number };
  pawR: { x: number; y: number; rotate: number };
  /** Key into MOUTHS. */
  mouth: string;
  /** Infinite body-bounce keyframes (cheer moods only; skipped when reduced-motion). */
  bounce?: { y: number[]; dur: number };
}

export const POSES: Record<Mood, Pose> = {
  idle: {
    pose: { x: 0, y: 0, rotate: 0 },
    eyelids: 0, eyeShift: 0, blush: 0.3,
    pawL: { x: 0, y: 0, rotate: 0 }, pawR: { x: 0, y: 0, rotate: 0 },
    mouth: 'smile',
  },
  peeking: {
    pose: { x: -2, y: -2, rotate: -4 },
    eyelids: 0.2, eyeShift: -2.5, blush: 0.5,
    pawL: { x: 0, y: 0, rotate: 0 }, pawR: { x: 0, y: 0, rotate: 0 },
    mouth: 'smile',
  },
  shy: {
    pose: { x: 0, y: 2, rotate: 2 },
    eyelids: 0.85, eyeShift: 3, blush: 0.9,
    pawL: { x: 2, y: -30, rotate: -24 }, pawR: { x: -2, y: -30, rotate: 24 },
    mouth: 'flat',
  },
  blush: {
    pose: { x: 0, y: 0, rotate: 0 },
    eyelids: 0, eyeShift: 0, blush: 1,
    pawL: { x: 0, y: 0, rotate: 0 }, pawR: { x: 0, y: 0, rotate: 0 },
    mouth: 'smile',
  },
  cheering: {
    pose: { x: 0, y: 0, rotate: 0 },
    eyelids: 0, eyeShift: 0, blush: 0.5,
    pawL: { x: 0, y: -14, rotate: -30 }, pawR: { x: 0, y: -14, rotate: 30 },
    mouth: 'happyOpen',
    bounce: { y: [0, -7, 0], dur: 0.9 },
  },
  celebrating: {
    pose: { x: 0, y: 0, rotate: 0 },
    eyelids: 0, eyeShift: 0, blush: 1,
    pawL: { x: 0, y: -18, rotate: -38 }, pawR: { x: 0, y: -18, rotate: 38 },
    mouth: 'happyOpen',
    bounce: { y: [0, -14, 0], dur: 0.55 },
  },
  pouting: {
    pose: { x: 0, y: 2, rotate: -6 },
    eyelids: 0.3, eyeShift: 0, blush: 0,
    pawL: { x: 0, y: 0, rotate: 0 }, pawR: { x: 0, y: 0, rotate: 0 },
    mouth: 'pout',
  },
  /** User stopped moving — half-sleepy, head hangs. */
  drowsy: {
    pose: { x: 0, y: 3, rotate: -8 },
    eyelids: 0.6, eyeShift: 0, blush: 0,
    pawL: { x: 0, y: 0, rotate: 0 }, pawR: { x: 0, y: 0, rotate: 0 },
    mouth: 'flat',
  },
  /** Fast scroll / sudden jump — wide eyes, "o" mouth. */
  surprised: {
    pose: { x: 0, y: -3, rotate: 0 },
    eyelids: 0, eyeShift: 0, blush: 0.15,
    pawL: { x: -1, y: -4, rotate: -8 }, pawR: { x: 1, y: -4, rotate: 8 },
    mouth: 'o',
  },
};
