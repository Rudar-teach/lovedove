'use client';

import type { Mood, OneShotAction, ActionState } from '../companions/types';

/** Extend the existing types with 3D-specific props */
export interface Companion3DProps {
  mood: Mood;
  action: ActionState | null;
  gazeX: -1 | 0 | 1;
  blink: boolean;
  crying: boolean;
  nod: boolean;
  shy: boolean;
  surprised: boolean;
  winBounce: boolean;
  hovered: boolean;
  walkDir: -1 | 0 | 1;
  pawShift: -1 | 0 | 1;
  tilt: number;
  reduced: boolean;
  clickTick: number;
  /** Self-managed clock (seconds) — set by useFrame inside each character component */
  clock: number;
}
