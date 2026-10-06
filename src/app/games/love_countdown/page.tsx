'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function LoveCountdownPage() {
  const [phase, setPhase] = useState<'setup' | 'running' | 'finished'>('setup');
  const [title, setTitle] = useState('Our Anniversary');
  const [targetDate, setTargetDate] = useState('');
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [milestones, setMilestones] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const startCountdown = () => {
    if (!targetDate) return;
    setPhase('running');
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const tick = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining({ days: d, hours: h, minutes: m, seconds: s });

      if (d === 0 && h === 0 && m === 0 && s === 0) {
        setPhase('finished');
      }

      if (d === 7 && !milestones.includes('1 week')) setMilestones(m => [...m, '1 week']);
      if (d === 1 && !milestones.includes('1 day')) setMilestones(m => [...m, '1 day']);
      if (d === 0 && h === 1 && !milestones.includes('1 hour')) setMilestones(m => [...m, '1 hour']);
    };
    tick();
    timerRef.current = window.setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, targetDate, milestones]);

  const presetDates = () => {
    const now = new Date();
    const options = [
      { label: '1 Month', date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString() },
      { label: '1 Year', date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString() },
      { label: '100 Days', date: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString() },
      { label: 'Valentine\'s Day', date: new Date(now.getFullYear(), 1, 14).toISOString() },
    ];
    return options;
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Heart className="w-5 h-5 text-rose-500" /> Love Countdown</h1>
            <div className="w-16" />
          </div>

          {phase === 'setup' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⏳</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Love Countdown</h2>
                  <p className="text-gray-600">Count down to your special moment together!</p>

                  <div className="space-y-3">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title (e.g., Our Anniversary)"
                      className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-primary-400 outline-none text-center font-bold" />
                    <input type="datetime-local" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-primary-400 outline-none text-center" />
                  </div>

                  <p className="text-sm text-gray-500">Quick picks:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {presetDates().map(p => (
                      <button key={p.label} onClick={() => setTargetDate(p.date)} className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-sm font-medium text-pink-700 transition-colors">
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <Button onClick={startCountdown} variant="primary" size="lg" className="w-full" disabled={!targetDate}>Start Countdown ⏳</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'running' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-800">{title}</h2>
              </div>

              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { val: remaining.days, label: 'Days' },
                      { val: remaining.hours, label: 'Hours' },
                      { val: remaining.minutes, label: 'Mins' },
                      { val: remaining.seconds, label: 'Secs' },
                    ].map(u => (
                      <div key={u.label} className="text-center">
                        <div className="text-3xl md:text-4xl font-black text-primary-600">{String(u.val).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-500">{u.label}</div>
                      </div>
                    ))}
                  </div>

                  {milestones.length > 0 && (
                    <div className="bg-pink-50 rounded-xl p-3">
                      <p className="text-sm font-bold text-pink-600 mb-1">Milestones:</p>
                      {milestones.map((m, i) => <p key={i} className="text-sm text-gray-700">🎉 {m} remaining!</p>)}
                    </div>
                  )}
                </div>
              </TiltCard>

              <div className="text-center mt-4">
                <Button onClick={() => { setPhase('setup'); if (timerRef.current) clearInterval(timerRef.current); }} variant="outline">Change Event</Button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl animate-bounce">🎉</div>
                  <h2 className="text-3xl font-display font-black text-gray-800">It's {title}!</h2>
                  <p className="text-xl text-primary-600 font-bold">The moment has arrived! Enjoy! 💕</p>
                  <Button onClick={() => setPhase('setup')} variant="primary" size="lg">New Countdown ⏳</Button>
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
