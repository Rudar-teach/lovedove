'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const HEART_W = 40;
const HEART_H = 40;
const GRAVITY = 0.35;
const PIPE_W = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.5;
const PIPE_INTERVAL = 1800;

export default function FlappyHeartPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const b = localStorage.getItem('flappyheart_best');
    if (b) setBest(Number(b));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    let heartY = H / 2;
    let heartVel = 0;
    let pipes: { x: number; gapY: number; scored: boolean }[] = [];
    let frameCount = 0;
    let gameScore = 0;
    let animId: number;
    let lastPipe = 0;
    let running = false;

    const drawHeart = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      const s = HEART_W / 30;
      ctx.moveTo(0, 5 * s);
      ctx.bezierCurveTo(-15 * s, -10 * s, -25 * s, 5 * s, 0, 20 * s);
      ctx.moveTo(0, 5 * s);
      ctx.bezierCurveTo(15 * s, -10 * s, 25 * s, 5 * s, 0, 20 * s);
      ctx.fill();
      ctx.restore();
    };

    const drawPipe = (x: number, gapY: number) => {
      const topH = gapY - PIPE_GAP / 2;
      const botY = gapY + PIPE_GAP / 2;
      const botH = H - botY;

      const grad1 = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
      grad1.addColorStop(0, '#4c1d95');
      grad1.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad1;
      ctx.fillRect(x, 0, PIPE_W, topH);

      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(x - 4, topH - 12, PIPE_W + 8, 12);

      const grad2 = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
      grad2.addColorStop(0, '#4c1d95');
      grad2.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad2;
      ctx.fillRect(x, botY, PIPE_W, botH);

      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(x - 4, botY, PIPE_W + 8, 12);
    };

    const loop = () => {
      if (!running) return;

      heartVel += GRAVITY;
      heartY += heartVel;

      frameCount++;
      if (frameCount - lastPipe > PIPE_INTERVAL / (PIPE_SPEED * 3)) {
        const minGap = 80;
        const maxGap = H - 80 - PIPE_GAP;
        const gapY = Math.random() * (maxGap - minGap) + minGap + PIPE_GAP / 2;
        pipes.push({ x: W, gapY, scored: false });
        lastPipe = frameCount;
      }

      pipes.forEach((p) => (p.x -= PIPE_SPEED));

      pipes = pipes.filter((p) => {
        if (!p.scored && p.x + PIPE_W < 60) {
          p.scored = true;
          gameScore++;
          setScore(gameScore);
        }
        return p.x > -PIPE_W;
      });

      // collision
      const cx = 60;
      for (const p of pipes) {
        if (cx + HEART_W / 2 > p.x && cx - HEART_W / 2 < p.x + PIPE_W) {
          const topPipeBottom = p.gapY - PIPE_GAP / 2;
          const botPipeTop = p.gapY + PIPE_GAP / 2;
          if (heartY - HEART_H / 2 < topPipeBottom || heartY + HEART_H / 2 > botPipeTop) {
            running = false;
            setState('finished');
            if (gameScore > best) {
              setBest(gameScore);
              localStorage.setItem('flappyheart_best', String(gameScore));
            }
            return;
          }
        }
      }

      if (heartY < 0 || heartY > H) {
        running = false;
        setState('finished');
        if (gameScore > best) {
          setBest(gameScore);
          localStorage.setItem('flappyheart_best', String(gameScore));
        }
        return;
      }

      // draw
      ctx.clearRect(0, 0, W, H);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // stars
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 47 + frameCount * 0.3) % W;
        const sy = (i * 31) % H;
        const sz = ((i * 13) % 3) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      pipes.forEach((p) => drawPipe(p.x, p.gapY));
      drawHeart(cx, heartY);

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(gameScore), W / 2, 50);

      animId = requestAnimationFrame(loop);
    };

    const startGame = () => {
      heartY = H / 2;
      heartVel = 0;
      pipes = [];
      gameScore = 0;
      frameCount = 0;
      lastPipe = 0;
      running = true;
      setScore(0);
      setState('playing');
      loop();
    };

    const flap = () => {
      if (state === 'idle') {
        startGame();
      } else if (state === 'playing') {
        heartVel = -7;
      }
    };

    (window as any).__flappyFlap = flap;

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      delete (window as any).__flappyFlap;
    };
  }, [best, state]);

  const restart = useCallback(() => {
    setState('idle');
    setScore(0);
  }, []);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Flappy Heart
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="w-full rounded-2xl cursor-pointer"
                style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
                onClick={() => (window as any).__flappyFlap?.()}
              />

              {state === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl"
                >
                  <Heart className="text-pink-400 mb-2" size={48} />
                  <p className="text-white text-lg font-bold">Tap or Space to Fly</p>
                  <p className="text-white/60 text-sm">Avoid the purple pipes!</p>
                </motion.div>
              )}

              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {score >= 20 ? '🏆 Amazing!' : score >= 10 ? '💖 Great!' : '💕 Good Try!'}
                  </h2>
                  <p className="text-white/80 mb-4">Score: {score}</p>
                  <button
                    onClick={restart}
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold flex items-center gap-2"
                  >
                    <RotateCcw size={18} /> Play Again
                  </button>
                </motion.div>
              )}
            </div>

            {state === 'playing' && (
              <p className="text-center text-white/50 text-sm mt-2">Tap / Space to flap</p>
            )}
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}
