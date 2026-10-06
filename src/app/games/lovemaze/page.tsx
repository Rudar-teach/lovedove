'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const CELL_SIZE = 18;
const DIRECTIONS = [
  { dx: -1, dy: 0, label: '← Left' },
  { dx: 1, dy: 0, label: 'Right →' },
  { dx: 0, dy: -1, label: '↑ Up' },
  { dx: 0, dy: 1, label: '↓ Down' },
];

function generateMaze(rows: number, cols: number) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(r: number, c: number) {
    grid[r][c] = 0;
    const dirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
    for (const d of dirs) {
      const nr = r + d.dy * 2, nc = c + d.dx * 2;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
        grid[r + d.dy][c + d.dx] = 0;
        carve(nr, nc);
      }
    }
  }
  carve(1, 1);
  grid[rows - 2][cols - 2] = 0;
  return grid;
}

export default function LoveMazePage() {
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'result'>('start');
  const [maze1, setMaze1] = useState<string[][]>([]);
  const [maze2, setMaze2] = useState<string[][]>([]);
  const [pos1, setPos1] = useState({ x: 1, y: 1 });
  const [pos2, setPos2] = useState({ x: 1, y: 1 });
  const [rows, setRows] = useState(11);
  const [cols, setCols] = useState(15);
  const [time1, setTime1] = useState(0);
  const [time2, setTime2] = useState(0);
  const [steps1, setSteps1] = useState(0);
  const [steps2, setSteps2] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setTime1(t => Math.floor((Date.now() - startRef.current) / 1000));
      setTime2(t => Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const setupMaze = useCallback(() => {
    const m1 = generateMaze(rows, cols);
    const m2 = generateMaze(rows, cols);
    setMaze1(m1);
    setMaze2(m2);
    setPos1({ x: 1, y: 1 });
    setPos2({ x: 1, y: 1 });
    setSteps1(0);
    setSteps2(0);
  }, [rows, cols]);

  const startGame = () => {
    setupMaze();
    resetTimer();
    setTime1(0);
    setTime2(0);
    setPhase('p1');
  };

  useEffect(() => {
    if (phase === 'p1' || phase === 'p2') {
      const handleKey = (e: KeyboardEvent) => {
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
        else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
        else if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
        else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
        else return;

        if (phase === 'p1') {
          const nx = pos1.x + dx, ny = pos1.y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze1[ny]?.[nx] === 0) {
            setPos1({ x: nx, y: ny });
            setSteps1(s => s + 1);
            if (nx === cols - 2 && ny === rows - 2) {
              stopTimer();
              setTime1(t => Math.floor((Date.now() - startRef.current) / 1000));
              setTimeout(() => {
                setupMaze();
                setPos2({ x: 1, y: 1 });
                setSteps2(0);
                resetTimer();
                setTime2(0);
                setPhase('p2');
              }, 1500);
            }
          }
        } else {
          const nx = pos2.x + dx, ny = pos2.y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze2[ny]?.[nx] === 0) {
            setPos2({ x: nx, y: ny });
            setSteps2(s => s + 1);
            if (nx === cols - 2 && ny === rows - 2) {
              stopTimer();
              setTime2(t => Math.floor((Date.now() - startRef.current) / 1000));
              setPhase('result');
            }
          }
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [phase, pos1, pos2, maze1, maze2, cols, rows, setupMaze, resetTimer, stopTimer]);

  const atGoal1 = pos1.x === cols - 2 && pos1.y === rows - 2;
  const atGoal2 = pos2.x === cols - 2 && pos2.y === rows - 2;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Love Maze</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🗺️</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Love Maze</h2>
                  <p className="text-gray-600">Navigate your heart 💙 through the maze to reach your lover's heart 💗! Use arrow keys or WASD!</p>
                  <p className="text-sm text-pink-500 font-medium">Player 1 goes first, then Player 2 races the same maze!</p>
                  <div className="bg-pink-50 rounded-xl p-3 text-sm text-gray-600">
                    <p>💙 = You &nbsp;&nbsp; 💗 = Goal &nbsp;&nbsp; ⬛ = Wall</p>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Maze 🗺️</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {(phase === 'p1' || phase === 'p2') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between mb-3 text-sm font-bold">
                <span className={phase === 'p1' ? 'text-blue-600' : 'text-rose-600'}>
                  {phase === 'p1' ? '💙 Player 1 - Find the Heart!' : '💗 Player 2 - Your Turn!'}
                </span>
                <div className="flex gap-3">
                  <span className="text-gray-600">⏱️ {phase === 'p1' ? time1 : time2}s</span>
                  <span className="text-gray-600">Steps: {phase === 'p1' ? steps1 : steps2}</span>
                </div>
              </div>

              <TiltCard intensity={3}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <div className="overflow-x-auto">
                    <div className="inline-block mx-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`, gap: '1px', background: '#e5e7eb', borderRadius: '12px', padding: '2px' }}>
                      {(phase === 'p1' ? maze1 : maze2).flat().map((cell, i) => {
                        const r = Math.floor(i / cols), c = i % cols;
                        const currentPos = phase === 'p1' ? pos1 : pos2;
                        const isPlayer = r === currentPos.y && c === currentPos.x;
                        const isGoal = r === rows - 2 && c === cols - 2;
                        const isStart = r === 1 && c === 1;
                        if (isPlayer) return <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE, background: '#60a5fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>💙</div>;
                        if (isGoal) return <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE, background: '#fecaca', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>💗</div>;
                        if (isStart) return <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE, background: '#fce7f3', borderRadius: '4px' }} />;
                        return <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE, background: cell === 0 ? '#f9fafb' : '#374151', borderRadius: '2px' }} />;
                      })}
                    </div>
                  </div>
                </div>
              </TiltCard>

              <div className="flex justify-center gap-2 mt-4">
                {DIRECTIONS.map(d => (
                  <button key={d.label} onTouchStart={() => {
                    let dx = 0, dy = 0;
                    if (d.label.includes('Left')) dx = -1;
                    if (d.label.includes('Right')) dx = 1;
                    if (d.label.includes('Up')) dy = -1;
                    if (d.label.includes('Down')) dy = 1;
                    const grid = phase === 'p1' ? maze1 : maze2;
                    const cur = phase === 'p1' ? pos1 : pos2;
                    const nx = cur.x + dx, ny = cur.y + dy;
                    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny]?.[nx] === 0) {
                      if (phase === 'p1') { setPos1({ x: nx, y: ny }); setSteps1(s => s + 1); }
                      else { setPos2({ x: nx, y: ny }); setSteps2(s => s + 1); }
                      if (nx === cols - 2 && ny === rows - 2) {
                        stopTimer();
                        if (phase === 'p1') setTime1(t => Math.floor((Date.now() - startRef.current) / 1000));
                        else { setTime2(t => Math.floor((Date.now() - startRef.current) / 1000)); setPhase('result'); }
                        if (phase === 'p1') {
                          setTimeout(() => { setupMaze(); setPos2({ x: 1, y: 1 }); setSteps2(0); resetTimer(); setTime2(0); setPhase('p2'); }, 1500);
                        }
                      }
                    }
                  }} className="px-3 py-2 bg-white/70 rounded-xl font-bold text-sm shadow border border-pink-100">{d.label}</button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Maze Complete!</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4"><p className="text-blue-500 font-medium">💙 Player 1</p><p className="text-2xl font-black">{time1}s</p><p className="text-sm text-gray-600">{steps1} steps</p></div>
                    <div className="bg-rose-50 rounded-xl p-4"><p className="text-rose-500 font-medium">💗 Player 2</p><p className="text-2xl font-black">{time2}s</p><p className="text-sm text-gray-600">{steps2} steps</p></div>
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    {time1 < time2 ? '💙 Player 1 Wins!' : time2 < time1 ? '💗 Player 2 Wins!' : '🤝 Tie!'}
                  </p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🗺️</Button>
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
