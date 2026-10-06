'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_W = 500;
const GAME_H = 350;
const PADDLE_H = 70;
const PADDLE_W = 12;
const BALL_SIZE = 12;
const BALL_SPEED = 4;

export default function LovePongPage() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [winner, setWinner] = useState<'player' | 'ai' | 'tie' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const inputRef = useRef<{ y: number }>({ y: GAME_H / 2 });

  const startGame = useCallback(() => {
    setPlayerScore(0);
    setAiScore(0);
    setTimeLeft(60);
    setWinner(null);
    setState('playing');
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (state !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientY: number;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }
    const y = ((clientY - rect.top) / rect.height) * GAME_H;
    inputRef.current.y = Math.max(PADDLE_H / 2, Math.min(GAME_H - PADDLE_H / 2, y));
  }, [state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerY = GAME_H / 2;
    let aiY = GAME_H / 2;
    let ballX = GAME_W / 2;
    let ballY = GAME_H / 2;
    let vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let vy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) * 0.6;
    let pScore = 0;
    let aScore = 0;
    let running = true;
    let lastTimer = performance.now();

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerInterval);
          running = false;
          setState('finished');
          if (pScore > aScore) setWinner('player');
          else if (aScore > pScore) setWinner('ai');
          else setWinner('tie');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const loop = () => {
      if (!running) return;

      playerY = inputRef.current.y;

      // AI moves toward ball
      const aiTarget = ballY;
      const aiSpeed = 3.5;
      if (aiY < aiTarget - 5) aiY += aiSpeed;
      else if (aiY > aiTarget + 5) aiY -= aiSpeed;

      aiY = Math.max(PADDLE_H / 2, Math.min(GAME_H - PADDLE_H / 2, aiY));

      ballX += vx;
      ballY += vy;

      // top/bottom wall
      if (ballY < BALL_SIZE / 2 || ballY > GAME_H - BALL_SIZE / 2) {
        vy = -vy;
        ballY = Math.max(BALL_SIZE / 2, Math.min(GAME_H - BALL_SIZE / 2, ballY));
      }

      // player paddle
      if (
        ballX - BALL_SIZE / 2 < PADDLE_W &&
        ballY > playerY - PADDLE_H / 2 &&
        ballY < playerY + PADDLE_H / 2
      ) {
        vx = Math.abs(vx) * 1.05;
        const hit = (ballY - playerY) / (PADDLE_H / 2);
        vy = hit * 5;
        ballX = PADDLE_W + BALL_SIZE / 2;
      }

      // ai paddle
      if (
        ballX + BALL_SIZE / 2 > GAME_W - PADDLE_W &&
        ballY > aiY - PADDLE_H / 2 &&
        ballY < aiY + PADDLE_H / 2
      ) {
        vx = -Math.abs(vx) * 1.05;
        const hit = (ballY - aiY) / (PADDLE_H / 2);
        vy = hit * 5;
        ballX = GAME_W - PADDLE_W - BALL_SIZE / 2;
      }

      // scoring
      if (ballX < 0) {
        aScore++;
        setAiScore(aScore);
        ballX = GAME_W / 2;
        ballY = GAME_H / 2;
        vx = BALL_SPEED;
        vy = BALL_SPEED * 0.5;
      }
      if (ballX > GAME_W) {
        pScore++;
        setPlayerScore(pScore);
        ballX = GAME_W / 2;
        ballY = GAME_H / 2;
        vx = -BALL_SPEED;
        vy = BALL_SPEED * 0.5;
      }

      // draw
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      const bgGrad = ctx.createLinearGradient(0, 0, GAME_W, 0);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(1, '#831843');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // center line
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(GAME_W / 2, 0);
      ctx.lineTo(GAME_W / 2, GAME_H);
      ctx.stroke();
      ctx.setLineDash([]);

      // hearts in center
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(236, 72, 153, 0.5)';
      for (let i = 0; i < 5; i++) {
        ctx.fillText('💕', GAME_W / 2, 60 + i * 60);
      }

      // player paddle
      const playerGrad = ctx.createLinearGradient(0, 0, PADDLE_W, 0);
      playerGrad.addColorStop(0, '#ec4899');
      playerGrad.addColorStop(1, '#f472b6');
      ctx.fillStyle = playerGrad;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.fillRect(0, playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H);

      // ai paddle
      const aiGrad = ctx.createLinearGradient(GAME_W - PADDLE_W, 0, GAME_W, 0);
      aiGrad.addColorStop(0, '#8b5cf6');
      aiGrad.addColorStop(1, '#a78bfa');
      ctx.fillStyle = aiGrad;
      ctx.shadowColor = '#8b5cf6';
      ctx.fillRect(GAME_W - PADDLE_W, aiY - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // ball
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      clearInterval(timerInterval);
    };
  }, [state]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="text-pink-400" /> Love Pong
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
                <div className="text-pink-300 text-xs uppercase">You</div>
                <div className="text-2xl font-bold text-pink-300">{playerScore}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase text-center">Time</div>
                <div className={`text-2xl font-bold text-center ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
              <div className="text-right">
                <div className="text-purple-300 text-xs uppercase">AI</div>
                <div className="text-2xl font-bold text-purple-300">{aiScore}</div>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_W}
                height={GAME_H}
                className="w-full rounded-2xl cursor-none"
                style={{ aspectRatio: `${GAME_W}/${GAME_H}` }}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
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
                    <p className="text-white text-lg font-bold">Love Pong</p>
                    <p className="text-white/60 text-sm mb-4">Move mouse to control your paddle</p>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold flex items-center gap-2"
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
                      {winner === 'player' ? '🏆 You Win!' : winner === 'tie' ? '💕 Tie!' : '💖 AI Wins'}
                    </h2>
                    <p className="text-white/80 mb-4">
                      {playerScore} - {aiScore}
                    </p>
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