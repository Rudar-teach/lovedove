'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SUGGESTED = [
  "Have a date night every week", "Put phones away during dinner", "Express appreciation daily",
  "Travel to a new place together", "Try couples therapy or coaching", "Establish a weekly check-in",
  "Take a long walk together every Sunday", "Surprise each other monthly", "Read together once a week",
  "Plan a big trip together this year", "Create a shared savings goal", "Learn something new together",
  "Practice forgiveness quickly", "Compliment each other daily", "Be each other's biggest fan",
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHECKIN_PROMPTS = [
  "How are we feeling about our resolutions?",
  "What's working well this month?",
  "What needs adjustment?",
  "Any new resolutions to add?",
  "What's one thing you want more of next month?",
];

type Phase = 'start' | 'add' | 'list' | 'checkin';

export default function LoveResolutionsPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [resolutions, setResolutions] = useState<{ text: string; monthChecks: boolean[]; created: string }[]>([]);
  const [newRes, setNewRes] = useState('');
  const [checkinMonth, setCheckinMonth] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('love-resolutions');
    if (saved) { try { setResolutions(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (resolutions.length > 0) localStorage.setItem('love-resolutions', JSON.stringify(resolutions));
  }, [resolutions]);

  const add = () => {
    if (!newRes.trim()) return;
    setResolutions(r => [...r, { text: newRes, monthChecks: Array(12).fill(false), created: new Date().toLocaleDateString() }]);
    setNewRes('');
  };

  const toggleCheck = (idx: number, month: number) => {
    setResolutions(r => r.map((res, i) => i === idx ? { ...res, monthChecks: res.monthChecks.map((c, m) => m === month ? !c : c) } : res));
  };

  const remove = (idx: number) => setResolutions(r => r.filter((_, i) => i !== idx));

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Star className="w-5 h-5 text-rose-500" /> Resolutions
            </h1>
            <button onClick={() => setPhase('start')} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🎊</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple's Resolutions</h2>
                    <p className="text-gray-600">Set goals for the year, then check in every month together.</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <Button onClick={() => setPhase('add')} variant="primary" className="w-full">Add New</Button>
                      <Button onClick={() => setPhase('list')} variant="outline" className="w-full">View All ({resolutions.length})</Button>
                    </div>
                    <Button onClick={() => setPhase('checkin')} variant="outline" className="w-full">Monthly Check-in 📅</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'add' && (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.05)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-3">
                    <h3 className="font-bold text-gray-800">Create a Resolution</h3>
                    <textarea value={newRes} onChange={e => setNewRes(e.target.value)} placeholder="What's your resolution?"
                      rows={3} className="w-full p-3 rounded-2xl border-2 border-gray-200 focus:border-pink-400 outline-none resize-none text-sm" />
                    <Button onClick={add} variant="primary" className="w-full">Add ✨</Button>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Or pick a suggestion:</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {SUGGESTED.map((s, i) => (
                          <button key={i} onClick={() => setNewRes(s)} className="w-full text-left text-xs p-2 rounded-lg hover:bg-pink-50 text-gray-600">
                            💡 {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
                <Button onClick={() => setPhase('start')} variant="outline" className="w-full mt-4">Back</Button>
              </motion.div>
            )}

            {phase === 'list' && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-2">
                  {resolutions.map((r, i) => (
                    <div key={i} className="p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60">
                      <div className="flex items-start gap-2 mb-2">
                        <p className="flex-1 text-sm font-medium text-gray-800">{r.text}</p>
                        <button onClick={() => remove(i)} className="text-red-300 text-xs">×</button>
                      </div>
                      <div className="flex gap-1">
                        {MONTHS.map((m, mi) => (
                          <button key={m} onClick={() => toggleCheck(i, mi)}
                            className={`w-6 h-6 rounded-md text-[9px] font-bold ${
                              r.monthChecks[mi] ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setPhase('start')} variant="primary" className="w-full mt-4">Back</Button>
              </motion.div>
            )}

            {phase === 'checkin' && (
              <motion.div key="checkin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 text-center">📅 Monthly Check-in</h3>
                    <select value={checkinMonth} onChange={e => setCheckinMonth(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm">
                      {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase">Discussion Prompts</p>
                      {CHECKIN_PROMPTS.map((p, i) => (
                        <div key={i} className="p-2 bg-pink-50 rounded-xl text-sm text-gray-700">💭 {p}</div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
                <Button onClick={() => setPhase('start')} variant="outline" className="w-full mt-4">Back</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
