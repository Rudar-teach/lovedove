'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const CANVAS_W = 700;
const CANVAS_H = 400;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 10;
const WIN_SCORE = 10;

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [status, setStatus] = useState<'ready' | 'playing' | 'paused' | 'gameover'>('ready');
  const [winner, setWinner] = useState('');
  const [toast, setToast] = useState(false);
  const keysRef = useRef<Set<string>>(new Set());

  const gameRef = useRef({
    p1Y: CANVAS_H / 2 - PADDLE_H / 2,
    p2Y: CANVAS_H / 2 - PADDLE_H / 2,
    bx: CANVAS_W / 2,
    by: CANVAS_H / 2,
    bvx: 5,
    bvy: 3,
    speed: 1,
  });

  const drawPaddle = (ctx: CanvasRenderingContext2D, x: number, y: number, grad: CanvasGradient) => {
    ctx.save();
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 15;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + PADDLE_W - 2, y + 4);
    ctx.lineTo(x + PADDLE_W - 2, y + PADDLE_H - 4);
    ctx.lineTo(x + 4, y + PADDLE_H);
    ctx.lineTo(x, y + PADDLE_H - 4);
    ctx.lineTo(x, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = gameRef.current;

    // Background
    ctx.fillStyle = '#0a0014';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddle 1
    const grad1 = ctx.createLinearGradient(0, g.p1Y, 0, g.p1Y + PADDLE_H);
    grad1.addColorStop(0, '#ec4899');
    grad1.addColorStop(1, '#be185d');
    drawPaddle(ctx, PADDLE_W, g.p1Y, grad1);

    // Paddle 2
    const grad2 = ctx.createLinearGradient(0, g.p2Y, 0, g.p2Y + PADDLE_H);
    grad2.addColorStop(0, '#f43f5e');
    grad2.addColorStop(1, '#9f1239');
    drawPaddle(ctx, CANVAS_W - PADDLE_W * 2, g.p2Y, grad2);

    // Ball
    ctx.save();
    ctx.shadowColor = '#fce7f3';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Scores
    ctx.save();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.font = 'bold 60px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(scores.p1.toString(), CANVAS_W / 4, 80);
    ctx.fillText(scores.p2.toString(), 3 * CANVAS_W / 4, 80);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.fillText('P1', CANVAS_W / 4, 105);
    ctx.fillText('P2', 3 * CANVAS_W / 4, 105);
    ctx.restore();
  }, [scores]);

  const update = useCallback(() => {
    if (status !== 'playing') return;
    const g = gameRef.current;
    const keys = keysRef.current;

    if (keys.has('w') || keys.has('W')) g.p1Y = Math.max(0, g.p1Y - 7);
    if (keys.has('s') || keys.has('S')) g.p1Y = Math.min(CANVAS_H - PADDLE_H, g.p1Y + 7);
    if (keys.has('ArrowUp')) g.p2Y = Math.max(0, g.p2Y - 7);
    if (keys.has('ArrowDown')) g.p2Y = Math.min(CANVAS_H - PADDLE_H, g.p2Y + 7);

    g.bx += g.bvx * g.speed;
    g.by += g.bvy * g.speed;

    if (g.by <= BALL_R || g.by >= CANVAS_H - BALL_R) {
      g.bvy *= -1;
      g.speed = Math.min(g.speed + 0.02, 2);
    }

    const p1Left = PADDLE_W;
    const p1Right = PADDLE_W + PADDLE_W;
    const p2Left = CANVAS_W - PADDLE_W * 2;
    const p2Right = CANVAS_W - PADDLE_W;

    const hitP1 = g.bx - BALL_R <= p1Right && g.bx > p1Left && g.by >= g.p1Y && g.by <= g.p1Y + PADDLE_H;
    const hitP2 = g.bx + BALL_R >= p2Left && g.bx < p2Right && g.by >= g.p2Y && g.by <= g.p2Y + PADDLE_H;

    if (hitP1) {
      g.bvx = Math.abs(g.bvx);
      const rel = (g.by - (g.p1Y + PADDLE_H / 2)) / (PADDLE_H / 2);
      g.bvy = rel * 6;
      g.speed = Math.min(g.speed + 0.05, 2);
    }
    if (hitP2) {
      g.bvx = -Math.abs(g.bvx);
      const rel = (g.by - (g.p2Y + PADDLE_H / 2)) / (PADDLE_H / 2);
      g.bvy = rel * 6;
      g.speed = Math.min(g.speed + 0.05, 2);
    }

    if (g.bx < -BALL_R) {
      setScores(s => ({ ...s, p2: s.p2 + 1 }));
      resetBall(g, 1);
    }
    if (g.bx > CANVAS_W + BALL_R) {
      setScores(s => ({ ...s, p1: s.p1 + 1 }));
      resetBall(g, -1);
    }
  }, [status]);

  const resetBall = (g: typeof gameRef.current, dir: number) => {
    g.bx = CANVAS_W / 2;
    g.by = CANVAS_H / 2;
    g.bvx = 5 * dir;
    g.bvy = 3 * (Math.random() > 0.5 ? 1 : -1);
    g.speed = 1;
  };

  useEffect(() => {
    let animId: number;
    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [update, draw]);

  useEffect(() => {
    if (status !== 'playing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (['w','s','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status]);

  useEffect(() => {
    if (scores.p1 >= WIN_SCORE) { setStatus('gameover'); setWinner('Player 1'); }
    else if (scores.p2 >= WIN_SCORE) { setStatus('gameover'); setWinner('Player 2'); }
  }, [scores]);

  const resetGame = () => {
    gameRef.current = {
      p1Y: CANVAS_H / 2 - PADDLE_H / 2,
      p2Y: CANVAS_H / 2 - PADDLE_H / 2,
      bx: CANVAS_W / 2,
      by: CANVAS_H / 2,
      bvx: 5 * (Math.random() > 0.5 ? 1 : -1),
      bvy: 3 * (Math.random() > 0.5 ? 1 : -1),
      speed: 1,
    };
    setScores({ p1: 0, p2: 0 });
    setStatus('ready');
    setWinner('');
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Pong 2 Player
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          {/* Scoreboard */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <p className="text-xs text-primary-500 font-semibold mb-1">PLAYER 1 (W/S)</p>
              <p className="text-4xl font-black text-primary-600">{scores.p1}</p>
            </div>
            <div className="text-4xl font-bold text-gray-300 self-center">:</div>
            <div className="text-center">
              <p className="text-xs text-rose-500 font-semibold mb-1">PLAYER 2 (↑/↓)</p>
              <p className="text-4xl font-black text-rose-600">{scores.p2}</p>
            </div>
          </div>

          {/* Canvas */}
          <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="w-full rounded-2xl"
                style={{ maxWidth: CANVAS_W }}
              />
              <div className="flex justify-center gap-3 mt-4">
                {status === 'ready' && (
                  <Button onClick={() => setStatus('playing')} variant="primary" size="lg">Start Game</Button>
                )}
                {status === 'playing' && (
                  <Button onClick={() => setStatus('paused')} variant="secondary">Pause</Button>
                )}
                {status === 'paused' && (
                  <Button onClick={() => setStatus('playing')} variant="primary">Resume</Button>
                )}
                {(status === 'playing' || status === 'paused') && (
                  <Button onClick={resetGame} variant="outline">Reset</Button>
                )}
              </div>
              <AnimatePresence>
                {status === 'gameover' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                    <p className="text-3xl font-bold text-primary-600 mb-3">🎉 {winner} Wins!</p>
                    <Button onClick={resetGame} variant="primary" size="lg">Play Again</Button>
                  </motion.div>
                )}
              </AnimatePresence>
              {status === 'paused' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                  <p className="text-xl font-bold text-gray-500">⏸️ Game Paused</p>
                </motion.div>
              )}
            </div>
          </TiltCard>

          <div className="flex justify-center gap-8 mt-4 text-sm text-gray-500">
            <div className="text-center">
              <p className="font-semibold text-primary-500">Player 1</p>
              <p>W / S keys</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-rose-500">Player 2</p>
              <p>↑ / ↓ arrows</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            <GameSharePanel gameSlug="pong" />
      </PremiumBackground>
  );
}
