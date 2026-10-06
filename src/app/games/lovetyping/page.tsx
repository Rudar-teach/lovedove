'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const PHRASES = [
  "I love you", "You are beautiful", "Forever together", "My heart beats for you",
  "You complete me", "Love you always", "Soulmates forever", "My one and only",
  "Together always", "You are my sunshine", "Love never fades", "Be my valentine",
  "You make me happy", "My heart is yours", "With all my love",
];

export default function LoveTypingPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [phrases, setPhrases] = useState<typeof PHRASES>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    const shuffled = [...PHRASES].sort(() => Math.random() - 0.5).slice(0, 8);
    setPhrases(shuffled);
    setCurrentIdx(0);
    setInput('');
    setScore(0);
    setTimeLeft(45);
    setCurrentPhrase(shuffled[0]);
    setCorrectChars(0);
    setTotalChars(0);
    setWpm(0);
    setPhase('playing');
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (phase !== 'playing') return;
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
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === currentPhrase) {
      setScore(s => s + 10);
      setCorrectChars(c => c + currentPhrase.length);
      setTotalChars(c => c + currentPhrase.length);
      if (currentIdx + 1 < phrases.length) {
        setCurrentIdx(i => i + 1);
        setCurrentPhrase(phrases[currentIdx + 1]);
        setInput('');
      } else {
        const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
        const words = correctChars + currentPhrase.length / 5;
        setWpm(Math.round(words / Math.max(elapsed, 0.01)));
        setPhase('result');
      }
    }
    setInput('');
  };

  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-5 h-5 text-primary-500" /> Love Typing</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⌨️</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Love Typing</h2>
                  <p className="text-gray-600">Type romantic phrases as fast as you can! 45 seconds to shine!</p>
                  <div className="bg-pink-50 rounded-xl p-4 text-sm text-gray-600">
                    <p>Type each phrase exactly and hit Enter to continue! 💕</p>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Typing 💕</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && currentPhrase && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Phrase {currentIdx + 1}/{phrases.length}</span>
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-pink-600">Score: {score}</span>
                  <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timeLeft}s</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / phrases.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-3xl font-bold text-center text-gray-800 mb-2 tracking-wide">"{currentPhrase}"</p>
                  <p className="text-center text-sm text-gray-500 mb-6">Type exactly as shown</p>
                  <form onSubmit={handleSubmit}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} autoFocus placeholder="Type here..."
                      className="w-full text-center text-lg font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" />
                    <Button type="submit" variant="primary" className="w-full mt-3" disabled={!input.trim()}>Submit</Button>
                  </form>
                </div>
              </TiltCard>

              <div className="flex justify-center gap-4 mt-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">WPM</p>
                  <p className="text-xl font-bold text-primary-600">{wpm || '--'}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Accuracy</p>
                  <p className="text-xl font-bold text-green-600">{accuracy}%</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{wpm > 40 ? '⚡' : wpm > 20 ? '⌨️' : '🐢'}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Typing Complete!</h2>
                  <div className="text-5xl font-black gradient-text">{score} pts</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3"><p className="text-blue-500 text-sm">WPM</p><p className="text-2xl font-black text-gray-800">{wpm}</p></div>
                    <div className="bg-green-50 rounded-xl p-3"><p className="text-green-500 text-sm">Accuracy</p><p className="text-2xl font-black text-gray-800">{accuracy}%</p></div>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 🔄</Button>
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
