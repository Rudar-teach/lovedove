'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Heart, Mail, Clock as ClockIcon } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const PROMPTS = [
  'rainy days together',
  'our first date',
  'the way you smile',
  'lazy Sunday mornings',
  'inside jokes only we get',
  'the moment I knew I loved you',
  'our favorite adventure',
  'the sound of your laugh',
  'our future together',
  'tiny things you do that I love',
];

const SAMPLE_LETTERS = [
  'My love, on that very first evening, the world seemed to pause just for us. Your smile, brighter than any sunrise, made my heart dance. Every clumsy, amazing moment together holds the depth of our love — from every giggle to grand adventure. You are my always. 💕',
  'Dear heart, the sound of your laugh is my favorite song. Tiny things you do — the way you tuck your hair behind your ear, the way you hum while cooking — make my world bloom. I love you, today, tomorrow, always. 🌹',
  'Sweetheart, our future adventure together is my favorite daydream. From sunrise coffees to moonlit walks, every moment with you feels like home. Thank you for being my person. Forever yours. 💌',
];

export default function LoveLettersPage() {
  const [phase, setPhase] = useState<'intro' | 'writing' | 'done'>('intro');
  const [prompt, setPrompt] = useState('');
  const [letter, setLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [revealed, setRevealed] = useState(false);
  const [sample, setSample] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const intervalRef = useRef(0);

  const startWriting = () => {
    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
    setLetter('');
    setTimeLeft(120);
    setRevealed(false);
    setSample(SAMPLE_LETTERS[Math.floor(Math.random() * SAMPLE_LETTERS.length)]);
    setPhase('writing');
  };

  useEffect(() => {
    if (phase !== 'writing' || !timerEnabled || revealed) return;
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase, timerEnabled, revealed]);

  const wordCount = letter.trim() ? letter.trim().split(/\s+/).length : 0;

  const reveal = () => {
    setRevealed(true);
    setPhase('done');
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Love Letters', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Love Letters
            </h1>
            <div className="w-10" />
          </div>

          {phase === 'intro' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Mail className="w-20 h-20 text-primary-500 mx-auto" />
                  </motion.div>
                  <p className="text-gray-700 font-semibold">Write a love letter to your sweetheart 💌</p>
                  <p className="text-sm text-gray-500">Get a random prompt, write with your heart, then reveal your partner's letter!</p>
                  <label className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={timerEnabled}
                      onChange={e => setTimerEnabled(e.target.checked)}
                      className="w-4 h-4 accent-primary-500"
                    />
                    Enable 2-min timer
                  </label>
                  <Button onClick={startWriting} variant="primary">Start Writing 💖</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'writing' && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                {timerEnabled && (
                  <div className={`bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 shadow border ${timeLeft < 30 ? 'border-rose-400 text-rose-600' : 'border-pink-100 text-primary-600'} flex items-center gap-1`}>
                    <ClockIcon className="w-4 h-4" /> {formatTime(timeLeft)}
                  </div>
                )}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-pink-600 shadow border border-pink-100">
                  📝 {wordCount} words
                </div>
              </div>

              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-2xl">💕</div>
                  <div className="absolute top-2 right-2 text-2xl">💕</div>
                  <div className="absolute bottom-2 left-2 text-2xl">💕</div>
                  <div className="absolute bottom-2 right-2 text-2xl">💕</div>

                  <div className="text-center my-3">
                    <span className="inline-block bg-pink-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                      Write about: {prompt}
                    </span>
                  </div>

                  <textarea
                    value={letter}
                    onChange={e => setLetter(e.target.value)}
                    placeholder="Dear love, ..."
                    className="w-full h-72 p-4 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:outline-none focus:border-primary-300 resize-none font-serif text-gray-700 leading-relaxed"
                    style={{ backgroundImage: 'linear-gradient(transparent, transparent 27px, rgba(236,72,153,0.1) 27px, rgba(236,72,153,0.1) 28px, transparent 28px)', backgroundSize: '100% 28px', lineHeight: '28px' }}
                  />

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button onClick={reveal} variant="primary" size="sm" disabled={letter.length < 5}>
                      <Heart className="w-4 h-4 mr-1" /> Finish & Reveal
                    </Button>
                    <Button onClick={() => setPhase('done')} variant="ghost" size="sm">
                      Skip Timer
                    </Button>
                  </div>
                </div>
              </TiltCard>
            </>
          )}

          <AnimatePresence>
            {phase === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <TiltCard>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                    <h3 className="text-lg font-bold text-primary-700 text-center mb-3 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" /> Your Letter
                    </h3>
                    <div className="bg-pink-50/50 rounded-2xl p-4 font-serif text-gray-700 leading-relaxed border border-pink-100 min-h-[120px]" style={{ backgroundImage: 'linear-gradient(transparent, transparent 27px, rgba(236,72,153,0.1) 27px, rgba(236,72,153,0.1) 28px, transparent 28px)', backgroundSize: '100% 28px', lineHeight: '28px' }}>
                      {letter || '(You wrote nothing!)'}
                    </div>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-2xl">💖</div>
                    <div className="absolute top-2 right-2 text-2xl">💖</div>
                    <div className="absolute bottom-2 left-2 text-2xl">💖</div>
                    <div className="absolute bottom-2 right-2 text-2xl">💖</div>
                    <h3 className="text-lg font-bold text-rose-700 text-center mb-3 flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5 fill-current" /> Partner's Letter
                    </h3>
                    <div className="bg-rose-50/50 rounded-2xl p-4 font-serif text-gray-700 leading-relaxed border border-rose-100 min-h-[120px]" style={{ backgroundImage: 'linear-gradient(transparent, transparent 27px, rgba(244,63,94,0.1) 27px, rgba(244,63,94,0.1) 28px, transparent 28px)', backgroundSize: '100% 28px', lineHeight: '28px' }}>
                      {sample}
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2 italic">A sample from your sweetheart 💌</p>
                  </div>
                </TiltCard>

                <div className="text-center">
                  <Button onClick={() => setPhase('intro')} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Write Another</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
            <GameSharePanel gameSlug="loveletters" />
      </PremiumBackground>
  );
}
