'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

type Player = 1 | 2;
type Phase = 'start' | 'p1turn' | 'p2turn' | 'result';

interface BallState {
  x: number;
  y: number;
  power: number;
  angle: number;
  moving: boolean;
}

const HOLES = [
  { x: 20, y: 30, par: 2 }, { x: 70, y: 55, par: 3 }, { x: 40, y: 75, par: 2 }, { x: 80, y: 25, par: 3 },
  { x: 15, y: 60, par: 2 }, { x: 55, y: 40, par: 3 }, { x: 90, y: 70, par: 2 }, { x: 35, y: 15, par: 3 },
  { x: 65, y: 80, par: 2 }, { x: 10, y: 45, par: 3 }, { x: 50, y: 60, par: 2 }, { x: 75, y: 35, par: 3 },
];

const ROMANTIC_COMMENTS = [
  "💕 Like Cupid's arrow, straight to the hole!", "🌹 Beautiful shot, Romeo!", "💖 Perfect aim, Juliet!", "✨ What a swing!",
  "💘 Love this precision!", "🌸 Elegant like a dance!", "💝 Shot of the heart!", "🕊️ Smooth as a dove!",
  "💓 You're a natural!", "🌟 Almost perfect!", "💗 Close enough to feel the love!", "💖 Great try, lovebird!",
];

export default function CoupleGolfsPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [holes, setHoles] = useState<typeof HOLES>([]);
  const [currentHole, setCurrentHole] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [p1HoleScores, setP1HoleScores] = useState<number[]>([]);
  const [p2HoleScores, setP2HoleScores] = useState<number[]>([]);
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(45);
  const [shots, setShots] = useState(0);
  const [comment, setComment] = useState('');
  const [round, setRound] = useState(1);
  const [totalShots, setTotalShots] = useState({ 1: 0, 2: 0 });

  const ballRef = useRef<BallState>({ x: 10, y: 85, power: 50, angle: 45, moving: false });
  const animRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...HOLES].sort(() => Math.random() - 0.5).slice(0, 6);
    setHoles(shuffled);
    setCurrentHole(0);
    setP1Score(0);
    setP2Score(0);
    setP1HoleScores([]);
    setP2HoleScores([]);
    setCurrentPlayer(1);
    setPower(50);
    setAngle(45);
    setShots(0);
    setTotalShots({ 1: 0, 2: 0 });
    setComment('');
    ballRef.current = { x: 10, y: 85, power: 50, angle: 45, moving: false };
    setPhase('p1turn');
  };

  const swing = () => {
    if (ballRef.current.moving) return;
    ballRef.current.moving = true;
    ballRef.current.power = power;
    ballRef.current.angle = angle;
    setShots(s => s + 1);
    setTotalShots(t => ({ ...t, [currentPlayer]: t[currentPlayer] + 1 }));

    let bx = 10, by = 85;
    const target = holes[currentHole];
    const rad = (angle * Math.PI) / 180;
    const speed = power * 0.3;
    const dx = Math.cos(rad) * speed;
    const dy = -Math.sin(rad) * speed;
    let dist = 0;
    const maxDist = 200;

    const animate = () => {
      bx += dx * 0.05;
      by += dy * 0.05;
      dist += Math.sqrt(dx * dx + dy * dy) * 0.05;
      ballRef.current.x = bx;
      ballRef.current.y = by;

      if (dist > maxDist || bx < 0 || bx > 100 || by < 0 || by > 100) {
        ballRef.current.moving = false;
        ballRef.current.x = Math.max(5, Math.min(95, bx));
        ballRef.current.y = Math.max(5, Math.min(95, by));
        finishHole();
        return;
      }

      const hx = target.x, hy = target.y;
      if (Math.abs(bx - hx) < 5 && Math.abs(by - hy) < 5) {
        ballRef.current.moving = false;
        ballRef.current.x = hx;
        ballRef.current.y = hy;
        finishHole();
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const finishHole = () => {
    const hole = holes[currentHole];
    const dist = Math.sqrt((ballRef.current.x - hole.x) ** 2 + (ballRef.current.y - hole.y) ** 2);
    let holeScore = dist < 5 ? 1 : dist < 15 ? 2 : dist < 25 ? 3 : 4;
    holeScore = Math.max(1, Math.min(6, holeScore));

    if (currentPlayer === 1) {
      setP1Score(s => s + holeScore);
      setP1HoleScores(s => [...s, holeScore]);
    } else {
      setP2Score(s => s + holeScore);
      setP2HoleScores(s => [...s, holeScore]);
    }

    setComment(ROMANTIC_COMMENTS[Math.floor(Math.random() * ROMANTIC_COMMENTS.length)]);

    setTimeout(() => {
      setComment('');
      if (currentPlayer === 2) {
        if (currentHole + 1 < holes.length) {
          setCurrentHole(h => h + 1);
          setCurrentPlayer(1);
          setShots(0);
          ballRef.current = { x: 10, y: 85, power: 50, angle: 45, moving: false };
        } else {
          setPhase('result');
        }
      } else {
        setCurrentPlayer(2);
        setShots(0);
        ballRef.current = { x: 10, y: 85, power: 50, angle: 45, moving: false };
      }
    }, 1500);
  };

  const ballX = ballRef.current.x;
  const ballY = ballRef.current.y;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Target className="w-5 h-5 text-amber-500" /> Couple Golf</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⛳</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Couple Golf</h2>
                  <p className="text-gray-600">6 romantic holes! Set power & angle, then swing! Lower score wins!</p>
                  <p className="text-sm text-pink-500 font-medium">Player 1 goes first on each hole</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Tee Off! ⛳</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {(phase === 'p1turn' || phase === 'p2turn') && holes[currentHole] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-2 text-sm font-bold">
                <span className={currentPlayer === 1 ? 'text-blue-600' : 'text-rose-600'}>
                  {currentPlayer === 1 ? '💙 Player 1' : '💗 Player 2'}
                </span>
                <span className="text-gray-600">Hole {currentHole + 1}/{holes.length} - Par {holes[currentHole].par}</span>
              </div>

              <TiltCard intensity={3}>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-[2rem] shadow-xl border border-green-200 p-4 relative overflow-hidden" style={{ minHeight: '300px' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-64">
                    {holes.slice(0, currentHole + 1).map((h, i) => (
                      <circle key={i} cx={h.x} cy={h.y} r="4" fill="white" stroke="#333" strokeWidth="0.5" />
                    ))}
                    {holes[currentHole] && (
                      <circle cx={holes[currentHole].x} cy={holes[currentHole].y} r="3" fill="#dc2626" />
                    )}
                    <circle cx={ballX} cy={ballY} r="3" fill="white" stroke="#333" strokeWidth="0.5">
                      <animate attributeName="r" values="3;4;3" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  {comment && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-lg font-bold text-green-700">
                      {comment}
                    </motion.p>
                  )}
                </div>
              </TiltCard>

              {!comment && (
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Power: {power}%</label>
                      <input type="range" min="10" max="100" value={power} onChange={e => setPower(+e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Angle: {angle}°</label>
                      <input type="range" min="5" max="85" value={angle} onChange={e => setAngle(+e.target.value)} className="w-full" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="bg-blue-50 rounded-xl px-4 py-2"><p className="text-blue-500">P1 Total</p><p className="text-xl font-black">{p1Score}</p></div>
                      <div className="bg-rose-50 rounded-xl px-4 py-2"><p className="text-rose-500">P2 Total</p><p className="text-xl font-black">{p2Score}</p></div>
                    </div>
                    <Button onClick={swing} variant="primary" className="w-full" size="lg">Swing! 🏌️</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Final Results!</h2>
                  <div className="text-4xl font-black gradient-text">
                    P1: {p1Score} vs P2: {p2Score}
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    {p1Score < p2Score ? '💙 Player 1 Wins!' : p2Score < p1Score ? '💗 Player 2 Wins!' : '🤝 It\'s a Tie!'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 rounded-xl p-3"><p className="font-bold text-blue-700">Player 1 Scores</p>{p1HoleScores.map((s, i) => <p key={i}>H{i + 1}: {s}</p>)}</div>
                    <div className="bg-rose-50 rounded-xl p-3"><p className="font-bold text-rose-700">Player 2 Scores</p>{p2HoleScores.map((s, i) => <p key={i}>H{i + 1}: {s}</p>)}</div>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again ⛳</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
