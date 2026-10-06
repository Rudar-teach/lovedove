'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Timer, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const MOVES = [
  { name: 'Slow Sway', emoji: '💫', points: 30, duration: 10 },
  { name: 'Dip & Spin', emoji: '🌪️', points: 40, duration: 15 },
  { name: 'Lift Lift', emoji: '🦋', points: 50, duration: 10 },
  { name: 'Body Roll', emoji: '💃', points: 25, duration: 8 },
  { name: 'Freestyle Flair', emoji: '✨', points: 45, duration: 20 },
  { name: 'Hip Hop Shuffle', emoji: '🎧', points: 30, duration: 12 },
  { name: 'Tango Step', emoji: '💃🕺', points: 35, duration: 10 },
  { name: 'Cha-Cha Slide', emoji: '💕', points: 30, duration: 12 },
];

const SONGS = ['Perfect - Ed Sheeran', 'All of Me - John Legend', 'Thinking Out Loud', 'At Last - Etta James'];

export default function DanceChallengePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'ready' | 'playing' | 'finished'>('idle');
  const [moveIndex, setMoveIndex] = useState(0);
  const [moveTime, setMoveTime] = useState(0);
  const [score, setScore] = useState(0);
  const [song, setSong] = useState('');
  const [combo, setCombo] = useState(0);

  const start = () => {
    const s = SONGS[Math.floor(Math.random() * SONGS.length)];
    setSong(s);
    setMoveIndex(0);
    setMoveTime(MOVES[0].duration);
    setScore(0);
    setCombo(0);
    setState('ready');
  };

  const beginMove = () => {
    setState('playing');
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (moveTime <= 0) {
      setCombo(0);
      if (moveIndex + 1 >= MOVES.length) setState('finished');
      else {
        setMoveIndex((i) => i + 1);
        setMoveTime(MOVES[moveIndex + 1].duration);
      }
      return;
    }
    const t = setTimeout(() => setMoveTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [moveTime, state, moveIndex]);

  const completeMove = () => {
    setCombo((c) => c + 1);
    const bonus = combo * 2;
    setScore((s) => s + MOVES[moveIndex].points + bonus);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <Music className="w-20 h-20 text-fuchsia-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Dance Challenge</h1>
            <p className="text-white/80 mb-8 text-lg">Dance together, move by move. Build a combo for bonus points.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Pick a Song
            </button>
          </motion.div>
        )}

        {state === 'ready' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="text-7xl mb-6 animate-bounce">💃🕺</div>
            <h2 className="text-3xl font-bold text-white mb-2">Now Playing</h2>
            <p className="text-2xl text-pink-300 font-semibold mb-8">{song}</p>
            <button onClick={beginMove} className="px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl font-semibold text-lg">
              Hit the Dance Floor!
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div key={moveIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Move {moveIndex + 1}/{MOVES.length}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Combo: {combo}x</span>
            </div>
            <div className="bg-gradient-to-br from-fuchsia-500/40 to-pink-500/40 backdrop-blur-md rounded-3xl p-10 border-2 border-fuchsia-300/40 text-center">
              <div className="text-8xl mb-4">{MOVES[moveIndex].emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-3">{MOVES[moveIndex].name}</h2>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-3">
                <motion.div className="bg-gradient-to-r from-fuchsia-400 to-pink-400 h-full" animate={{ width: `${(moveTime / MOVES[moveIndex].duration) * 100}%` }} />
              </div>
              <div className="text-white/80">Time: {moveTime}s • Worth {MOVES[moveIndex].points} pts</div>
            </div>
            <button onClick={completeMove} className="w-full mt-6 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl font-semibold text-lg">
              Nailed It! +{MOVES[moveIndex].points + combo * 2}
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Performance Complete!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-fuchsia-300">{score}</div>
              <div className="text-white/80 mt-2">Total Dance Points</div>
              <p className="mt-6 text-white/80 italic">"Dance is the hidden language of the soul — together, it is the loudest."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Dance Again
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}