'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 120;
const MIN_SPEED = 60;

type Pos = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const dirRef = useRef<Direction>('right');

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'snake',
      players: [session.user.id],
      game_state: { score: 0 },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
    const stored = localStorage.getItem('snakeHighScore');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const spawnFood = useCallback((currentSnake: Pos[]): Pos => {
    let newFood: Pos;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const reset = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDir('right');
    dirRef.current = 'right';
    setScore(0);
    setGameOver(false);
    setIsRunning(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [spawnFood]);

  const step = useCallback(() => {
    setSnake(prev => {
      const currentDir = dirRef.current;
      const head = prev[0];
      const newHead: Pos = {
        x: head.x + (currentDir === 'right' ? 1 : currentDir === 'left' ? -1 : 0),
        y: head.y + (currentDir === 'down' ? 1 : currentDir === 'up' ? -1 : 0),
      };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setIsRunning(false);
        return prev;
      }

      // Self collision
      if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        setIsRunning(false);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const ns = s + 10;
          if (ns > highScore) {
            setHighScore(ns);
            localStorage.setItem('snakeHighScore', ns.toString());
          }
          return ns;
        });
        setFood(spawnFood(newSnake));
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, spawnFood, highScore]);

  const tick = useCallback(() => {
    if (!isRunning || gameOver) return;
    step();
    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - score * 2);
    gameLoopRef.current = window.setTimeout(tick, speed);
  }, [isRunning, gameOver, step, score]);

  useEffect(() => {
    tick();
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [tick]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1a0025';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Food (heart-shaped glow)
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const glowGradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, CELL_SIZE);
    glowGradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    glowGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    const fx = food.x * CELL_SIZE + 2;
    const fy = food.y * CELL_SIZE + 2;
    const fs = CELL_SIZE - 4;
    ctx.arc(fx + fs / 2, fy + fs / 3, fs / 4, 0, Math.PI * 2);
    ctx.arc(fx + fs / 2, fy + fs * 2 / 3, fs / 4, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snake.forEach((segment, i) => {
      const t = i / snake.length;
      const r = Math.round(236 - t * 40);
      const g = Math.round(72 + t * 30);
      const b = Math.round(153 + t * 20);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      const margin = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + margin,
        segment.y * CELL_SIZE + margin,
        CELL_SIZE - margin * 2,
        CELL_SIZE - margin * 2,
        i === 0 ? 6 : 4
      );
      ctx.fill();

      // Head glow
      if (i === 0) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#fff';
        const ex = segment.x * CELL_SIZE;
        const ey = segment.y * CELL_SIZE;
        const dirOffsets: Record<Direction, { x1: number; y1: number; x2: number; y2: number }> = {
          right: { x1: 4, y1: 4, x2: 4, y2: 12 },
          left: { x1: 12, y1: 4, x2: 12, y2: 12 },
          up: { x1: 4, y1: 4, x2: 12, y2: 4 },
          down: { x1: 4, y1: 12, x2: 12, y2: 12 },
        };
        const offsets = dirOffsets[dirRef.current];
        ctx.beginPath();
        ctx.arc(ex + offsets.x1, ey + offsets.y1, 3, 0, Math.PI * 2);
        ctx.arc(ex + offsets.x2, ey + offsets.y2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [snake, food]);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/snake?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const newDir = keyMap[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
      if (opposites[newDir] !== dirRef.current) {
        dirRef.current = newDir;
        setDir(newDir);
        if (!isRunning) setIsRunning(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, isRunning]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      localStorage.setItem('snakeHighScore', score.toString());
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  const directionalButtons = [
    { dir: 'up' as Direction, label: '↑', grid: 'col-start-2' },
    { dir: 'left' as Direction, label: '←', grid: '' },
    { dir: 'right' as Direction, label: '→', grid: 'col-start-3' },
    { dir: 'down' as Direction, label: '↓', grid: 'col-start-2' },
  ];

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Neon Snake
            </h1>
            <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Invite Button */}
          <div className="flex justify-center mb-4">
            <Button onClick={copyInvite} variant="outline" size="sm">
              {inviteCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friend
                </>
              )}
            </Button>
          </div>

          {/* Scores */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 px-5 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-medium">Score</p>
              <p className="text-2xl font-bold text-primary-600">{score}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 px-5 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-medium">Best</p>
              <p className="text-2xl font-bold text-yellow-600">{highScore}</p>
            </div>
          </div>

          {/* Canvas */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 md:p-4 flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="rounded-2xl"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </TiltCard>

          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 w-48 mx-auto mt-4">
            {directionalButtons.map(({ dir: d, label }) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (gameOver) return;
                  const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
                  if (opposites[d] !== dirRef.current) {
                    dirRef.current = d;
                    setDir(d);
                    if (!isRunning) setIsRunning(true);
                  }
                }}
                className="aspect-square rounded-2xl bg-white/80 backdrop-blur border border-pink-200 shadow-lg flex items-center justify-center text-2xl font-bold text-gray-700 active:bg-primary-100"
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Start / Game Over */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                  <div className="text-5xl mb-3">🐍</div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">Game Over!</h2>
                  <p className="text-4xl font-black text-primary-600">{score}</p>
                  <p className="text-sm text-gray-500 mb-4">Final Score</p>
                  <Button onClick={reset} variant="primary" className="w-full">
                    Play Again 🎮
                  </Button>
                </div>
              </motion.div>
            )}
            {!isRunning && !gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4"
              >
                <Button onClick={() => setIsRunning(true)} variant="primary" size="lg" className="w-full">
                  Start Game 🎮
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-6">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
