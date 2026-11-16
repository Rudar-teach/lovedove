'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { WIN_EVENT, LOSE_EVENT } from '@/lib/winCelebrate';
import type { ActionState, Mood, OneShotAction } from './types';

interface Override {
  mood: Mood;
  /** null = until explicitly cleared (e.g. shy until focusout). */
  expires: number | null;
  prio: number;
}

const PRIO: Record<Mood, number> = {
  celebrating: 5,
  pouting: 5,
  surprised: 4,
  shy: 4,
  peeking: 3,
  blush: 2,
  cheering: 1,
  drowsy: 0,
  idle: 0,
};

export interface Brain {
  mood: Mood;
  blink: boolean;
  nod: number;
  tilt: number;
  hop: boolean;
  pawShift: -1 | 0 | 1;
  /** Pair is leaning together (randomized every 45–90s). */
  snuggle: boolean;
  /** Which way eyes glance while gazing at the cursor (bear/panda share). */
  gaze: -1 | 0 | 1;
  wigglingId: 'bear' | 'panda' | null;
  clickTicks: { bear: number; panda: number };
  /** Which character is mid ear-twitch + the tick that started it. */
  earTwitch: { side: 'L' | 'R'; tick: number } | null;
  /** Incremented to trigger a heart-drop (falls past both characters). */
  heartDropTick: number;
  /** A random emoji the pair "says" for a couple seconds (null = none). */
  bubble: string | null;
  reduced: boolean;
  isGame: boolean;
  /** Ref for the widget container — the brain measures it to clamp wandering. */
  widgetRef: RefObject<HTMLDivElement | null>;
  /** Where the pair sits along the bottom (px from the left edge). */
  leftPx: number;
  /** Framer transition duration for the left value (s); 0 = snap. */
  leftDur: number;
  /** The pair is walking right now (1 = right, -1 = left, null = sitting). */
  walkingDir: 1 | -1 | null;
  /** One-shot action playing (jump/dance/wave/headbutt/peekup), or null. */
  action: ActionState | null;
  /** Loss reaction: a paw over the face + one small tear. */
  crying: boolean;
  pushHover: (id: 'bear' | 'panda') => void;
  click: (id: 'bear' | 'panda') => void;
}

export function useCompanionBrain(): Brain {
  const reduced = useReducedMotion() ?? false;
  const pathname = usePathname() || '';
  const segs = pathname.split('/').filter(Boolean);
  const isGame = segs[0] === 'games';

  const [overrides, setOverrides] = useState<Override[]>([]);
  const [blink, setBlink] = useState(false);
  const [nod, setNod] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [hop, setHop] = useState(false);
  const [pawShift, setPawShift] = useState<-1 | 0 | 1>(0);
  const [wigglingId, setWigglingId] = useState<'bear' | 'panda' | null>(null);
  const [clickTicks, setClickTicks] = useState({ bear: 0, panda: 0 });
  const [snuggle, setSnuggle] = useState(false);
  const [gaze, setGaze] = useState<-1 | 0 | 1>(0);
  const [earTwitch, setEarTwitch] = useState<{ side: 'L' | 'R'; tick: number } | null>(null);
  const [heartDropTick, setHeartDropTick] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [stale, setStale] = useState(false); // no user activity for 45s → dozy

  // ---- wander / one-shot / loss state ------------------------------------
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [leftPx, setLeftPx] = useState(8);
  const [leftDur, setLeftDur] = useState(0);
  const [walkingDir, setWalkingDir] = useState<1 | -1 | null>(null);
  const [action, setAction] = useState<ActionState | null>(null);
  const [crying, setCrying] = useState(false);

  // Refs so timer callbacks can read fresh values without re-arming chains.
  const moodRef = useRef<Mood>('idle');
  const leftRef = useRef(leftPx);
  const walkingRef = useRef(walkingDir);
  const actionRef = useRef<ActionState | null>(null);

  // ---- mood resolution -----------------------------------------------------
  // Drowsy (no activity for 45s) is the base mood everywhere except game pages.
  const base: Mood = isGame ? 'cheering' : stale ? 'drowsy' : 'idle';
  const mood: Mood = overrides.reduce<Mood>(
    (best, o) => {
      if (o.expires !== null && o.expires < Date.now()) return best;
      return PRIO[o.mood] > PRIO[best] ? o.mood : best;
    },
    base
  );

  // Refs mirror fresh values so timer callbacks never need re-arming.
  useEffect(() => { moodRef.current = mood; }, [mood]);
  useEffect(() => { leftRef.current = leftPx; }, [leftPx]);
  useEffect(() => { walkingRef.current = walkingDir; }, [walkingDir]);
  useEffect(() => { actionRef.current = action; }, [action]);

  const push = useCallback((mood: Mood, ttl: number | null) => {
    setOverrides((prev) => {
      const next = prev.filter((o) => o.mood !== mood);
      next.push({ mood, expires: ttl === null ? null : Date.now() + ttl, prio: PRIO[mood] });
      return next;
    });
    // Auto-clean timed overrides when they expire.
    if (ttl !== null) {
      setTimeout(() => {
        setOverrides((prev) => prev.filter((o) => !(o.mood === mood && o.expires !== null && o.expires <= Date.now())));
      }, ttl + 50);
    }
  }, []);

  const clearMood = useCallback((mood: Mood) => {
    setOverrides((prev) => prev.filter((o) => o.mood !== mood));
  }, []);

  // ---- win / lose -----------------------------------------------------------
  const tearTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winBubbleTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onWin = () => {
      push('celebrating', 4000);
      setBubble('🎉');
      if (winBubbleTO.current) clearTimeout(winBubbleTO.current);
      winBubbleTO.current = setTimeout(() => setBubble(null), 3500);
    };
    const onLose = () => {
      push('pouting', 3000);
      setCrying(true);
      if (tearTO.current) clearTimeout(tearTO.current);
      tearTO.current = setTimeout(() => setCrying(false), 3000);
    };
    window.addEventListener(WIN_EVENT, onWin);
    window.addEventListener(LOSE_EVENT, onLose);
    return () => {
      window.removeEventListener(WIN_EVENT, onWin);
      window.removeEventListener(LOSE_EVENT, onLose);
      if (tearTO.current) clearTimeout(tearTO.current);
      if (winBubbleTO.current) clearTimeout(winBubbleTO.current);
    };
  }, [push]);

  // ---- typing / password ----------------------------------------------------
  useEffect(() => {
    let nodTO: ReturnType<typeof setTimeout> | null = null;

    const onInput = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLTextAreaElement)) return;
      const type = (t as HTMLInputElement).type;
      if (type === 'password') {
        push('shy', null); // stays until focusout clears it
      } else {
        push('peeking', 2500); // re-armed on every keystroke
        setNod(1);
        if (nodTO) clearTimeout(nodTO);
        nodTO = setTimeout(() => setNod(0), 140);
      }
    };

    const onFocusOut = (e: FocusEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement && t.type === 'password') clearMood('shy');
    };

    document.addEventListener('input', onInput, true);
    document.addEventListener('focusout', onFocusOut, true);
    return () => {
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('focusout', onFocusOut, true);
      if (nodTO) clearTimeout(nodTO);
    };
  }, [push, clearMood]);

  // ---- randomized idle drift + blink chains (pause when tab hidden) --------
  const driftChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTO = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return; // no loops, no timers

    const scheduleDrift = () => {
      driftChain.current = setTimeout(() => {
        if (document.hidden) return scheduleDrift();
        // They're busy (walking or mid one-shot) — let it finish first.
        if (walkingRef.current || actionRef.current) return scheduleDrift();
        const r = Math.random();
        if (r < 0.35) {
          const deg = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3);
          setTilt(deg);
          setTimeout(() => setTilt(0), 2200 + Math.random() * 1500);
        } else if (r < 0.6) {
          setHop(true);
          setTimeout(() => setHop(false), 400);
        } else if (r < 0.8) {
          setPawShift((Math.random() < 0.5 ? -1 : 1) as -1 | 1);
          setTimeout(() => setPawShift(0), 1500 + Math.random() * 2000);
        }
        scheduleDrift();
      }, 3000 + Math.random() * 3000);
    };

    const scheduleBlink = () => {
      blinkChain.current = setTimeout(() => {
        if (document.hidden) return scheduleBlink();
        setBlink(true);
        if (blinkTO.current) clearTimeout(blinkTO.current);
        blinkTO.current = setTimeout(() => setBlink(false), 130);
        scheduleBlink();
      }, 2800 + Math.random() * 3500);
    };

    scheduleDrift();
    scheduleBlink();

    const onVis = () => {
      // Clean restart on visibility change — never a stacked-timer burst.
      if (driftChain.current) clearTimeout(driftChain.current);
      if (blinkChain.current) clearTimeout(blinkChain.current);
      if (blinkTO.current) clearTimeout(blinkTO.current);
      if (!document.hidden) {
        setTimeout(scheduleDrift, 1000);
        setTimeout(scheduleBlink, 1500);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (driftChain.current) clearTimeout(driftChain.current);
      if (blinkChain.current) clearTimeout(blinkChain.current);
      if (blinkTO.current) clearTimeout(blinkTO.current);
    };
  }, [reduced]);

  // ---- wander: every 60–120s the pair walks to a random x along the bottom -
  // Position source: `leftPx` + `leftDur` — the widget animates the container's
  // "left" value with framer-motion (linear, distance-based), never a tick.
  const wanderChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkTO = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return;

    /** Travel range in px, clamped to the real viewport (tighter on mobile). */
    const range = () => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const widgetW = widgetRef.current?.offsetWidth ?? (vw < 640 ? 92 : 124);
      const pad = vw < 640 ? 16 : 8;
      const min = pad;
      const max = Math.max(min, vw - widgetW - pad);
      return { min, max };
    };

    /**
     * ms = time to the next roll. Normal rolls are 60–120s out; a blocked
     * roll (hidden tab / walking / high-priority mood) re-checks in 8–12s.
     */
    const scheduleWander = (ms?: number) => {
      if (wanderChain.current) clearTimeout(wanderChain.current);
      const wait = ms ?? 60000 + Math.random() * 60000;
      wanderChain.current = setTimeout(() => {
        if (document.hidden || walkingRef.current) {
          return scheduleWander(8000 + Math.random() * 4000);
        }
        const m = moodRef.current;
        if (m === 'shy' || m === 'celebrating' || m === 'pouting') {
          return scheduleWander(8000 + Math.random() * 4000); // high-priority override
        }
        const { min, max } = range();
        const target = min + Math.random() * (max - min);
        const dist = Math.abs(target - leftRef.current);
        if (dist < 40) return scheduleWander(); // close enough — just sit here
        const dir: 1 | -1 = target > leftRef.current ? 1 : -1;
        const dur = Math.max(1.2, dist / 70); // ~70 px/s walk
        setWalkingDir(dir);
        setLeftDur(dur);
        setLeftPx(target);
        if (walkTO.current) clearTimeout(walkTO.current);
        walkTO.current = setTimeout(() => setWalkingDir(null), dur * 1000 + 200);
        scheduleWander();
      }, wait);
    };

    scheduleWander();
    const onVis = () => {
      if (walkTO.current) clearTimeout(walkTO.current);
      if (!document.hidden) setTimeout(scheduleWander, 3000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (wanderChain.current) clearTimeout(wanderChain.current);
      if (walkTO.current) clearTimeout(walkTO.current);
    };
  }, [reduced]);

  useEffect(() => {
    const onResize = () => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const widgetW = widgetRef.current?.offsetWidth ?? (vw < 640 ? 92 : 124);
      const pad = vw < 640 ? 16 : 8;
      setLeftPx((x) => Math.min(Math.max(x, pad), Math.max(pad, vw - widgetW - pad)));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ---- one-shot actions: jump / dance / wave / headbutt / peek-up ----------
  // Never the same twice in a row (lastAction tracks it).
  const actChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAction = useRef<OneShotAction | null>(null);

  useEffect(() => {
    if (reduced) return;
    const DURS: Record<OneShotAction, number> = {
      jump: 900,
      dance: 2300,
      wave: 2300,
      headbutt: 1300,
      peekup: 2100,
    };
    const KINDS: OneShotAction[] = ['jump', 'dance', 'wave', 'headbutt', 'peekup'];

    const schedule = () => {
      actChain.current = setTimeout(() => {
        if (!document.hidden && !walkingRef.current) {
          let pick = KINDS[Math.floor(Math.random() * KINDS.length)] ?? 'jump';
          if (pick === lastAction.current) pick = KINDS[(KINDS.indexOf(pick) + 1) % KINDS.length] ?? 'jump';
          lastAction.current = pick;
          setAction({ kind: pick, tick: Date.now() });
          if (actTO.current) clearTimeout(actTO.current);
          actTO.current = setTimeout(() => setAction(null), DURS[pick]);
        }
        schedule();
      }, 14000 + Math.random() * 16000);
    };

    schedule();
    const onVis = () => {
      if (actChain.current) clearTimeout(actChain.current);
      actChain.current = null;
      if (!document.hidden) setTimeout(schedule, 4000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (actChain.current) clearTimeout(actChain.current);
      if (actTO.current) clearTimeout(actTO.current);
    };
  }, [reduced]);

  // ---- cursor-follow gaze (throttled so it costs nothing on slow scrolls) ----
  const lastGazeAt = useRef(0);
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastGazeAt.current < 900) return; // at most one glance per ~1s
      lastGazeAt.current = now;
      const w = window.innerWidth;
      const g: -1 | 0 | 1 = e.clientX < w / 3 ? -1 : e.clientX > (w * 2) / 3 ? 1 : 0;
      setGaze(g);
      setTimeout(() => setGaze((cur) => (cur === g ? 0 : cur)), 2600);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced]);

  // ---- occasional snuggle (the pair leans together, every 45–90s) -----------
  const snuggleChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (reduced) return;
    const schedule = () => {
      snuggleChain.current = setTimeout(() => {
        if (document.hidden || walkingRef.current) return schedule();
        setSnuggle(true);
        setTimeout(() => setSnuggle(false), 3200);
        schedule();
      }, 45000 + Math.random() * 45000);
    };
    schedule();
    const onVis = () => {
      if (snuggleChain.current) clearTimeout(snuggleChain.current);
      snuggleChain.current = null;
      if (!document.hidden) setTimeout(schedule, 3000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (snuggleChain.current) clearTimeout(snuggleChain.current);
    };
  }, [reduced]);

  // ---- staleness: no activity for 45s → they get dozy ------------------------
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armStale = useCallback(() => {
    setStale(false);
    if (staleTimer.current) clearTimeout(staleTimer.current);
    staleTimer.current = setTimeout(() => setStale(true), 45000);
  }, []);
  useEffect(() => {
    armStale();
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'wheel', 'touchstart'];
    const onActivity = () => armStale();
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      if (staleTimer.current) clearTimeout(staleTimer.current);
    };
  }, [armStale]);

  // ---- fast scroll "whoa" + heart drop ---------------------------------------
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let onReset: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      const speed = Math.abs(window.scrollY - lastY) / dt; // px per frame
      lastY = window.scrollY;
      lastTime = now;
      if (speed > 4) {
        push('surprised', 1400);
        setHeartDropTick((t) => t + 1);
        if (onReset) clearTimeout(onReset);
        onReset = setTimeout(() => setHeartDropTick(0), 1400);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (onReset) clearTimeout(onReset);
    };
  }, [reduced, push]);

  // ---- ear twitches + occasional "speech" bubbles ----------------------------
  const twChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (reduced) return;
    const BUBBLES = ['💗', '✨', '🥰', '😴', '🎮', '☕️', '💫'];
    const schedule = () => {
      twChain.current = setTimeout(() => {
        if (!document.hidden && !walkingRef.current) {
          const r = Math.random();
          if (r < 0.55) {
            setEarTwitch({ side: Math.random() < 0.5 ? 'L' : 'R', tick: Date.now() });
            setTimeout(() => setEarTwitch(null), 400);
          } else if (r < 0.8) {
            const b = BUBBLES[Math.floor(Math.random() * BUBBLES.length)] ?? '💗';
            setBubble(b);
            setTimeout(() => setBubble(null), 2600);
          } else {
            setHeartDropTick((t) => t + 1);
            setTimeout(() => setHeartDropTick(0), 1500);
          }
        }
        schedule();
      }, 22000 + Math.random() * 28000);
    };
    schedule();
    const onVis = () => {
      if (twChain.current) clearTimeout(twChain.current);
      twChain.current = null;
      if (!document.hidden) setTimeout(schedule, 4000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (twChain.current) clearTimeout(twChain.current);
    };
  }, [reduced]);

  // ---- first-visit wave ------------------------------------------------------
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    if (!reduced) {
      const t = setTimeout(() => {
        setPawShift(1);
        setTimeout(() => setPawShift(0), 1200);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [reduced]);

  // ---- route-change hop -------------------------------------------------------
  const prevRoute = useRef(pathname);
  useEffect(() => {
    if (prevRoute.current === pathname) return;
    prevRoute.current = pathname;
    if (reduced) return;
    setHop(true);
    const t = setTimeout(() => setHop(false), 400);
    return () => clearTimeout(t);
  }, [pathname, reduced]);

  // ---- hover / click ----------------------------------------------------------
  const pushHover = useCallback((id: 'bear' | 'panda') => {
    push('blush', 1200);
    setWigglingId(id);
    setTimeout(() => setWigglingId((cur) => (cur === id ? null : cur)), 1300);
  }, [push]);

  const click = useCallback((id: 'bear' | 'panda') => {
    setClickTicks((c) => ({ ...c, [id]: c[id] + 1 }));
  }, []);

  return {
    mood,
    blink,
    nod,
    tilt,
    hop,
    pawShift,
    snuggle,
    gaze,
    earTwitch,
    heartDropTick,
    bubble,
    wigglingId,
    clickTicks,
    reduced,
    isGame,
    widgetRef,
    leftPx,
    leftDur,
    walkingDir,
    action,
    crying,
    pushHover,
    click,
  };
}
