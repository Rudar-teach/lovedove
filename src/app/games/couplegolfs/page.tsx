'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const HOLE_COUNT = 9;

function calcScore(distance: number): number {
  if (distance < 10) return 50;
  if (distance < 30) return 40;
  if (distance < 60) return 30;
  if (distance < 100) return 20;
  if (distance < 160) return 10;
  return 0;
}

function distFromCenter(cx: number, cy: number, tx: number, ty: number): number {
  return Math.sqrt((cx - tx) ** 2 + (cy - ty) ** 2);
}

const RATING_NAME = (score: number): string => {
  const s = score * 5;
  if (s >= 200) return 'Mini Golf Pro!';
  if (s >= 160) return 'Expert Golfer!';
  if (s >= 120) return 'Great Player!';
  if (s >= 80) return 'Good Swing!';
  if (s >= 40) return 'Getting There!';
  return 'Keep Practicing!';
};

export default function CoupleGolfsPage() {
  const [playing, setPlaying] = useState(false);
  const [hole, setHole] = useState(1);
  const [shots, setShots] = useState(0);
  const [score, setScore] = useState(0);
  const [par, setPar] = useState(3);
  const [wind, setWind] = useState(0);
  const [target, setTarget] = useState({ x: 0.5, y: 0.3 });
  const [ball, setBall] = useState({ x: 0.5, y: 0.8 });
  const [power, setPower] = useState(0);
  const [phase, setPhase] = useState<'aim' | 'shoot' | 'result'>('aim');
  const [lastHit, setLastHit] = useState<{ dist: number; pts: number } | null>(null);
  const [done, setDone] = useState(false);
  const [totalShots, setTotalShots] = useState(0);
  const targetAnimRef = useRef(0);
  const targetTimeRef = useRef(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startHole = useCallback(() => {
    const hPar = Math.floor(Math.random() * 3) + 2;
    setPar(hPar);
    setShots(0);
    setPhase('aim');
    setLastHit(null);
    const newWind = Math.round((Math.random() - 0.5) * 2 * 10) / 10;
    setWind(newWind);
    setBall({ x: 0.5 + (Math.random() - 0.5) * 0.2, y: 0.8 });
    setPower(0);
  }, []);

  const startGame = () => {
    setPlaying(true);
    setHole(1);
    setScore(0);
    setTotalShots(0);
    setDone(false);
    startHole();
  };

  // Target drift
  useEffect(() => {
    if (!playing || phase !== 'aim') return;
    targetTimeRef.current = Date.now() + 2000;
    const animate = () => {
      if (!playing || phase !== 'aim') return;
      const elapsed = (Date.now() - targetTimeRef.current) / 1000;
      const nx = 0.3 + Math.sin(elapsed * 0.7 + hole) * 0.25;
      const ny = 0.2 + Math.cos(elapsed * 0.5 + hole * 2) * 0.15;
      setTarget({ x: Math.max(0.15, Math.min(0.85, nx)), y: Math.max(0.15, Math.min(0.5, ny)) });
      targetAnimRef.current = requestAnimationFrame(animate);
    };
    targetAnimRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(targetAnimRef.current);
  }, [playing, phase, hole]);

  // Draw course
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;
    const rect = board.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const tx = target.x * W;
    const ty = target.y * H;
    const bx = ball.x * W;
    const by = ball.y * H;

    // Background
    ctx.fillStyle = '#dcfce7';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Concentric target rings
    const rings = [
      { r: 50, color: 'rgba(34, 197, 94, 0.3)', pts: '50 pts' },
      { r: 40, color: 'rgba(34, 197, 94, 0.5)', pts: '40 pts' },
      { r: 30, color: 'rgba(22, 163, 74, 0.6)', pts: '30 pts' },
      { r: 20, color: 'rgba(22, 163, 74, 0.8)', pts: '20 pts' },
      { r: 10, color: 'rgba(21, 128, 61, 0.9)', pts: '10 pts' },
    ];
    rings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(tx, ty, ring.r, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Bullseye
    ctx.beginPath();
    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#15803d';
    ctx.fill();

    // Wind indicator
    if (phase === 'aim') {
      ctx.save();
      ctx.translate(W / 2, H - 25);
      ctx.rotate(wind * 0.05);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(15, 0);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.fillText(`Wind: ${wind > 0 ? '→' : wind < 0 ? '←' : '–'} ${Math.abs(wind).toFixed(1)}`, 0, 20);
      ctx.restore();
    }

    // Ball
    ctx.beginPath();
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ball highlight
    ctx.beginPath();
    ctx.arc(bx - 3, by - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    // Power bar (during aim)
    if (phase === 'aim') {
      const p = power;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(W / 2 - 40, H - 55, 80, 12);
      const gradient = ctx.createLinearGradient(W / 2 - 40, 0, W / 2 - 40 + 80 * p, 0);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#eab308');
      gradient.addColorStop(1, '#ef4444');
      ctx.fillStyle = gradient;
      ctx.fillRect(W / 2 - 40, H - 55, 80 * p, 12);
    }

  }, [target, ball, wind, power, phase]);

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (phase !== 'aim') return;
    e.preventDefault();
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (y > 0.7) {
      // Power control area
      const p = Math.max(0.1, Math.min(1, 1 - (y - 0.7) / 0.3));
      setPower(p);
      return;
    }
    // Direction click
    const dx = x - ball.x;
    const dy = y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.01) {
      const powerUsed = power || 0.5;
      const newX = Math.max(0.1, Math.min(0.9, ball.x + (dx / dist) * powerUsed * 0.3));
      const newY = Math.max(0.1, Math.min(0.9, ball.y + (dy / dist) * powerUsed * 0.3));
      setBall({ x: newX, y: newY });
      setPower(0);
    }
  };

  const shoot = () => {
    setPhase('shoot');
    const tx = target.x;
    const ty = target.y;
    const bx = ball.x;
    const by = ball.y;
    const d = distFromCenter(bx, by, tx, ty);
    // Add wind effect
    const windEffect = wind * 0.02;
    const finalDist = Math.max(0, distFromCenter(
      bx + windEffect, by,
      tx, ty
    ));
    const pts = calcScore(finalDist);
    setShots(s => s + 1);
    setScore(sc => sc + pts);
    setTotalShots(ts => ts + 1);
    setLastHit({ dist: Math.round(finalDist), pts });

    setTimeout(() => {
      if (hole >= HOLE_COUNT) {
        setDone(true);
        setPlaying(false);
      } else {
        setHole(h => h + 1);
        startHole();
      }
    }, 1500);
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Couple Golf', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Couple Golf
            </h1>
            <div className="w-10" />
          </div>

          {!playing && !done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-7xl">⛳</span>
                  </motion.div>
                  <p className="text-gray-700 font-semibold text-lg">9 Holes of Love! 🏌️</p>
                  <p className="text-sm text-gray-500">Tap to aim, power-up at bottom, and shoot! Wind affects your ball!</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-pink-50 rounded-xl p-2">🏆 50 pts: Bullseye</div>
                    <div className="bg-pink-50 rounded-xl p-2">💚 30 pts: Great</div>
                    <div className="bg-pink-50 rounded-xl p-2">🌱 10 pts: Near</div>
                  </div>
                  <Button onClick={startGame} variant="primary">Tee Off! ⛳</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {playing && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100">
                  Hole {hole}/{HOLE_COUNT}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
                  Score: {score}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
                  Par {par}: {shots}/{par}
                </div>
                {wind !== 0 && (
                  <div className="bg-blue-50 backdrop-blur-xl rounded-xl px-3 py-1.5 text-blue-600 shadow border border-blue-200">
                    💨 Wind: {wind.toFixed(1)}
                  </div>
                )}
              </div>

              <TiltCard>
                <div
                  ref={boardRef}
                  onClick={handleBoardClick}
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-2 overflow-hidden"
                  style={{ aspectRatio: '3/4', maxHeight: 500 }}
                >
                  <canvas ref={canvasRef} className="w-full h-full rounded-2xl" style={{ touchAction: 'none' }} />
                </div>
              </TiltCard>

              {phase === 'aim' && (
                <div className="flex justify-center gap-3 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={shoot}
                    className="bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-full px-8 py-3 font-display font-black text-lg shadow-lg"
                  >
                    <Zap className="w-5 h-5 inline mr-1" /> Shoot!
                  </motion.button>
                </div>
              )}

              {phase === 'shoot' && lastHit && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-3">
                  <div className="text-4xl mb-1">
                    {lastHit.pts >= 40 ? '🎯' : lastHit.pts >= 20 ? '💚' : '🌱'}
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {lastHit.pts >= 40 ? 'Excellent shot!' : lastHit.pts >= 20 ? 'Nice one!' : 'Keep trying!'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Distance: {lastHit.dist}px | +{lastHit.pts} points
                  </p>
                </motion.div>
              )}

              <p className="text-center text-sm text-gray-500 mt-3">
                {phase === 'aim' ? 'Tap target area to aim, tap bottom area for power, then SHOT!' : 'Moving to next hole...'}
              </p>
            </>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                  <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-6xl">🏆</span>
                  </motion.div>
                  <h2 className="text-3xl font-display font-black gradient-text-animated">
                    {RATING_NAME(score)}
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Total Score</div>
                      <div className="text-2xl font-bold text-primary-600">{score}</div>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Total Shots</div>
                      <div className="text-2xl font-bold text-rose-600">{totalShots}</div>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Holes</div>
                      <div className="text-2xl font-bold text-pink-600">{HOLE_COUNT}</div>
                    </div>
                  </div>
                  <Button onClick={startGame} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}