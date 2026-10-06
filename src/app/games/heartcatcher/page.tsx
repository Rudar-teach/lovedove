'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_DURATION = 30;
const SPAWN_INTERVAL = 800;

type Item = { id: number; x: number; y: number; type: 'heart' | 'sparkle' | 'bomb'; points: number; emoji: string };

export default function HeartCatcherPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_DURATION);
  const [items, setItems] = useState<Item[]>([]);
  const [catcher, setCatcher] = useState({ x: 50 });
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const idRef = useRef(0);

  const useRef = (v: number) => ({ current: v });

  const spawnItem = useCallback(() => {
    if (state !== 'playing') return;
    const types: { type: Item['type']; points: number; emoji: string }[] = [
      { type: 'heart', points: 10, emoji: '❤️' },
      { type: 'heart', points: 10, emoji: '💕' },
      { type: 'sparkle', points: 25, emoji: '✨' },
      { type: 'bomb', points: 0, emoji: '💣' },
    ];
    const weights = [0.5, 0.25, 0.15, 0.1];
    let r = Math.random();
    let typeIndex = 0;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) { sum += weights[i]; if (r <= sum) { typeIndex = i; break; } }
    const t = types[typeIndex];
    const item: Item = { id: Date.now() + Math.random(), x: 5 + Math.random() * 85, y: -5, type: t.type, points: t.points, emoji: t.emoji };
    setItems((prev) => [...prev.slice(-30), item]);
  }, [state]);

  const moveCatcher = (e: React.KeyboardEvent | KeyboardEvent) => {
    setCatcher((c) => {
      if ((e as KeyboardEvent).key === 'ArrowLeft') return { x: Math.max(0, c.x - 10) };
      if ((e as KeyboardEvent).key === 'ArrowRight') return { x: Math.min(90, c.x + 10) };
      return c;
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', moveCatcher);
    return () => window.removeEventListener('keydown', moveCatcher);
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    if (time <= 0) { setState('finished'); return; }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const interval = setInterval(spawnItem, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [state, spawnItem]);

  useEffect(() => {
    if (state !== 'playing') return;
    const fall = setInterval(() => {
      setItems((prev) => {
        const updated = prev.map((item) => ({ ...item, y: item.y + 5 })).filter((item) => item.y <= 100);
        return updated;
      });
    }, 300);
    return () => clearInterval(fall);
  }, [state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const check = setInterval(() => {
      const catcherLeft = catcher.x;
      const catcherRight = catcher.x + 12;
      setItems((prev) => {
        const remaining: Item[] = [];
        prev.forEach((item) => {
          if (item.y >= 80 && item.y <= 95 && item.x >= catcherLeft && item.x <= catcherRight) {
            if (item.type === 'heart') {
              setCombo((c) => { const nc = c + 1; return nc; });
              setScore((s) => s + item.points * (combo > 2 ? 2 : 1));
            } else if (item.type === 'sparkle') {
              setScore((s) => s + item.points);
              setCombo((c) => c + 1);
            } else if (item.type === 'bomb') {
              setCombo(0);
              setLives((l) => l - 1);
            }
          } else {
            remaining.push(item);
          }
        });
        return remaining;
      });
    }, 500);
    return () => clearInterval(check);
  }, [state, catcher, combo]);

  const comboCount = combo;
  useEffect(() => { setCombo(comboCount); }, [comboCount]);

  const start = () => {
    setScore(0);
    setTime(GAME_DURATION);
    setItems([]);
    setCatcher({ x: 44 });
    setCombo(0);
    setLives(3);
    setState('playing');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Heart className="w-20 h-20 text-pink-400 mx-auto mb-6" fill="currentColor" />
            <h1 className="text-5xl font-bold text-white mb-4">Heart Catcher</h1>
            <p className="text-white/80 mb-4 text-lg">Catch falling hearts with your basket. Use Arrow keys to move. Avoid bombs!</p>
            <p className="text-white/60 mb-8 text-sm">Build a combo for double points. Catch sparkles for bonus rewards.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Game
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-3 text-white">
              <span className="bg-white/10 px-3 py-1 rounded-full">Score: {score}</span>
              <span className="bg-white/10 px-3 py-1 rounded-full">Time: {time}s</span>
              <span className="bg-white/10 px-3 py-1 rounded-full">Lives: {'❤️'.repeat(lives)}</span>
              {combo > 2 && <span className="bg-pink-500/50 px-3 py-1 rounded-full animate-pulse">Combo {combo}x!</span>}
            </div>
            <div className="relative bg-gradient-to-b from-indigo-900/50 to-purple-900/50 rounded-3xl h-[400px] border-2 border-white/20 overflow-hidden">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  animate={{ y: item.y + '%', opacity: item.y > 95 ? 0 : 1 }}
                  className="absolute text-2xl pointer-events-none"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  {item.emoji}
                </motion.div>
              ))}
              <div className="absolute bottom-4 transition-all duration-200" style={{ left: `${catcher.x}%`, transform: 'translateX(-50%)' }}>
                <div className="w-12 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full border-2 border-white/60 shadow-lg flex items-center justify-center">
                  <Heart size={14} className="text-white" fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-white/50 text-center mt-3 text-sm">Use ← → arrow keys to move</p>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Game Over!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-pink-300">{score}</div>
              <div className="text-white/80 mt-2">Final Score</div>
              <p className="mt-6 text-white/80 italic">"Catch every heart, dodge every bomb — just like real love."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Play Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}