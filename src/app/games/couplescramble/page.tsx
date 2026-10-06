'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Users, Sparkles, Zap, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const WORDS = ['LOVE', 'KISS', 'HUGS', 'HEART', 'DREAM', 'SOUL', 'PASSION', 'TENDER', 'FOREVER', 'ADORE', 'CUDDLE', 'CHERISH'];

function scramble(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr.join('');
}

export default function CoupleScramblePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [p1Answer, setP1Answer] = useState('');
  const [p2Answer, setP2Answer] = useState('');
  const [p1Finished, setP1Finished] = useState(false);
  const [p2Finished, setP2Finished] = useState(false);
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const startGame = () => {
    setP1Score(0); setP2Score(0); setRoundNum(0);
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(w); setScrambled(scramble(w));
    setP1Answer(''); setP2Answer(''); setP1Finished(false); setP2Finished(false);
    setRoundWinner(null); setStartTime(Date.now());
    setPhase('playing');
  };

  useEffect(() => {
    if (p1Finished && p2Finished) {
      const t1 = p1Time;
      const t2 = p2Time;
      let p1Win = false;
      if (t1 < t2) { setP1Score(s => s + 10); p1Win = true; }
      else if (t2 < t1) { setP2Score(s => s + 10); p1Win = false; }
      else { setP1Score(s => s + 5); setP2Score(s => s + 5); p1Win = false; }

      setRoundWinner(p1Win ? 'Partner 1' : 'Partner 2');
      setTimeout(() => {
        if (roundNum + 1 >= 8) setPhase('finished');
        else nextRound();
      }, 2000);
    }
  }, [p1Finished, p2Finished]);

  const nextRound = () => {
    setRoundNum(r => r + 1);
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(w); setScrambled(scramble(w));
    setP1Answer(''); setP2Answer(''); setP1Finished(false); setP2Finished(false);
    setRoundWinner(null); setStartTime(Date.now());
  };

  const handleSubmitP1 = () => {
    if (p1Answer.trim().toUpperCase() === currentWord) {
      setP1Time((Date.now() - startTime) / 1000);
      setP1Finished(true);
    }
  };

  const handleSubmitP2 = () => {
    if (p2Answer.trim().toUpperCase() === currentWord) {
      setP2Time((Date.now() - startTime) / 1000);
      setP2Finished(true);
    }
  };

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
                <div className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /><span className="font-bold text-gray-700">Race Scramble</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">⚔️</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Scramble Battle</h1>
              <p className="text-gray-600 mb-8 text-lg">First to unscramble the word wins the point!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Same word scrambled for both players</li>
                  <li>First to type correct word gets 10 pts</li>
                  <li>Tie = both get 5 pts</li>
                  <li>Race through 8 rounds total!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start Race</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm font-bold border">Round {roundNum + 1}/8</span>
                <span className="text-sm font-bold text-blue-600">P1: {p1Score}</span>
                <span className="text-sm font-bold text-purple-600">P2: {p2Score}</span>
              </div>

              <motion.div key={currentWord} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-2xl p-8 mb-4 text-center">
                <p className="text-white text-sm mb-2">UNSCRAMBLE:</p>
                <div className="text-6xl font-black text-white tracking-widest mb-3 break-all">{scrambled}</div>
                <p className="text-sm text-white/70">Race to type the correct word!</p>
              </motion.div>

              {roundWinner ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-[2rem] p-6 text-center text-white">
                  <p className="font-black text-2xl mb-1">{roundWinner} wins this round!</p>
                  <p className="text-sm">P1: {p1Time}s | P2: {p2Time}s</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-blue-200 p-4">
                    <h3 className="font-bold text-blue-700 mb-2">Partner 1 {p1Finished && '✓'}</h3>
                    <input type="text" value={p1Answer} onChange={e => setP1Answer(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleSubmitP1()} placeholder="Type answer..." disabled={p1Finished} className="w-full px-3 py-2 rounded-xl border-2 border-blue-200 text-center font-bold uppercase focus:border-blue-500 disabled:opacity-50" />
                    <button onClick={handleSubmitP1} disabled={p1Finished} className="w-full mt-2 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50">Submit</button>
                  </div>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-purple-200 p-4">
                    <h3 className="font-bold text-purple-700 mb-2">Partner 2 {p2Finished && '✓'}</h3>
                    <input type="text" value={p2Answer} onChange={e => setP2Answer(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleSubmitP2()} placeholder="Type answer..." disabled={p2Finished} className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 text-center font-bold uppercase focus:border-purple-500 disabled:opacity-50" />
                    <button onClick={handleSubmitP2} disabled={p2Finished} className="w-full mt-2 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition disabled:opacity-50">Submit</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Race Complete!</h2>
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
                  <p className="text-sm mb-2">Partner 1</p>
                  <p className="text-5xl font-black">{p1Score}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
                  <p className="text-sm mb-2">Partner 2</p>
                  <p className="text-5xl font-black">{p2Score}</p>
                </div>
              </div>
              <p className="text-2xl font-display font-black gradient-text mb-6">{p1Score > p2Score ? 'Partner 1 Wins!' : p2Score > p1Score ? 'Partner 2 Wins!' : "It's a Tie!"}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Race Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}