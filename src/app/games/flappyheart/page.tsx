'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const HEART_SIZE = 36;
const GRAVITY = 0.4;
const JUMP_FORCE = -7;
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 90;

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

export default function FlappyHeartPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heartY, setHeartY] = useState(CANVAS_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const heartYRef = useRef(heartY);
  const velocityRef = useRef(velocity);
  const pipesRef = useRef(pipes);
  const scoreRef = useRef(score);
  const isRunningRef = useRef(isRunning);
  const gameOverRef = useRef(gameOver);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'flappyheart',
      players: [session.user.id],
      game_state: { score: 0 },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
    const stored = localStorage.getItem('flappyHeartHighScore');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  useEffect(() => {
    heartYRef.current = heartY;
  }, [heartY]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    pipesRef.current = pipes;
  }, [pipes]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const reset = useCallback(() => {
    setHeartY(CANVAS_HEIGHT / 2);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsRunning(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  const spawnPipe = useCallback((x: number): Pipe => {
    const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
    return { x, topHeight, scored: false };
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      reset();
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
    }
    setVelocity(JUMP_FORCE);
  }, [gameOver, isRunning, reset]);

  // Main game loop
  useEffect(() => {
    let lastPipe = 0;

    const loop = () => {
      if (!isRunningRef.current || gameOverRef.current) {
        return;
      }

      // Apply gravity
      velocityRef.current += GRAVITY;
      heartYRef.current += velocityRef.current;

      // Bounds check
      if (heartYRef.current >= CANVAS_HEIGHT - HEART_SIZE) {
        heartYRef.current = CANVAS_HEIGHT - HEART_SIZE;
        setGameOver(true);
        setIsRunning(false);
        return;
      }
      if (heartYRef.current < 0) {
        heartYRef.current = 0;
        velocityRef.current = 0;
      }

      // Spawn pipes
      if (lastPipe >= PIPE_INTERVAL) {
        pipesRef.current = [...pipesRef.current, spawnPipe(CANVAS_WIDTH)];
        lastPipe = 0;
      } else {
        lastPipe += 1;
      }

      // Move pipes
      let newScore = scoreRef.current;
      const updatedPipes = pipesRef.current
        .map(p => {
          const newPipe = { ...p, x: p.x - PIPE_SPEED };
          if (!newPipe.scored && newPipe.x + PIPE_WIDTH < 100 - HEART_SIZE / 2) {
            newPipe.scored = true;
            newScore += 1;
          }
          return newPipe;
        })
        .filter(p => p.x + PIPE_WIDTH > 0);

      // Collision with pipes
      for (const pipe of updatedPipes) {
        const heartLeft = 100 - HEART_SIZE / 2;
        const heartRight = 100 + HEART_SIZE / 2;
        const heartTop = heartYRef.current;
        const heartBottom = heartYRef.current + HEART_SIZE;

        if (heartRight > pipe.x && heartLeft < pipe.x + PIPE_WIDTH) {
          if (heartTop < pipe.topHeight || heartBottom > pipe.topHeight + PIPE_GAP) {
            setGameOver(true);
            setIsRunning(false);
            return;
          }
        }
      }

      pipesRef.current = updatedPipes;
      scoreRef.current = newScore;

      setHeartY(heartYRef.current);
      setVelocity(velocityRef.current);
      setPipes([...updatedPipes]);
      setScore(newScore);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    if (isRunning) {
      gameLoopRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isRunning, spawnPipe]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#ffd6e7');
    skyGrad.addColorStop(0.5, '#fce7f3');
    skyGrad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(80, 100, 25, 0, Math.PI * 2);
    ctx.arc(110, 100, 30, 0, Math.PI * 2);
    ctx.arc(140, 105, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(280, 180, 20, 0, Math.PI * 2);
    ctx.arc(310, 185, 28, 0, Math.PI * 2);
    ctx.arc(345, 185, 22, 0, Math.PI * 2);
    ctx.fill();

    // Pipes
    pipes.forEach(pipe => {
      // Top pipe
      const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      topGrad.addColorStop(0, '#ec4899');
      topGrad.addColorStop(0.5, '#f472b6');
      topGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = topGrad;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Top pipe cap
      ctx.fillStyle = '#be185d';
      ctx.fillRect(pipe.x - 4, pipe.topHeight - 24, PIPE_WIDTH + 8, 24);

      // Bottom pipe
      const botGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      botGrad.addColorStop(0, '#ec4899');
      botGrad.addColorStop(0.5, '#f472b6');
      botGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = botGrad;
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
      ctx.fillStyle = '#be185d';
      ctx.fillRect(pipe.x - 4, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 8, 24);
    });

    // Heart
    const heartX = 100 - HEART_SIZE / 2;
    const heartYC = heartY;
    ctx.save();
    ctx.translate(heartX + HEART_SIZE / 2, heartYC + HEART_SIZE / 2);
    ctx.rotate(Math.min(Math.PI / 8, velocityRef.current * 0.04));

    // Heart glow
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 20;

    const hs = HEART_SIZE / 2;
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.moveTo(0, hs / 3);
    ctx.bezierCurveTo(0, -hs / 3, -hs, -hs / 3, -hs, hs / 4);
    ctx.bezierCurveTo(-hs, hs * 2 / 3, -hs / 2, hs, 0, hs * 1.3);
    ctx.bezierCurveTo(hs / 2, hs, hs, hs * 2 / 3, hs, hs / 4);
    ctx.bezierCurveTo(hs, -hs / 3, 0, -hs / 3, 0, hs / 3);
    ctx.fill();

    // Highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-hs / 3, 0, hs / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Ground
    const groundGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 30, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#ec4899');
    groundGrad.addColorStop(1, '#be185d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);
    ctx.fillStyle = '#9d174d';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 4);

    // Score
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px "Comic Sans MS", cursive';
    ctx.textAlign = 'center';
    ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 70);
    ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 70);
  }, [heartY, pipes, score]);

  // Input handlers
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyHeartHighScore', score.toString());
    }
  }, [score, highScore]);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/flappyheart?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

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
              Flappy Heart
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

          {/* High Score */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 px-5 py-2 text-center">
              <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-500" /> Best: <span className="font-bold text-yellow-600">{highScore}</span>
              </p>
            </div>
          </div>

          {/* Game Canvas */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3 md:p-4 flex justify-center cursor-pointer"
              onClick={jump}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-2xl max-w-full h-auto touch-none"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </TiltCard>

          {/* Controls */}
          <div className="text-center mt-4">
            {!isRunning && !gameOver && (
              <Button onClick={jump} variant="primary" size="lg" className="w-full">
                Tap to Fly 💕
              </Button>
            )}
            {gameOver && (
              <Button onClick={reset} variant="primary" size="lg" className="w-full">
                Play Again 🎮
              </Button>
            )}
            {isRunning && !gameOver && (
              <p className="text-sm text-gray-500">
                Tap or press SPACE to fly!
              </p>
            )}
          </div>

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