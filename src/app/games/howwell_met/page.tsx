'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Share2, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface StoryQuestion {
  q: string;
  type: 'mc' | 'fill';
  options: string[];
  correct: number;
  hint: string;
}

const QUESTIONS: StoryQuestion[] = [
  { q: "When did you first meet your partner?", type: 'mc', options: ['Through mutual friends', 'At work or school', 'On a dating app', 'At a social event'], correct: -1, hint: 'No wrong answer here! All meetings are valid ❤️' },
  { q: "Where was your first date?", type: 'mc', options: ['A restaurant', 'A coffee shop', 'A movie theater', 'A walk in the park'], correct: -1, hint: 'Where your love story began!' },
  { q: "What was the first thing you noticed about them?", type: 'mc', options: ['Their eyes', 'Their smile', 'Their laugh', 'Their style'], correct: -1, hint: 'The spark moment! ✨' },
  { q: "Who said 'I love you' first?", type: 'mc', options: ['I did', 'They did', 'We said it together', "We're still racing to say it!"], correct: -1, hint: 'The big three words! 💕' },
  { q: "How long did you date before becoming official?", type: 'mc', options: ['Less than a month', '1-3 months', '3-6 months', 'Over 6 months'], correct: -1, hint: 'When it went from casual to forever' },
  { q: "What is your favorite shared hobby?", type: 'mc', options: ['Cooking together', 'Watching movies', 'Outdoor adventures', 'Traveling'], correct: -1, hint: 'What makes time fly together?' },
  { q: "Where was your first kiss?", type: 'mc', options: ['At a restaurant', 'In a car', 'At the movies', 'On a walk'], correct: -1, hint: 'The moment that changed everything' },
  { q: "What is your 'song' as a couple?", type: 'mc', options: ['A song from our first date', 'A song we danced to', 'A song that reminds us of each other', 'A song that played at a key moment'], correct: -1, hint: 'The soundtrack of your love 🎵' },
];

export default function HowWellMet() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);

  const startGame = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setShowHint(false);
    setPhase('playing');
  };

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const next = () => {
    if (selected === null) return;
    setAnswers([...answers, selected]);
    setSelected(null);
    setShowHint(false);
    if (current + 1 >= QUESTIONS.length) {
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
    }
  };

  useEffect(() => {
    if (phase === 'playing') {
      setProgress(((current) / QUESTIONS.length) * 100);
    }
  }, [current, phase]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-rose-500" /> Your Love Story
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-rose-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💑</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">How Well Do You Know Each Other?</h2>
                    <p className="text-gray-600">A journey through your love story! 8 questions about the moments that made you 'us'.</p>
                    <p className="text-sm text-rose-500 font-medium">Reflect, reminisce, and celebrate your story</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Begin Our Story 📖</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && QUESTIONS[current] && (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-full h-2 bg-rose-100 rounded-full mb-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                    animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600">Chapter {current + 1} of {QUESTIONS.length}</span>
                  <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">
                    ❤️ Story Mode
                  </span>
                </div>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6 md:p-8">
                    <p className="text-xl font-bold text-center text-gray-800 mb-2 leading-snug">{QUESTIONS[current].q}</p>

                    <div className="space-y-3 mt-6">
                      {QUESTIONS[current].options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={selected === null ? { scale: 1.02, x: 4 } : {}}
                          whileTap={selected === null ? { scale: 0.98 } : {}}
                          onClick={() => handlePick(i)}
                          disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${selected === i ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-white border-gray-200 hover:border-rose-300 hover:bg-rose-50'} ${selected !== null && selected !== i ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-sm font-bold text-rose-600">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                            {selected === i && <span className="ml-auto">💕</span>}
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-gray-600">
                          <span className="font-bold text-yellow-700">💡 Reflect:</span> {QUESTIONS[current].hint}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {selected !== null && (
                      <div className="mt-4 space-y-2">
                        {!showHint && (
                          <button onClick={() => setShowHint(true)} className="w-full p-2 text-sm text-rose-600 font-medium hover:underline">
                            Show a reflection hint 💡
                          </button>
                        )}
                        <Button onClick={next} variant="primary" className="w-full">
                          {current + 1 < QUESTIONS.length ? 'Next Chapter →' : 'See Our Story 🌟'}
                        </Button>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">📖</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">Your Love Story</h2>
                    <p className="text-gray-600">Every great love has chapters. Here's a snapshot of yours:</p>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {QUESTIONS.map((q, i) => (
                        <div key={i} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-3 text-left border border-rose-100">
                          <p className="text-xs text-rose-600 font-bold">Chapter {i + 1}</p>
                          <p className="text-sm font-semibold text-gray-700">{q.q}</p>
                          <p className="text-sm text-rose-700 mt-1">→ {q.options[answers[i]]}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-rose-100 rounded-xl p-3">
                      <p className="text-sm font-semibold text-rose-700">⭐ Your story is unique and beautiful — keep writing it together!</p>
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Add Another Chapter 📚</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games"><Button variant="ghost" size="sm">← Back to Games</Button></Link>
            </div>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your love 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
