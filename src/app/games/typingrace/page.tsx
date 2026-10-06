'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const WORDS = [
  "love", "heart", "kiss", "hug", "forever", "romance", "darling", "sweetheart",
  "passion", "adore", "cherish", "embrace", "together", "eternal", "enchanting",
  "blissful", "amorous", "covet", "infatuated", "tender", "affection", "beloved",
  "enamored", "fondness", "yearning", "devoted", "lovers", "romantic",
];

export default function TypingRacePage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 15);
    setWords(shuffled);
    setCurrentWord(shuffled[0]);
    setWordIdx(0);
    setInput('');
    setScore(0);
    setTimeLeft(30);
    setCombo(0);
    setMaxCombo(0);
    setStarted(false);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' || started) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, started]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!started) { setStarted(true); return; }
    if (input.trim() === currentWord) {
      const pts = 10 + combo * 2;
      setScore(s => s + pts);
      setCombo(c => {
        const nc = c + 1;
        if (nc > maxCombo) setMaxCombo(nc);
        return nc;
      });
    } else {
      setCombo(0);
    }
    if (wordIdx + 1 < words.length) {
      setWordIdx(i => i + 1);
      setCurrentWord(words[wordIdx + 1]);
      setInput('');
    } else {
      setPhase('result');
    }
  };

  const handleCountdown = () => {
    setInput(input + currentWord[0]);
    if (input.length + 1 >= currentWord.length) {
      handleSubmit(new Event('submit') as any);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Zap className="w-5 h-5 text-amber-500" /> Typing Race</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⚡</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Typing Race</h2>
                  <p className="text-gray-600">Type romantic words as fast as possible in 30 seconds! Build combos for bonus points!</p>
                  <div className="bg-amber-50 rounded-xl p-3 text-sm text-gray-600">
                    <p>⚡ Build combos for bonus points!</p>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Race ⚡</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Word {wordIdx + 1}/{words.length}</span>
                <div className="flex gap-3">
                  {combo > 2 && <span className="text-sm font-bold text-amber-600">🔥 {combo}x combo!</span>}
                  <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timeLeft}s</span>
                </div>
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-4xl font-bold text-center text-gray-800 mb-6 tracking-wider">
                    {currentWord.split('').map((ch, i) => {
                      const typed = input[i];
                      if (typed === undefined) return <span key={i} className="text-gray-300">{ch}</span>;
                      if (typed === ch) return <span key={i} className="text-green-600 underline">{ch}</span>;
                      return <span key={i} className="text-red-500 line-through">{typed}</span>;
                    })}
                  </p>
                  <form onSubmit={handleSubmit}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} autoFocus placeholder="Type the word..."
                      className="w-full text-center text-lg font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" />
                    <Button type="submit" variant="primary" className="w-full mt-3">Submit</Button>
                  </form>
                </div>
              </TiltCard>

              <div className="flex justify-center gap-4 mt-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-bold text-primary-600">{score}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Max Combo</p>
                  <p className="text-xl font-bold text-amber-600">🔥 {maxCombo}x</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⚡</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Race Complete!</h2>
                  <div className="text-5xl font-black gradient-text">{score} pts</div>
                  <p className="text-amber-600 font-bold">Best combo: 🔥 {maxCombo}x</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Race Again ⚡</Button>
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
