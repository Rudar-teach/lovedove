'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from 'framer-motion';
import type { CharacterProps, Mood } from './types';
import { MOUTHS } from './types';
import { POSES, SPRING } from './poses';

type Palette = {
  /** Head + body fur. */
  body: string;
  /** Soft belly patch. */
  tummy: string;
  /** Outer ears. */
  ear: string;
  /** Soft inner-ear (solid dark on the panda = no inner ear). */
  earInner: string;
  /** Pupil / panda dark features. */
  dark: string;
  /** Nose + mouth stroke. */
  nose: string;
  /** Feet + little arms. */
  foot: string;
  /** Cheek color (bear: warm golden, panda: rosy pink). */
  blush: string;
  /** Subtle sticker outline so the panda reads on white. */
  outline: string;
  /** Little round tail peeking out to the side. */
  tail?: string;
  /** Panda: eye patches + dark tummy/limbs. */
  panda: boolean;
};

const BEAR: Palette = {
  body: '#a16b45',
  tummy: '#d9a878',
  ear: '#a16b45',
  earInner: '#d9a878',
  dark: '#3b2314',
  nose: '#6b3f21',
  foot: '#8a5a35',
  blush: '#f3b264',
  outline: '#7c4a26',
  tail: '#d9a878',
  panda: false,
};

const PANDA: Palette = {
  body: '#f7f6f3',
  tummy: '#1f2937',
  ear: '#1f2937',
  earInner: '#1f2937',
  dark: '#111827',
  nose: '#111827',
  foot: '#1f2937',
  blush: '#fca5a5',
  outline: '#1f2937',
  tail: '#1f2937',
  panda: true,
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
  action = null,
  walking = null,
  crying = false,
}: CharacterSvgProps) {
  const P = POSES[mood];
  const pal = variant === 'bear' ? BEAR : PANDA;

  // The one-shot action (jump/dance/wave/headbutt/peekup) — null when
  // reduced-motion (the brain never schedules them anyway) or idle.
  const act = action && !reduced ? action.kind : null;
  // Gait is live only while walking AND not reduced-motion.
  const gaitOn = !!walking && !reduced;

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

  // ---- base values every keyframe anim starts from --------------------------
  const baseY = P.pose.y - (nod ?? 0) * 3 + (hop ? -7 : 0);
  const baseR = P.pose.rotate + tilt + leanRot;

  const bodyAnimate: TargetAndTransition = {
    x: P.pose.x + leanX,
    y: P.bounce && bouncing ? P.bounce.y : baseY,
    rotate: P.bounce ? P.pose.rotate + tilt : baseR,
  };
  if (isWiggling && !reduced) {
    bodyAnimate.rotate = [P.pose.rotate - 6, P.pose.rotate + 5, P.pose.rotate - 3, P.pose.rotate];
  }
  // One-shot actions layer keyframe arrays on top of the pose:
  if (act === 'jump') {
    // Big jump ~14px off the ground, paws up, 0.7s.
    bodyAnimate.y = [baseY, baseY - 14, baseY];
  }
  if (act === 'dance') {
    // 2s side-to-side sway with paws alternating up (paws below).
    bodyAnimate.rotate = [baseR - 7, baseR + 7, baseR - 7, baseR + 5, baseR];
  }
  if (act === 'headbutt') {
    // Both lean together, thunk = soft scale-dip near the end.
    const d = leanDir ?? 1;
    bodyAnimate.rotate = [baseR, baseR + d * 7, baseR + d * 4, baseR];
    bodyAnimate.scale = [1, 1, 0.94, 1];
  }
  if (act === 'peekup') {
    // Pair rises 8px above the bottom edge, looks at the page, sits back.
    bodyAnimate.y = [baseY, baseY - 8, baseY - 8, baseY];
  }

  // Per-key transition mixes trip up framer v11's strict types; a cast is
  // safe here because every key is a value this component actually animates.
  const s: Transition = lag ? { ...SPRING, delay: lag } : SPRING;
  const bodyTransition = (
    bouncing && P.bounce
      ? { x: s, rotate: s, y: { duration: P.bounce.dur, repeat: Infinity, ease: 'easeOut', delay: lag } }
      : act === 'jump'
        ? { x: s, rotate: s, scale: s, y: { duration: 0.7, ease: ['easeIn', 'easeOut'] as const } }
        : act === 'dance'
          ? { x: s, y: s, scale: s, rotate: { duration: 2, ease: 'easeInOut', delay: lag } }
          : act === 'headbutt'
            ? {
                x: s,
                y: s,
                rotate: { duration: 1.1, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] },
                scale: { duration: 1.1, ease: 'easeInOut', times: [0, 0.4, 0.65, 1] },
              }
            : act === 'peekup'
              ? { x: s, rotate: s, scale: s, y: { duration: 2, times: [0, 0.3, 0.65, 1], ease: 'easeInOut' } }
              : isWiggling
                ? { x: s, y: s, rotate: { duration: 0.45, delay: lag } }
                : { ...s }
  ) as unknown as Transition;

  // ---- paws -----------------------------------------------------------------
  // The bear waves its outer paw, the panda mirrors with its own.
  const waveL = act === 'wave' && variant === 'bear';
  const waveR = act === 'wave' && variant === 'panda';
  // Crying (loss): one paw up over the face.
  const cryLift = crying ? -26 : 0;
  const cryRot = crying ? -30 : 0;

  const pawLx = P.pawL.x + (pawShift === -1 ? -2.5 : 0) + (crying ? 1.5 : 0);
  const pawRx = P.pawR.x + (pawShift === 1 ? 2.5 : 0);

  let pawL: { x: number; y: number | number[]; rotate: number | number[] };
  let pawR: { x: number; y: number | number[]; rotate: number | number[] };

  if (act === 'dance') {
    // Paws alternate up — left leads, right is half a beat behind.
    pawL = {
      x: pawLx,
      y: [P.pawL.y, P.pawL.y - 12, P.pawL.y, P.pawL.y - 12, P.pawL.y],
      rotate: P.pawL.rotate,
    };
    pawR = {
      x: pawRx,
      y: [P.pawR.y - 12, P.pawR.y, P.pawR.y - 12, P.pawR.y, P.pawR.y - 12],
      rotate: P.pawR.rotate,
    };
  } else if (act === 'jump') {
    pawL = { x: pawLx, y: [P.pawL.y, P.pawL.y - 10, P.pawL.y], rotate: P.pawL.rotate - 20 };
    pawR = { x: pawRx, y: [P.pawR.y, P.pawR.y - 10, P.pawR.y], rotate: P.pawR.rotate + 20 };
  } else {
    pawL = {
      x: pawLx,
      y: P.pawL.y + cryLift + (waveL ? -14 : 0),
      rotate: waveL
        ? [P.pawL.rotate, P.pawL.rotate - 20, P.pawL.rotate + 20, P.pawL.rotate - 20, P.pawL.rotate]
        : P.pawL.rotate + cryRot,
    };
    pawR = {
      x: pawRx,
      y: P.pawR.y + cryLift + (waveR ? -14 : 0),
      rotate: waveR
        ? [P.pawR.rotate, P.pawR.rotate + 20, P.pawR.rotate - 20, P.pawR.rotate + 20, P.pawR.rotate]
        : P.pawR.rotate + cryRot,
    };
  }
  const pawLTrans = (
    act === 'dance'
      ? { x: s, y: { duration: 2, ease: 'easeInOut', delay: lag }, rotate: s }
      : act === 'jump'
        ? { x: s, y: { duration: 0.7, ease: 'easeOut' }, rotate: s }
        : waveL
          ? { x: s, y: s, rotate: { duration: 2, ease: 'easeInOut' } }
          : s
  ) as unknown as Transition;
  const pawRTrans = (
    act === 'dance'
      ? { x: s, y: { duration: 2, ease: 'easeInOut', delay: lag }, rotate: s }
      : act === 'jump'
        ? { x: s, y: { duration: 0.7, ease: 'easeOut' }, rotate: s }
        : waveR
          ? { x: s, y: s, rotate: { duration: 2, ease: 'easeInOut' } }
          : s
  ) as unknown as Transition;

  // ---- gait (feet alternate — keyframe arrays, zero state ticks) ------------
  // The front runner (leading) starts the step; the partner runs the mirrored
  // arrays so the feet visibly alternate. 0.55s cycle ≈ the ~70px/s walk.
  const lead = walking?.leading ?? false;
  const gaitLean = gaitOn ? walking!.dir * 6 : 0;
  const footLRot = gaitOn ? (lead ? [10, -12, 10] : [-10, 12, -10]) : 0;
  const footRRot = gaitOn ? (lead ? [-10, 12, -10] : [10, -12, 10]) : 0;
  const footLift = (phase: 'up' | 'down') =>
    gaitOn ? (phase === 'up' ? [0, -1.6, 0] : [-1.6, 0, -1.6]) : 0;
  const footTrans = (): Transition =>
    gaitOn
      ? ({
          rotate: { duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: lag },
          y: { duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: lag },
        } as unknown as Transition)
      : SPRING;

  // Eyes look up while peek-up; closed on blink/shy; mood shift otherwise.
  const eyeY = mood === 'peeking' ? 1 : act === 'peekup' ? -2 : 0;

  const openMouth = P.mouth === 'happyOpen' || P.mouth === 'open' || P.mouth === 'laugh';

  // Eyelids sized to cover whatever sits over the eye in each variant
  // (panda: the whole dark patch, bear: the sparkly eye).
  const lidW = pal.panda ? 16 : 11;
  const lidH = pal.panda ? 20 : 14;
  const lidY = pal.panda ? 29.5 : 33;

  return (
    <svg viewBox="0 0 96 96" className={sizeClass} aria-hidden="true">
      {/* Gait lean — the pair leans ~6° into the travel direction while walking */}
      <motion.g
        animate={gaitOn ? { rotate: gaitLean } : { rotate: 0 }}
        transition={gaitOn ? { type: 'spring', stiffness: 120, damping: 14, delay: lag } : SPRING}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      >
        {/* Walk bob — small up-down loop synced to the foot cycle */}
        <motion.g
          animate={gaitOn ? { y: [0, -1.8, 0] } : { y: 0 }}
          transition={
            gaitOn
              ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: lag }
              : SPRING
          }
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        >
          {/* Whole body: mood pose + drift tilt + hop + bounce + wiggle + one-shots */}
          <motion.g
            animate={bodyAnimate}
            transition={bodyTransition}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 80%' }}
          >
            {/* Breathing (innermost, scales around the tummy) */}
            <motion.g
              animate={breathe ? { scaleY: [1, 1.03, 1] } : { scaleY: 1 }}
              transition={breathe ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : SPRING}
              style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
            >
              {/* Tail — little round bump peeking out at the hip */}
              {pal.tail && (
                <circle cx="66" cy="84" r={pal.panda ? 4.5 : 6} fill={pal.tail} stroke={pal.outline} strokeWidth="1" />
              )}

              {/* Body — small sitting torso under the big head */}
              <ellipse cx="48" cy="73" rx="16" ry="13.5" fill={pal.body} stroke={pal.outline} strokeWidth="1.2" />
              {/* Tummy patch (panda: dark chest, bear: soft cream) */}
              <ellipse cx="48" cy="76" rx="9.5" ry="7.5" fill={pal.tummy} />

              {/* Little feet pointing forward — they alternate while walking */}
              <motion.g
                animate={gaitOn ? { rotate: footLRot, y: footLift(lead ? 'up' : 'down') } : { rotate: 0, y: 0 }}
                transition={footTrans()}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
              >
                <ellipse cx="38" cy="86.5" rx="6.5" ry="4.6" fill={pal.foot} stroke={pal.outline} strokeWidth="1" />
              </motion.g>
              <motion.g
                animate={gaitOn ? { rotate: footRRot, y: footLift(lead ? 'down' : 'up') } : { rotate: 0, y: 0 }}
                transition={footTrans()}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
              >
                <ellipse cx="58" cy="86.5" rx="6.5" ry="4.6" fill={pal.foot} stroke={pal.outline} strokeWidth="1" />
              </motion.g>

              {/* Ears (one can twitch) — big + round, on top of the head */}
              <motion.g
                animate={twitching?.side === 'L' ? { scaleY: [1, 1.25, 0.9, 1] } : { scaleY: 1 }}
                transition={twitching?.side === 'L' ? { duration: 0.35 } : SPRING}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
              >
                <circle cx="28" cy="13" r="10" fill={pal.ear} stroke={pal.outline} strokeWidth="1.2" />
                <circle cx="28" cy="14.5" r="4.8" fill={pal.earInner} />
              </motion.g>
              <motion.g
                animate={twitching?.side === 'R' ? { scaleY: [1, 1.25, 0.9, 1] } : { scaleY: 1 }}
                transition={twitching?.side === 'R' ? { duration: 0.35 } : SPRING}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
              >
                <circle cx="68" cy="13" r="10" fill={pal.ear} stroke={pal.outline} strokeWidth="1.2" />
                <circle cx="68" cy="14.5" r="4.8" fill={pal.earInner} />
              </motion.g>

              {/* Head — big plush squircle, ~59% of the total height */}
              <rect x="18" y="11" width="60" height="52" rx="24" fill={pal.body} stroke={pal.outline} strokeWidth="1.2" />

              {/* Panda eye patches */}
              {pal.panda && (
                <>
                  <ellipse cx="34" cy="39.5" rx="7.8" ry="9.8" fill={pal.tummy} transform="rotate(-12 34 39.5)" />
                  <ellipse cx="62" cy="39.5" rx="7.8" ry="9.8" fill={pal.tummy} transform="rotate(12 62 39.5)" />
                </>
              )}

              {/* Eyes — big and sparkly: white base + large pupil + 2 glints.
                  Panda: round dark eye on the patch with the same twin glints.
                  The whole group glances toward the cursor + mood shift,
                  and looks UP during peek-up. */}
              <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                <motion.g animate={{ x: gazeX, y: eyeY }} transition={s}>
                  {!pal.panda && (
                    <>
                      <ellipse cx="34" cy="40" rx="4.4" ry="5.2" fill="#fff" />
                      <ellipse cx="62" cy="40" rx="4.4" ry="5.2" fill="#fff" />
                    </>
                  )}
                  {pal.panda ? (
                    <>
                      <circle cx="34" cy="40.5" r="3.1" fill={pal.dark} />
                      <circle cx="62" cy="40.5" r="3.1" fill={pal.dark} />
                      <circle cx="35.2" cy="39" r="1" fill="#fff" opacity="0.95" />
                      <circle cx="63.2" cy="39" r="1" fill="#fff" opacity="0.95" />
                      <circle cx="32.8" cy="42.2" r="0.55" fill="#fff" opacity="0.7" />
                      <circle cx="60.8" cy="42.2" r="0.55" fill="#fff" opacity="0.7" />
                    </>
                  ) : (
                    <>
                      <circle cx="34" cy="40.8" r="2.9" fill={pal.dark} />
                      <circle cx="62" cy="40.8" r="2.9" fill={pal.dark} />
                      <circle cx="35.3" cy="39.2" r="1.1" fill="#fff" opacity="0.95" />
                      <circle cx="63.3" cy="39.2" r="1.1" fill="#fff" opacity="0.95" />
                      <circle cx="32.8" cy="42.6" r="0.6" fill="#fff" opacity="0.75" />
                      <circle cx="60.8" cy="42.6" r="0.6" fill="#fff" opacity="0.75" />
                    </>
                  )}
                </motion.g>
              </g>

              {/* Eyelids — fur/patch-colored, scaleY 0 (open) → 1 (shut), from top */}
              <motion.rect
                x={34 - lidW / 2}
                y={lidY}
                width={lidW}
                height={lidH}
                rx={pal.panda ? 8 : 5.5}
                fill={pal.panda ? pal.tummy : pal.body}
                animate={{ scaleY: closed }}
                transition={s}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
              />
              <motion.rect
                x={62 - lidW / 2}
                y={lidY}
                width={lidW}
                height={lidH}
                rx={pal.panda ? 8 : 5.5}
                fill={pal.panda ? pal.tummy : pal.body}
                animate={{ scaleY: closed }}
                transition={s}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
              />

              {/* Cheeks — warm golden (bear) / rosy pink (panda) */}
              <motion.g animate={{ opacity: P.blush }} transition={{ duration: 0.25 }}>
                <ellipse cx="24.5" cy="48.5" rx="5" ry="3.6" fill={pal.blush} />
                <ellipse cx="71.5" cy="48.5" rx="5" ry="3.6" fill={pal.blush} />
              </motion.g>

              {/* Tiny nose + mouth (path swapped per mood) */}
              {pal.panda ? (
                <ellipse cx="48" cy="45.8" rx="3" ry="2.2" fill={pal.nose} />
              ) : (
                <path
                  d="M45.5,44.6 L50.5,44.6 L48,47.4 Z"
                  fill={pal.nose}
                  stroke={pal.nose}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              )}
              <path
                key={P.mouth}
                d={mouth}
                transform="translate(48 51.5)"
                stroke={pal.nose}
                strokeWidth="1.6"
                fill={openMouth ? '#f87171' : 'none'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Little arms — raise to the face (shy/crying) or up out (cheer) */}
              <motion.g
                animate={{ x: pawL.x, y: pawL.y, rotate: pawL.rotate }}
                transition={pawLTrans}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
              >
                <ellipse cx="30" cy="71" rx="4.8" ry="6.4" fill={pal.foot} stroke={pal.outline} strokeWidth="1" transform="rotate(8 30 71)" />
              </motion.g>
              <motion.g
                animate={{ x: pawR.x, y: pawR.y, rotate: pawR.rotate }}
                transition={pawRTrans}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
              >
                <ellipse cx="66" cy="71" rx="4.8" ry="6.4" fill={pal.foot} stroke={pal.outline} strokeWidth="1" transform="rotate(-8 66 71)" />
              </motion.g>

              {/* Loss: one single small tear drop sliding off the right eye */}
              <AnimatePresence>
                {crying && !reduced && (
                  <motion.path
                    key="tear"
                    d="M0,0 C1.5,1.8 1.5,3.6 0,4.6 C-1.5,3.6 -1.5,1.8 0,0 Z"
                    transform="translate(63.5 46)"
                    fill="#7dd3fc"
                    stroke="#38bdf8"
                    strokeWidth="0.4"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [0, 5, 9, 12] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, times: [0, 0.25, 0.7, 1] }}
                  />
                )}
              </AnimatePresence>

              {/* Headbutt: a little heart pops between the pair's heads */}
              <AnimatePresence>
                {act === 'headbutt' && action && (
                  <motion.path
                    key={`hb-${action.tick}`}
                    d="M0,3 C0,0 -4,0 -4,2.5 C-4,5 0,7.5 0,9 C0,7.5 4,5 4,2.5 C4,0 0,0 0,3 Z"
                    transform="translate(44 1)"
                    fill="#f472b6"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{
                      opacity: [0, 0, 1, 1, 0],
                      scale: [0.4, 0.4, 1, 1, 0.9],
                      y: [0, 0, -3, -5, -7],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, times: [0, 0.4, 0.55, 0.8, 1] }}
                  />
                )}
              </AnimatePresence>

              {/* Random heart drop — one 💗 falls past the body */}
              <AnimatePresence>
                {dropping && !reduced && (
                  <motion.text
                    key={`drop-${heartDropTick}`}
                    x="80"
                    y="16"
                    fontSize="9"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [0, 20, 40, 58] }}
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
                    <path d="M48 11.5 L44 5.5 L52 5.5 Z" fill="#fff" />
                    <rect x="41" y="0.5" width="14" height="9" rx="4.5" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="48" y="8" textAnchor="middle" fontSize="6.5">
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
                        transform={`translate(${44 + i * 4} 8)`}
                        fill={['#f472b6', '#fb7185', '#f59e0b'][i]}
                        initial={{ opacity: 0, y: 0, scale: 0.6 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [0 - i * 2, -18 - i * 4], scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, delay: i * 0.12, ease: 'easeOut' }}
                      />
                    ))}
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  );
}

export type { Mood };
