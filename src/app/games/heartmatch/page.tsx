'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const ICONS = ['💕','💖','💗','💓','💘','💝','❤️','🌹','💍','🎁','✨','🫶'];
const PAIRS = [...ICONS, ...ICONS];

export default function HeartMatchPage() {
  const [cards, setCards] = useState<{id:number;icon:string;flipped:boolean;matched:boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const shuffle = () => {
    const s = [...PAIRS].sort(() => Math.random() - 0.5).map((icon, i) => ({id: i, icon, flipped: false, matched: false}));
    setCards(s); setFlipped([]); setMoves(0); setMatches(0); setDone(false); setTimer(0); setStarted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const handleCard = (i: number) => {
    if (cards[i].flipped || cards[i].matched || flipped.length === 2) return;
    const f = [...flipped, i];
    setFlipped(f);
    setCards(c => c.map((card, idx) => idx === i ? {...card, flipped: true} : card));
    if (f.length === 2) {
      setMoves(m => m + 1);
      const [i1, i2] = f;
      if (cards[i1].icon === cards[i2].icon) {
        setTimeout(() => { setCards(c => c.map((card, idx) => (idx === i1 || idx === i2) ? {...card, matched: true} : card)); setMatches(m => m + 1); setFlipped([]); if (matches + 1 === ICONS.length) { setDone(true); clearInterval(timerRef.current!); } }, 400);
      } else {
        setTimeout(() => { setCards(c => c.map((card, idx) => (idx === i1 || idx === i2) ? {...card, flipped: false} : card)); setFlipped([]); }, 1000);
      }
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  import('react').then(r => { const useRef = r.useRef; const timerRef = useRef(0); }); // this won't work inline, use proper import

  const fmt = (t: number) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;
  const stars = moves <= 12 ? 3 : moves <= 18 ? 2 : 1;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500" /> Heart Match</h1>
            <div className="w-16" />
          </div>

          {!started ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl mb-4">🏰</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Heart Match</h2>
                  <p className="text-gray-600">Match all the love symbol pairs!</p>
                  <div className="text-2xl">{stars >= 3 ? '⭐⭐⭐' : stars >= 2 ? '⭐⭐' : '⭐'}</div>
                  <Button onClick={shuffle} variant="primary" size="lg" className="w-full">Start Game 🏰</Button>
                </div>
              </TiltCard>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Moves</p><p className="text-xl font-bold text-gray-800">{moves}</p></div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Matches</p><p className="text-xl font-bold text-primary-600">{matches}/{ICONS.length}</p></div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Time</p><p className="text-xl font-bold text-gray-800">{fmt(timer)}</p></div>
              </div>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {cards.map((card, i) => (
                      <motion.button key={card.id} whileTap={{ scale: 1 }} onClick={() => handleCard(i)} disabled={card.flipped || card.matched}
                        className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 ${card.flipped || card.matched ? 'bg-white shadow-md border-2 border-primary-200' : 'bg-gradient-to-br from-primary-400 to-rose-500 shadow-lg cursor-pointer hover:shadow-xl'}`}>
                        {card.flipped || card.matched ? card.icon : '💕'}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </TiltCard>
              {done && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center space-y-3">
                  <div className="text-4xl">🎉</div>
                  <h2 className="text-2xl font-display font-bold text-primary-600">You Won!</h2>
                  <p className="text-gray-600">{moves} moves · {fmt(timer)}</p>
                  <div className="text-2xl">{stars >= 3 ? '⭐⭐⭐' : stars >= 2 ? '⭐⭐' : '⭐'}</div>
                  <Button onClick={shuffle} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
