'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Bear from './Bear';
import Panda from './Panda';
import { useCompanionBrain } from './useCompanionBrain';

/**
 * Two kawaii companions (bear + panda) that float on every page, like a
 * little "3rd player". They idle with randomized micro-movements, peek at
 * what you type, hide their eyes on password fields, blush when hovered,
 * cheer while you're on a game page, and celebrate wins / pout on losses.
 *
 * Every 60–120s they also WANDER: the pair walks to a random x-position
 * along the bottom of the viewport (lean, alternating feet, bob). The
 * container position is driven by a framer-motion animated "left" value
 * (px) — no fixed corner classes, no state ticks.
 *
 * Hidden on /admin*. Scales down on phones.
 */
export default function CompanionWidget() {
  const brain = useCompanionBrain();
  const pathname = usePathname() || '';

  // Admin pages: no companions (and their password field never reacts).
  if (pathname.startsWith('/admin')) return null;

  const {
    mood, blink, nod, tilt, hop, pawShift, snuggle, gaze, earTwitch,
    heartDropTick, bubble, wigglingId, clickTicks, reduced, isGame,
    widgetRef, leftPx, leftDur, walkingDir, action, crying,
  } = brain;

  // On game pages the "Play with friend" button owns the bottom strip, so
  // the pair parks higher there on mobile. Horizontal position is animated
  // (leftPx / leftDur) — they sit at their last x when idle.
  const bottomClass = isGame ? 'bottom-40 sm:bottom-6' : 'bottom-24 sm:bottom-6';

  const charClass = 'w-10 sm:w-14 block';

  // The panda runs a soft lag + opposite micro-drift so the two never move
  // in lockstep (which is what makes a pair look "looped").
  const pandaTilt = -tilt * 0.6;

  // Memoize the two character subtrees so the (cheap) container re-render
  // doesn't force full SVG re-renders on every unrelated brain tick.
  // Gait: the front runner leads. Walking right → bear (left) leads;
  // walking left → panda (right) leads.
  const bearProps = useMemo(
    () => ({
      mood, blink, nod, tilt, hop, pawShift, snuggle, gaze,
      earTwitch, heartDropTick, bubble, reduced, isWiggling: wigglingId === 'bear',
      clickTick: clickTicks.bear, sizeClass: charClass,
      action,
      walking: walkingDir === null ? null : { dir: walkingDir, leading: walkingDir === 1 },
      crying,
    }),
    [mood, blink, nod, tilt, hop, pawShift, snuggle, gaze, earTwitch,
      heartDropTick, bubble, reduced, wigglingId, clickTicks.bear, charClass,
      action, walkingDir, crying]
  );
  const pandaProps = useMemo(
    () => ({
      mood, blink, nod, hop, pawShift, snuggle, gaze,
      earTwitch, heartDropTick, reduced,
      isWiggling: wigglingId === 'panda',
      tilt: pandaTilt,
      clickTick: clickTicks.panda,
      sizeClass: charClass,
      bubble: null, // only the bear "speaks" — otherwise both say the same line
      action,
      walking: walkingDir === null ? null : { dir: walkingDir, leading: walkingDir === -1 },
      crying,
    }),
    [mood, blink, nod, hop, pawShift, snuggle, gaze, earTwitch, heartDropTick,
      reduced, wigglingId, pandaTilt, clickTicks.panda, charClass,
      action, walkingDir, crying]
  );

  const heartVisible = snuggle && !reduced;

  return (
    <motion.div
      ref={widgetRef}
      className={`fixed z-[90] pointer-events-none flex items-end gap-1 sm:gap-2 select-none ${bottomClass}`}
      style={{ left: 0 }}
      animate={{ left: leftPx }}
      transition={{ duration: leftDur, ease: 'linear' }}
      aria-hidden="true"
      title={isGame ? 'They’re playing along!' : undefined}
    >
      {/* Little heart that pops in between them when they snuggle */}
      <AnimatePresence>
        {heartVisible && (
          <motion.div
            key="snuggle-heart"
            className="absolute left-1/2 bottom-full -translate-x-1/2 -mb-1 text-base pointer-events-none"
            initial={{ opacity: 0, scale: 0.4, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: -6 }}
            transition={{ duration: 0.4 }}
          >
            ❤️
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-auto cursor-pointer outline-none"
        onMouseEnter={() => brain.pushHover('bear')}
        onClick={() => brain.click('bear')}
      >
        <Bear {...bearProps} />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-auto cursor-pointer outline-none"
        onMouseEnter={() => brain.pushHover('panda')}
        onClick={() => brain.click('panda')}
      >
        <Panda {...pandaProps} />
      </button>
    </motion.div>
  );
}
