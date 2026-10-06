'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type Milestone = '1 month' | '6 months' | '1 year' | '2 years' | '5 years' | '10 years';

const PLAN_SECTIONS = [
  {
    id: 'activities',
    title: 'Activity Ideas',
    icon: '🎯',
    items: [
      "Romantic candlelit dinner at home",
      "Visit your first date location",
      "Take a dance class together",
      "Plan a weekend getaway",
      "Watch your wedding video",
      "Create a photo album together",
      "Go on a hike/nature walk",
      "Cook a meal together",
    ]
  },
  {
    id: 'gifts',
    title: 'Gift Ideas',
    icon: '🎁',
    items: [
      "Personalized photo frame",
      "Custom star map of your first date",
      "Handwritten love letter",
      "Matching jewelry",
      "A scrapbook of memories",
      "Experience gift (concert/tickets)",
      "Custom illustration of you both",
      "A planted tree together",
    ]
  },
  {
    id: 'decorations',
    title: 'Decoration Ideas',
    icon: '🎊',
    items: [
      "Photo timeline/wall",
      "String lights everywhere",
      "Balloon arch",
      "Rose petals path",
      "Custom banner with your names",
      "Memory jar display",
      "Love notes wall",
      "Fairy light canopy",
    ]
  },
];

export default function AnniversaryPlanner() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [selectedDecor, setSelectedDecor] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(0);

  const milestones: Milestone[] = ['1 month', '6 months', '1 year', '2 years', '5 years', '10 years'];

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const startGame = () => {
    setGameState('playing');
    setSelectedMilestone(null);
    setSelectedActivities([]);
    setSelectedGifts([]);
    setSelectedDecor([]);
    setNotes('');
    setStep(0);
  };

  const canProceed = () => {
    if (step === 0) return selectedMilestone !== null;
    if (step === 1) return selectedActivities.length > 0;
    if (step === 2) return selectedGifts.length > 0;
    return true;
  };

  const isFinished = step === PLAN_SECTIONS.length;

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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">🎂</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Anniversary Planner</h1>
              <p className="text-gray-600 mb-8 text-lg">Plan the perfect anniversary!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-red-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🎂 Pick your milestone</li>
                  <li>🎯 Choose activities</li>
                  <li>🎁 Pick gift ideas</li>
                  <li>🎊 Select decorations</li>
                  <li>📝 Add your personal notes!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start Planning
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && !isFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">
                  {step === 0 ? 'Step 1' : step === 1 ? 'Step 2' : 'Step 3'} of 3
                </span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                  style={{ width: `${((step + 1) / PLAN_SECTIONS.length) * 100}%` }} />
              </div>

              {step === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-2xl font-display font-black text-gray-900 mb-2 text-center">Choose Your Milestone</h2>
                  <p className="text-gray-600 text-center mb-6">What anniversary are you planning for?</p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {milestones.map(m => (
                      <button key={m} onClick={() => setSelectedMilestone(m)}
                        className={`p-4 rounded-2xl font-bold text-sm transition-all ${selectedMilestone === m ? 'bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg' : 'bg-white/70 border-2 border-gray-200 text-gray-700 hover:border-red-400'}`}>
                        <Calendar className="w-5 h-5 mx-auto mb-1" />
                        {m}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step >= 1 && PLAN_SECTIONS[step - 1] && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-4">
                    <span className="text-4xl">{PLAN_SECTIONS[step - 1].icon}</span>
                    <h2 className="text-2xl font-display font-black text-gray-900">{PLAN_SECTIONS[step - 1].title}</h2>
                    <p className="text-gray-600 text-sm">Select at least one item</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {PLAN_SECTIONS[step - 1].items.map(item => {
                      const isSelected = step === 1 ? selectedActivities.includes(item) : selectedGifts.includes(item);
                      return (
                        <button key={item} onClick={() => toggleItem(item, step === 1 ? selectedActivities : selectedGifts, step === 1 ? setSelectedActivities : setSelectedGifts)}
                          className={`p-4 rounded-2xl text-sm font-medium text-left transition-all ${isSelected ? 'bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg' : 'bg-white/70 border-2 border-gray-200 text-gray-700 hover:border-red-400'}`}>
                          {isSelected && <Sparkles className="w-4 h-4 inline mr-2" />}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === PLAN_SECTIONS.length && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-2xl font-display font-black text-gray-900 mb-4 text-center">Add Personal Notes</h2>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any extra plans, messages, or ideas..."
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white outline-none focus:border-red-500 resize-none mb-4"
                  />
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600">
                    Back
                  </button>
                )}
                {!isFinished && (
                  <button onClick={() => { if (canProceed()) setStep(s => s + 1); }}
                    disabled={!canProceed()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl disabled:opacity-50">
                    {step === PLAN_SECTIONS.length ? 'Finish' : 'Next'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && isFinished && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-4">🎂</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-1">Your Anniversary Plan</h2>
              <p className="text-xl font-bold text-red-600 mb-6">{selectedMilestone} Anniversary</p>

              <div className="space-y-4 mb-8 text-left">
                {selectedActivities.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-red-100/60 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">🎯 Activities</h3>
                    {selectedActivities.map(a => (
                      <p key={a} className="text-sm text-gray-700 ml-2">• {a}</p>
                    ))}
                  </div>
                )}
                {selectedGifts.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-red-100/60 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">🎁 Gifts</h3>
                    {selectedGifts.map(g => (
                      <p key={g} className="text-sm text-gray-700 ml-2">• {g}</p>
                    ))}
                  </div>
                )}
                {notes && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-red-100/60 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">📝 Notes</h3>
                    <p className="text-sm text-gray-700">{notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Plan Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl text-white font-bold shadow-lg">
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
