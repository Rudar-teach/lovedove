'use client';

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
 * Hidden on /admin*. Bottom-left corner; scales down on phones.
 */
export default function CompanionWidget() {
  const brain = useCompanionBrain();
  const pathname = usePathname() || '';

  // Admin pages: no companions (and their password field never reacts).
  if (pathname.startsWith('/admin')) return null;

  const { mood, blink, nod, tilt, hop, pawShift, snuggle, gaze, earTwitch, heartDropTick, bubble, wigglingId, clickTicks, reduced, isGame } = brain;

  // Base position is bottom-left; on game pages the "Play with friend"
  // button owns bottom-left, so the pair parks higher there on mobile.
  const containerClass = `fixed z-[90] pointer-events-none flex items-end gap-1 sm:gap-2 select-none left-3 sm:left-5 ${
    isGame ? 'bottom-40 sm:bottom-6' : 'bottom-24 sm:bottom-6'
  }`;

  const charClass = 'w-10 sm:w-14 block';

  // The panda runs a soft lag + opposite micro-drift so the two never move
  // in lockstep (which is what makes a pair look "looped").
  const pandaTilt = -tilt * 0.6;

  const shared = {
    mood,
    blink,
    nod,
    hop,
    pawShift,
    snuggle,
    gaze,
    earTwitch,
    heartDropTick,
    bubble,
    reduced,
    sizeClass: charClass,
  };

  const heartVisible = snuggle && !reduced;

  return (
    <div
      className={containerClass}
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
        <Bear
          {...shared}
          tilt={tilt}
          isWiggling={wigglingId === 'bear'}
          clickTick={clickTicks.bear}
        />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-auto cursor-pointer outline-none"
        onMouseEnter={() => brain.pushHover('panda')}
        onClick={() => brain.click('panda')}
      >
        <Panda
          {...shared}
          bubble={null} // only the bear "speaks" — otherwise both say the same line
          tilt={pandaTilt}
          isWiggling={wigglingId === 'panda'}
          clickTick={clickTicks.panda}
        />
      </button>
    </div>
  );
}
