'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

type Turn = 'pick1' | 'guess1' | 'pick2' | 'guess2' | 'result';

export default function NumberGuessPage() {
  const [turn, setTurn] = useState<Turn>('pick1');
  const [number1, setNumber1] = useState<number | null>(null);
  const [number2, setNumber2] = useState<number | null>(null);
  const [guess1, setGuess1] = useState('');
  const [guess2, setGuess2] = useState('');
  const [history1, setHistory1] = useState<{guess: number; hint: string}[]>([]);
  const [history2, setHistory2] = useState<{guess: number; hint: string}[]>([]);
  const [result, setResult] = useState('');
  const [winner, setWinner] = useState('');
  const [toast, setToast] = useState(false);

  const generateNumber = () => Math.floor(Math.random() * 100) + 1;

  const handlePick1 = () => {
    const n = generateNumber();
    setNumber1(n);
    setTurn('guess1');
    setHistory1([]);
  };

  const handleGuess1 = () => {
    if (number1 === null) return;
    const g = parseInt(guess1);
    if (isNaN(g) || g < 1 || g > 100) return;
    if (g === number1) {
      setHistory1(prev => [...prev, { guess: g, hint: '🎉 Correct!' }]);
      setTurn('pick2');
      setGuess1('');
    } else if (g < number1) {
      setHistory1(prev => [...prev, { guess: g, hint: '📈 Higher' }]);
    } else {
      setHistory1(prev => [...prev, { guess: g, hint: '📉 Lower' }]);
    }
    setGuess1('');
  };

  const handlePick2 = () => {
    const n = generateNumber();
    setNumber2(n);
    setTurn('guess2');
    setHistory2([]);
  };

  const handleGuess2 = () => {
    if (number2 === null) return;
    const g = parseInt(guess2);
    if (isNaN(g) || g < 1 || g > 100) return;
    if (g === number2) {
      setHistory2(prev => [...prev, { guess: g, hint: '🎉 Correct!' }]);
      setTurn('result');
      const attempts1 = history1.length + 1;
      const attempts2 = history2.length + 1;
      if (attempts1 < attempts2) {
        setWinner('Player 1');
        setResult(`Player 1 won in ${attempts1} guesses vs Player 2's ${attempts2}! 🏆`);
      } else if (attempts2 < attempts1) {
        setWinner('Player 2');
        setResult(`Player 2 won in ${attempts2} guesses vs Player 1's ${attempts1}! 🏆`);
      } else {
        setResult(`It's a tie! Both needed ${attempts1} guesses! 🤝`);
        setWinner('');
      }
    } else if (g < number2) {
      setHistory2(prev => [...prev, { guess: g, hint: '📈 Higher' }]);
    } else {
      setHistory2(prev => [...prev, { guess: g, hint: '📉 Lower' }]);
    }
    setGuess2('');
  };

  const resetGame = () => {
    setTurn('pick1');
    setNumber1(null);
    setNumber2(null);
    setGuess1('');
    setGuess2('');
    setHistory1([]);
    setHistory2([]);
    setResult('');
    setWinner('');
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Number Guess Battle
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          {/* Turn Indicator */}
          <AnimatePresence mode="wait">
            {turn === 'pick1' && (
              <motion.div key="pick1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <p className="text-center text-lg font-semibold text-gray-700 mb-4">
                  👤 <strong>Player 1</strong>: Think of a number between 1-100
                </p>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-6">🤫</p>
                    <p className="text-gray-600 mb-6">Don&apos;t let Player 2 see your number!</p>
                    <Button onClick={handlePick1} variant="primary" size="lg">
                      I&apos;ve Picked My Number!
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'guess1' && (
              <motion.div key="guess1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <p className="text-center text-lg font-semibold text-primary-600 mb-4">
                  👤 <strong>Player 2</strong>: Guess Player 1&apos;s number!
                </p>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                    <div className="flex gap-3 mb-6">
                      <input
                        type="number" min="1" max="100"
                        value={guess1}
                        onChange={e => setGuess1(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGuess1()}
                        placeholder="1-100"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none text-center text-xl font-bold"
                      />
                      <Button onClick={handleGuess1}>Guess!</Button>
                    </div>
                    {/* History */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history1.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className={`flex justify-between items-center p-2 rounded-lg text-sm font-semibold ${h.hint.includes('Correct') ? 'bg-green-100 text-green-700' : h.hint.includes('Higher') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          <span>Guess: {h.guess}</span>
                          <span>{h.hint}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'pick2' && (
              <motion.div key="pick2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <p className="text-center text-lg font-semibold text-gray-700 mb-4">
                  👤 <strong>Player 2</strong>: Think of a number between 1-100
                </p>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-6">🤫</p>
                    <p className="text-gray-600 mb-6">Don&apos;t let Player 1 see your number!</p>
                    <Button onClick={handlePick2} variant="primary" size="lg">
                      I&apos;ve Picked My Number!
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'guess2' && (
              <motion.div key="guess2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <p className="text-center text-lg font-semibold text-primary-600 mb-4">
                  👤 <strong>Player 1</strong>: Guess Player 2&apos;s number!
                </p>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                    <div className="flex gap-3 mb-6">
                      <input
                        type="number" min="1" max="100"
                        value={guess2}
                        onChange={e => setGuess2(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGuess2()}
                        placeholder="1-100"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none text-center text-xl font-bold"
                      />
                      <Button onClick={handleGuess2}>Guess!</Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history2.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className={`flex justify-between items-center p-2 rounded-lg text-sm font-semibold ${h.hint.includes('Correct') ? 'bg-green-100 text-green-700' : h.hint.includes('Higher') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          <span>Guess: {h.guess}</span>
                          <span>{h.hint}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">{winner ? '🏆' : '🤝'}</p>
                    <p className="text-2xl font-bold text-primary-600 mb-2">{result}</p>
                    <Button onClick={resetGame} variant="primary" size="lg" className="mt-4">
                      Play Again 🔄
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games" className="inline-block mt-3">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            <GameSharePanel gameSlug="numberguess" />
      </PremiumBackground>
  );
}
