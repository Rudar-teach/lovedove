'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function NumberGuessPage() {
  const [turn, setTurn] = useState<'pick1' | 'guess1' | 'pick2' | 'guess2' | 'result'>('pick1');
  const [number1, setNumber1] = useState<number | null>(null);
  const [number2, setNumber2] = useState<number | null>(null);
  const [guess1, setGuess1] = useState('');
  const [guess2, setGuess2] = useState('');
  const [history1, setHistory1] = useState<{ guess: number; hint: string }[]>([]);
  const [history2, setHistory2] = useState<{ guess: number; hint: string }[]>([]);
  const [result, setResult] = useState('');
  const [toast, setToast] = useState(false);

  const generateNumber = () => Math.floor(Math.random() * 100) + 1;

  const handlePick1 = () => {
    setNumber1(generateNumber());
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
      setHistory1(prev => [...prev, { guess: g, hint: '📈 Higher!' }]);
    } else {
      setHistory1(prev => [...prev, { guess: g, hint: '📉 Lower!' }]);
    }
    setGuess1('');
  };
  const handlePick2 = () => {
    setNumber2(generateNumber());
    setTurn('guess2');
    setHistory2([]);
  };
  const handleGuess2 = () => {
    if (number2 === null) return;
    const g = parseInt(guess2);
    if (isNaN(g) || g < 1 || g > 100) return;
    if (g === number2) {
      setHistory2(prev => [...prev, { guess: g, hint: '🎉 Correct!' }]);
      const a1 = history1.length + 1;
      const a2 = history2.length + 1;
      if (a1 < a2) setResult(`💙 Player 1 wins in ${a1} vs ${a2} guesses!`);
      else if (a2 < a1) setResult(`💗 Player 2 wins in ${a2} vs ${a1} guesses!`);
      else setResult(`🤝 Tie! Both needed ${a1} guesses!`);
      setTurn('result');
    } else if (g < number2) {
      setHistory2(prev => [...prev, { guess: g, hint: '📈 Higher!' }]);
    } else {
      setHistory2(prev => [...prev, { guess: g, hint: '📉 Lower!' }]);
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
  };
  const inviteFriend = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Number Guess Battle</h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors"><Heart className="w-5 h-5 text-primary-500" /></button>
          </div>

          <AnimatePresence mode="wait">
            {turn === 'pick1' && (
              <motion.div key="pick1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🤫</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Player 1's Turn</h2>
                    <p className="text-gray-600">Think of a secret number between 1-100!</p>
                    <Button onClick={handlePick1} variant="primary" size="lg" className="w-full">I've Picked! 🤫</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'guess1' && (
              <motion.div key="guess1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-center text-lg font-semibold text-blue-600 mb-4">💙 Player 2 - Guess Player 1's Number!</p>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                    <div className="flex gap-3">
                      <input type="number" min="1" max="100" value={guess1} onChange={e => setGuess1(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGuess1()} placeholder="1-100" className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 text-center text-xl font-bold focus:border-primary-500 outline-none" />
                      <Button onClick={handleGuess1}>Guess!</Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history1.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className={`flex justify-between items-center p-3 rounded-xl text-sm font-bold ${h.hint.includes('Correct') ? 'bg-green-100 text-green-700' : h.hint.includes('Higher') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          <span>Guess: {h.guess}</span><span>{h.hint}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'pick2' && (
              <motion.div key="pick2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🤫</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Player 2's Turn</h2>
                    <p className="text-gray-600">Think of a secret number between 1-100!</p>
                    <Button onClick={handlePick2} variant="primary" size="lg" className="w-full">I've Picked! 🤫</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'guess2' && (
              <motion.div key="guess2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-center text-lg font-semibold text-rose-600 mb-4">💗 Player 1 - Guess Player 2's Number!</p>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                    <div className="flex gap-3">
                      <input type="number" min="1" max="100" value={guess2} onChange={e => setGuess2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGuess2()} placeholder="1-100" className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 text-center text-xl font-bold focus:border-primary-500 outline-none" />
                      <Button onClick={handleGuess2}>Guess!</Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history2.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className={`flex justify-between items-center p-3 rounded-xl text-sm font-bold ${h.hint.includes('Correct') ? 'bg-green-100 text-green-700' : h.hint.includes('Higher') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          <span>Guess: {h.guess}</span><span>{h.hint}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {turn === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🏆</div>
                    <p className="text-2xl font-bold text-primary-600">{result}</p>
                    <Button onClick={resetGame} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
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
    </PremiumBackground>
  );
}
