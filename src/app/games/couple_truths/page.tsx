'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  "What's the first thing you noticed about me?",
  "What's our most romantic moment?",
  "What do I do that always makes you smile?",
  "What's your favorite physical feature of mine?",
  "What song reminds you most of us?",
  "Where do you see us in 5 years?",
  "What's your biggest fear about our relationship?",
  "What's the best gift I've ever given you?",
  "What was the moment you knew you loved me?",
  "What's the most romantic thing I've done?",
  "What's your dream date with me?",
  "What small thing do I do that you love?",
  "What's the biggest surprise I've given you?",
  "What would you name our future pet?",
  "What's your favorite 'us' tradition?",
];

export default function CoupleTruthsPage() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p2Answers, setP2Answers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [p1Turn, setP1Turn] = useState(true);
  const [feedback, setFeedback] = useState('');

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setP1Answers([]);
    setP2Answers([]);
    setInput('');
    setP1Turn(true);
    setFeedback('');
    setPhase('playing');
  };

  const submitAnswer = () => {
    if (!input.trim() || currentIdx >= questions.length) return;
    if (p1Turn) {
      setP1Answers(a => [...a, input.trim()]);
      setP1Turn(false);
      setInput('');
    } else {
      setP2Answers(a => [...a, input.trim()]);
      setP2Answers(a2 => [...a2, input.trim()]);
      setInput('');
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(i => i + 1);
        setP1Turn(true);
        setFeedback('');
      } else {
        setFeedback('done');
        setTimeout(() => setPhase('result'), 500);
      }
    }
  };

  const skip = () => {
    if (p1Turn) {
      setP1Answers(a => [...a, 'skipped']);
      setP1Turn(false);
    } else {
      setP2Answers(a => [...a, 'skipped']);
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(i => i + 1);
        setP1Turn(true);
      } else {
        setPhase('result');
      }
    }
    setInput('');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Couple Truths</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">💬</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Couple Truths</h2>
                  <p className="text-gray-600">Answer 8 deep questions about your relationship! Both players answer, then compare!</p>
                  <p className="text-sm text-pink-500 font-medium">Be honest and open with each other</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Truths 💬</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'playing' && questions[currentIdx] && (
            <motion.div initial={{ opacity: 0, x: p1Turn ? 40 : -40 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">{p1Turn ? '💙 Player 1\'s Turn' : '💗 Player 2\'s Turn'}</span>
                <span className="text-sm text-gray-500">Q {currentIdx + 1}/{questions.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-lg font-bold text-gray-800 mb-6 text-center">{questions[currentIdx]}</p>
                  <div className="space-y-3">
                    <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Share your truth..."
                      className="w-full rounded-xl border-2 border-pink-200 p-4 focus:border-primary-400 outline-none resize-none" rows={3} autoFocus />
                    <div className="flex gap-3">
                      <Button onClick={submitAnswer} variant="primary" className="flex-1" disabled={!input.trim()}>Submit</Button>
                      <Button onClick={skip} variant="outline">Skip</Button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">💬</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Truths Shared!</h2>
                  <p className="text-gray-600">You've both shared your truths. Open hearts, deep connections!</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4"><p className="text-blue-500 font-medium">💙 Player 1</p><p className="text-sm text-gray-600">{p1Answers.filter(a => a !== 'skipped').length} answers</p></div>
                    <div className="bg-rose-50 rounded-xl p-4"><p className="text-rose-500 font-medium">💗 Player 2</p><p className="text-sm text-gray-600">{p2Answers.filter(a => a !== 'skipped').length} answers</p></div>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Share Again 💬</Button>
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
