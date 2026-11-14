'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from 'framer-motion';
import type { CharacterProps, Mood } from './types';
import { MOUTHS } from './types';
import { POSES, SPRING } from './poses';

type Palette = {
  body: string;
  inner: string; // tummy / inner ear / muzzle
  dark: string; // ears (panda) or outline-free dark parts
  ear: string;
  foot: string;
  tail?: string;
  hasEyePatches: boolean;
};

const BEAR: Palette = {
  body: '#a16b45',
  inner: '#d9a878',
  dark: '#7c4f2c',
  ear: '#a16b45',
  foot: '#8f5c37',
  tail: '#d9a878',
  hasEyePatches: false,
};

const PANDA: Palette = {
  body: '#f7f6f3',
  inner: '#ffffff',
  dark: '#1f2937',
  ear: '#1f2937',
  foot: '#1f2937',
  hasEyePatches: true,
};

interface CharacterSvgProps extends CharacterProps {
  variant: 'bear' | 'panda';
  /** One-shot nod pulse (1 = nod, decays to 0), fired per keystroke. */
  nod?: number;
  /** Motion lag in seconds — the panda follows the bear, so they never
   *  move in lockstep and the pair never feels looped. */
  lag?: number;
}

export default function CharacterSvg({
  variant,
  mood,
  tilt,
  hop,
  pawShift,
  blink,
  isWiggling,
  clickTick,
  reduced,
  sizeClass,
  nod,
  snuggle,
  leanDir,
  gaze,
  earTwitch,
  heartDropTick,
  bubble,
  lag = 0,
}: CharacterSvgProps) {
  const P = POSES[mood];
  const pal = variant === 'bear' ? BEAR : PANDA;

  // One-shot heart burst on click (3 hearts, staggered, ~1.5s).
  const [burst, setBurst] = useState(0);
  const lastTick = useRef(0);
  useEffect(() => {
    if (clickTick > 0 && clickTick !== lastTick.current) {
      lastTick.current = clickTick;
      setBurst((b) => b + 1);
    }
  }, [clickTick]);
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 1600);
    return () => clearTimeout(t);
  }, [burst]);

  // One-shot ear twitch (250ms scaleY jump on the named ear).
  const [twitching, setTwitching] = useState<{ side: 'L' | 'R' } | null>(null);
  const lastTwitch = useRef(0);
  useEffect(() => {
    if (earTwitch && earTwitch.tick !== lastTwitch.current) {
      lastTwitch.current = earTwitch.tick;
      setTwitching({ side: earTwitch.side });
      const t = setTimeout(() => setTwitching(null), 400);
      return () => clearTimeout(t);
    }
  }, [earTwitch]);

  // Random heart drop (one 💗 falls past, keyed by tick).
  const [dropping, setDropping] = useState(false);
  const lastDrop = useRef(0);
  useEffect(() => {
    if (heartDropTick && heartDropTick !== lastDrop.current) {
      lastDrop.current = heartDropTick;
      setDropping(true);
      const t = setTimeout(() => setDropping(false), 1500);
      return () => clearTimeout(t);
    }
  }, [heartDropTick]);

  const busy = mood === 'shy' || mood === 'celebrating';
  const closed = blink ? 1 : P.eyelids;
  const mouth = MOUTHS[P.mouth] || MOUTHS.smile;

  // Breathing loop only when idle-ish and not reduced-motion.
  const breathe = !reduced && !busy && !P.bounce;
  // Bounce loops only on cheer moods (and not reduced).
  const bouncing = !reduced && !!P.bounce;

  // Snuggle: lean toward the partner (bear leanDir=1, panda=-1) + head tilt.
  const leanX = snuggle ? leanDir! * 3 : 0;
  const leanRot = snuggle ? leanDir! * 5 : 0;
  // Gaze: subtle cursor-follow on top of the mood's eye shift.
  const gazeX = P.eyeShift + (gaze ?? 0) * 1.5;

  const pawLx = P.pawL.x + (pawShift === -1 ? -2.5 : 0);
  const pawRx = P.pawR.x + (pawShift === 1 ? 2.5 : 0);

  const bodyAnimate: TargetAndTransition = {
    x: P.pose.x + leanX,
    y: P.bounce && bouncing ? P.bounce.y : P.pose.y - (nod ?? 0) * 3 + (hop ? -7 : 0),
    rotate: P.pose.rotate + tilt + leanRot,
  };
  if (isWiggling && !reduced) {
    bodyAnimate.rotate = [P.pose.rotate - 6, P.pose.rotate + 5, P.pose.rotate - 3, P.pose.rotate];
  }
  // Per-key transition mixes trip up framer v11's strict types; a cast is
  // safe here because every key is a value this component actually animates.
  const s: Transition = lag ? { ...SPRING, delay: lag } : SPRING;
  const bodyTransition = (
    bouncing && P.bounce
      ? { x: s, rotate: s, y: { duration: P.bounce.dur, repeat: Infinity, ease: 'easeOut', delay: lag } }
      : isWiggling
        ? { x: s, y: s, rotate: { duration: 0.45, delay: lag } }
        : { ...s }
  ) as unknown as Transition;

  return (
    <svg viewBox="0 0 96 96" className={sizeClass} aria-hidden="true">
      {/* Whole body: mood pose + drift tilt + hop + bounce + wiggle */}
      <motion.g
        animate={bodyAnimate}
        transition={bodyTransition}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 80%' }}
      >
        {/* Breathing (innermost, scales around the tummy) */}
        <motion.g
          animate={breathe ? { scaleY: [1, 1.035, 1] } : { scaleY: 1 }}
          transition={breathe ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : SPRING}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        >
          {/* Tail (bear) */}
          {pal.tail && <circle cx="24" cy="70" r="7" fill={pal.tail} />}

          {/* Feet */}
          <ellipse cx="35" cy="86" rx="8" ry="5.5" fill={pal.foot} />
          <ellipse cx="61" cy="86" rx="8" ry="5.5" fill={pal.foot} />

          {/* Body */}
          <ellipse cx="48" cy="70" rx="21" ry="17" fill={pal.body} />
          <ellipse cx="48" cy="73" rx="13" ry="10" fill={pal.inner} />

          {/* Panda shoulder stripes */}
          {pal.hasEyePatches && (
            <>
              <path d="M30 60 Q26 66 30 72 L36 68 Z" fill={pal.dark} opacity="0.9" />
              <path d="M66 60 Q70 66 66 72 L60 68 Z" fill={pal.dark} opacity="0.9" />
            </>
          )}

          {/* Ears (one can twitch) */}
          <motion.g
            animate={twitching?.side === 'L' ? { scaleY: [1, 1.25, 0.9, 1] } : { scaleY: 1 }}
            transition={twitching?.side === 'L' ? { duration: 0.35 } : SPRING}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
          >
            <circle cx="26" cy="15" r="10" fill={pal.ear} />
            <circle cx="26" cy="16" r="4.5" fill={pal.hasEyePatches ? '#4b5563' : pal.inner} />
          </motion.g>
          <motion.g
            animate={twitching?.side === 'R' ? { scaleY: [1, 1.25, 0.9, 1] } : { scaleY: 1 }}
            transition={twitching?.side === 'R' ? { duration: 0.35 } : SPRING}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
          >
            <circle cx="70" cy="15" r="10" fill={pal.ear} />
            <circle cx="70" cy="16" r="4.5" fill={pal.hasEyePatches ? '#4b5563' : pal.inner} />
          </motion.g>

          {/* Head */}
          <circle cx="48" cy="38" r="26" fill={pal.body} />
          <ellipse cx="48" cy="46" rx="13" ry="10" fill={pal.inner} opacity="0.55" />

          {/* Panda eye patches */}
          {pal.hasEyePatches && (
            <>
              <ellipse cx="36.5" cy="35" rx="8.5" ry="10" fill={pal.dark} transform="rotate(-14 36.5 35)" />
              <ellipse cx="59.5" cy="35" rx="8.5" ry="10" fill={pal.dark} transform="rotate(14 59.5 35)" />
            </>
          )}

          {/* Eyes (white + pupil + highlight) — glance toward cursor + mood shift */}
          <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <motion.g animate={{ x: gazeX, y: mood === 'peeking' ? 1 : 0 }} transition={s}>
              <ellipse cx="38" cy="35" rx="4.4" ry="5" fill="#fff" />
              <ellipse cx="58" cy="35" rx="4.4" ry="5" fill="#fff" />
              <motion.circle cx="38" cy="35.6" r="2.3" fill={pal.hasEyePatches ? '#111827' : '#3b2314'} />
              <motion.circle cx="58" cy="35.6" r="2.3" fill={pal.hasEyePatches ? '#111827' : '#3b2314'} />
              <circle cx="39.2" cy="34.2" r="0.9" fill="#fff" opacity="0.9" />
              <circle cx="59.2" cy="34.2" r="0.9" fill="#fff" opacity="0.9" />
            </motion.g>
          </g>

          {/* Eyelids — fur/patch-colored, scaleY 0 (open) → 1 (shut), from top */}
          <motion.rect
            x="33"
            y="29"
            width="10"
            height="12"
            rx="4"
            fill={pal.hasEyePatches ? '#111827' : pal.body}
            animate={{ scaleY: closed }}
            transition={s}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
          />
          <motion.rect
            x="53"
            y="29"
            width="10"
            height="12"
            rx="4"
            fill={pal.hasEyePatches ? '#111827' : pal.body}
            animate={{ scaleY: closed }}
            transition={s}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
          />

          {/* Blush */}
          <motion.g animate={{ opacity: P.blush }} transition={{ duration: 0.25 }}>
            <ellipse cx="27" cy="44" rx="5" ry="3.2" fill="#fca5a5" />
            <ellipse cx="69" cy="44" rx="5" ry="3.2" fill="#fca5a5" />
          </motion.g>

          {/* Nose + mouth (path swapped per mood) */}
          <ellipse cx="48" cy="43" rx="3" ry="2.2" fill={pal.hasEyePatches ? '#111827' : '#6b3f21'} />
          <path
            key={P.mouth}
            d={mouth}
            transform="translate(48 49)"
            stroke={pal.hasEyePatches ? '#111827' : '#6b3f21'}
            strokeWidth="1.8"
            fill={P.mouth === 'happyOpen' || P.mouth === 'open' ? '#f87171' : 'none'}
            strokeLinecap="round"
          />

          {/* Front paws — raise to face (shy) or up (cheer) */}
          <motion.g animate={{ x: pawLx, y: P.pawL.y, rotate: P.pawL.rotate }} transition={s} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
            <ellipse cx="33" cy="80" rx="6.5" ry="5" fill={pal.foot} />
          </motion.g>
          <motion.g animate={{ x: pawRx, y: P.pawR.y, rotate: P.pawR.rotate }} transition={s} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
            <ellipse cx="63" cy="80" rx="6.5" ry="5" fill={pal.foot} />
          </motion.g>

          {/* Random heart drop — one 💗 falls past the body */}
          <AnimatePresence>
            {dropping && !reduced && (
              <motion.text
                key={`drop-${heartDropTick}`}
                x="76"
                y="20"
                fontSize="9"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: [0, 20, 40, 60] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeIn' }}
              >
                💗
              </motion.text>
            )}
          </AnimatePresence>

          {/* Emoji "speech" bubble above the head */}
          <AnimatePresence>
            {bubble && !reduced && (
              <motion.g
                key={bubble}
                initial={{ opacity: 0, scale: 0.3, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: -8 }}
                transition={{ duration: 0.35, ease: 'backOut' }}
              >
                <path d="M48 6 L44 2 L52 2 Z" fill="#fff" />
                <rect x="41" y="2" width="14" height="9" rx="4.5" fill="#fff" />
                <text x="48" y="10.5" textAnchor="middle" fontSize="6.5">
                  {bubble}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Click heart burst */}
          <AnimatePresence>
            {burst > 0 && !reduced && (
              <motion.g key={burst}>
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d="M0,3 C0,0 -4,0 -4,2.5 C-4,5 0,7.5 0,9 C0,7.5 4,5 4,2.5 C4,0 0,0 0,3 Z"
                    transform={`translate(${44 + i * 4} 4)`}
                    fill={['#f472b6', '#fb7185', '#f59e0b'][i]}
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [-2 - i * 3, -24 - i * 4], scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, delay: i * 0.12, ease: 'easeOut' }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>
      </motion.g>
    </svg>
  );
}

export type { Mood };
