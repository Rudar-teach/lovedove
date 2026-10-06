'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Flame, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface Question {
  q: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  { q: "Which ancient Roman festival is considered the precursor to Valentine's Day?", options: ['Lupercalia', 'Saturnalia', 'Flora', 'Bacchanalia'], correct: 0 },
  { q: "What year was the first Valentine's Day card sent in the US?", options: ['1700s', '1847', '1901', '1950'], correct: 1 },
  { q: "Which organ has long been associated with love in virtually every culture?", options: ['Brain', 'Heart', 'Liver', 'Lungs'], correct: 1 },
  { q: "Who built the Taj Mahal as a monument to his beloved wife?", options: ['Akbar', 'Shah Jahan', 'Humayun', 'Aurangzeb'], correct: 1 },
  { q: "How many hearts does an octopus have?", options: ['1', '2', '3', '4'], correct: 2 },
  { q: "What hormone is known as the 'love hormone'?", options: ['Dopamine', 'Oxytocin', 'Serotonin', 'Adrenaline'], correct: 1 },
  { q: "On average, how long does it take to fall in love?", options: ['2 days', '8 seconds', '2 weeks', '2 months'], correct: 1 },
  { q: "Which Shakespeare play features the line 'Love looks not with the eyes'?", options: ['Romeo and Juliet', "A Midsummer Night's Dream", 'Much Ado About Nothing', 'The Tempest'], correct: 1 },
  { q: "What is the traditional gift for a 1st wedding anniversary?", options: ['Silver', 'Paper', 'Cotton', 'Wood'], correct: 1 },
  { q: "Couples who laugh together are statistically more...", options: ['Annoyed', 'Satisfied', 'Bored', 'Angry'], correct: 1 },
  { q: "What percentage of couples meet through friends?", options: ['10%', '22%', '35%', '50%'], correct: 1 },
  { q: "The ancient Greeks believed there were how many types of love?", options: ['3', '4', '5', '6'], correct: 3 },
  { q: "Which color has been scientifically proven to increase attraction?", options: ['Blue', 'Red', 'Green', 'Pink'], correct: 1 },
  { q: "What happens to your brain when you fall in love?", options: ['Nothing special', 'It releases dopamine', 'It shrinks', 'It turns pink'], correct: 1 },
  { q: "What flower is most associated with Valentine's Day?", options: ['Rose', 'Lily', 'Tulip', 'Daisy'], correct: 0 },
  { q: "Who wrote 'Romeo and Juliet'?", options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Emily Brontë'], correct: 1 },
  { q: "In which movie does Jack build a snowman with Rose?", options: ['Ghost', 'Titanic', 'The Notebook', 'Pearl Harbor'], correct: 1 },
  { q: "How many times a day should couples say 'I love you' on average?", options: ['Once', 'Multiple times', 'Never', 'Only on birthdays'], correct: 1 },
];

export default function CoupleTrivia2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'result'>('start');
  const [currentQ, setCurrentQ] = useState(0);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [toast, setToast] = useState(false);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore1(0);
    setScore2(0);
    setSelected(null);
    setShowCorrect(false);
    setPhase('p1');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null || !questions[currentQ]) return;
    setSelected(idx);
    setShowCorrect(true);

    const correct = idx === questions[currentQ].correct;
    if (phase === 'p1' && correct) setScore1(s => s + 1);
    if (phase === 'p2' && correct) setScore2(s => s + 1);

    setTimeout(() => {
      setSelected(null);
      setShowCorrect(false);

      if (phase === 'p1') {
        setPhase('p2');
      } else {
        if (currentQ < questions.length - 1) {
          setCurrentQ(q => q + 1);
        } else {
          setPhase('result');
        }
      }
    }, 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const pct1 = questions.length > 0 ? Math.round((score1 / questions.length) * 100) : 0;
  const pct2 = questions.length > 0 ? Math.round((score2 / questions.length) * 100) : 0;
  const winner = score1 > score2 ? 'p1' : score2 > score1 ? 'p2' : 'tie';

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Couple Trivia Battle
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Zap className="w-5 h-5 text-amber-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🧠💕</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple Trivia Battle</h2>
                    <p className="text-gray-600">Both partners answer the same questions about love & relationships!</p>
                    <p className="text-sm text-gray-500">10 questions each • 4 options • See who knows more!</p>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Battle ⚔️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {(phase === 'p1' || phase === 'p2') && questions[currentQ] && (
              <motion.div key={`q-${currentQ}-${phase}`} initial={{ opacity: 0, x: phase === 'p1' ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: phase === 'p1' ? -40 : 40 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${phase === 'p1' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                    {phase === 'p1' ? '💙 Player 1' : '💗 Player 2'} &mdash; Q{currentQ + 1}/{questions.length}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-blue-600">P1: {score1}</span>
                    <span className="text-sm font-bold text-rose-600">P2: {score2}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-blue-400 to-rose-400 rounded-full"
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-lg font-bold text-gray-800 mb-6 text-center">{questions[currentQ].q}</p>
                    <div className="space-y-3">
                      {questions[currentQ].options.map((opt, i) => {
                        const isCorrect = i === questions[currentQ].correct;
                        const isSelected = selected === i;
                        let btnClass = 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50';
                        if (showCorrect && isCorrect) btnClass = 'bg-green-100 border-green-400 text-green-800';
                        else if (showCorrect && isSelected && !isCorrect) btnClass = 'bg-red-100 border-red-400 text-red-800';
                        else if (showCorrect) btnClass = 'opacity-50 border-gray-200 text-gray-400';
                        return (
                          <motion.button key={i} whileHover={!showCorrect ? { scale: 1.02, x: 4 } : {}} whileTap={!showCorrect ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswer(i)} disabled={showCorrect}
                            className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${btnClass}`}>
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                              <span>{opt}</span>
                              {showCorrect && isCorrect && <span className="ml-auto">✅</span>}
                              {showCorrect && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{winner === 'p1' ? '🏆' : winner === 'p2' ? '🎉' : '🤝'}</div>
                    <h2 className="text-3xl font-display font-black text-gray-800">
                      {winner === 'p1' ? 'Player 1 Wins!' : winner === 'p2' ? 'Player 2 Wins!' : "It's a Tie!"}
                    </h2>

                    <div className="flex justify-center gap-4">
                      <div className={`text-center p-4 rounded-2xl ${winner === 'p1' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500">💙 Player 1</p>
                        <p className="text-3xl font-black text-blue-600">{score1}/{questions.length}</p>
                        <p className="text-xs text-gray-500">{pct1}%</p>
                      </div>
                      <div className={`text-center p-4 rounded-2xl ${winner === 'p2' ? 'bg-rose-100 ring-2 ring-rose-400' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500">💗 Player 2</p>
                        <p className="text-3xl font-black text-rose-600">{score2}/{questions.length}</p>
                        <p className="text-xs text-gray-500">{pct2}%</p>
                      </div>
                    </div>

                    <p className="text-gray-600">
                      {winner === 'tie' ? "You're equally romantic! Perfect match!" : score1 >= 8 ? 'Amazing love knowledge!' : 'Keep learning about love together!'}
                    </p>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Battle Again ⚔️</Button>
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
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
