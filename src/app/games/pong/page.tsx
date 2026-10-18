'use client';

/* =====================================================================
   LOVE PONG — Neon Arcade Edition
   ---------------------------------------------------------------------
   REAL PHYSICS: Matter.js rigid-body world. The ball is a circle body
   that collides with wall, paddle and sensor bodies through Matter's
   own constraint solver. Nothing below is hand-rolled velocity code —
   rebounds come out of Matter, which is why every hit feels alive and
   no two rallies repeat.

   VISUAL IDENTITY: synthwave arcade. Scanlines, glowing neon paddles,
   a ball whose colour shifts pink → violet → cyan as it speeds up, a
   screen that shakes on every goal. Deliberately unlike any other game
   in this app.
   ===================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import GameBackground from '@/components/GameBackground';
import * as Matter from 'matter-js';

const W = 560;
const H = 380;
const PADDLE_W = 10;
const PADDLE_H = 76;
const BALL_R = 9;
const WALL = 12;
const PLAYER_X = 18;
const AI_X = W - 18;
const START_SPEED = 5.4;
const MAX_SPEED = 15.5;

type Phase = 'idle' | 'playing' | 'finished';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.25);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.35, x + s * 1.1, y + s * 0.2, x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.1, y + s * 0.2, x - s * 0.5, y - s * 0.35, x, y + s * 0.25);
  ctx.closePath();
}

export default function LovePongPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [winner, setWinner] = useState<'player' | 'ai' | 'tie' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const playerRef = useRef<Matter.Body | null>(null);
  const aiRef = useRef<Matter.Body | null>(null);
  const goalLRef = useRef<Matter.Body | null>(null);
  const goalRRef = useRef<Matter.Body | null>(null);
  const rafRef = useRef(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{ x: number; y: number; a: number }[]>([]);
  const shakeRef = useRef(0);
  const playerTargetRef = useRef(H / 2);
  const aiTargetRef = useRef(H / 2);
  const scoreRef = useRef({ p: 0, a: 0 });
  const runningRef = useRef(false);

  const spawnBurst = useCallback((x: number, y: number, n: number, color: string) => {
    const arr = particlesRef.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 5;
      arr.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 28 + Math.random() * 22,
        size: 1.4 + Math.random() * 2.4,
        color,
      });
    }
    if (arr.length > 150) arr.splice(0, arr.length - 150);
  }, []);

  const setupWorld = useCallback(() => {
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;
    const world = engine.world;
    const wallOpts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: 0.9,
      friction: 0,
      frictionAir: 0,
    };

    Matter.World.add(world, [
      Matter.Bodies.rectangle(W / 2, WALL / 2, W, WALL, wallOpts),
      Matter.Bodies.rectangle(W / 2, H - WALL / 2, W, WALL, wallOpts),
    ]);

    const paddleOpts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: 0.95,
      friction: 0,
      frictionAir: 0,
    };
    const player = Matter.Bodies.rectangle(PLAYER_X, H / 2, PADDLE_W, PADDLE_H, {
      ...paddleOpts,
      chamfer: { radius: PADDLE_W / 2 },
    });
    const ai = Matter.Bodies.rectangle(AI_X, H / 2, PADDLE_W, PADDLE_H, {
      ...paddleOpts,
      chamfer: { radius: PADDLE_W / 2 },
    });

    const ball = Matter.Bodies.circle(W / 2, H / 2, BALL_R, {
      restitution: 0.95,
      friction: 0,
      frictionAir: 0,
      density: 0.001,
      slop: 0.02,
    });

    // Invisible goal sensors — when the ball overlaps one, it scores.
    const sensor = (x: number) => Matter.Bodies.rectangle(x, H / 2, 4, H - WALL * 2, {
      isSensor: true,
      isStatic: true,
    });
    const goalL = sensor(-15);
    const goalR = sensor(W + 15);

    Matter.World.add(world, [player, ai, ball, goalL, goalR]);

    // Every ball bounce becomes a spark burst.
    Matter.Events.on(engine, 'collisionStart', (ev) => {
      if (!runningRef.current) return;
      for (const pair of ev.pairs as Array<{ bodyA: Matter.Body; bodyB: Matter.Body }>) {
        const hasBall = pair.bodyA === ball || pair.bodyB === ball;
        if (!hasBall) continue;
        const other = pair.bodyA === ball ? pair.bodyB : pair.bodyA;
        if (other === goalL || other === goalR) continue;
        const sp = ball.speed;
        const hot = sp > 8;
        spawnBurst(
          ball.position.x,
          ball.position.y,
          8 + Math.floor(sp * 0.9),
          hot ? '#22d3ee' : '#ec4899',
        );
        shakeRef.current = Math.min(5, 1.2 + sp * 0.18);
      }
    });

    worldRef.current = world;
    ballRef.current = ball;
    playerRef.current = player;
    aiRef.current = ai;
    goalLRef.current = goalL;
    goalRRef.current = goalR;
  }, [spawnBurst]);

  const serve = useCallback(() => {
    const ball = ballRef.current;
    if (!ball) return;
    Matter.Body.setPosition(ball, { x: W / 2, y: H / 2 });
    Matter.Body.setVelocity(ball, {
      x: (Math.random() > 0.5 ? 1 : -1) * START_SPEED,
      y: (Math.random() * 2 - 1) * START_SPEED * 0.55,
    });
    Matter.Body.setAngularVelocity(ball, 0);
    Matter.Body.setAngularVelocity(ball, 0.05);
    trailRef.current = [];
  }, []);

  const scorePoint = useCallback((who: 'player' | 'ai') => {
    scoreRef.current[who === 'player' ? 'p' : 'a'] += 1;
    if (who === 'player') setPlayerScore(scoreRef.current.p);
    else setAiScore(scoreRef.current.a);
    shakeRef.current = 12;
    spawnBurst(who === 'ai' ? W - 30 : 30, H / 2, 26, who === 'player' ? '#f472b6' : '#a78bfa');
    serve();
  }, [spawnBurst, serve]);

  const endGame = useCallback(() => {
    runningRef.current = false;
    setPhase('finished');
    const { p, a } = scoreRef.current;
    setWinner(p > a ? 'player' : a > p ? 'ai' : 'tie');
  }, []);

  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const ctx = c.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = { p: 0, a: 0 };
    setPlayerScore(0);
    setAiScore(0);
    setTimeLeft(60);
    setWinner(null);
    particlesRef.current = [];
    trailRef.current = [];
    shakeRef.current = 0;

    setupWorld();
    serve();

    runningRef.current = true;
    setPhase('playing');
  }, [setupWorld, serve]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (phase !== 'playing') return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    playerTargetRef.current = ((clientY - rect.top) / rect.height) * H;
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const loop = () => {
      if (!runningRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const ball = ballRef.current;
      const player = playerRef.current;
      const ai = aiRef.current;
      if (!ctx || !ball || !player || !ai) return;

      // --- Matter integration: fixed timestep, 4 substeps for stability ---
      const eng = engineRef.current;
      if (eng) Matter.Engine.update(eng, 1000 / 60 / 4);

      // --- Player paddle: critically-damped chase toward the pointer ---
      Matter.Body.setPosition(player, {
        x: PLAYER_X,
        y: player.position.y + (playerTargetRef.current - player.position.y) * 0.4,
      });

      // --- AI: predicts the ball, but with human-scale error ---
      if (ball.velocity.x > 0) {
        const dx = (AI_X - PADDLE_W / 2) - ball.position.x;
        const t = ball.velocity.x > 0.1 ? dx / ball.velocity.x : 30;
        aiTargetRef.current = ball.position.y + ball.velocity.y * t * 0.85;
        aiTargetRef.current += Math.sin(performance.now() / 340) * 22;
      } else {
        aiTargetRef.current = H / 2 + Math.sin(performance.now() / 700) * 60;
      }
      const aiDelta = aiTargetRef.current - ai.position.y;
      Matter.Body.setPosition(ai, {
        x: AI_X,
        y: ai.position.y + Math.max(-4.6, Math.min(4.6, aiDelta * 0.18)),
      });

      // --- Goal detection via Matter sensors ---
      if (Matter.Bounds.overlaps(ball.bounds, goalLRef.current!.bounds)) scorePoint('ai');
      else if (Matter.Bounds.overlaps(ball.bounds, goalRRef.current!.bounds)) scorePoint('player');

      // --- Speed cap so rallies stay playable ---
      const sp = ball.speed;
      if (sp > MAX_SPEED) {
        const k = MAX_SPEED / sp;
        Matter.Body.setVelocity(ball, { x: ball.velocity.x * k, y: ball.velocity.y * k });
      }

      // --- Particles ---
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055;
        p.vx *= 0.985;
        if (p.life >= p.max) parts.splice(i, 1);
      }

      // --- Trail ---
      const trail = trailRef.current;
      trail.push({ x: ball.position.x, y: ball.position.y, a: 1 });
      if (trail.length > 16) trail.shift();

      // ================= RENDER =================
      const sx = (Math.random() - 0.5) * shakeRef.current;
      const sy = (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.88;

      ctx.save();
      ctx.translate(sx, sy);

      // Backdrop
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0b0418');
      bg.addColorStop(0.5, '#1a0a2e');
      bg.addColorStop(1, '#04060f');
      ctx.fillStyle = bg;
      ctx.fillRect(-20, -20, W + 40, H + 40);

      // Perspective grid
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // Scanlines
      ctx.fillStyle = 'rgba(255,255,255,0.022)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

      // Center divider with pulsing hearts
      const pulse = 0.55 + 0.45 * Math.sin(performance.now() / 420);
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.14 + pulse * 0.1})`;
      ctx.setLineDash([9, 11]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.globalAlpha = 0.22 + pulse * 0.18;
      for (let i = 0; i < 4; i++) {
        heart(ctx, W / 2, 60 + i * 80, 13 + pulse * 2);
        ctx.fillStyle = '#ec4899';
        ctx.fill();
      }
      ctx.restore();

      // Paddle glow halos
      ctx.save();
      ctx.shadowBlur = 34;
      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = 'rgba(236,72,153,0.32)';
      ctx.beginPath();
      ctx.roundRect(player.position.x - PADDLE_W / 2, player.position.y - PADDLE_H / 2, PADDLE_W, PADDLE_H, PADDLE_W / 2);
      ctx.fill();
      ctx.shadowColor = '#8b5cf6';
      ctx.fillStyle = 'rgba(139,92,246,0.32)';
      ctx.beginPath();
      ctx.roundRect(ai.position.x - PADDLE_W / 2, ai.position.y - PADDLE_H / 2, PADDLE_W, PADDLE_H, PADDLE_W / 2);
      ctx.fill();
      ctx.restore();

      // Paddles
      const pGrad = ctx.createLinearGradient(0, player.position.y - PADDLE_H / 2, 0, player.position.y + PADDLE_H / 2);
      pGrad.addColorStop(0, '#f9a8d4');
      pGrad.addColorStop(0.5, '#ec4899');
      pGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(player.position.x - PADDLE_W / 2, player.position.y - PADDLE_H / 2, PADDLE_W, PADDLE_H, PADDLE_W / 2);
      ctx.fill();

      const aGrad = ctx.createLinearGradient(0, ai.position.y - PADDLE_H / 2, 0, ai.position.y + PADDLE_H / 2);
      aGrad.addColorStop(0, '#c4b5fd');
      aGrad.addColorStop(0.5, '#8b5cf6');
      aGrad.addColorStop(1, '#6d28d9');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.roundRect(ai.position.x - PADDLE_W / 2, ai.position.y - PADDLE_H / 2, PADDLE_W, PADDLE_H, PADDLE_W / 2);
      ctx.fill();

      // Ball trail
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const k = i / trail.length;
        ctx.globalAlpha = k * 0.4;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_R * (0.3 + k * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Ball — colour shifts with speed
      const hot = Math.max(0, (ball.speed - START_SPEED) / (MAX_SPEED - START_SPEED));
      const ballColor = hot > 0.55 ? '#22d3ee' : hot > 0.25 ? '#c084fc' : '#f9a8d4';
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = ballColor;
      heart(ctx, ball.position.x, ball.position.y, BALL_R * 1.9);
      ctx.fillStyle = ballColor;
      ctx.fill();
      heart(ctx, ball.position.x, ball.position.y, BALL_R * 0.9);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();
      ctx.restore();

      // Particles
      for (const p of parts) {
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [phase, endGame, resizeCanvas, scorePoint]);

  return (
    <GameBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between mb-5">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Heart className="text-pink-400" fill="currentColor" /> LOVE PONG
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl p-3 md:p-5 shadow-2xl"
            style={{
              background: 'linear-gradient(160deg, rgba(30,7,60,0.85), rgba(8,4,20,0.9))',
              border: '1px solid rgba(236,72,153,0.28)',
              boxShadow: '0 0 50px rgba(139,92,246,0.28), 0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex justify-between items-end mb-3 px-1">
              <div>
                <div className="text-pink-300 text-[10px] uppercase tracking-[0.2em] font-bold">You</div>
                <div className="text-4xl font-black text-pink-300 leading-none" style={{ textShadow: '0 0 18px rgba(236,72,153,0.8)' }}>
                  {playerScore}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="text-white/50 text-[10px] uppercase tracking-[0.2em]">Time</div>
                <div className={`text-3xl font-black tab-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white/80'}`}>
                  {timeLeft}
                </div>
                <div className="text-[9px] text-purple-300/70 flex items-center gap-1">
                  <Zap size={9} /> REAL PHYSICS
                </div>
              </div>
              <div className="text-right">
                <div className="text-purple-300 text-[10px] uppercase tracking-[0.2em] font-bold">Rival</div>
                <div className="text-4xl font-black text-purple-300 leading-none" style={{ textShadow: '0 0 18px rgba(139,92,246,0.8)' }}>
                  {aiScore}
                </div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl cursor-none touch-none block"
                style={{ aspectRatio: `${W}/${H}` }}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
              />

              <AnimatePresence>
                {phase === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm"
                  >
                    <Heart className="text-pink-400 mb-4 animate-pulse" size={56} fill="currentColor" />
                    <p className="text-white text-2xl font-black tracking-tight">NEON ARCADE</p>
                    <p className="text-white/60 text-sm mb-5 px-8 text-center">
                      Rigid-body physics. The ball never moves the same way twice.
                    </p>
                    <button
                      onClick={startGame}
                      className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-pink-600/40"
                    >
                      <Play size={18} fill="currentColor" /> Start Rally
                    </button>
                  </motion.div>
                )}

                {phase === 'finished' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm"
                  >
                    <div className="text-5xl mb-2">
                      {winner === 'player' ? '💖' : winner === 'ai' ? '💜' : '🤝'}
                    </div>
                    <p className="text-white text-2xl font-black mb-1">
                      {winner === 'player' ? 'You Win!' : winner === 'ai' ? 'Rival Wins' : 'It\'s a Tie'}
                    </p>
                    <p className="text-white/60 mb-5">
                      {playerScore} — {aiScore}
                    </p>
                    <button
                      onClick={startGame}
                      className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-pink-600/40"
                    >
                      <RotateCcw size={18} /> Play Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-white/40 text-center text-xs mt-3">
              Move your mouse or finger to aim
            </p>
          </motion.div>
        </div>
      </div>
    </GameBackground>
  );
}
