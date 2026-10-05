'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, Heart, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

type Target = { x: number; y: number; vy: number; size: number; hit: boolean; id: number };
type Arrow = { x: number; y: number; vy: number };

export default function CupidsArrowPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const animRef = useRef(0);
  const targetsRef = useRef<Target[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);
  const spawnTimerRef = useRef(0);
  const gameOverRef = useRef(false);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const gameStartedRef = useRef(false);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetsRefAlt = useRef<Target[]>([]);

  // Load high score from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = parseInt(localStorage.getItem('cupidsArrowHighScore') || '0');
      if (!isNaN(stored)) setHighScore(stored);
    }
  }, []);

  const W = 400;
  const H = 500;
  const BOW_X = W / 2;
  const BOW_Y = H - 40;
  const BASE_SPAWN_INTERVAL = 90;
  const BASE_TARGET_SPEED = 0.8;

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevel(1);
    setCombo(0);
    gameOverRef.current = false;
    levelRef.current = 1;
    targetsRef.current = [];
    arrowsRef.current = [];
    spawnTimerRef.current = 0;
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const spawn = () => {
      const existing = targetsRef.current.filter(t => !t.hit);
      if (existing.length < 5 + levelRef.current) {
        const size = 18 + Math.random() * 10;
        targetsRef.current.push({
          x: 30 + Math.random() * (W - 60),
          y: -size,
          vy: -(BASE_TARGET_SPEED + levelRef.current * 0.25 + Math.random() * 0.5),
          size,
          hit: false,
          id: Date.now() + Math.random(),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#fdf2f8');
      bg.addColorStop(1, '#fce7f3');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137) % W);
        const sy = ((i * 97 + frame * 0.3) % H);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bow
      ctx.strokeStyle = '#9d174d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(BOW_X, BOW_Y, 30, -Math.PI * 0.8, Math.PI * 0.8);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#be185d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(BOW_X + Math.cos(-Math.PI * 0.8) * 30, BOW_Y + Math.sin(-Math.PI * 0.8) * 30);
      ctx.lineTo(BOW_X, BOW_Y - 10);
      ctx.lineTo(BOW_X + Math.cos(Math.PI * 0.8) * 30, BOW_Y + Math.sin(Math.PI * 0.8) * 30);
      ctx.stroke();

      // Targets
      targetsRef.current = targetsRef.current.filter(t => {
        if (t.hit) return false;
        t.y += t.vy;
        // Draw heart
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.scale(t.size / 20, t.size / 20);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.bezierCurveTo(5, -10, 12, -4, 0, 8);
        ctx.bezierCurveTo(-12, -4, -5, -10, 0, -4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -2, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Missed - off screen top
        if (t.y < -t.size * 2) {
          if (!gameOverRef.current) {
            setCombo(0);
            setLives(l => {
              const nl = l - 1;
              if (nl <= 0 && !gameOverRef.current) {
                gameOverRef.current = true;
                setGameOver(true);
                if (scoreRef.current > highScore) {
                  setHighScore(scoreRef.current);
                }
              }
              return Math.max(0, nl);
            });
          }
          return false;
        }
        return true;
      });

      // Arrows
      arrowsRef.current = arrowsRef.current.filter(a => {
        a.y -= 8;
        ctx.fillStyle = '#be185d';
        ctx.fillRect(a.x - 1, a.y - 8, 2, 16);
        // Arrowhead
        ctx.fillStyle = '#9d174d';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - 12);
        ctx.lineTo(a.x - 4, a.y - 6);
        ctx.lineTo(a.x + 4, a.y - 6);
        ctx.fill();

        // Collision
        for (const t of targetsRef.current) {
          if (t.hit) continue;
          const dx = a.x - t.x;
          const dy = a.y - t.y;
          if (Math.sqrt(dx * dx + dy * dy) < t.size * 0.6) {
            t.hit = true;
            setCombo(c => c + 1);
            const pts = 10 + levelRef.current * 5 + combo * 2;
            setScore(s => {
              const ns = s + pts;
              if (ns > highScore) {
                setHighScore(ns);
              }
              scoreRef.current = s + pts;
              return ns;
            });
            if ((combo + 1) % 5 === 0) {
              setLevel(l => {
                const nl = l + 1;
                levelRef.current = nl;
                return nl;
              });
            }
            return false;
          }
        }
        return a.y > -20;
      });

      // Level up check
      const currentScore = score;
      const newLevel = Math.floor(currentScore / 100) + 1;
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel);
      }

      frame++;
      if (frame % Math.max(20, BASE_SPAWN_INTERVAL - levelRef.current * 8) === 0 && !gameOverRef.current) {
        spawn();
      }
      spawnTimerRef.current++;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, combo]);

  const shoot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || gameOverRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    if (my < H - 60) {
      arrowsRef.current.push({ x: mx, y: my, vy: 8 });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Cupid&apos;s Arrow
            </h1>
            <div className="w-10" />
          </div>

          {/* HUD */}
          <div className="flex justify-center gap-3 mb-3">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-sm font-bold text-primary-600 shadow border border-pink-100">
              ❤️ x{lives}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-sm font-bold text-pink-600 shadow border border-pink-100">
              Score: {score}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-sm font-bold text-rose-600 shadow border border-pink-100">
              Lv.{level}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-sm font-bold text-gray-600 shadow border border-pink-100">
              🏆 {highScore}
            </div>
          </div>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 flex justify-center overflow-auto">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                onClick={shoot}
                className="rounded-2xl cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </TiltCard>

          <p className="text-center text-sm text-gray-500 mt-3">
            Click or tap above the bow to shoot arrows at the hearts 💘
          </p>

          {gameOver && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center space-y-3">
              <p className="text-2xl font-bold text-primary-600">Game Over! 💔</p>
              <p className="text-gray-600">You scored {score} points at Level {level}</p>
              <p className="text-sm text-gray-500">High Score: {highScore}</p>
              <Button onClick={resetGame} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
            </motion.div>
          )}

          <div className="flex justify-center mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="cupidsarrow" />
      </PremiumBackground>
  );
}
