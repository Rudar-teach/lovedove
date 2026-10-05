'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const CANVAS_W = 700;
const CANVAS_H = 400;
const PADDLE_W = 12;
const PADDLE_H = 80;
const PUCK_SIZE = 12;
const WIN_SCORE = 10;

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [status, setStatus] = useState<'ready' | 'playing' | 'paused' | 'gameover'>('ready');
  const [winner, setWinner] = useState('');
  const [toast, setToast] = useState(false);
  const keysRef = useRef<Set<string>>(new Set());

  const gameRef = useRef({
    paddle1Y: CANVAS_H / 2 - PADDLE_H / 2,
    paddle2Y: CANVAS_H / 2 - PADDLE_H / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H / 2,
    ballVX: 5,
    ballVY: 3,
    speed: 1,
  });

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const resetGame = useCallback(() => {
    gameRef.current = {
      paddle1Y: CANVAS_H / 2 - PADDLE_H / 2,
      paddle2Y: CANVAS_H / 2 - PADDLE_H / 2,
      ballX: CANVAS_W / 2,
      ballY: CANVAS_H / 2,
      ballVX: 5 * (Math.random() > 0.5 ? 1 : -1),
      ballVY: 3 * (Math.random() > 0.5 ? 1 : -1),
      speed: 1,
    };
    setScores({ p1: 0, p2: 0 });
    setStatus('ready');
    setWinner('');
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    const { paddle1Y, paddle2Y, ballX, ballY } = g;

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

    // Glow effect
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 15;

    // Paddle 1 (left, pink)
    const grad1 = ctx.createLinearGradient(0, paddle1Y, 0, paddle1Y + PADDLE_H);
    grad1.addColorStop(0, '#ec4899');
    grad1.addColorStop(1, '#be185d');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.roundRect(PADDLE_W, paddle1Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Paddle 2 (right, rose)
    const grad2 = ctx.createLinearGradient(0, paddle2Y, 0, paddle2Y + PADDLE_H);
    grad2.addColorStop(0, '#f43f5e');
    grad2.addColorStop(1, '#9f1239');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.roundRect(CANVAS_W - PADDLE_W * 2, paddle2Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Ball
    ctx.shadowColor = '#fce7f3';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.arc(ballX, ballY, PUCK_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Score text
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.font = 'bold 60px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(scores.p1.toString(), CANVAS_W / 4, 80);
    ctx.fillText(scores.p2.toString(), 3 * CANVAS_W / 4, 80);

    // Labels
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.fillText('P1', CANVAS_W / 4, 105);
    ctx.fillText('P2', 3 * CANVAS_W / 4, 105);
  }, [scores]);

  const update = useCallback(() => {
    if (status !== 'playing') return;

    const g = gameRef.current;
    const keys = keysRef.current;

    // P1 movement
    if (keys.has('w') || keys.has('W')) g.paddle1Y = Math.max(0, g.paddle1Y - 7);
    if (keys.has('s') || keys.has('S')) g.paddle1Y = Math.min(CANVAS_H - PADDLE_H, g.paddle1Y + 7);

    // P2 movement
    if (keys.has('ArrowUp')) g.paddle2Y = Math.max(0, g.paddle2Y - 7);
    if (keys.has('ArrowDown')) g.paddle2Y = Math.min(CANVAS_H - PADDLE_H, g.paddle2Y + 7);

    // Ball
    g.ballX += g.ballVX * g.speed;
    g.ballY += g.ballVY * g.speed;

    // Top/bottom walls
    if (g.ballY <= PUCK_SIZE || g.ballY >= CANVAS_H - PUCK_SIZE) {
      g.ballVY *= -1;
      g.speed = Math.min(g.speed + 0.02, 2);
    }

    // Paddle collision
    const hitP1 = g.ballX - PUCK_SIZE <= PADDLE_W * 2 && g.ballX > 0 &&
      g.ballY >= g.paddle1Y && g.ballY <= g.paddle1Y + PADDLE_H;
    const hitP2 = g.ballX + PUCK_SIZE >= CANVAS_W - PADDLE_W * 2 && g.ballX < CANVAS_W &&
      g.ballY >= g.paddle2Y && g.ballY <= g.paddle2Y + PADDLE_H;

    if (hitP1) {
      g.ballVX = Math.abs(g.ballVX);
      const rel = (g.ballY - (g.paddle1Y + PADDLE_H / 2)) / (PADDLE_H / 2);
      g.ballVY = rel * 6;
      g.speed = Math.min(g.speed + 0.05, 2);
    }
    if (hitP2) {
      g.ballVX = -Math.abs(g.ballVX);
      const rel = (g.ballY - (g.paddle2Y + PADDLE_H / 2)) / (PADDLE_H / 2);
      g.ballVY = rel * 6;
      g.speed = Math.min(g.speed + 0.05, 2);
    }

    // Scoring
    if (g.ballX < 0) {
      setScores(s => ({ ...s, p2: s.p2 + 1 }));
      g.ballX = CANVAS_W / 2;
      g.ballY = CANVAS_H / 2;
      g.ballVX = 5;
      g.ballVY = 3;
      g.speed = 1;
    }
    if (g.ballX > CANVAS_W) {
      setScores(s => ({ ...s, p1: s.p1 + 1 }));
      g.ballX = CANVAS_W / 2;
      g.ballY = CANVAS_H / 2;
      g.ballVX = -5;
      g.ballVY = 3;
      g.speed = 1;
    }
  }, [status]);

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
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (scores.p1 >= WIN_SCORE) {
      setStatus('gameover');
      setWinner('Player 1');
    } else if (scores.p2 >= WIN_SCORE) {
      setStatus('gameover');
      setWinner('Player 2');
    }
  }, [scores]);

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

              {/* Controls */}
              <div className="flex justify-center gap-3 mt-4">
                {status === 'ready' && (
                  <Button onClick={() => setStatus('playing')} variant="primary" size="lg">
                    Start Game 🎮
                  </Button>
                )}
                {status === 'playing' && (
                  <Button onClick={() => setStatus('paused')} variant="secondary">
                    Pause ⏸️
                  </Button>
                )}
                {status === 'paused' && (
                  <Button onClick={() => setStatus('playing')} variant="primary">
                    Resume ▶️
                  </Button>
                )}
                {(status === 'playing' || status === 'paused') && (
                  <Button onClick={resetGame} variant="outline">
                    Reset 🔄
                  </Button>
                )}
              </div>

              {/* Game Over Overlay */}
              <AnimatePresence>
                {status === 'gameover' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                    <p className="text-3xl font-bold text-primary-600 mb-3">🎉 {winner} Wins!</p>
                    <Button onClick={resetGame} variant="primary" size="lg">Play Again 🔄</Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause overlay */}
              {status === 'paused' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                  <p className="text-xl font-bold text-gray-500">⏸️ Game Paused</p>
                </motion.div>
              )}
            </div>
          </TiltCard>

          {/* Controls Info */}
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
    </PremiumBackground>
  );
}
