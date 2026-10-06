'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Share2, Flame, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface Question {
  q: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  { q: "What's your partner's favorite color?", options: ['Red', 'Blue', 'Pink', 'Green', 'Purple'] },
  { q: "What's their idea of a perfect Sunday morning?", options: ['Sleeping in', 'Working out early', 'Brunch with friends', 'Cooking breakfast together'] },
  { q: "What was your partner's childhood dream job?", options: ['Astronaut', 'Doctor', 'Musician', 'Athlete', 'Artist'] },
  { q: "What's their biggest pet peeve?", options: ['Tardiness', 'Messiness', 'Loud chewing', 'Not listening', 'Being interrupted'] },
  { q: "What's their go-to comfort food?", options: ['Pizza', 'Ice cream', 'Mac & cheese', 'Chocolate', 'Soup'] },
  { q: "What's their preferred way to unwind after a bad day?", options: ['Alone time', 'Watching movies', 'Talking about it', 'Going for a walk'] },
  { q: "What's their biggest fear?", options: ['Heights', 'Spiders', 'Public speaking', 'The dark', 'Failure'] },
  { q: "What's their dream vacation style?", options: ['Beach resort', 'Mountain hiking', 'City exploration', 'Camping adventure'] },
  { q: "What's their love language?", options: ['Words of affirmation', 'Physical touch', 'Acts of service', 'Quality time', 'Gifts'] },
  { q: "What's their biggest life goal right now?", options: ['Career growth', 'Starting a family', 'Traveling more', 'Buying a home', 'Learning new skills'] },
];

type Phase = 'start' | 'p1' | 'p2' | 'compare' | 'result';

export default function CoupleQuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('start');
  const [p1Answers, setP1Answers] = useState<Record<number, number>>({});
  const [p2Answers, setP2Answers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [activePlayer, setActivePlayer] = useState<'p1' | 'p2'>('p1');
  const [selected, setSelected] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [toast, setToast] = useState(false);

  const startGame = () => {
    setP1Answers({});
    setP2Answers({});
    setCurrent(0);
    setActivePlayer('p1');
    setSelected(null);
    setShowReveal(false);
    setPhase('p1');
  };

  const handlePick = (qIdx: number, optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
  };

  const confirmAnswer = () => {
    if (selected === null) return;
    const ans = activePlayer === 'p1'
      ? { ...p1Answers, [current]: selected }
      : { ...p2Answers, [current]: selected };

    if (activePlayer === 'p1') setP1Answers(ans);
    else setP2Answers(ans);

    setSelected(null);
    if (current + 1 < QUESTIONS.length) {
      setCurrent(c => c + 1);
    } else if (activePlayer === 'p1') {
      setCurrent(0);
      setActivePlayer('p2');
    } else {
      setPhase('compare');
    }
  };

  const matches = () => {
    let count = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (p1Answers[i] === p2Answers[i]) count++;
    }
    return count;
  };

  const matchScore = matches();
  const pct = Math.round((matchScore / QUESTIONS.length) * 100);
  const compatLevel = pct >= 90 ? { label: 'Soulmates!', emoji: '💕' } : pct >= 70 ? { label: 'Deeply Connected', emoji: '💖' } : pct >= 50 ? { label: 'Great Match', emoji: '💗' } : pct >= 30 ? { label: 'Getting There', emoji: '💝' } : { label: 'Keep Discovering!', emoji: '🌱' };

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
              <Sparkles className="w-4 h-4 text-amber-500" /> Couple Compatibility
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Zap className="w-5 h-5 text-amber-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💑</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple Compatibility Quiz</h2>
                    <p className="text-gray-600">Both partners answer the same 10 questions independently. Then discover how well you truly know each other!</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {['Preferences', 'Habits', 'Dreams', 'Love Style'].map(c => (
                        <span key={c} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">{c}</span>
                      ))}
                    </div>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Test Our Compatibility 💫</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {(phase === 'p1' || phase === 'p2') && QUESTIONS[current] && (
              <motion.div key={`q-${current}-${phase}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`rounded-2xl p-3 mb-3 text-center ${activePlayer === 'p1' ? 'bg-amber-100' : 'bg-rose-100'}`}>
                  <p className={`text-sm font-bold ${activePlayer === 'p1' ? 'text-amber-700' : 'text-rose-700'}`}>
                    🤫 {activePlayer === 'p1' ? "Player 1 — Don't let Player 2 see!" : "Player 2 — Don't let Player 1 see!"}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Q {current + 1}/{QUESTIONS.length}</span>
                  <div className="flex gap-3">
                    <span className="text-sm font-bold text-amber-600">💛 P1: {Object.keys(p1Answers).length}/{QUESTIONS.length}</span>
                    <span className="text-sm font-bold text-rose-600">💗 P2: {Object.keys(p2Answers).length}/{QUESTIONS.length}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                    animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6 md:p-8">
                    <p className="text-lg font-bold text-center text-gray-800 mb-6">{QUESTIONS[current].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[current].options.map((opt, i) => (
                        <button key={i} onClick={() => handlePick(current, i)} disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${selected === i ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50'} ${selected !== null && selected !== i ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                            {selected === i && <span className="ml-auto">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>

                    {selected !== null && (
                      <Button onClick={confirmAnswer} variant="primary" className="w-full mt-4">
                        {current + 1 < QUESTIONS.length ? 'Next →' : activePlayer === 'p1' ? 'Pass to Player 2 →' : 'See Results →'}
                      </Button>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'compare' && (
              <motion.div key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6 md:p-8">
                    <h2 className="text-2xl font-display font-black text-center mb-4">📊 Your Compatibility</h2>

                    <div className="max-w-xs mx-auto mb-4">
                      <div className="h-5 bg-amber-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" />
                      </div>
                    </div>

                    <p className="text-3xl font-black text-center gradient-text mb-1">{pct}%</p>
                    <p className="text-center text-amber-600 font-bold text-lg mb-6">{compatLevel.emoji} {compatLevel.label}</p>

                    <div className="flex justify-center gap-6 mb-4">
                      <div className="text-center p-4 rounded-2xl bg-amber-50">
                        <p className="text-xs text-amber-500">💛 Player 1</p>
                        <p className="text-lg font-bold text-gray-700">{Object.values(p1Answers).map((a, i) => QUESTIONS[i].options[a]).join(', ').substring(0, 60)}...</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-rose-50">
                        <p className="text-xs text-rose-500">💗 Player 2</p>
                        <p className="text-lg font-bold text-gray-700">{Object.values(p2Answers).map((a, i) => QUESTIONS[i].options[a]).join(', ').substring(0, 60)}...</p>
                      </div>
                    </div>

                    <Button onClick={() => setPhase('result')} variant="primary" className="w-full">See Full Breakdown 📋</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{compatLevel.emoji}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">{compatLevel.label}</h2>
                    <p className="text-5xl font-black gradient-text">{pct}%</p>
                    <p className="text-gray-600">You matched on {matchScore}/{QUESTIONS.length} questions!</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs text-amber-500">💛 Player 1 score</p>
                        <p className="text-2xl font-black text-amber-600">{matchScore} matches</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-3">
                        <p className="text-xs text-rose-500">💗 Player 2 score</p>
                        <p className="text-2xl font-black text-rose-600">{QUESTIONS.length - matchScore} different</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-sm text-amber-800">
                        {pct >= 70 ? 'Amazing connection! You know each other deeply.' : pct >= 50 ? 'Good match! Keep exploring each other.' : 'Every new answer brings you closer together!'}
                      </p>
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Try Again 💫</Button>
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
                Link copied! Share the quiz 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
