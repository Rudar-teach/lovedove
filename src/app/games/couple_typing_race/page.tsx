'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const PHRASES = [
  "I love you", "you are my everything", "forever and always", "my heart beats for you",
  "you complete me", "together forever", "my one and only", "love you to the moon",
  "my soulmate", "you make me smile", "love never ends", "be mine always",
  "you are beautiful", "my heart is yours", "with you always",
];

export default function CoupleTypingRacePage() {
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'result'>('start');
  const [phrases, setPhrases] = useState<typeof PHRASES>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [p1Input, setP1Input] = useState('');
  const [p2Input, setP2Input] = useState('');
  const [p1Done, setP1Done] = useState<string[]>([]);
  const [p2Done, setP2Done] = useState<string[]>([]);
  const [p1Wpm, setP1Wpm] = useState(0);
  const [p2Wpm, setP2Wpm] = useState(0);
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const [winner, setWinner] = useState('');
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1');
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...PHRASES].sort(() => Math.random() - 0.5).slice(0, 6);
    setPhrases(shuffled);
    setCurrentIdx(0);
    setP1Input('');
    setP2Input('');
    setP1Done([]);
    setP2Done([]);
    setP1Wpm(0);
    setP2Wpm(0);
    setP1Time(0);
    setP2Time(0);
    setTurn('p1');
    setWinner('');
    setPhase('p1');
  };

  const finishTurn = (player: 'p1' | 'p2', time: number) => {
    if (player === 'p1') setP1Time(time);
    else setP2Time(time);
    if (turn === 'p1') {
      setTurn('p2');
      setCurrentIdx(0);
      setP2Input('');
    } else {
      const p1Words = p1Done.length;
      const p2Words = p2Done.length;
      const p1Total = p1Done.join('').length / 5;
      const p2Total = p2Done.join('').length / 5;
      setP1Wpm(Math.round((p1Total / Math.max(p1Time, 0.01)) * 60));
      setP2Wpm(Math.round((p2Total / Math.max(p2Time, 0.01)) * 60));
      if (p1Wpm > p2Wpm) setWinner('💙 Player 1!');
      else if (p2Wpm > p1Wpm) setWinner('💗 Player 2!');
      else setWinner('🤝 Tie!');
      setPhase('result');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Zap className="w-5 h-5 text-amber-500" /> Couple Typing Race</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">⚡</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Couple Typing Race</h2>
                  <p className="text-gray-600">Race against each other typing romantic phrases! Who types faster?</p>
                  <p className="text-sm text-pink-500 font-medium">Player 1 goes first, then Player 2!</p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start Race ⚡</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {(phase === 'p1' || phase === 'p2') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center text-lg font-semibold mb-4">
                {turn === 'p1' ? '💙 Player 1\'s Turn' : '💗 Player 2\'s Turn'}
              </p>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-2xl font-bold text-center text-gray-800 mb-6">
                    "{phrases[currentIdx]}"
                  </p>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const done = turn === 'p1' ? [...p1Done, phrases[currentIdx]] : [...p2Done, phrases[currentIdx]];
                    if (turn === 'p1') { setP1Done(done); setP1Input(''); }
                    else { setP2Done(done); setP2Input(''); }
                    if (currentIdx + 1 < phrases.length) {
                      setCurrentIdx(i => i + 1);
                    } else {
                      const elapsed = (Date.now() - startRef.current) / 1000;
                      finishTurn(turn, elapsed);
                    }
                  }}>
                    <input type="text" value={turn === 'p1' ? p1Input : p2Input} onChange={e => turn === 'p1' ? setP1Input(e.target.value) : setP2Input(e.target.value)} autoFocus placeholder="Type the phrase..."
                      className="w-full text-center text-lg font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" />
                    <Button type="submit" variant="primary" className="w-full mt-3" disabled={!((turn === 'p1' ? p1Input : p2Input) === phrases[currentIdx])}>Submit</Button>
                  </form>
                  <p className="text-center text-sm text-gray-500 mt-3">{phrases[currentIdx]}</p>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">🏆</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Race Complete!</h2>
                  <p className="text-2xl font-bold text-primary-600">{winner}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-blue-500 font-medium">💙 Player 1</p>
                      <p className="text-2xl font-black">{p1Wpm} WPM</p>
                      <p className="text-sm text-gray-600">{p1Time.toFixed(1)}s</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4">
                      <p className="text-rose-500 font-medium">💗 Player 2</p>
                      <p className="text-2xl font-black">{p2Wpm} WPM</p>
                      <p className="text-sm text-gray-600">{p2Time.toFixed(1)}s</p>
                    </div>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Race Again ⚡</Button>
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
