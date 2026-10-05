'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const WORDS: { scrambled: string; answer: string }[] = [
  { scrambled: 'tnelaV', answer: 'Valentine' },
  { scrambled: 'dipuC', answer: 'Cupid' },
  { scrambled: 'tnemele', answer: 'Element' },
  { scrambled: 'esroR', answer: 'Rose' },
  { scrambled: 'retaw', answer: 'water' },
  { scrambled: 'eman', answer: 'name' },
  { scrambled: 'yob', answer: 'boy' },
  { scrambled: 'lriG', answer: 'Girl' },
  { scrambled: 'tnorf', answer: 'front' },
  { scrambled: 'llew', answer: 'well' },
  { scrambled: 'yad', answer: 'day' },
  { scrambled: 'thgil', answer: 'light' },
  { scrambled: 'kcolc', answer: 'clock' },
  { scrambled: 'ggeD', answer: 'Edge' },
  { scrambled: 'yrraH', answer: 'Harry' },
  { scrambled: 'lohO', answer: 'Ohio' },
  { scrambled: 'nhoJ', answer: 'John' },
  { scrambled: 'ykS', answer: 'Sky' },
  { scrambled: 'eerhT', answer: 'Three' },
  { scrambled: 'htoB', answer: 'Both' },
  { scrambled: 'lriF', answer: 'Fril' },
  { scrambled: 'tnek', answer: 'Kent' },
  { scrambled: 'sam', answer: 'Sam' },
  { scrambled: 'em', answer: 'me' },
  { scrambled: 'doG', answer: 'Dog' },
  { scrambled: 'caT', answer: 'Cat' },
  { scrambled: 'gnoL', answer: 'Long' },
  { scrambled: 'htiW', answer: 'With' },
  { scrambled: 'htim', answer: 'might' },
  { scrambled: 'sdraH', answer: 'Hands' },
  { scrambled: 'neerG', answer: 'Green' },
  { scrambled: 'tneraP', answer: 'Parent' },
  { scrambled: 'laireS', answer: 'Serial' },
  { scrambled: 'kcab', answer: 'back' },
  { scrambled: 'egdir', answer: 'ridge' },
  { scrambled: 'yned', answer: 'dney' },
  { scrambled: 'eurt', answer: 'true' },
  { scrambled: 'eulB', answer: 'Blue' },
  { scrambled: 'enihcam', answer: 'Machine' },
  { scrambled: 'elbaT', answer: 'Table' },
  { scrambled: 'elppA', answer: 'Apple' },
  { scrambled: 'drwaL', answer: 'Walld'.replace('d','') },
  { scrambled: 'dranE', answer: 'Ender' },
  { scrambled: 'tcejbO', answer: 'Object' },
  { scrambled: 'tneraP', answer: 'Parent' },
  { scrambled: 'dnalaC', answer: 'Canada' },
  { scrambled: 'ytilauQ', answer: 'Quality' },
  { scrambled: 'gnitucexE', answer: 'Execute' },
  { scrambled: 'noitceleS', answer: 'Selection' },
  { scrambled: 'snoitcnuF', answer: 'Functions' },
  { scrambled: 'tneiciffE', answer: 'Efficient' },
  { scrambled: 'retupmoC', answer: 'Computer' },
  { scrambled: 'ngisaeM', answer: 'Messaging' },
  { scrambled: 'noitcelloC', answer: 'Collection' },
  { scrambled: 'noitacifirreP', answer: 'Preference' },
  { scrambled: 'snoitseuQ', answer: 'Questions' },
  { scrambled: 'ytiruceS', answer: 'Security' },
  { scrambled: 'gnitarepoO', answer: 'Operating' },
  { scrambled: 'noitautiS', answer: 'Situations' },
  { scrambled: 'noitcnuJ', answer: 'Junction' },
];

type Phase = 'intro' | 'p1' | 'p2' | 'result';

export default function CouplesScramblePage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [word, setWord] = useState({ scrambled: '', answer: '' });
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [time1, setTime1] = useState(0);
  const [time2, setTime2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [toast, setToast] = useState(false);
  const startTimeRef = useRef(0);
  const [currentWord, setCurrentWord] = useState({ scrambled: '', answer: '' });

  const getNewWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

  const startP1 = () => {
    const w = getNewWord();
    setWord(w);
    setCurrentWord(w);
    setInput1('');
    setTimeLeft(30);
    startTimeRef.current = Date.now();
    setPhase('p1');
  };

  const startP2 = () => {
    const w = getNewWord();
    setWord(w);
    setCurrentWord(w);
    setInput2('');
    setTimeLeft(30);
    startTimeRef.current = Date.now();
    setPhase('p2');
  };

  useEffect(() => {
    if (phase !== 'p1' && phase !== 'p2') return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleSubmit = (timeUp = false) => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (phase === 'p1') {
      setTime1(elapsed);
      setPhase('p2');
    } else if (phase === 'p2') {
      setTime2(elapsed);
      setPhase('result');
    }
  };

  const checkCorrect = (input: string, answer: string) => input.trim().toLowerCase() === answer.toLowerCase();

  const resetGame = () => {
    setPhase('intro');
    setWord({ scrambled: '', answer: '' });
    setInput1('');
    setInput2('');
    setTime1(0);
    setTime2(0);
    setTimeLeft(30);
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const score1 = time1 > 0 ? Math.max(0, 100 - time1 * 3 + (checkCorrect(input1, currentWord.answer) ? 50 : 0)) : 0;
  const score2 = time2 > 0 ? Math.max(0, 100 - time2 * 3 + (checkCorrect(input2, currentWord.answer) ? 50 : 0)) : 0;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Couple Scramble
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🔤💕</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Couple Scramble</h2>
                    <p className="text-gray-600 mb-2">Unscramble the romantic word as fast as you can!</p>
                    <p className="text-sm text-gray-500 mb-6">Player 1 goes first, then Player 2 tries to beat their time!</p>
                    <Button onClick={startP1} variant="primary" size="lg">Start Scrambling! 🎯</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'p1' && (
              <motion.div key="p1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-primary-600">👤 Player 1</span>
                  <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`}>⏱️ {timeLeft}s</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${(timeLeft / 30) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-xs text-gray-500 mb-4">Unscramble this word:</p>
                    <motion.p initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-5xl font-black text-primary-600 tracking-widest mb-6">
                      {currentWord.scrambled}
                    </motion.p>
                    <input
                      type="text"
                      autoFocus
                      value={input1}
                      onChange={e => setInput1(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Type the answer..."
                      className="w-full p-4 text-xl font-bold text-center rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none mb-4"
                    />
                    <Button onClick={() => handleSubmit()} variant="primary">Submit ✓</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'p2' && (
              <motion.div key="p2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🔤💗</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Player 2, Your Turn!</h2>
                    <p className="text-gray-600 mb-1">Player 1 finished in <strong className="text-primary-600">{time1}s</strong></p>
                    <p className="text-sm text-gray-500 mb-6">Can you beat them?</p>
                    <Button onClick={startP2} variant="primary" size="lg">Bring It On! 💪</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'p2' && currentWord.scrambled && (
              <motion.div key="p2game" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-rose-600">👤 Player 2</span>
                  <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-rose-600'}`}>⏱️ {timeLeft}s</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${(timeLeft / 30) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-xs text-gray-500 mb-4">Unscramble this word:</p>
                    <motion.p initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} className="text-5xl font-black text-rose-600 tracking-widest mb-6">
                      {currentWord.scrambled}
                    </motion.p>
                    <input
                      type="text"
                      autoFocus
                      value={input2}
                      onChange={e => setInput2(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Type the answer..."
                      className="w-full p-4 text-xl font-bold text-center rounded-xl border-2 border-pink-200 focus:border-primary-500 focus:outline-none mb-4"
                    />
                    <Button onClick={() => handleSubmit()} variant="primary">Submit ✓</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🏆</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Battle of the Brains!</h2>
                    <div className="space-y-3 mb-6">
                      <div className={`p-4 rounded-xl ${score1 > score2 ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                        <p className="font-bold text-primary-700">👤 Player 1</p>
                        <p className="text-sm text-gray-600">Time: {time1}s | Answer: <strong>{checkCorrect(input1, currentWord.answer) ? '✅' : '❌'} {currentWord.answer}</strong></p>
                        <p className="text-2xl font-black text-primary-600">Score: {score1}</p>
                      </div>
                      <div className={`p-4 rounded-xl ${score2 > score1 ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                        <p className="font-bold text-rose-700">👤 Player 2</p>
                        <p className="text-sm text-gray-600">Time: {time2}s | Answer: <strong>{checkCorrect(input2, currentWord.answer) ? '✅' : '❌'} {currentWord.answer}</strong></p>
                        <p className="text-2xl font-black text-rose-600">Score: {score2}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary-600 mb-4">
                      {score1 > score2 ? 'Player 1 Wins! 🎉' : score2 > score1 ? 'Player 2 Wins! 🎉' : "It's a Tie! 🤝"}
                    </p>
                    <Button onClick={resetGame} variant="primary" size="lg">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}