'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SCENARIOS = [
  { title: "Our First Date", scenario: "You're on your first date. Where do you take them?", answers: ["A fancy restaurant", "A cozy coffee shop", "A sunset picnic", "An adventure activity"] },
  { title: "Moving In Together", scenario: "You're about to move in together. What's the first thing you do?", answers: ["Argue about furniture", "Paint the walls together", "Have a housewarming party", "Set up the bedroom first"] },
  { title: "Sunday Morning", scenario: "It's a lazy Sunday morning. What do you do together?", answers: ["Cook breakfast in bed", "Go for a morning walk", "Watch movies all day", "Plan the week ahead"] },
  { title: "Unexpected Surprise", scenario: "Your partner surprises you with a spontaneous gift. What is it?", answers: ["A handwritten letter", "A weekend getaway", "Your favorite flowers", "A surprise date night"] },
  { title: "Future Home", scenario: "You're designing your dream home. What's the must-have feature?", answers: ["A giant walk-in closet", "A cozy fireplace", "A home theater", "A beautiful garden"] },
  { title: "Adventure Time", scenario: "You have a free week together. What do you do?", answers: ["Road trip across the country", "Beach vacation", "Staycation with luxury", "Visit both families"] },
  { title: "Anniversary Gift", scenario: "What's the perfect anniversary gift from your partner?", answers: ["Something handmade", "Something expensive", "An experience together", "A heartfelt letter"] },
  { title: "Rainy Day", scenario: "It's pouring rain. What do you do indoors?", answers: ["Board games and hot cocoa", "Movie marathon", "Cook a fancy meal", "Dance in the living room"] },
  { title: "Big Decision", scenario: "You need to make a big life decision together. How do you approach it?", answers: ["List pros and cons", "Trust your gut", "Ask friends for advice", "Sleep on it"] },
  { title: "Sweet Gesture", scenario: "What's the sweetest thing your partner could do for you?", answers: ["Leave surprise notes", "Plan a surprise date", "Do my chores", "Give me a massage"] },
];

export default function FutureTogetherPage() {
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'result'>('start');
  const [scenarios, setScenarios] = useState<typeof SCENARIOS>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [p1Answers, setP1Answers] = useState<number[]>([]);
  const [p2Answers, setP2Answers] = useState<number[]>([]);
  const [p1Turn, setP1Turn] = useState(true);
  const [score, setScore] = useState(0);

  const startGame = () => {
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 6);
    setScenarios(shuffled);
    setCurrentIdx(0);
    setP1Answers([]);
    setP2Answers([]);
    setP1Turn(true);
    setScore(0);
    setPhase('p1');
  };

  const handleAnswer = (idx: number) => {
    if (p1Turn) {
      setP1Answers(a => [...a, idx]);
      setP1Turn(false);
    } else {
      setP2Answers(a => [...a, idx]);
      if (currentIdx + 1 < scenarios.length) {
        setCurrentIdx(i => i + 1);
        setP1Turn(true);
      } else {
        setPhase('result');
      }
    }
  };

  const calculate = () => {
    let matches = 0;
    for (let i = 0; i < p1Answers.length; i++) {
      if (p1Answers[i] === p2Answers[i]) matches++;
    }
    setScore(Math.round((matches / p1Answers.length) * 100));
  };

  useEffect(() => {
    if (phase === 'result') calculate();
  }, [phase]);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Calendar className="w-5 h-5 text-primary-500" /> Future Together</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🔮</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Future Together</h2>
                  <p className="text-gray-600">How well do you see the same future? Answer 6 life scenarios!</p>
                  <p className="text-sm text-pink-500 font-medium">Both players answer, then compare visions!</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">See the Future 🔮</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {(phase === 'p1' || phase === 'p2') && scenarios[currentIdx] && (
            <motion.div initial={{ opacity: 0, x: p1Turn ? 40 : -40 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">{p1Turn ? '💙 Player 1' : '💗 Player 2'} answers</span>
                <span className="text-sm text-gray-500">Q {currentIdx + 1}/{scenarios.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / scenarios.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-sm font-bold text-primary-600 mb-2">{scenarios[currentIdx].title}</p>
                  <p className="text-lg font-bold text-gray-800 mb-6 text-center">{scenarios[currentIdx].scenario}</p>
                  <div className="space-y-3">
                    {scenarios[currentIdx].answers.map((ans, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(i)}
                        className="w-full p-4 rounded-2xl text-left font-semibold bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-100 hover:border-primary-300 hover:from-pink-100 hover:to-rose-100 transition-all text-gray-700">
                        {String.fromCharCode(65 + i)}. {ans}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">{score >= 80 ? '🔮' : score >= 50 ? '💫' : '🌈'}</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Future Vision Match!</h2>
                  <div className="text-5xl font-black gradient-text">{score}%</div>
                  <p className="text-lg font-semibold text-primary-600">
                    {score >= 80 ? 'Perfect vision! You see the same future!' : score >= 50 ? 'Good alignment! Great conversations ahead!' : 'Different visions - that\'s what makes life interesting!'}
                  </p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Future Again 🔮</Button>
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
