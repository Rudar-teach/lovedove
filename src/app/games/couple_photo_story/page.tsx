'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Camera, MapPin } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const MILESTONES = [
  { year: "The First Meeting", emoji: "👋", desc: "When you first laid eyes on each other" },
  { year: "The First Date", emoji: "🌹", desc: "Your first official date together" },
  { year: "First 'I Love You'", emoji: "💕", desc: "When feelings became words" },
  { year: "First Trip Together", emoji: "✈️", desc: "Adventures as a couple" },
  { year: "Moving In", emoji: "🏠", desc: "Building a home together" },
  { year: "The Proposal", emoji: "💍", desc: "The big question popped" },
  { year: "The Wedding", emoji: "🎊", desc: "Saying 'I do' forever" },
  { year: "Future Dreams", emoji: "🌈", desc: "All the adventures ahead" },
];

const QUESTIONS = [
  "What was your first thought when you saw them?",
  "What were you wearing on the first date?",
  "What song was playing during your first dance?",
  "What was the most embarrassing moment?",
  "What made you fall in love?",
  "What's your favorite inside joke?",
  "Where did you have your first kiss?",
  "What's a food you both love?",
];

export default function CouplePhotoStory() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [phase, setPhase] = useState<'intro' | 'recall' | 'build' | 'finished'>('intro');
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [recalledStory, setRecalledStory] = useState<{ milestone: string; answer: string; note: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [customMilestone, setCustomMilestone] = useState('');

  const startGame = () => {
    setGameState('playing');
    setPhase('recall');
    setCurrentMilestone(0);
    setRecalledStory([]);
    setCurrentAnswer('');
  };

  const saveAnswer = () => {
    if (!currentAnswer.trim()) return;
    setRecalledStory(prev => [...prev, {
      milestone: MILESTONES[currentMilestone].year,
      answer: currentAnswer.trim(),
      note: ''
    }]);
    setCurrentAnswer('');
    if (currentMilestone < MILESTONES.length - 1) {
      setCurrentMilestone(c => c + 1);
    } else {
      setPhase('finished');
    }
  };

  const addCustomMilestone = () => {
    if (!customMilestone.trim()) return;
    setRecalledStory(prev => [...prev, {
      milestone: customMilestone.trim(),
      answer: '📸 Photo / memory',
      note: ''
    }]);
    setCustomMilestone('');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">📸</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Photo Story</h1>
              <p className="text-gray-600 mb-8 text-lg">Relive your journey together!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-amber-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📸 Walk through your milestones</li>
                  <li>💬 Recall your favorite moments</li>
                  <li>📅 Build your love timeline</li>
                  <li>💕 Relive the magic!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && phase === 'recall' && MILESTONES[currentMilestone] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Milestone {currentMilestone + 1}/{MILESTONES.length}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${((currentMilestone + 1) / MILESTONES.length) * 100}%` }} />
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6 sm:p-8 mb-6 text-center">
                <div className="text-5xl mb-4">{MILESTONES[currentMilestone].emoji}</div>
                <h2 className="text-2xl font-display font-black text-gray-900 mb-2">{MILESTONES[currentMilestone].year}</h2>
                <p className="text-gray-600 mb-4">{MILESTONES[currentMilestone].desc}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4">
                  <Camera className="w-3 h-3 inline mr-1" />
                  Recall this moment together
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">💬 Share your memory:</label>
                <textarea
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="What do you remember about this moment?"
                  rows={3}
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none resize-none mb-4"
                  autoFocus
                />
                <button onClick={saveAnswer} disabled={!currentAnswer.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50">
                  Save Memory
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && phase === 'finished' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Your Love Timeline</h2>
              <p className="text-gray-600 mb-8">A story of your journey together!</p>

              <div className="space-y-4 mb-8 text-left">
                {recalledStory.map((story, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-amber-100/60 p-5 flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">📸</div>
                    <div>
                      <p className="font-bold text-amber-700 text-sm">{story.milestone}</p>
                      <p className="text-gray-700 text-sm mt-1">{story.answer}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Create Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
