'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Brain, Sparkles, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Scenario {
  id: number;
  title: string;
  situation: string;
  emoji: string;
  options: { text: string; score: number; type: 'romantic' | 'practical' | 'adventurous' | 'caring'; }[];
}

const SCENARIOS: Scenario[] = [
  { id: 1, title: 'The Anniversary Surprise', emoji: '🎁', situation: 'Your anniversary is tomorrow but your partner forgot. How do you react?', options: [
    { text: 'Plan a romantic surprise to gently remind them', score: 30, type: 'caring' },
    { text: 'Be upset and express your feelings directly', score: 20, type: 'practical' },
    { text: 'Pretend it does not bother you at all', score: 10, type: 'practical' },
    { text: 'Throw a surprise party for THEM instead', score: 30, type: 'romantic' },
  ]},
  { id: 2, title: 'Long Distance Calling', emoji: '📞', situation: 'You have a free weekend but your partner is across the country. What do you do?', options: [
    { text: 'Book a surprise visit with flowers', score: 30, type: 'romantic' },
    { text: 'Plan a virtual movie date night', score: 20, type: 'caring' },
    { text: 'Use the time to focus on yourself', score: 15, type: 'practical' },
    { text: 'Send a care package with love notes', score: 25, type: 'romantic' },
  ]},
  { id: 3, title: 'The Big Argument', emoji: '💔', situation: 'You have just had your first serious fight. What is your next move?', options: [
    { text: 'Take space and cool off before talking', score: 20, type: 'practical' },
    { text: 'Apologize immediately even if not at fault', score: 15, type: 'caring' },
    { text: 'Write a heartfelt letter explaining feelings', score: 30, type: 'romantic' },
    { text: 'Plan a special date to reconnect', score: 25, type: 'caring' },
  ]},
  { id: 4, title: 'Meeting The Parents', emoji: '👨‍👩‍👧', situation: 'Your partner asks you to meet their family for the first time. How do you prepare?', options: [
    { text: 'Research their interests and bring gifts', score: 30, type: 'caring' },
    { text: 'Just show up and be yourself', score: 20, type: 'practical' },
    { text: 'Cook a special meal to impress them', score: 25, type: 'romantic' },
    { text: 'Plan an adventure to escape after an hour', score: 10, type: 'adventurous' },
  ]},
  { id: 5, title: 'Career Relocation', emoji: '✈️', situation: 'Your partner gets a dream job offer in another city. How do you handle it?', options: [
    { text: 'Support them and find ways to make it work', score: 30, type: 'caring' },
    { text: 'Insist they turn it down for the relationship', score: 10, type: 'practical' },
    { text: 'Suggest trying it out with a long-distance plan', score: 25, type: 'romantic' },
    { text: 'Quit everything and move with them', score: 30, type: 'romantic' },
  ]},
  { id: 6, title: 'The Unexpected Gift', emoji: '💐', situation: 'Your partner surprises you with an expensive gift you do not love. What do you do?', options: [
    { text: 'Express honest appreciation for the thought', score: 25, type: 'caring' },
    { text: 'Pretend you love it completely', score: 15, type: 'practical' },
    { text: 'Politely mention preferences for future gifts', score: 30, type: 'practical' },
    { text: 'Make a big romantic gesture in return', score: 25, type: 'romantic' },
  ]},
  { id: 7, title: 'Friend Jealousy', emoji: '👫', situation: 'You feel jealous when your partner spends time with a close friend. How do you handle it?', options: [
    { text: 'Express your feelings honestly', score: 30, type: 'caring' },
    { text: 'Demand they stop seeing the friend', score: 10, type: 'practical' },
    { text: 'Work on building your own friendships', score: 25, type: 'practical' },
    { text: 'Suggest a double date to feel included', score: 30, type: 'romantic' },
  ]},
  { id: 8, title: 'The Big Decision', emoji: '💍', situation: 'You are thinking about proposing. How do you know the time is right?', options: [
    { text: 'When you cannot imagine life without them', score: 30, type: 'romantic' },
    { text: 'When you have stable finances', score: 25, type: 'practical' },
    { text: 'When you have discussed the future openly', score: 30, type: 'caring' },
    { text: 'When the timing feels right in your gut', score: 25, type: 'adventurous' },
  ]},
];

const PERSONALITIES: Record<string, { title: string; emoji: string; desc: string }> = {
  romantic: { title: 'The Hopeless Romantic', emoji: '💕', desc: 'You lead with love and grand gestures. Your partner feels cherished.' },
  practical: { title: 'The Practical Partner', emoji: '🎯', desc: 'You balance emotion with logic. You build stable, lasting relationships.' },
  caring: { title: 'The Caring Soul', emoji: '💝', desc: 'You prioritize your partners needs above all. You are deeply empathetic.' },
  adventurous: { title: 'The Bold Adventurer', emoji: '🚀', desc: 'You bring excitement and spontaneity. Life with you is never boring.' },
};

export default function LoveScenarioPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ scenario: number; chosen: number; score: number; type: string }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startGame = () => {
    setCurrentIdx(0); setAnswers([]); setSelected(null); setShowFeedback(false); setPhase('playing');
  };

  const handleChoice = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setTimeout(() => {
      const opt = SCENARIOS[currentIdx].options[idx];
      setAnswers([...answers, { scenario: currentIdx, chosen: idx, score: opt.score, type: opt.type }]);
      if (currentIdx + 1 >= SCENARIOS.length) {
        setPhase('finished');
      } else {
        setCurrentIdx(currentIdx + 1);
        setSelected(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const personalityCounts: Record<string, number> = { romantic: 0, practical: 0, caring: 0, adventurous: 0 };
  answers.forEach(a => personalityCounts[a.type]++);
  const personality = Object.entries(personalityCounts).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2"><Brain className="w-5 h-5 text-pink-500" /><span className="font-bold text-gray-700">Love Scenarios</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💑</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Scenarios</h1>
              <p className="text-gray-600 mb-8 text-lg">8 relationship scenarios, your choices reveal your love style!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Read each scenario carefully</li>
                  <li>Choose your best response</li>
                  <li>Higher scores show emotional intelligence</li>
                  <li>Discover your relationship personality!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Begin</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={currentIdx}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Question {currentIdx + 1}/{SCENARIOS.length}</span>
                <span className="text-sm font-bold text-pink-600">Score: {answers.reduce((s, a) => s + a.score, 0)}</span>
              </div>

              <motion.div key={currentIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-4">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{SCENARIOS[currentIdx].emoji}</div>
                  <h2 className="text-2xl font-display font-black text-gray-900 mb-2">{SCENARIOS[currentIdx].title}</h2>
                  <p className="text-gray-700">{SCENARIOS[currentIdx].situation}</p>
                </div>

                <div className="space-y-3">
                  {SCENARIOS[currentIdx].options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    const isCorrect = isSelected && opt.score >= 25;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleChoice(idx)}
                        disabled={showFeedback}
                        className={`w-full p-4 rounded-xl text-left font-medium transition border-2 ${isSelected ? (isCorrect ? 'bg-green-100 border-green-400 text-green-800' : 'bg-orange-100 border-orange-300 text-orange-800') : 'bg-white border-gray-200 hover:border-pink-300 text-gray-700'}`}
                      >
                        <span className="font-black mr-2">{String.fromCharCode(65 + idx)}.</span>{opt.text}
                        {showFeedback && isSelected && (
                          <span className="float-right font-bold">+{opt.score} pts</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">{totalScore} pts</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                <div className="text-6xl mb-3">{PERSONALITIES[personality].emoji}</div>
                <h3 className="text-2xl font-display font-black gradient-text mb-2">{PERSONALITIES[personality].title}</h3>
                <p className="text-gray-700">{PERSONALITIES[personality].desc}</p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  {Object.entries(personalityCounts).map(([k, v]) => (
                    <div key={k} className="bg-pink-50 rounded-lg p-2">
                      <div className="text-2xl mb-1">{PERSONALITIES[k].emoji}</div>
                      <div className="font-bold">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Retake</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}