'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Users, Sparkles, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Scenario {
  id: number;
  title: string;
  emoji: string;
  situation: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  compatibilityMap: string[];
}

const SCENARIOS: Scenario[] = [
  { id: 1, title: 'The Dream Vacation', emoji: '🏝️', situation: 'You both win a free trip. Where do you go?', optionA: 'Tropical beach resort', optionB: 'Mountain cabin adventure', optionC: 'European city tour', optionD: 'Stay home and save money', compatibilityMap: ['A', 'B', 'A', 'C'] },
  { id: 2, title: 'Friday Night Plans', emoji: '🎬', situation: 'It is Friday evening. What do you do together?', optionA: 'Cozy movie night in', optionB: 'Dinner at a fancy restaurant', optionC: 'Hit the town with friends', optionD: 'Try a new activity together', compatibilityMap: ['A', 'B', 'A', 'C'] },
  { id: 3, title: 'Pet Preferences', emoji: '🐶', situation: 'You decide to adopt a pet. What kind?', optionA: 'Cute dog for walks', optionB: 'Independent cat', optionC: 'Colorful fish tank', optionD: 'No pets for us', compatibilityMap: ['A', 'B', 'A', 'C'] },
  { id: 4, title: 'Money Matters', emoji: '💰', situation: 'You receive a $5000 bonus. How do you use it?', optionA: 'Save it all for future', optionB: 'Splurge on a romantic trip', optionC: 'Invest in something meaningful', optionD: 'Buy each other gifts', compatibilityMap: ['A', 'B', 'C', 'B'] },
  { id: 5, title: 'Conflict Resolution', emoji: '🕊️', situation: 'You disagree about something important. How do you resolve it?', optionA: 'Calm discussion tonight', optionB: 'Take space, talk tomorrow', optionC: 'Compromise immediately', optionD: 'Let it go for harmony', compatibilityMap: ['A', 'B', 'A', 'C'] },
  { id: 6, title: 'Big Life Decision', emoji: '🏠', situation: 'You consider moving to a new city. How do you decide?', optionA: 'Research thoroughly first', optionB: 'Follow your heart', optionC: 'Ask family for advice', optionD: 'Stay where we are safe', compatibilityMap: ['A', 'B', 'A', 'C'] },
];

export default function LoveScenariosPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'compare' | 'finished'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [partner1, setPartner1] = useState<{ name: string; answers: string[] }>({ name: 'Partner 1', answers: [] });
  const [partner2, setPartner2] = useState<{ name: string; answers: string[] }>({ name: 'Partner 2', answers: [] });

  const startGame = () => {
    setCurrentIdx(0); setPartner1({ name: 'Partner 1', answers: [] }); setPartner2({ name: 'Partner 2', answers: [] }); setPhase('p1');
  };

  const handleAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
    if (phase === 'p1') {
      setPartner1({ ...partner1, answers: [...partner1.answers, option] });
      if (currentIdx + 1 >= SCENARIOS.length) {
        setCurrentIdx(0);
        setPhase('p2');
      } else {
        setCurrentIdx(currentIdx + 1);
      }
    } else if (phase === 'p2') {
      setPartner2({ ...partner2, answers: [...partner2.answers, option] });
      if (currentIdx + 1 >= SCENARIOS.length) {
        setPhase('compare');
      } else {
        setCurrentIdx(currentIdx + 1);
      }
    }
  };

  const compatibilityScore = partner1.answers.reduce((acc, a, i) => acc + (a === partner2.answers[i] ? 100 : 50), 0) / partner1.answers.length;

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
                <div className="flex items-center gap-2"><Users className="w-5 h-5 text-rose-500" /><span className="font-bold text-gray-700">Couple Scenarios</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💑</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Scenarios</h1>
              <p className="text-gray-600 mb-8 text-lg">Both partners answer separately, then compare your compatibility!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Both of you answer 6 scenarios independently</li>
                  <li>Pick the option that fits YOU best</li>
                  <li>Don&apos;t peek at each other&apos;s answers!</li>
                  <li>Reveal compatibility at the end</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {(phase === 'p1' || phase === 'p2') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`${phase}-${currentIdx}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">{currentIdx + 1}/{SCENARIOS.length}</span>
                <span className="text-sm font-bold text-rose-600">{phase === 'p1' ? partner1.name : partner2.name}</span>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{SCENARIOS[currentIdx].emoji}</div>
                  <h2 className="text-2xl font-display font-black text-gray-900 mb-2">{SCENARIOS[currentIdx].title}</h2>
                  <p className="text-gray-700">{SCENARIOS[currentIdx].situation}</p>
                </div>
                <p className="text-sm text-center text-rose-500 font-bold mb-3">Pass the device to {phase === 'p1' ? partner1.name : partner2.name}</p>

                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                    const text = letter === 'A' ? SCENARIOS[currentIdx].optionA : letter === 'B' ? SCENARIOS[currentIdx].optionB : letter === 'C' ? SCENARIOS[currentIdx].optionC : SCENARIOS[currentIdx].optionD;
                    return (
                      <button key={letter} onClick={() => handleAnswer(letter)} className="w-full p-4 rounded-xl text-left font-medium bg-white border-2 border-gray-200 hover:border-rose-400 hover:bg-rose-50 text-gray-700 transition">
                        <span className="font-black mr-2">{letter}.</span>{text}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === 'compare' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">💞</div>
                <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Compatibility Reveal!</h2>
                <p className="text-5xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-4">{Math.round(compatibilityScore)}%</p>
                <p className="text-gray-600">You two match in choices</p>
              </div>

              <div className="space-y-3">
                {SCENARIOS.map((s, i) => {
                  const match = partner1.answers[i] === partner2.answers[i];
                  return (
                    <div key={s.id} className={`bg-white/70 backdrop-blur-xl rounded-2xl p-4 border-2 ${match ? 'border-green-200' : 'border-orange-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{s.emoji} {s.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{partner1.name}: <span className="font-bold text-rose-600">{partner1.answers[i]}</span> | {partner2.name}: <span className="font-bold text-blue-600">{partner2.answers[i]}</span></div>
                        </div>
                        <div className={`text-2xl ${match ? 'text-green-500' : 'text-orange-500'}`}>{match ? '💚' : '💛'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center mt-6">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}