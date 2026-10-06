'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const GRID_SIZE = 3;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

export default function TicTacToePage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'p1name' | 'playing' | 'finished'>('idle');
  const [board, setBoard] = useState<(string | null)[]>(Array(TOTAL_CELLS).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [p1, setP1] = useState('Player 1');
  const [p2, setP2] = useState('Player 2');
  const [score, setScore] = useState({ p1: 0, p2: 0, ties: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[]>([]);
  const [round, setRound] = useState(1);

  const checkWinner = (b: (string | null)[]): { winner: string | null; line: number[] } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { winner: b[a]!, line: [a, bIdx, c] };
      }
    }
    return { winner: null, line: [] };
  };

  const startGame = () => {
    setBoard(Array(TOTAL_CELLS).fill(null));
    setTurn('X');
    setWinner(null);
    setWinLine([]);
    setState('playing');
  };

  const select = (idx: number) => {
    if (board[idx] || state !== 'playing') return;
    const updated = [...board];
    updated[idx] = turn;
    setBoard(updated);
    const result = checkWinner(updated);
    if (result.winner) {
      setWinner(result.winner);
      setWinLine(result.line);
      setScore((s) => ({
        ...s,
        p1: s.p1 + (result.winner === 'X' ? 1 : 0),
        p2: s.p2 + (result.winner === 'O' ? 1 : 0),
      }));
      setState('finished');
    } else if (updated.every((c) => c !== null)) {
      setWinner('tie');
      setScore((s) => ({ ...s, ties: s.ties + 1 }));
      setState('finished');
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  const resetBoard = () => {
    setBoard(Array(TOTAL_CELLS).fill(null));
    setTurn('X');
    setWinner(null);
    setWinLine([]);
    setRound((r) => r + 1);
    setState('playing');
  };

  const resetAll = () => {
    setScore({ p1: 0, p2: 0, ties: 0 });
    setRound(1);
    startGame();
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto mb-6">
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">X</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">O</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">X</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">O</div>
              <div className="aspect-square bg-pink-500/50 rounded-xl flex items-center justify-center text-3xl">💖</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">O</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">X</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">O</div>
              <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center text-3xl">X</div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Love Tic Tac Toe</h1>
            <p className="text-white/80 mb-8 text-lg">Play with X and O, but make it romantic. Race to three in a row.</p>
            <div className="max-w-xs mx-auto mb-6 space-y-2">
              <input value={p1} onChange={(e) => setP1(e.target.value)} placeholder="Player X name" className="w-full bg-white/10 text-white placeholder-white/50 rounded-2xl px-4 py-3 outline-none text-center" />
              <input value={p2} onChange={(e) => setP2(e.target.value)} placeholder="Player O name" className="w-full bg-white/10 text-white placeholder-white/50 rounded-2xl px-4 py-3 outline-none text-center" />
            </div>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Game
            </button>
          </motion.div>
        )}

        {state === 'playing' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Round {round}</span>
              <span className={`px-4 py-2 rounded-full font-semibold ${turn === 'X' ? 'bg-pink-500/50' : 'bg-rose-500/50'}`}>
                {turn === 'X' ? p1 : p2}'s turn ({turn})
              </span>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <div className="bg-pink-500/30 px-4 py-2 rounded-full text-white">
                <span className="font-bold">{p1}:</span> {score.p1}
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-full text-white">
                Ties: {score.ties}
              </div>
              <div className="bg-rose-500/30 px-4 py-2 rounded-full text-white">
                <span className="font-bold">{p2}:</span> {score.p2}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
              {board.map((cell, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => select(idx)}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: winLine.includes(idx) ? 1.15 : 1,
                    backgroundColor: cell ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold transition-all border-2 ${
                    winLine.includes(idx) ? 'border-yellow-300' : 'border-white/20'
                  }`}
                >
                  {cell === 'X' && <span className="text-pink-300">{cell}</span>}
                  {cell === 'O' && <span className="text-rose-300">{cell}</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'finished' && winner && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Heart className="w-20 h-20 text-pink-400 mx-auto mb-6" fill="currentColor" />
            <h2 className="text-4xl font-bold text-white mb-2">
              {winner === 'tie' ? "It's a Tie!" : `${winner === 'X' ? p1 : p2} Wins!`}
            </h2>
            {winner !== 'tie' && <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-4" />}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-pink-300">
                {winner === 'tie' ? '🤝' : '👑'}
              </div>
              <p className="text-white/80 mt-2">{winner === 'tie' ? 'Perfectly matched!' : 'Victory!'}</p>
              <p className="text-white/80 mt-1">Score: {winner === 'X' ? score.p1 : score.p2} - {score.ties} - {winner === 'O' ? score.p2 : score.p1}</p>
              <p className="mt-6 text-white/80 italic">"In love as in games — two can play, but only one can win the heart."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={resetBoard} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Next Round
              </button>
              <button onClick={resetAll} className="px-6 py-3 bg-white/20 text-white rounded-2xl">Reset Score</button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}