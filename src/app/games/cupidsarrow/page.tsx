'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_W = 500;
const GAME_H = 600;
const ARCHER_X = 60;
const ARROW_SPEED = 8;
const TARGETS = [
  { label: '💕', points: 10 },
  { label: '💖', points: 20 },
  { label: '💗', points: 15 },
  { label: '💘', points: 25 },
  { label: '💝', points: 30 },
  { label: '👑', points: 50 },
  { label: '⭐', points: 35 },
  { label: '🏆', points: 40 },
];

export default function CupidsArrowPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState<{ x: number; y: number; id: number }[]>([]);
  const [targets, setTargets] = useState<
    { x: number; y: number; type: number; id: number; hit?: boolean }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const targetIdRef = useRef(0);
  const arrowIdRef = useRef(0);

  useEffect(() => {
    const b = localStorage.getItem('cupidsarrow_best');
    if (b) setBest(Number(b));
  }, []);

  const spawnTarget = useCallback(() => {
    const id = targetIdRef.current++;
    const type = Math.floor(Math.random() * TARGETS.length);
    const y = 80 + Math.random() * (GAME_H - 200);
    setTargets((prev) => {
      if (prev.length > 5) return prev;
      return [...prev, { x: GAME_W - 80, y, type, id }];
    });
  }, []);

  const startGame = useCallback(() => {
    setArrows([]);
    setTargets([]);
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setState('playing');
  }, []);

  const shoot = useCallback(() => {
    if (state !== 'playing') return;
    const id = arrowIdRef.current++;
    setArrows((prev) => [...prev, { x: ARCHER_X + 30, y: GAME_H / 2 + 20, id }]);
  }, [state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setState('finished');
          if (score > best) {
            setBest(score);
            localStorage.setItem('cupidsarrow_best', String(score));
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const spawnInterval = setInterval(() => spawnTarget(), 1200);

    let running = true;
    const loop = () => {
      if (!running) return;

      setArrows((prevArrows) => {
        const updated = prevArrows
          .map((a) => ({ ...a, x: a.x + ARROW_SPEED }))
          .filter((a) => a.x < GAME_W + 50);

        setTargets((prevTargets) => {
          const moving = prevTargets
            .map((t) => ({ ...t, x: t.x - 1.5 }))
            .filter((t) => t.x > -60);

          let hitScore = 0;
          let hitCombo = 0;

          const remaining = moving.map((t) => {
            if (t.hit) return t;
            const hitArrow = updated.find(
              (a) =>
                !a._used &&
                Math.abs(a.x - t.x) < 35 &&
                Math.abs(a.y - t.y) < 35,
            );
            if (hitArrow) {
              (hitArrow as any)._used = true;
              hitCombo++;
              const multiplier = Math.min(hitCombo, 5);
              hitScore += TARGETS[t.type].points * multiplier;
              return { ...t, hit: true };
            }
            return t;
          });

          const usedCount = updated.filter((a) => (a as any)._used).length;
          const filteredArrows = updated.filter((a) => !(a as any)._used);

          if (hitScore > 0) {
            setScore((s) => {
              const ns = s + hitScore;
              return ns;
            });
            setCombo(hitCombo);
          }

          return remaining;
        });

        return updated;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [state, spawnTarget, best, score]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (state === 'idle') startGame();
        else if (state === 'playing') shoot();
      }
    },
    [state, startGame, shoot],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400" /> Cupid's Arrow
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-2xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-2xl font-bold text-pink-300">{best}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Time</div>
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_W}
                height={GAME_H}
                className="w-full rounded-2xl cursor-pointer"
                style={{ aspectRatio: `${GAME_W}/${GAME_H}` }}
                onClick={() => {
                  if (state === 'idle') startGame();
                  else if (state === 'playing') shoot();
                }}
              />

              <AnimatePresence>
                {state === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl"
                  >
                    <Sparkles className="text-yellow-400 mb-3" size={48} />
                    <p className="text-white text-lg font-bold">Click or Space to Shoot</p>
                    <p className="text-white/60 text-sm">Hit the hearts for points!</p>
                  </motion.div>
                )}

                {state === 'finished' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl"
                  >
                    <Trophy className="text-yellow-400 mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 200 ? '🏆 Cupid Champion!' : score >= 100 ? '💖 Great Shot!' : '💕 Nice Aim!'}
                    </h2>
                    <p className="text-white/80 mb-4">Score: {score}</p>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                      <RotateCcw size={18} /> Play Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}
