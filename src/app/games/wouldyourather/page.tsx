'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  { a: 'Kiss in the rain', b: 'Stargazing all night' },
  { a: 'Live on a beach', b: 'Live in the mountains' },
  { a: 'Cook together', b: 'Order takeout every time' },
  { a: 'Morning person', b: 'Night owl' },
  { a: 'Adventure trip', b: 'Relaxing vacation' },
  { a: 'Watch a movie', b: 'Play a game' },
  { a: 'Say &quot;I love you&quot; first', b: 'Wait for them to say it' },
  { a: 'Have a super power', b: 'Have all the money' },
  { a: 'Speak 10 languages', b: 'Play 10 instruments' },
  { a: 'Cuddle all day', b: 'Have space alone' },
];

export default function WouldYouRatherPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [yourAnswer, setYourAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState(0);
  const [phase, setPhase] = useState<'partner' | 'you' | 'compare' | 'done'>('partner');
  const [showDone, setShowDone] = useState(false);

  const handle = (answer: string) => {
    if (phase === 'partner') { setPartnerAnswer(answer); setPhase('you'); }
    else if (phase === 'you') {
      setYourAnswer(answer);
      if (answer === partnerAnswer) setMatches(m => m + 1);
      setPhase('compare');
    }
  };

  const next = () => {
    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(q => q + 1);
      setPartnerAnswer(null);
      setYourAnswer(null);
      setPhase('partner');
    } else {
      setShowDone(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setPartnerAnswer(null);
    setYourAnswer(null);
    setPhase('partner');
    setShowDone(false);
    setMatches(0);
  };

  if (showDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">💕</div>
          <h2 className="text-3xl font-display font-bold gradient-text mb-4">Results!</h2>
          <p className="text-4xl font-bold text-gray-900 mb-2">{matches}/{QUESTIONS.length}</p>
          <p className="text-gray-600 mb-6">
            {matches >= 7 ? '💖 You think so much alike!' : matches >= 4 ? '💕 Pretty similar!' : '💛 You complement each other!'}
          </p>
          <button onClick={restart} className="bg-gradient-to-r from-primary-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">Play Again</button>
        </motion.div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard"><button className="p-2 hover:bg-white rounded-full"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
          <h1 className="text-2xl font-display font-bold text-gray-900">Would You Rather</h1>
          <button onClick={restart} className="p-2 hover:bg-white rounded-full"><RefreshCw className="w-6 h-5 text-primary-500" /></button>
        </div>

        <div className="text-center mb-4 text-sm text-gray-600">Question {currentQ + 1}/{QUESTIONS.length} | Matches: {matches}</div>
        <div className="bg-gray-200 h-2 rounded-full mb-8">
          <motion.div animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }} className="bg-gradient-to-r from-primary-500 to-rose-500 h-2 rounded-full" />
        </div>

        {phase === 'partner' && <p className="text-center text-sm font-medium text-blue-600 mb-4">Round 1: Partner&apos;s turn</p>}
        {phase === 'you' && <p className="text-center text-sm font-medium text-pink-600 mb-4">Round 2: Your turn</p>}

        <motion.div key={currentQ + phase} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4">
          {phase === 'compare' ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100 space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <p className="text-sm text-blue-600">Partner chose:</p>
                <p className="text-xl font-bold text-blue-900">{partnerAnswer}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-2xl border-2 border-pink-200">
                <p className="text-sm text-pink-600">You chose:</p>
                <p className="text-xl font-bold text-pink-900">{yourAnswer}</p>
              </div>
              <div className="text-center pt-2">
                <p className="text-xl font-bold mb-2">{partnerAnswer === yourAnswer ? '💕 You Match!' : '💛 Different!'}</p>
                <button onClick={next} className="bg-gradient-to-r from-primary-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">Next <ChevronRight className="inline w-4 h-4" /></button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {[q.a, q.b].map(option => (
                <button key={option} onClick={() => handle(option)} className="p-6 text-left rounded-2xl border-2 border-pink-100 hover:border-primary-300 hover:bg-primary-50 transition-all font-medium text-lg bg-white">
                  {option}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}