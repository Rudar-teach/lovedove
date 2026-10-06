'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Timer, BarChart3, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface HealthQuestion {
  q: string;
  options: string[];
  points: number[];
  category: string;
}

const QUESTIONS: HealthQuestion[] = [
  {
    category: 'Communication',
    q: 'How often do you and your partner have meaningful conversations?',
    options: ['Every day', 'A few times a week', 'Once a week', 'Rarely'],
    points: [4, 3, 2, 0],
  },
  {
    category: 'Communication',
    q: 'When you disagree, how do you handle it?',
    options: ['Talk it out calmly', 'We argue then forgive', 'We avoid the topic', 'We give each other space first'],
    points: [4, 2, 0, 3],
  },
  {
    category: 'Intimacy',
    q: 'How often do you show physical affection?',
    options: ['Multiple times a day', 'Several times a week', 'A few times a month', 'Rarely'],
    points: [4, 3, 2, 0],
  },
  {
    category: 'Intimacy',
    q: 'How comfortable are you expressing your feelings?',
    options: ['Very comfortable', 'Somewhat comfortable', 'It takes effort', 'I hold back a lot'],
    points: [4, 3, 2, 0],
  },
  {
    category: 'Trust',
    q: 'How secure do you feel in this relationship?',
    options: ['Completely secure', 'Mostly secure', 'Sometimes anxious', 'Often doubtful'],
    points: [4, 3, 1, 0],
  },
  {
    category: 'Trust',
    q: 'How do you handle jealousy?',
    options: ['We talk about it openly', 'I keep it to myself', "It causes arguments", "I trust them fully"],
    points: [4, 2, 0, 4],
  },
  {
    category: 'Fun',
    q: 'How often do you do new things together?',
    options: ['Every week', 'Monthly', 'Rarely', 'We prefer routine'],
    points: [4, 3, 1, 1],
  },
  {
    category: 'Fun',
    q: 'How often do you laugh together?',
    options: ['Every single day', 'Several times a week', 'A few times a month', 'Hardly ever'],
    points: [4, 3, 2, 0],
  },
];

type Category = 'Communication' | 'Intimacy' | 'Trust' | 'Fun';

const categoryEmojis: Record<string, string> = {
  Communication: '💬',
  Intimacy: '🤗',
  Trust: '🔒',
  Fun: '🎉',
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Communication: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  Intimacy: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
  Trust: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  Fun: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
};

export default function RelationshipQuiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [toast, setToast] = useState(false);

  const startGame = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setCategoryScores({ Communication: 0, Intimacy: 0, Trust: 0, Fun: 0 });
    setPhase('playing');
  };

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const pts = QUESTIONS[current].points[idx];
    const cat = QUESTIONS[current].category;
    setScore(s => s + pts);
    setCategoryScores(cs => ({ ...cs, [cat]: (cs[cat] || 0) + pts }));
  };

  const next = () => {
    if (selected === null) return;
    setSelected(null);
    if (current + 1 >= QUESTIONS.length) {
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const maxPossible = QUESTIONS.reduce((sum, q) => sum + Math.max(...q.points), 0);
  const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
  const healthLevel = pct >= 85 ? { label: 'Thriving Relationship!', emoji: '🏆', color: 'text-green-600' }
    : pct >= 65 ? { label: 'Healthy Relationship', emoji: '💚', color: 'text-green-500' }
    : pct >= 45 ? { label: 'Getting There', emoji: '💛', color: 'text-amber-600' }
    : { label: 'Needs Attention', emoji: '💡', color: 'text-orange-600' };

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
              <HeartHandshake className="w-4 h-4 text-rose-500" /> Relationship Health
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Sparkles className="w-5 h-5 text-rose-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💑</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Relationship Health Quiz</h2>
                    <p className="text-gray-600">Evaluate the health of your relationship across 4 key areas: Communication, Intimacy, Trust & Fun!</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {['Communication', 'Intimacy', 'Trust', 'Fun'].map(c => (
                        <span key={c} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold">{c}</span>
                      ))}
                    </div>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Check Our Health 💗</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && QUESTIONS[current] && (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-blue-400 via-pink-400 to-amber-400 rounded-full"
                    animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600">Q {current + 1}/{QUESTIONS.length}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[QUESTIONS[current].category].bg} ${categoryColors[QUESTIONS[current].category].text}`}>
                    {categoryEmojis[QUESTIONS[current].category]} {QUESTIONS[current].category}
                  </span>
                </div>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-6 md:p-8">
                    <p className="text-lg font-bold text-center text-gray-800 mb-6 leading-snug">{QUESTIONS[current].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[current].options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={selected === null ? { scale: 1.02, x: 4 } : {}}
                          whileTap={selected === null ? { scale: 0.98 } : {}}
                          onClick={() => handlePick(i)}
                          disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${selected === i ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-white border-gray-200 hover:border-rose-300'} ${selected !== null && selected !== i ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {selected !== null && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Button onClick={next} variant="primary" className="w-full mt-4">
                            {current + 1 < QUESTIONS.length ? 'Next →' : 'See Results 📊'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-rose-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{healthLevel.emoji}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">{healthLevel.label}</h2>
                    <p className="text-5xl font-black gradient-text">{pct}%</p>
                    <p className="text-gray-600">Relationship Health Score</p>

                    <div className="space-y-2">
                      {(Object.keys(categoryScores) as Category[]).map(cat => {
                        const maxCat = QUESTIONS.filter(q => q.category === cat).reduce((s, q) => s + Math.max(...q.points), 0);
                        const catPct = maxCat > 0 ? Math.round((categoryScores[cat] / maxCat) * 100) : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm font-semibold mb-1">
                              <span>{categoryEmojis[cat]} {cat}</span>
                              <span className={catPct >= 70 ? 'text-green-600' : catPct >= 40 ? 'text-amber-600' : 'text-red-600'}>{catPct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${catPct}%` }} transition={{ duration: 1 }}
                                className={`h-2 rounded-full ${catPct >= 70 ? 'bg-green-500' : catPct >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <p className="text-sm text-rose-800">
                        {pct >= 80 ? 'Your relationship is flourishing! Keep nurturing it.' : pct >= 60 ? 'You have a solid foundation. Work on one area at a time!' : pct >= 40 ? 'Focus on communication and small acts of love.' : 'Consider having open conversations about what matters most to each of you.'}
                      </p>
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Retake Quiz 🔄</Button>
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
