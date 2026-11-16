/** Shared props every companion character receives from the widget. */
export type Mood =
  | 'idle'
  | 'drowsy'
  | 'peeking'
  | 'shy'
  | 'blush'
  | 'surprised'
  | 'cheering'
  | 'celebrating'
  | 'pouting';

/** One-shot actions the pair can perform (random-rolled, never twice in a row). */
export type OneShotAction = 'jump' | 'dance' | 'wave' | 'headbutt' | 'peekup';

/** The one-shot action currently playing (tick re-triggers on repeats). */
export interface ActionState {
  kind: OneShotAction;
  tick: number;
}

/** Gait info while the pair walks along the bottom of the page. */
export interface GaitState {
  /** Travel direction: 1 = right, -1 = left. */
  dir: 1 | -1;
  /** Whether this character leads the gait (front runner, starts each step). */
  leading: boolean;
}

export interface CharacterProps {
  /** The mood this character is currently in. */
  mood: Mood;
  /** Randomized idle drift — head tilt in degrees, springs toward this. */
  tilt: number;
  /** The pair is snuggling right now. */
  snuggle?: boolean;
  /** Which way this character leans to snuggle (bear: 1 toward panda, panda: -1). */
  leanDir?: 1 | -1;
  /** Cursor-follow gaze, quantized -1 | 0 | 1 (left / center / right). */
  gaze?: -1 | 0 | 1;
  /** One-shot ear twitch: which ear jumps + the tick that re-triggers it. */
  earTwitch?: { side: 'L' | 'R'; tick: number } | null;
  /** Random heart-drop tick — when it changes, one 💗 falls past the pair. */
  heartDropTick?: number;
  /** A little emoji bubble above this character (null/undefined = hidden). */
  bubble?: string | null;
  /** One-shot hop pulse (400ms). */
  hop: boolean;
  /** Which front paw is casually shifted (-1 left, 1 right, 0 none). */
  pawShift: -1 | 0 | 1;
  /** Eyes shut right now (130ms blink). */
  blink: boolean;
  /** This character is the one being hovered / wiggling right now. */
  isWiggling: boolean;
  /** Incremented on click — re-triggers the one-shot heart burst. */
  clickTick: number;
  /** Respect prefers-reduced-motion: no loops, crossfade only. */
  reduced: boolean;
  /** Tailwind size class for the svg (e.g. "w-10 sm:w-14"). */
  sizeClass: string;
  /** One-shot action playing right now (jump/dance/wave/headbutt/peekup). */
  action?: ActionState | null;
  /** The pair is walking right now (gait: lean, alternating feet, bob). */
  walking?: GaitState | null;
  /** Loss reaction: one paw over the face + a single small tear drop. */
  crying?: boolean;
}

/** Mouth shapes — swapped instantly per mood, no path morphing. */
export const MOUTHS: Record<string, string> = {
  smile: 'M-4.5,0 Q0,4.5 4.5,0',
  open: 'M-3.2,-1 A3.4,3.4 0 0 0 3.2,-1 Z',
  flat: 'M-3.5,1 Q0,2.5 3.5,1',
  pout: 'M-3.5,-1 Q0,-4 3.5,-1',
  happyOpen: 'M-5,-1 Q0,5.5 5,-1 Q0,2.5 -5,-1 Z',
  o: 'M0,-2.4 A2.4,2.4 0 1 0 0.01,-2.4 Z',
  /** Big open "laughing" mouth with a little tongue — plushy kawaii cheer. */
  laugh: 'M-4.5,-0.5 Q0,6 4.5,-0.5 Q0,2.5 -4.5,-0.5 Z',
};
