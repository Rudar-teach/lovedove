'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Share2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: "What is your partner's favorite color?", options: ['Red', 'Blue', 'Pink', 'Green', 'Purple'] },
  { q: "What is your partner's favorite food?", options: ['Pizza', 'Sushi', 'Pasta', 'Tacos', 'Burgers'] },
  { q: "What is your partner's favorite movie genre?", options: ['Romance', 'Action', 'Comedy', 'Thriller', 'Drama'] },
  { q: "Who is your partner's celebrity crush?", options: ['Ryan Reynolds', 'Margot Robbie', 'Chris Hemsworth', 'Zendaya', 'Other'] },
  { q: "What is your partner's dream vacation destination?", options: ['Paris', 'Maldives', 'Tokyo', 'New York', 'Bali'] },
  { q: "What is your partner's biggest pet peeve?", options: ['Loud chewing', 'Tardiness', 'Messiness', 'Bad grammar', 'Interruptions'] },
  { q: "What is your partner's go-to comfort drink?", options: ['Coffee', 'Tea', 'Hot chocolate', 'Wine', 'Smoothie'] },
  { q: "What is your partner's favorite season?", options: ['Spring', 'Summer', 'Fall', 'Winter', 'All of them'] },
  { q: "What makes your partner laugh the most?", options: ['Dad jokes', 'Puns', 'Slapstick', 'Memes', 'Inside jokes'] },
  { q: "What is your partner's hidden talent?", options: ['Singing', 'Cooking', 'Drawing', 'Dancing', 'Whistling'] },
];

export default function WhoKnowsWho() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'reveal' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [p1Ans, setP1Ans] = useState<number[]>([]);
  const [p2Ans, setP2Ans] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [toast, setToast] = useState(false);

  const startGame = () => {
    setP1Ans([]);
    setP2Ans([]);
    setCurrent(0);
    setSelected(null);
    setShowAnswer(false);
    setMatchCount(0);
    setPhase('p1');
  };

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const next = () => {
    if (selected === null) return;

    if (phase === 'p1') {
      setP1Ans([...p1Ans, selected]);
      setSelected(null);
      if (current + 1 >= QUESTIONS.length) {
        setCurrent(0);
        setPhase('p2');
      } else {
        setCurrent(c => c + 1);
      }
    } else if (phase === 'p2') {
      const newP2 = [...p2Ans, selected];
      setP2Ans(newP2);
      setSelected(null);
      if (current + 1 >= QUESTIONS.length) {
        let count = 0;
        for (let i = 0; i < QUESTIONS.length; i++) {
          if (p1Ans[i] === newP2[i]) count++;
        }
        setMatchCount(count);
        setPhase('reveal');
      } else {
        setCurrent(c => c + 1);
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const pct = QUESTIONS.length > 0 ? Math.round((matchCount / QUESTIONS.length) * 100) : 0;
  const verdict = pct >= 90 ? 'Soulmate level! 🌟' : pct >= 70 ? 'You really know each other! 💕' : pct >= 50 ? 'Solid connection! 💖' : 'Lots to discover! 💬';

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-pink-500" /> Who Knows Who
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-pink-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">👫</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Who Knows Who?</h2>
                    <p className="text-gray-600">Both partners answer the same questions about each other. Then see how many match!</p>
                    <p className="text-sm text-gray-500">10 questions • 2 player • Pass the device!</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Test 💑</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {(phase === 'p1' || phase === 'p2') && (
              <motion.div key={`p-${phase}-${current}`} initial={{ opacity: 0, x: phase === 'p1' ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: phase === 'p1' ? -30 : 30 }}>
                <div className={`rounded-2xl p-3 mb-4 text-center ${phase === 'p1' ? 'bg-pink-100' : 'bg-rose-100'}`}>
                  <p className={`text-sm font-bold ${phase === 'p1' ? 'text-pink-700' : 'text-rose-700'}`}>
                    🤫 {phase === 'p1' ? "Player 1's turn" : "Player 2's turn"} &mdash; Don't peek!
                  </p>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                    animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <p className="text-sm font-semibold text-gray-500 mb-2 text-center">Question {current + 1}/{QUESTIONS.length}</p>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-xl font-bold text-center text-gray-800 mb-6">{QUESTIONS[current].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[current].options.map((opt, i) => (
                        <button key={i} onClick={() => handlePick(i)} disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${selected === i ? 'bg-pink-100 border-pink-400 text-pink-800' : 'bg-white border-gray-200 hover:border-pink-300'} ${selected !== null && selected !== i ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                            {selected === i && <span className="ml-auto">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>

                    {selected !== null && (
                      <Button onClick={next} variant="primary" className="w-full mt-4">
                        {current + 1 < QUESTIONS.length ? 'Next →' : (phase === 'p1' ? 'Pass to Player 2 →' : 'See Results →')}
                      </Button>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'reveal' && (
              <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <h2 className="text-2xl font-display font-black text-center mb-2">📊 How You Compare</h2>
                    <p className="text-center text-gray-600 mb-4">{matchCount} of {QUESTIONS.length} matched</p>

                    <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                      {QUESTIONS.map((q, i) => {
                        const matched = p1Ans[i] === p2Ans[i];
                        return (
                          <div key={i} className={`p-3 rounded-xl border-2 ${matched ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Q{i + 1}: {q.q}</p>
                            <p className="text-xs text-gray-500">
                              {matched ? '✅ Both chose: ' : '💙 P1: "' + q.options[p1Ans[i]] + '" | 💗 P2: "' + q.options[p2Ans[i]] + '"'}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <Button onClick={() => setPhase('result')} variant="primary" className="w-full">See Final Score 🎯</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{pct >= 70 ? '💕' : pct >= 40 ? '💖' : '💬'}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">{pct}% Match!</h2>
                    <p className="text-xl text-pink-600 font-bold">{verdict}</p>
                    <div className="flex justify-center gap-4">
                      <div className="text-center p-3 rounded-2xl bg-pink-50">
                        <p className="text-2xl font-black text-pink-600">{matchCount}/{QUESTIONS.length}</p>
                        <p className="text-xs text-gray-500">Matches</p>
                      </div>
                      <div className="text-center p-3 rounded-2xl bg-rose-50">
                        <p className="text-2xl font-black text-rose-600">{QUESTIONS.length - matchCount}</p>
                        <p className="text-xs text-gray-500">Mismatches</p>
                      </div>
                    </div>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 💕</Button>
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
                Link copied! 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
