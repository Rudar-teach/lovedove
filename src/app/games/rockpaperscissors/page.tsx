'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';
import { supabase } from '@/lib/supabase';

type Choice = 'rock' | 'paper' | 'scissors' | null;

const CHOICES: { id: 'rock' | 'paper' | 'scissors'; emoji: string; label: string; color: string }[] = [
  { id: 'rock', emoji: '🪨', label: 'Rock', color: 'from-gray-400 to-gray-600' },
  { id: 'paper', emoji: '📄', label: 'Paper', color: 'from-blue-400 to-blue-600' },
  { id: 'scissors', emoji: '✂️', label: 'Scissors', color: 'from-pink-400 to-rose-600' },
];

function determineWinner(p1: Choice, p2: Choice): 'p1' | 'p2' | 'draw' {
  if (!p1 || !p2) return 'draw';
  if (p1 === p2) return 'draw';
  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'paper' && p2 === 'rock') ||
    (p1 === 'scissors' && p2 === 'paper')
  ) {
    return 'p1';
  }
  return 'p2';
}

export default function RockPaperScissorsPage() {
  const [player1, setPlayer1] = useState<Choice>(null);
  const [player2, setPlayer2] = useState<Choice>(null);
  const [phase, setPhase] = useState<'idle' | 'p1-pick' | 'p2-pick' | 'reveal'>('idle');
  const [result, setResult] = useState<'p1' | 'p2' | 'draw' | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draw: 0 });
  const [mode, setMode] = useState<'ai' | 'two-player'>('ai');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'rockpaperscissors',
      players: [session.user.id],
      game_state: { phase: 'idle' },
      status: 'waiting',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
  }, []);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/rockpaperscissors?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleChoice = (choice: Choice) => {
    if (mode === 'ai') {
      setPlayer1(choice);
      setPhase('reveal');
      const aiChoices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
      const aiPick = aiChoices[Math.floor(Math.random() * 3)];
      setPlayer2(aiPick);
      const winner = determineWinner(choice, aiPick);
      setResult(winner);
      if (winner === 'p1') setScores(s => ({ ...s, p1: s.p1 + 1 }));
      else if (winner === 'p2') setScores(s => ({ ...s, p2: s.p2 + 1 }));
      else setScores(s => ({ ...s, draw: s.draw + 1 }));
      saveGame(winner);
    } else {
      if (phase === 'p1-pick') {
        setPlayer1(choice);
        setPhase('p2-pick');
      } else if (phase === 'p2-pick') {
        setPlayer2(choice);
        const winner = determineWinner(player1, choice);
        setResult(winner);
        setPhase('reveal');
        if (winner === 'p1') setScores(s => ({ ...s, p1: s.p1 + 1 }));
        else if (winner === 'p2') setScores(s => ({ ...s, p2: s.p2 + 1 }));
        else setScores(s => ({ ...s, draw: s.draw + 1 }));
        saveGame(winner);
      }
    }
  };

  const saveGame = async (winner: 'p1' | 'p2' | 'draw') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (sessionId) {
      await supabase.from('game_sessions').update({
        game_state: { player1, player2, winner },
        status: 'completed',
      }).eq('id', sessionId);
    }
  };

  const resetRound = () => {
    setPlayer1(null);
    setPlayer2(null);
    setPhase('idle');
    setResult(null);
  };

  const startNewRound = () => {
    resetRound();
    if (mode === 'two-player') setPhase('p1-pick');
  };

  const resultMessage = () => {
    if (result === 'draw') return { text: "It's a Draw! 🤝", color: 'text-gray-700' };
    if (result === 'p1') return { text: mode === 'ai' ? 'You Win! 🎉' : 'Player 1 Wins! 🎉', color: 'text-primary-600' };
    return { text: mode === 'ai' ? 'AI Wins! 🤖' : 'Player 2 Wins! 🎉', color: 'text-rose-600' };
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
              Rock Paper Scissors
            </h1>
            <button onClick={startNewRound} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
          </div>

          {/* Invite Button */}
          <div className="flex justify-center mb-6">
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

          {/* Mode Selector */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => { setMode('ai'); resetRound(); }}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                mode === 'ai' ? 'bg-primary-500 text-white' : 'bg-white/70 text-gray-700'
              }`}
            >
              🤖 vs AI
            </button>
            <button
              onClick={() => { setMode('two-player'); resetRound(); setPhase('p1-pick'); }}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                mode === 'two-player' ? 'bg-primary-500 text-white' : 'bg-white/70 text-gray-700'
              }`}
            >
              👫 2 Players
            </button>
          </div>

          {/* Score Board */}
          <div className="flex justify-center gap-3 mb-6">
            <div className="px-4 py-2 rounded-2xl font-bold bg-primary-100 text-primary-700">
              {mode === 'ai' ? '❤️' : 'P1'} {scores.p1}
            </div>
            <div className="px-4 py-2 rounded-2xl font-bold bg-gray-100 text-gray-700">
              🤝 {scores.draw}
            </div>
            <div className="px-4 py-2 rounded-2xl font-bold bg-rose-100 text-rose-700">
              {mode === 'ai' ? '🤖' : 'P2'} {scores.p2}
            </div>
          </div>

          {/* Result Message */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center mb-6"
              >
                <p className={`text-2xl font-bold ${resultMessage().color}`}>
                  {resultMessage().text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choices Display */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              {phase === 'reveal' ? (
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-center"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {mode === 'ai' ? 'You' : 'Player 1'}
                    </p>
                    <div className="text-7xl">{player1 && CHOICES.find(c => c.id === player1)?.emoji}</div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-center"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {mode === 'ai' ? 'AI' : 'Player 2'}
                    </p>
                    <div className="text-7xl">{player2 && CHOICES.find(c => c.id === player2)?.emoji}</div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center mb-6">
                  <p className="text-lg text-gray-600">
                    {mode === 'two-player' && phase === 'p1-pick' && 'Player 1: Make your choice!'}
                    {mode === 'two-player' && phase === 'p2-pick' && 'Player 2: Make your choice!'}
                    {(mode === 'ai' || phase === 'idle') && 'Choose your move!'}
                  </p>
                </div>
              )}

              {/* Choice Buttons */}
              {phase !== 'reveal' && (
                <div className="grid grid-cols-3 gap-3">
                  {CHOICES.map((choice) => (
                    <motion.button
                      key={choice.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChoice(choice.id)}
                      className={`aspect-square rounded-2xl bg-gradient-to-br ${choice.color} shadow-lg flex flex-col items-center justify-center text-white transition-all`}
                    >
                      <span className="text-4xl mb-1">{choice.emoji}</span>
                      <span className="text-sm font-medium">{choice.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {phase === 'reveal' && (
                <Button onClick={startNewRound} variant="primary" className="w-full" size="lg">
                  Next Round 🎮
                </Button>
              )}
            </div>
          </TiltCard>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="rockpaperscissors" />
      </PremiumBackground>
  );
}
