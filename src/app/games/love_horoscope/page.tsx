'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const HOROSCOPES: Record<string, { emoji: string; title: string; text: string; lucky: string }> = {
  Aries: { emoji: '🐏', title: 'The Bold Lover', text: 'Your passionate energy attracts admirers! This week, surprise your partner with an adventurous date. Your bold gestures will create unforgettable memories.', lucky: 'Red roses' },
  Taurus: { emoji: '🐂', title: 'The Devoted Heart', text: 'Your steady love is a safe harbor for your partner. Plan a cozy evening with good food and warm company. Romance blooms in comfort.', lucky: 'Chocolate' },
  Gemini: { emoji: '👯', title: 'The Playful Soul', text: 'Your wit and charm make every moment fun! Surprise your partner with a playful text or a silly joke. Laughter is the best aphrodisiac.', lucky: 'A funny movie' },
  Cancer: { emoji: '🦀', title: 'The Nurturing Love', text: 'Your caring nature makes your partner feel cherished. Create a special evening with their favorite comfort foods and heartfelt conversations.', lucky: 'A handwritten note' },
  Leo: { emoji: '🦁', title: 'The Grand Romantic', text: 'Your love knows no bounds! Plan something spectacular this week. Your partner will be swept off their feet by your generosity and warmth.', lucky: 'Sunset view' },
  Virgo: { emoji: '👩', title: 'The Thoughtful Partner', text: 'Your attention to detail shows how much you care. Plan a surprise that shows you notice the little things. Small gestures have big impact.', lucky: 'Fresh flowers' },
  Libra: { emoji: '⚖️', title: 'The Harmonious Lover', text: 'Balance and beauty define your love. Create a romantic atmosphere with candles and music. Your partner loves your refined taste.', lucky: 'A sunset walk' },
  Scorpio: { emoji: '🦂', title: 'The Deep Connector', text: 'Your intensity creates powerful bonds. Have a deep, meaningful conversation with your partner. Vulnerability brings you closer together.', lucky: 'Dark chocolate' },
  Sagittarius: { emoji: '🏹', title: 'The Adventurous Heart', text: 'Your free spirit inspires your partner! Plan a spontaneous adventure. The journey together creates the best memories.', lucky: 'A road trip' },
  Capricorn: { emoji: '🐐', title: 'The Loyal Guardian', text: 'Your commitment is rock solid. Show your partner you value them by planning a future-oriented date. Your love story is built to last.', lucky: 'A cozy sweater' },
  Aquarius: { emoji: '🏺', title: 'The Unique Soulmate', text: 'Your originality makes love exciting! Try something completely new together. Your partner loves your creative spirit.', lucky: 'An underrated song' },
  Pisces: { emoji: '🐟', title: 'The Dreamy Romantic', text: 'Your heart sees the beauty in everything! Create a magical evening with fairy lights and stargazing. Your love is pure poetry.', lucky: 'Ocean sounds' },
};

export default function LoveHoroscope() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'input' | 'result' | 'finished'>('idle');
  const [name, setName] = useState('');
  const [result, setResult] = useState<{sign: string; data: typeof HOROSCOPES[string]} | null>(null);
  const [allResults, setAllResults] = useState<{name: string; sign: string; emoji: string}[]>([]);

  const getZodiacSign = (nameVal: string): string => {
    const codes = nameVal.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const signs = Object.keys(HOROSCOPES);
    return signs[codes % signs.length];
  };

  const revealHoroscope = () => {
    if (!name.trim()) return;
    const sign = getZodiacSign(name);
    setResult({ sign, data: HOROSCOPES[sign] });
    setAllResults(prev => [...prev, { name: name, sign, emoji: HOROSCOPES[sign].emoji }]);
    setGameState('result');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">⭐</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Horoscope</h1>
              <p className="text-gray-600 mb-8 text-lg">Enter your name and discover your love horoscope!</p>
              <button onClick={() => setGameState('input')} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Star className="w-5 h-5 inline mr-2" /> Reveal My Stars</button>
            </motion.div>
          )}
          {gameState === 'input' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-6xl mb-6">🔮</div>
              <h2 className="text-2xl font-display font-black text-gray-900 mb-6">Enter Your Name</h2>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Type your name here..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white/80 text-center text-xl mb-6"
                onKeyDown={e => e.key === 'Enter' && revealHoroscope()}
              />
              <button onClick={revealHoroscope} disabled={!name.trim()} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg disabled:opacity-50">Reveal Horoscope ⭐</button>
            </motion.div>
          )}
          {gameState === 'result' && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-4">{result.data.emoji}</div>
              <h2 className="text-2xl font-display font-black text-gray-900 mb-1">{result.sign}</h2>
              <p className="text-lg text-purple-600 font-medium mb-6">{result.data.title}</p>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-[2rem] shadow-2xl p-8 mb-6 text-white">
                <p className="text-xl leading-relaxed font-medium">{result.data.text}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 mb-8">
                <p className="text-sm text-gray-600">Lucky charm: <span className="font-bold text-purple-600">{result.data.lucky}</span></p>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setGameState('input')} className="px-8 py-3 bg-white/70 rounded-2xl font-bold">Check Another</button>
                <button onClick={() => { setAllResults([]); setGameState('finished'); }} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold">See All ⭐</button>
              </div>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Your Stars</h2>
              <p className="text-gray-600 mb-8">All {allResults.length} horoscopes revealed!</p>
              <div className="space-y-3 mb-8 text-left">
                {allResults.map((r, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-purple-100/60 flex items-center gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-900">{r.name} - {r.sign}</p>
                      <p className="text-sm text-gray-600">{HOROSCOPES[r.sign].title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setGameState('idle')} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
