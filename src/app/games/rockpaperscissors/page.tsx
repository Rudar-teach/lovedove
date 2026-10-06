'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

type Turn = 'start' | 'p1pick' | 'p1guess' | 'p2pick' | 'p2guess' | 'result';

export default function RockPaperScissorsPage() {
  const [turn, setTurn] = useState<Turn>('start');
  const [p1Choice, setP1Choice] = useState('');
  const [p2Choice, setP2Choice] = useState('');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [lastResult, setLastResult] = useState('');
  const [history, setHistory] = useState<{ p1: string; p2: string; result: string }[]>([]);

  const CHOICES = ['rock', 'paper', 'scissors'];
  const EMOJIS: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' };

  const determine = (a: string, b: string): string => {
    if (a === b) return 'tie';
    if ((a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper')) return 'p1';
    return 'p2';
  };

  const playRound = () => {
    if (!p1Choice || !p2Choice) return;
    const result = determine(p1Choice, p2Choice);
    let msg = '';
    if (result === 'p1') { setP1Score(s => s + 1); msg = '💙 Player 1 wins!'; }
    else if (result === 'p2') { setP2Score(s => s + 1); msg = '💗 Player 2 wins!'; }
    else msg = '🤝 Tie!';
    setLastResult(msg);
    setHistory(h => [...h, { p1: p1Choice, p2: p2Choice, result: msg }]);
    if (round >= totalRounds) {
      setTurn('result');
    } else {
      setTurn('p1pick');
    }
  };

  const startGame = (rounds: number) => {
    setTotalRounds(rounds);
    setP1Score(0);
    setP2Score(0);
    setRound(1);
    setHistory([]);
    setLastResult('');
    setTurn('p1pick');
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setP1Choice('');
    setP2Choice('');
    setLastResult('');
    setTurn('p1pick');
  };

  const renderChoiceButtons = (player: 'p1' | 'p2', disabled: boolean) => (
    <div className="grid grid-cols-3 gap-3">
      {CHOICES.map(c => (
        <motion.button key={c} whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={() => player === 'p1' ? setP1Choice(c) : setP2Choice(c)}
          disabled={disabled}
          className={`p-6 rounded-2xl text-center transition-all ${player === 'p1' ? (p1Choice === c ? 'bg-blue-500 text-white ring-4 ring-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-gray-700') : (p2Choice === c ? 'bg-rose-500 text-white ring-4 ring-rose-300' : 'bg-rose-50 hover:bg-rose-100 text-gray-700')}`}>
          <div className="text-4xl mb-1">{EMOJIS[c]}</div>
          <div className="text-sm font-bold capitalize">{c}</div>
        </motion.button>
      ))}
    </div>
  );

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Trophy className="w-5 h-5 text-amber-500" /> Rock Paper Scissors</h1>
            <div className="w-16" />
          </div>

          {turn === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">✂️</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Rock Paper Scissors</h2>
                  <p className="text-gray-600">Classic couples game! Pick your rounds and battle!</p>
                  <div className="flex justify-center gap-3">
                    {[3, 5, 7].map(r => (
                      <button key={r} onClick={() => startGame(r)} className="px-6 py-3 rounded-xl font-bold bg-white border-2 border-pink-200 hover:border-primary-400 text-gray-700 transition-all">{r} Rounds</button>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(turn === 'p1pick' || turn === 'p2pick') && (
              <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-pink-100/60 shadow-lg font-bold">
                    Round {round}/{totalRounds} - {turn === 'p1pick' ? '💙 Player 1' : '💗 Player 2'} Pick!
                  </span>
                </div>
                <div className="flex justify-center gap-4 mb-4">
                  <div className="bg-blue-50 rounded-xl px-4 py-2"><p className="text-xs text-blue-500">P1 Score</p><p className="text-xl font-black">{p1Score}</p></div>
                  <div className="bg-rose-50 rounded-xl px-4 py-2"><p className="text-xs text-rose-500">P2 Score</p><p className="text-xl font-black">{p2Score}</p></div>
                </div>
                {renderChoiceButtons(turn === 'p1pick' ? 'p1' : 'p2', false)}
                {lastResult && <p className="text-center text-lg font-bold text-primary-600 mt-4">{lastResult}</p>}
              </motion.div>
            )}

            {(turn === 'p1guess' || turn === 'p2guess') && (
              <motion.div key="guess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-center mb-4 text-lg font-semibold text-gray-700">
                  {turn === 'p1guess' ? '💙 Player 2 - What will Player 1 pick?' : '💗 Player 1 - What will Player 2 pick?'}
                </p>
                {renderChoiceButtons(turn === 'p1guess' ? 'p1' : 'p2', true)}
                <p className="text-center text-sm text-gray-500 mt-3">Hidden pick made!</p>
                {lastResult && <p className="text-center text-lg font-bold text-primary-600 mt-2">{lastResult}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {turn === 'p1pick' && p1Choice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
              <Button onClick={() => { setTurn('p1guess'); setP2Choice(''); }} variant="outline">Next: Player 2 →</Button>
            </motion.div>
          )}

          {turn === 'p1guess' && p2Choice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
              <Button onClick={playRound} variant="primary" size="lg">Reveal! 🎭</Button>
            </motion.div>
          )}

          {turn === 'p2pick' && p2Choice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
              <Button onClick={nextRound} variant="primary">Next Round →</Button>
            </motion.div>
          )}

          {turn === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Game Over!</h2>
                  <div className="text-4xl font-black gradient-text">{p1Score} - {p2Score}</div>
                  <p className="text-xl font-bold text-primary-600">
                    {p1Score > p2Score ? '💙 Player 1 Wins!' : p2Score > p1Score ? '💗 Player 2 Wins!' : '🤝 Tie Game!'}
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {history.map((h, i) => (
                      <div key={i} className="text-sm text-gray-600">R{i + 1}: {EMOJIS[h.p1]} vs {EMOJIS[h.p2]} - {h.result}</div>
                    ))}
                  </div>
                  <Button onClick={() => startGame(totalRounds)} variant="primary" size="lg" className="w-full">Play Again 🎭</Button>
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
