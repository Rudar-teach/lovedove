'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type CellValue = 'X' | 'O' | null;

export default function TicTacToePage() {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (currentBoard: CellValue[]): { winner: string | null; line: number[] } => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a]!, line: combo };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: [] };
    }
    return { winner: null, line: [] };
  };

  const createSession = async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'tictactoe',
      players: [authSession.user.id],
      game_state: { board: Array(9).fill(null), turn: 'X' },
      status: 'waiting',
      current_turn: 'X',
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => { createSession(); }, []);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner !== 'draw') {
        setScores(prev => ({ ...prev, [result.winner!]: prev[result.winner!] + 1 }));
        saveGame(result.winner);
      } else {
        setScores(prev => ({ ...prev, draw: prev.draw + 1 }));
        saveGame('draw');
      }
    }
    setIsXNext(!isXNext);
  };

  const saveGame = async (gameWinner: string) => {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) return;
    if (sessionId) {
      await supabase.from('game_sessions').update({
        game_state: { board },
        status: 'completed',
        winner_id: gameWinner === 'X' ? authSession.user.id : null,
      }).eq('id', sessionId);
    }
    const { data: existing } = await supabase.from('game_stats').select('*').eq('user_id', authSession.user.id).eq('game_type', 'tictactoe').single();
    if (existing) {
      await supabase.from('game_stats').update({
        games_played: existing.games_played + 1,
        wins: gameWinner === 'X' ? existing.wins + 1 : existing.wins,
        total_time_played: existing.total_time_played + 30,
        last_played: new Date().toISOString(),
      }).eq('id', existing.id);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const getCellStyle = (index: number) => {
    if (winningLine.includes(index)) {
      return 'bg-gradient-to-br from-primary-100 to-rose-100 border-primary-400 scale-105';
    }
    return 'bg-white border-pink-100 hover:border-primary-300 hover:bg-primary-50/50';
  };

  const isDraw = winner === 'draw';

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Tic-Tac-Toe
            </h1>
            <button onClick={resetGame} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Status */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
            {winner ? (
              <div className="space-y-2">
                {isDraw ? (
                  <p className="text-2xl font-bold text-gray-700">It&apos;s a Draw! 🤝</p>
                ) : (
                  <p className="text-2xl font-bold text-primary-600">
                    {winner} Wins! 🎉
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl font-semibold text-gray-700">
                {isXNext ? "Your turn" : "Opponent's turn"} ({isXNext ? 'X' : 'O'})
              </p>
            )}
          </motion.div>

          {/* Score Board */}
          <div className="flex justify-center gap-4 mb-6">
            {Object.entries(scores).map(([player, score]) => (
              <div
                key={player}
                className={`px-4 py-2 rounded-2xl font-bold text-lg ${
                  player === 'X' ? 'bg-primary-100 text-primary-700' :
                  player === 'O' ? 'bg-rose-100 text-rose-700' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {player === 'X' ? '❤️' : player === 'O' ? '💙' : '🤝'} {score}
              </div>
            ))}
          </div>

          {/* Board */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              <div className="grid grid-cols-3 gap-2">
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: cell ? 1 : 1.05 }}
                    whileTap={{ scale: cell ? 1 : 0.95 }}
                    onClick={() => handleCellClick(index)}
                    disabled={!!cell || !!winner}
                    className={`
                      aspect-square rounded-2xl border-2 text-4xl font-bold
                      flex items-center justify-center transition-all duration-300
                      ${getCellStyle(index)}
                      ${cell === 'X' ? 'text-primary-600' : 'text-blue-600'}
                    `}
                  >
                    {cell && (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* Play Again */}
          {(winner || isDraw) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
              <Button onClick={resetGame} variant="primary" size="lg">
                Play Again 🎮
              </Button>
            </motion.div>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">
            Challenge your partner to play together!
          </p>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-4">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
