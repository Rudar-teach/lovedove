'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, Trophy, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const CELL = 20;
const MAZE_COLS = 21;
const MAZE_ROWS = 21;
const WIDTH = MAZE_COLS * CELL;
const HEIGHT = MAZE_ROWS * CELL;

const MAZES = [
  // Maze 1
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Maze 2
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Maze 3
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
];

type Pos = { x: number; y: number };

export default function LoveMazePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mazeIndex, setMazeIndex] = useState(0);
  const [player, setPlayer] = useState<Pos>({ x: 1, y: 1 });
  const [goal, setGoal] = useState<Pos>({ x: MAZE_COLS - 2, y: MAZE_ROWS - 2 });
  const [won, setWon] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);
  const animRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());

  const maze = MAZES[mazeIndex % MAZES.length];

  const resetGame = useCallback(() => {
    setPlayer({ x: 1, y: 1 });
    setGoal({ x: MAZE_COLS - 2, y: MAZE_ROWS - 2 });
    setWon(false);
    setStartTime(Date.now());
    setElapsed(0);
    setMoves(0);
    setParticles([]);
  }, []);

  const nextMaze = () => {
    setMazeIndex(i => i + 1);
    resetGame();
  };

  // Timer
  useEffect(() => {
    if (won) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [won, startTime]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Movement tick
  useEffect(() => {
    if (won) return;
    const tick = () => {
      const dirs: Record<string, Pos> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 } };
      let moved = false;
      for (const key of keysRef.current) {
        const dir = dirs[key];
        if (dir) {
          const nx = player.x + dir.x;
          const ny = player.y + dir.y;
          if (ny >= 0 && ny < MAZE_ROWS && nx >= 0 && nx < MAZE_COLS && maze[ny][nx] === 0) {
            setPlayer({ x: nx, y: ny });
            setMoves(m => m + 1);
            moved = true;
            if (nx === goal.x && ny === goal.y) {
              setWon(true);
              spawnCelebration(nx * CELL + CELL / 2, ny * CELL + CELL / 2);
            }
            break;
          }
        }
      }
    };
    const id = setInterval(tick, 120);
    return () => clearInterval(id);
  }, [player, won, maze, goal]);

  const spawnCelebration = (cx: number, cy: number) => {
    const colors = ['#ec4899', '#f43f5e', '#f472b6', '#fda4af', '#fbbf24', '#fb923c'];
    const newParticles: typeof particles = [];
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80;
      const speed = 1.5 + Math.random() * 3;
      newParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
  };

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Maze walls
      for (let r = 0; r < MAZE_ROWS; r++) {
        for (let c = 0; c < MAZE_COLS; c++) {
          if (maze[r][c] === 1) {
            ctx.fillStyle = '#be185d';
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            ctx.fillStyle = '#9d174d';
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }

      // Goal
      const gx = goal.x * CELL + CELL / 2;
      const gy = goal.y * CELL + CELL / 2;
      ctx.save();
      ctx.translate(gx, gy);
      const t = Date.now() / 500;
      ctx.scale(1 + Math.sin(t) * 0.2, 1 + Math.sin(t) * 0.2);
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(0, -CELL / 3);
      ctx.bezierCurveTo(CELL / 3, -CELL / 2, CELL / 2, -CELL / 6, 0, CELL / 3);
      ctx.bezierCurveTo(-CELL / 2, -CELL / 6, -CELL / 3, -CELL / 2, 0, -CELL / 3);
      ctx.fill();
      ctx.restore();

      // Player heart
      const px = player.x * CELL + CELL / 2;
      const py = player.y * CELL + CELL / 2;
      ctx.save();
      ctx.translate(px, py);
      const pt = Date.now() / 400;
      ctx.scale(1 + Math.sin(pt) * 0.15, 1 + Math.sin(pt) * 0.15);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(0, CELL / 4);
      ctx.bezierCurveTo(CELL / 3, -CELL / 4, CELL / 2, -CELL / 8, 0, CELL / 2);
      ctx.bezierCurveTo(-CELL / 2, -CELL / 8, -CELL / 3, -CELL / 4, 0, CELL / 4);
      ctx.fill();
      ctx.restore();

      // Particles
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.04,
          life: p.life - 0.015,
        })).filter(p => p.life > 0);
        if (updated.length > 0) {
          for (const p of updated) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        return updated;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [maze, player, goal, particles]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Love Maze
            </h1>
            <div className="w-10" />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 shadow border border-pink-100">
              ⏱ {formatTime(elapsed)}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 shadow border border-pink-100">
              👣 {moves} moves
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 shadow border border-pink-100">
              🧭 Maze {mazeIndex + 1}/3
            </div>
          </div>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 flex justify-center overflow-auto">
              <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="rounded-xl"
                style={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated' }}
              />
            </div>
          </TiltCard>

          {/* Instructions */}
          <p className="text-center text-sm text-gray-500 mt-3">
            Use Arrow Keys or WASD to navigate the heart ❤️ Reach the pink heart goal!
          </p>

          {/* Win Screen */}
          {won && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center space-y-3">
              <p className="text-2xl font-bold text-primary-600">You found your love! 💕</p>
              <p className="text-gray-600">Completed in {formatTime(elapsed)} with {moves} moves</p>
              <div className="flex justify-center gap-3">
                <Button onClick={resetGame} variant="primary">
                  <RotateCcw className="w-4 h-4 mr-1" /> Play Again
                </Button>
                {mazeIndex + 1 < MAZES.length && (
                  <Button onClick={nextMaze} variant="outline">
                    Next Maze ➡️
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={() => { navigator.clipboard.writeText(window.location.href); }} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
            <Button onClick={resetGame} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
