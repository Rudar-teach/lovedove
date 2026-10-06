'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const RIDDLES = [
  { q: "What has to be broken before you can use it?", answer: "an egg", options: ["an egg", "a heart", "a promise", "a seal"] },
  { q: "I'm full of holes but still hold water. What am I?", answer: "a sponge", options: ["a sponge", "a net", "a cloud", "a sieve"] },
  { q: "What can travel all around the world without leaving its corner?", answer: "a stamp", options: ["a stamp", "a thought", "a shadow", "light"] },
  { q: "The more you share me, the more I grow. What am I?", answer: "love", options: ["love", "a secret", "knowledge", "money"] },
  { q: "What has legs but cannot walk?", answer: "a table", options: ["a table", "a chair", "a plant", "a clock"] },
  { q: "What belongs to you but others use it more than you?", answer: "your name", options: ["your name", "your phone", "your house", "your heart"] },
  { q: "What gets bigger the more you take away?", answer: "a hole", options: ["a hole", "debt", "anger", "distance"] },
  { q: "What has many keys but can't open a single lock?", answer: "a piano", options: ["a piano", "a computer", "a map", "a diary"] },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "the letter m", options: ["the letter m", "the number 1", "a heartbeat", "love"] },
  { q: "I can fly without wings. I can cry without eyes. What am I?", answer: "a cloud", options: ["a cloud", "the wind", "a ghost", "a dream"] },
  { q: "What has one eye but can't see?", answer: "a needle", options: ["a needle", "a potato", "a storm", "a cyclone"] },
  { q: "What kind of room has no doors or windows?", answer: "a mushroom", options: ["a mushroom", "a cavity", "a mirror", "a thought"] },
  { q: "What has a tongue but cannot talk, has a soul but cannot feel love?", answer: "a shoe", options: ["a shoe", "a river", "a plant", "a statue"] },
  { q: "What can fill a room but takes up no space?", answer: "light", options: ["light", "love", "sound", "music"] },
  { q: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "a map", options: ["a map", "a painting", "a dream", "a story"] },
];

export default function RelationshipRiddlesPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [riddles, setRiddles] = useState<typeof RIDDLES>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...RIDDLES].sort(() => Math.random() - 0.5).slice(0, 10);
    setRiddles(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setBestStreak(0);
    setFeedback('');
    setPhase('playing');
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

  const handleAnswer = (choice: string) => {
    const correct = riddles[currentIdx].answer;
    if (choice === correct) {
      setScore(s => s + 10);
      setStreak(s => {
        const ns = s + 1;
        if (ns > bestStreak) setBestStreak(ns);
        return ns;
      });
      setFeedback('✨ Correct!');
    } else {
      setStreak(0);
      setFeedback(`😅 It was: ${correct}`);
    }
    setTimeout(() => {
      setFeedback('');
      if (currentIdx + 1 < riddles.length) {
        setCurrentIdx(i => i + 1);
      } else {
        setPhase('result');
      }
    }, 1000);
  };

  const percent = Math.round((score / (riddles.length * 10)) * 100);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-5 h-5 text-primary-500" /> Relationship Riddles</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🔍</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Relationship Riddles</h2>
                  <p className="text-gray-600">Solve 10 riddles with couple-themed answers in 60 seconds! Beat your streak!</p>
                  <div className="flex gap-2 justify-center text-2xl">
                    <span className="px-3 py-1 bg-pink-100 rounded-full">🧠</span>
                    <span className="px-3 py-1 bg-rose-100 rounded-full">💕</span>
                    <span className="px-3 py-1 bg-pink-100 rounded-full">⏱️</span>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Solo 🔍</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && riddles[currentIdx] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Riddle {currentIdx + 1}/{riddles.length}</span>
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-pink-600">🔥 {streak} streak</span>
                  <span className={`text-sm font-bold ${timeLeft <= 15 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timeLeft}s</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / riddles.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-lg font-bold text-gray-800 mb-6 text-center italic leading-relaxed">"{riddles[currentIdx].q}"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {riddles[currentIdx].options.map((opt, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleAnswer(opt)}
                        className="p-4 rounded-2xl font-semibold text-left bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-100 hover:border-primary-300 hover:from-pink-100 hover:to-rose-100 transition-all text-gray-700">
                        {['A', 'B', 'C', 'D'][i]}. {opt}
                      </motion.button>
                    ))}
                  </div>
                  {feedback && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="text-center text-lg font-bold mt-4 text-primary-600">{feedback}</motion.p>
                  )}
                </div>
              </TiltCard>

              <div className="flex justify-center gap-4 mt-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-bold text-primary-600">{score}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100">
                  <p className="text-xs text-gray-500">Best Streak</p>
                  <p className="text-xl font-bold text-amber-600">🔥 {bestStreak}</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem} shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{percent >= 70 ? '🏆' : percent >= 40 ? '💡' : '🧩'}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">
                    {percent >= 70 ? 'Riddle Genius!' : percent >= 40 ? 'Great Thinker!' : 'Keep Trying!'}
                  </h2>
                  <div className="text-5xl font-black gradient-text">{percent}%</div>
                  <p className="text-gray-600">Score: {score}/{riddles.length * 10}</p>
                  <p className="text-amber-600 font-bold">Best streak: 🔥 {bestStreak}</p>
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
