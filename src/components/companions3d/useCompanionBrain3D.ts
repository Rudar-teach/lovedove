'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { WIN_EVENT, LOSE_EVENT } from '@/lib/winCelebrate';
import type { Mood, OneShotAction, ActionState } from '../companions/types';

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

export interface Companion3DBrain {
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
  pushHover: (id: 'bear' | 'panda') => void;
  click: (id: 'bear' | 'panda') => void;
}

export function useCompanionBrain3D(): Companion3DBrain {
  const reduced = useReducedMotion() ?? false;

  const [overrides, setOverrides] = useState<{ mood: Mood; expires: number | null; prio: number }[]>([]);
  const [blink, setBlink] = useState(false);
  const [nod, setNod] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [crying, setCrying] = useState(false);
  const [shy, setShy] = useState(false);
  const [surprised, setSurprised] = useState(false);
  const [winBounce, setWinBounce] = useState(false);
  const [walkDir, setWalkDir] = useState<-1 | 0 | 1>(0);
  const [pawShift, setPawShift] = useState<-1 | 0 | 1>(0);
  const [action, setAction] = useState<ActionState | null>(null);
  const [hovered, setHovered] = useState(false);
  const [clickTick, setClickTick] = useState(0);
  const [stale, setStale] = useState(false);
  const [gaze, setGaze] = useState<-1 | 0 | 1>(0);

  const moodRef = useRef<Mood>('idle');
  const walkRef = useRef(0);
  const actionRef = useRef<ActionState | null>(null);

  // ---- mood resolution ------------------------------------------------------
  const isGame = typeof window !== 'undefined' && window.location.pathname.includes('/games');
  const base: Mood = isGame ? 'cheering' : stale ? 'drowsy' : 'idle';
  const currentMood: Mood = overrides.reduce<Mood>((best, o) => {
    if (o.expires !== null && o.expires < Date.now()) return best;
    return PRIO[o.mood] > PRIO[best] ? o.mood : best;
  }, base);

  useEffect(() => { moodRef.current = currentMood; }, [currentMood]);
  useEffect(() => { walkRef.current = walkDir; }, [walkDir]);
  useEffect(() => { actionRef.current = action; }, [action]);

  const push = useCallback((m: Mood, ttl: number | null) => {
    setOverrides((prev) => {
      const next = prev.filter((o) => o.mood !== m);
      next.push({ mood: m, expires: ttl === null ? null : Date.now() + ttl, prio: PRIO[m] });
      return next;
    });
    if (ttl !== null) {
      setTimeout(() => {
        setOverrides((prev) => prev.filter((o) => !(o.mood === m && o.expires !== null && o.expires <= Date.now())));
      }, ttl + 50);
    }
  }, []);

  // ---- win / lose -----------------------------------------------------------
  const tearTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winTO = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onWin = () => {
      push('celebrating', 4000);
      setWinBounce(true);
      if (winTO.current) clearTimeout(winTO.current);
      winTO.current = setTimeout(() => setWinBounce(false), 4000);
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
      if (winTO.current) clearTimeout(winTO.current);
    };
  }, [push]);

  // ---- blink chain ----------------------------------------------------------
  const blinkChain = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTO = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return;
    const schedule = () => {
      blinkChain.current = setTimeout(() => {
        if (document.hidden) return schedule();
        setBlink(true);
        if (blinkTO.current) clearTimeout(blinkTO.current);
        blinkTO.current = setTimeout(() => setBlink(false), 150);
        schedule();
      }, 2000 + Math.random() * 4000);
    };
    schedule();
    const onVis = () => {
      if (blinkChain.current) clearTimeout(blinkChain.current);
      if (blinkTO.current) clearTimeout(blinkTO.current);
      if (!document.hidden) setTimeout(schedule, 1000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (blinkChain.current) clearTimeout(blinkChain.current);
      if (blinkTO.current) clearTimeout(blinkTO.current);
    };
  }, [reduced]);

  // ---- idle drift (head tilt, arm shift) ------------------------------------
  const driftChain = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return;
    const schedule = () => {
      driftChain.current = setTimeout(() => {
        if (document.hidden) return schedule();
        if (walkRef.current || actionRef.current) return schedule();
        const r = Math.random();
        if (r < 0.4) {
          const deg = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3);
          setTilt(deg);
          setTimeout(() => setTilt(0), 2200 + Math.random() * 1500);
        } else if (r < 0.65) {
          setPawShift((Math.random() < 0.5 ? -1 : 1) as -1 | 1);
          setTimeout(() => setPawShift(0), 1500 + Math.random() * 2000);
        }
        schedule();
      }, 3000 + Math.random() * 3000);
    };
    schedule();
    const onVis = () => {
      if (driftChain.current) clearTimeout(driftChain.current);
      if (!document.hidden) setTimeout(schedule, 1000);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (driftChain.current) clearTimeout(driftChain.current);
    };
  }, [reduced]);

  // ---- one-shot actions -----------------------------------------------------
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
        if (!document.hidden && !walkRef.current) {
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
      if (actTO.current) clearTimeout(actTO.current);
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

  // ---- typing / password ----------------------------------------------------
  useEffect(() => {
    let nodTO: ReturnType<typeof setTimeout> | null = null;

    const onInput = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLTextAreaElement)) return;
      const type = (t as HTMLInputElement).type;
      if (type === 'password') {
        setShy(true);
      } else {
        setNod(true);
        if (nodTO) clearTimeout(nodTO);
        nodTO = setTimeout(() => setNod(false), 140);
      }
    };

    const onFocusOut = () => setShy(false);

    document.addEventListener('keydown', onInput);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      document.removeEventListener('keydown', onInput);
      document.removeEventListener('focusout', onFocusOut);
      if (nodTO) clearTimeout(nodTO);
    };
  }, []);

  // ---- cursor-follow gaze ---------------------------------------------------
  useEffect(() => {
    if (reduced) return;
    let lastAt = 0;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastAt < 900) return;
      lastAt = now;
      const w = window.innerWidth;
      const g: -1 | 0 | 1 = e.clientX < w / 3 ? -1 : e.clientX > (w * 2) / 3 ? 1 : 0;
      setGaze(g);
      setTimeout(() => setGaze(0), 2600);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced]);

  // ---- fast scroll "whoa" ---------------------------------------------------
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let resetTO: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      const speed = Math.abs(window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastTime = now;
      if (speed > 4) {
        push('surprised', 1400);
        setSurprised(true);
        if (resetTO) clearTimeout(resetTO);
        resetTO = setTimeout(() => setSurprised(false), 1400);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (resetTO) clearTimeout(resetTO);
    };
  }, [reduced, push]);

  // ---- staleness (dozy after 45s idle) --------------------------------------
  const staleTO = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armStale = useCallback(() => {
    setStale(false);
    if (staleTO.current) clearTimeout(staleTO.current);
    staleTO.current = setTimeout(() => setStale(true), 45000);
  }, []);

  useEffect(() => {
    armStale();
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'wheel', 'touchstart'];
    const onActivity = () => armStale();
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      if (staleTO.current) clearTimeout(staleTO.current);
    };
  }, [armStale]);

  // ---- hover / click --------------------------------------------------------
  const pushHover = useCallback((_id: 'bear' | 'panda') => {
    setHovered(true);
    push('blush', 1200);
  }, [push]);

  const click = useCallback(() => {
    setClickTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const onLeave = () => setHovered(false);
    window.addEventListener('mouseleave', onLeave);
    return () => window.removeEventListener('mouseleave', onLeave);
  }, []);

  return {
    mood: currentMood,
    action,
    gazeX: gaze,
    blink,
    crying,
    nod,
    shy,
    surprised,
    winBounce,
    hovered,
    walkDir,
    pawShift,
    tilt,
    reduced,
    clickTick,
    pushHover,
    click,
  };
}
