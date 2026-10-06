'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Star, Calendar, TrendingUp, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const ZODIAC = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21–Apr 19', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20–May 20', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21–Jun 20', element: 'Air' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21–Jul 22', element: 'Water' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23–Aug 22', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23–Sep 22', element: 'Earth' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23–Oct 22', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23–Nov 21', element: 'Water' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22–Dec 21', element: 'Fire' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22–Jan 19', element: 'Earth' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20–Feb 18', element: 'Air' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19–Mar 20', element: 'Water' },
];

const ELEMENT_COMPAT: Record<string, string[]> = {
  'Fire': ['Fire', 'Air'], 'Earth': ['Earth', 'Water'], 'Air': ['Air', 'Fire'], 'Water': ['Water', 'Earth'],
};

const WEEKLY_FORECASTS: Record<string, { title: string; desc: string; advice: string; mood: string }> = {
  'Aries': { title: 'Ignite the Passion', desc: 'Your fiery energy is magnetic this week. Take the lead in romance.', advice: 'Plan an exciting date night', mood: '🔥🔥🔥' },
  'Taurus': { title: 'Ground Your Love', desc: 'Stability creates deep bonds. Show up consistently for your partner.', advice: 'Cook a meal together', mood: '🌿🌿🌿' },
  'Gemini': { title: 'Connect Through Words', desc: 'Your words carry extra magic. Share your feelings openly.', advice: 'Write love notes this week', mood: '💬💬💬' },
  'Cancer': { title: 'Open Your Heart', desc: 'Emotional connection is your superpower. Be vulnerable.', advice: 'Share a childhood memory', mood: '🌙🌙🌙' },
  'Leo': { title: 'Shine Together', desc: 'Grand romantic gestures are favored. Make them feel special.', advice: 'Plan something spectacular', mood: '👑👑👑' },
  'Virgo': { title: 'Love in Details', desc: 'Pay attention to the small things — they matter most.', advice: 'Help with something stressful', mood: '💝💝💝' },
  'Libra': { title: 'Create Beauty', desc: 'Romance blooms in harmony. Create beautiful moments together.', advice: 'Have a candlelit evening', mood: '🎨🎨🎨' },
  'Scorpio': { title: 'Deep Dive', desc: 'A powerful emotional connection moment is coming.', advice: 'Have an honest deep talk', mood: '⚡⚡⚡' },
  'Sagittarius': { title: 'Adventure Awaits', desc: 'Try something new together to spark excitement.', advice: 'Plan a spontaneous trip', mood: '🌄🌄🌄' },
  'Capricorn': { title: 'Build Your Future', desc: 'Long-term plans feel natural. Dream together.', advice: 'Discuss your 3-year plan', mood: '🏔🏔🏔' },
  'Aquarius': { title: 'Unique Connection', desc: 'Do something unconventional together. Be your quirky selves.', advice: 'Try a weird new activity', mood: '✨✨✨' },
  'Pisces': { title: 'Dreamy Romance', desc: 'Magical moments are everywhere. Stay present and feel.', advice: 'Create a new ritual together', mood: '💫💫💫' },
};

const DAILY_TIPS = [
  "Give your partner an unexpected compliment today.",
  "Send them a text mid-day saying you're thinking of them.",
  "Hold hands while walking, even if you've done it a thousand times.",
  "Ask about their day and really listen.",
  "Plan a small surprise for this weekend.",
  "Express gratitude for something specific they did.",
  "Touch their arm when you talk to show you care.",
  "Share something that made you smile recently.",
];

type Tab = 'forecast' | 'compatibility' | 'tip';

export default function LoveHoroscopeEnhanced() {
  const [mySign, setMySign] = useState(ZODIAC[0]);
  const [partnerSign, setPartnerSign] = useState(ZODIAC[0]);
  const [tab, setTab] = useState<Tab>('forecast');
  const [showSignPicker, setShowSignPicker] = useState(false);
  const [tip, setTip] = useState(DAILY_TIPS[0]);

  const myForecast = WEEKLY_FORECASTS[mySign.name];
  const compMatches = ELEMENT_COMPAT[mySign.element];

  const getCompatibility = () => {
    const partner = partnerSign.name;
    const sameSign = mySign.name === partner ? 95 :
      myForecast.title.includes(partner) ? 90 :
      compMatches.includes(partnerSign.element) ? 85 :
      mySign.element === partnerSign.element ? 80 : 60;
    const names = [`${mySign.symbol}${mySign.name}`, `${partnerSign.symbol}${partnerSign.name}`];
    return { score: sameSign, names };
  };

  const refreshTip = () => setTip(DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)]);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Star className="w-5 h-5 text-pink-500" /> Love Horoscope
            </h1>
            <button onClick={() => { setTab('forecast'); setShowSignPicker(false); }} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-5 text-gray-600" />
            </button>
          </div>

          <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4 mb-6">
              <div className="flex items-center justify-between">
                <button onClick={() => { setShowSignPicker(!showSignPicker); }} className="text-center flex-1">
                  <span className="text-3xl block">{mySign.symbol}</span>
                  <span className="text-sm font-bold text-gray-700">{mySign.name}</span>
                </button>
                <div className="text-3xl">💑</div>
                <button onClick={() => setShowSignPicker(!showSignPicker)} className="text-center flex-1">
                  <span className="text-3xl block">{partnerSign.symbol}</span>
                  <span className="text-sm font-bold text-gray-700">{partnerSign.name}</span>
                </button>
              </div>
            </div>
          </TiltCard>

          {showSignPicker && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
              <div className="grid grid-cols-6 gap-2 p-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60 shadow-lg">
                {ZODIAC.map(z => (
                  <button key={z.name} onClick={() => { setMySign(z); setShowSignPicker(false); }}
                    className="p-2 rounded-xl hover:bg-pink-50 text-center transition-all">
                    <span className="text-xl block">{z.symbol}</span>
                    <span className="text-[10px] text-gray-600">{z.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-2 mb-4">
            {(['forecast', 'compatibility', 'tip'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  tab === t ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                {t === 'forecast' ? '📅 Weekly' : t === 'compatibility' ? '💑 Match' : '💡 Tips'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'forecast' && (
              <motion.div key="forecast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className={`bg-gradient-to-br from-pink-400 to-rose-500 rounded-[2rem] shadow-2xl p-8 text-white text-center space-y-3`}>
                    <span className="text-5xl">{mySign.symbol}</span>
                    <h2 className="text-2xl font-bold">{myForecast.title}</h2>
                    <p className="text-white/90">{myForecast.desc}</p>
                    <div className="text-4xl">{myForecast.mood}</div>
                  </div>
                </TiltCard>
                <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.05)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mt-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-pink-500" /> Weekly Advice</h3>
                    <p className="text-gray-700">{myForecast.advice}</p>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {tab === 'compatibility' && (
              <motion.div key="compat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <div><span className="text-4xl block">{mySign.symbol}</span><span className="text-sm font-bold">{mySign.name}</span></div>
                      <span className="text-4xl">💑</span>
                      <div><span className="text-4xl block">{partnerSign.symbol}</span><span className="text-sm font-bold">{partnerSign.name}</span></div>
                    </div>
                    <div className="text-5xl font-black text-rose-500">{getCompatibility().score}%</div>
                    <p className="text-gray-700">{getCompatibility().score >= 80 ? 'Cosmic match!' : getCompatibility().score >= 65 ? 'Strong connection potential' : 'Opposites can be exciting!'}</p>
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-gray-600 mb-2">Best element matches:</h4>
                      <div className="flex gap-2">
                        {compMatches.map(e => (
                          <span key={e} className="px-3 py-1 bg-pink-50 rounded-full text-xs font-medium text-pink-700">{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {tab === 'tip' && (
              <motion.div key="tip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-4xl">💡</div>
                    <p className="text-lg font-bold text-gray-800 leading-relaxed">{tip}</p>
                    <Button onClick={refreshTip} variant="outline" size="sm">New Tip</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
