'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

type FallingItem = {
  x: number; y: number; vy: number; type: 'heart' | 'rose' | 'bomb' | 'diamond';
  size: number; id: number;
};

export default function HeartCatcherPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const animRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const basketXRef = useRef(180);
  const basketTargetRef = useRef(180);
  const gameOverRef = useRef(false);
  const levelRef = useRef(1);
  const comboRef = useRef(0);
  const touchRef = useRef<{ active: boolean; x: number } | null>(null);

  const W = 380;
  const H = 520;
  const BASKET_W = 60;
  const BASKET_H = 30;

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevel(1);
    setCombo(0);
    setHighestCombo(0);
    gameOverRef.current = false;
    levelRef.current = 1;
    comboRef.current = 0;
    itemsRef.current = [];
    basketXRef.current = W / 2;
    basketTargetRef.current = W / 2;
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        basketTargetRef.current = Math.max(0, basketTargetRef.current - 30);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        basketTargetRef.current = Math.min(W - BASKET_W, basketTargetRef.current + 30);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let lastSpawn = 0;

    const spawn = () => {
      const types: FallingItem['type'][] = ['heart', 'heart', 'heart', 'rose', 'diamond', 'bomb'];
      if (levelRef.current >= 3) types.push('bomb');
      const type = types[Math.floor(Math.random() * types.length)];
      const size = type === 'bomb' ? 22 : 20;
      itemsRef.current.push({
        x: 20 + Math.random() * (W - 40),
        y: -size,
        vy: 1.5 + levelRef.current * 0.3 + Math.random() * 0.5,
        type,
        size,
        id: Date.now() + Math.random(),
      });
    };

    const drawHeart = (x: number, y: number, size: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 20, size / 20);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.bezierCurveTo(5, -10, 12, -4, 0, 8);
      ctx.bezierCurveTo(-12, -4, -5, -10, 0, -4);
      ctx.fill();
      ctx.restore();
    };

    const drawRose = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, -3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-1, 4, 2, 8);
      ctx.restore();
    };

    const drawBomb = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(0, -8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -10, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDiamond = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, 0);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      // Smooth basket movement
      const dx = basketTargetRef.current - basketXRef.current;
      basketXRef.current += dx * 0.2;

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#fdf2f8');
      bg.addColorStop(1, '#fbcfe8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Basket
      const bx = basketXRef.current;
      const by = H - 50;
      const grad = ctx.createLinearGradient(0, by, 0, by + BASKET_H);
      grad.addColorStop(0, '#a78bfa');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by);
      ctx.lineTo(bx + BASKET_W + 4, by);
      ctx.lineTo(bx + BASKET_W - 6, by + BASKET_H);
      ctx.lineTo(bx + 6, by + BASKET_H);
      ctx.closePath();
      ctx.fill();
      // Weave pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const x = bx + 6 + i * ((BASKET_W - 12) / 4);
        ctx.beginPath();
        ctx.moveTo(x, by + 2);
        ctx.lineTo(x + 2, by + BASKET_H - 2);
        ctx.stroke();
      }

      // Spawn logic
      if (frame - lastSpawn > Math.max(40, 100 - levelRef.current * 8) && !gameOverRef.current) {
        spawn();
        lastSpawn = frame;
      }

      // Items
      itemsRef.current = itemsRef.current.filter(item => {
        item.y += item.vy;

        if (item.type === 'heart') drawHeart(item.x, item.y, item.size, '#ec4899');
        else if (item.type === 'rose') drawRose(item.x, item.y, item.size);
        else if (item.type === 'bomb') drawBomb(item.x, item.y);
        else if (item.type === 'diamond') drawDiamond(item.x, item.y);

        // Catch detection
        if (item.y > by && item.y < by + BASKET_H && item.x > bx && item.x < bx + BASKET_W) {
          if (item.type === 'heart') {
            const pts = 10 + comboRef.current * 2;
            setScore(s => s + pts);
            comboRef.current += 1;
            setCombo(comboRef.current);
            setHighestCombo(hc => Math.max(hc, comboRef.current));
            if (comboRef.current % 8 === 0) {
              levelRef.current += 1;
              setLevel(levelRef.current);
            }
          } else if (item.type === 'rose') {
            setScore(s => s + 5);
            comboRef.current = 0;
            setCombo(0);
          } else if (item.type === 'diamond') {
            setScore(s => s + 25);
            comboRef.current += 2;
            setCombo(comboRef.current);
            setHighestCombo(hc => Math.max(hc, comboRef.current));
          } else if (item.type === 'bomb') {
            setLives(l => {
              const nl = l - 1;
              if (nl <= 0 && !gameOverRef.current) {
                gameOverRef.current = true;
                setGameOver(true);
              }
              return Math.max(0, nl);
            });
            comboRef.current = 0;
            setCombo(0);
          }
          return false;
        }

        if (item.y > H + 30) {
          if (item.type === 'heart' && !gameOverRef.current) {
            comboRef.current = 0;
            setCombo(0);
          }
          return false;
        }
        return true;
      });

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [lives]);

  const handleTouch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent, start: boolean) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) * scaleX;
    if (start) {
      touchRef.current = { active: true, x };
    }
    basketTargetRef.current = Math.max(0, Math.min(W - BASKET_W, x - BASKET_W / 2));
  };

  const handleTouchMove = (e: React.TouchEvent) => handleTouch(e, false);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (touchRef.current?.active) handleTouch(e, false);
  };
  const handleEnd = () => {
    if (touchRef.current) touchRef.current.active = false;
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
              Heart Catcher
            </h1>
            <div className="w-10" />
          </div>

          {/* HUD */}
          <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100">
              ❤️ x{lives}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
              Score: {score}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
              Lv.{level}
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-orange-600 shadow border border-pink-100">
              🔥 {combo}x
            </div>
          </div>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 flex justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                onTouchStart={handleTouch}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleTouch}
                onMouseMove={handleMouseMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                className="rounded-2xl cursor-pointer touch-none"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </TiltCard>

          <p className="text-center text-sm text-gray-500 mt-3">
            Use arrow keys, touch, or drag mouse to move basket. Catch hearts, avoid bombs! 💣
          </p>

          {gameOver && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center space-y-3">
              <p className="text-2xl font-bold text-primary-600">Game Over! 💔</p>
              <p className="text-gray-600">Score: {score} | Best Combo: {highestCombo}x | Level: {level}</p>
              <Button onClick={resetGame} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
            <Button onClick={resetGame} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="heartcatcher" />
      </PremiumBackground>
  );
}
