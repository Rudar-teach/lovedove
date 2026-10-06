'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_W = 400;
const GAME_H = 400;
const GRID = 20;
const CELL = GAME_W / GRID;

const LOVE_WORDS = ['LOVE', 'KISS', 'HUG', 'SOUL', 'DEAR', 'BABE', 'CARE', 'WARM', 'HOLD', 'TRUE', 'PASS', 'BLISS', 'EASY', 'DREAM', 'HONEY', 'SWEET'];

export default function LoveSnakePage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dirRef = useRef({ x: 1, y: 0 });
  const gameLoopRef = useRef<number>(0);
  const lastMoveRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    const b = localStorage.getItem('lovesnake_best');
    if (b) setBest(Number(b));
  }, []);

  const spawnFood = useCallback((snakeBody: { x: number; y: number }[]) => {
    let fx, fy;
    do {
      fx = Math.floor(Math.random() * GRID);
      fy = Math.floor(Math.random() * GRID);
    } while (snakeBody.some((s) => s.x === fx && s.y === fy));
    setFood({ x: fx, y: fy });
  }, []);

  const startGame = useCallback(() => {
    const initial: { x: number; y: number }[] = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    setSnake(initial);
    dirRef.current = { x: 1, y: 0 };
    setDir({ x: 1, y: 0 });
    scoreRef.current = 0;
    setScore(0);
    spawnFood(initial);
    setState('playing');
  }, [spawnFood]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (state !== 'playing') return;
      const d = dirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (d.y !== 1) dirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (d.y !== -1) dirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (d.x !== 1) dirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (d.x !== -1) dirRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let snakeData = [...snake];
    let foodData = { ...food };
    let lastTime = performance.now();
    let running = true;
    const SPEED = 120;

    const loop = (now: number) => {
      if (!running) return;
      const delta = now - lastTime;

      if (delta >= SPEED) {
        lastTime = now;
        const d = dirRef.current;
        const head = { x: snakeData[0].x + d.x, y: snakeData[0].y + d.y };

        // wall collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          running = false;
          setState('finished');
          if (scoreRef.current > best) {
            setBest(scoreRef.current);
            localStorage.setItem('lovesnake_best', String(scoreRef.current));
          }
          return;
        }

        // self collision
        if (snakeData.some((s) => s.x === head.x && s.y === head.y)) {
          running = false;
          setState('finished');
          if (scoreRef.current > best) {
            setBest(scoreRef.current);
            localStorage.setItem('lovesnake_best', String(scoreRef.current));
          }
          return;
        }

        snakeData.unshift(head);

        if (head.x === foodData.x && head.y === foodData.y) {
          scoreRef.current += 10;
          setScore(scoreRef.current);
          spawnFood(snakeData);
          foodData = { ...food };
        } else {
          snakeData.pop();
        }
      }

      // draw
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      // bg
      const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, GAME_H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(GAME_W, i * CELL);
        ctx.stroke();
      }

      // food
      ctx.font = `${CELL - 4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const foodEmojis = ['💕', '💖', '💗', '💘'];
      ctx.fillText(foodEmojis[scoreRef.current % foodEmojis.length], foodData.x * CELL + CELL / 2, foodData.y * CELL + CELL / 2 + 2);

      // snake
      snakeData.forEach((seg, i) => {
        const alpha = 1 - i / (snakeData.length + 5);
        ctx.fillStyle = i === 0 ? '#ec4899' : `rgba(236, 72, 153, ${alpha})`;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = i === 0 ? 10 : 0;
        const pad = i === 0 ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (i === 0) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(seg.x * CELL + CELL / 2 - 5, seg.y * CELL + CELL / 2 - 3, 2.5, 0, Math.PI * 2);
          ctx.arc(seg.x * CELL + CELL / 2 + 5, seg.y * CELL + CELL / 2 - 3, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(scoreRef.current), GAME_W / 2, 30);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [state, snake, food, spawnFood, best]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Love Snake
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
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Best</div>
                <div className="text-xl font-bold text-pink-300">{best}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Length</div>
                <div className="text-xl font-bold text-white">{snake.length}</div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_W}
                height={GAME_H}
                className="w-full rounded-2xl"
                style={{ aspectRatio: '1/1' }}
              />

              <AnimatePresence>
                {state === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl"
                  >
                    <Heart className="text-pink-400 mb-3" size={48} />
                    <p className="text-white text-lg font-bold">Love Snake</p>
                    <p className="text-white/60 text-sm">Arrow keys or WASD to move</p>
                    <button
                      onClick={startGame}
                      className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                      <Play size={18} /> Start
                    </button>
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
                      {score >= 200 ? '🏆 Incredible!' : score >= 100 ? '💖 Great!' : '💕 Good Try!'}
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
