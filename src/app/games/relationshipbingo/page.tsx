'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Sparkles, Grid3x3, Shuffle, Calendar } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const MILESTONES = [
  'First Date', 'First I Love You', 'First Road Trip', 'Met Family',
  'Had First Fight', 'Moved In Together', 'Got Pet Together',
  'First Holiday Together', 'Met Best Friends', 'Went to Concert',
  'First Dance', 'Watched Sunrise', 'Made Breakfast Together',
  'Wrote Love Note', 'Shared a Secret', 'Gave a Gift',
  'Surprise Date', 'Said I Miss You', 'First Photo Together',
  'Held Hands in Public', 'Slow Dance', 'Shared Umbrella',
  'Cooked Dinner Together', 'Played a Game', 'Watched Stars',
  'Took Selfie', 'Planned Future', 'Broke Stereotype',
  'Forgave Each Other', 'Promised Forever',
];

const WIN_PATTERNS: { name: string; cells: number[][] }[] = [
  { name: 'Row 1', cells: [[0,0],[0,1],[0,2],[0,3],[0,4]] },
  { name: 'Row 2', cells: [[1,0],[1,1],[1,2],[1,3],[1,4]] },
  { name: 'Row 3', cells: [[2,0],[2,1],[2,2],[2,3],[2,4]] },
  { name: 'Row 4', cells: [[3,0],[3,1],[3,2],[3,3],[3,4]] },
  { name: 'Row 5', cells: [[4,0],[4,1],[4,2],[4,3],[4,4]] },
  { name: 'Column 1', cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { name: 'Column 2', cells: [[0,1],[1,1],[2,1],[3,1],[4,1]] },
  { name: 'Column 3', cells: [[0,2],[1,2],[2,2],[3,2],[4,2]] },
  { name: 'Column 4', cells: [[0,3],[1,3],[2,3],[3,3],[4,3]] },
  { name: 'Column 5', cells: [[0,4],[1,4],[2,4],[3,4],[4,4]] },
  { name: 'Diagonal 1', cells: [[0,0],[1,1],[2,2],[3,3],[4,4]] },
  { name: 'Diagonal 2', cells: [[0,4],[1,3],[2,2],[3,1],[4,0]] },
  { name: 'X Pattern', cells: [[0,0],[1,1],[2,2],[3,3],[4,4],[0,4],[1,3],[2,2],[3,1],[4,0]] },
  { name: 'Four Corners', cells: [[0,0],[0,4],[4,0],[4,4]] },
];

export default function RelationshipBingoPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [card, setCard] = useState<string[][]>([]);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [called, setCalled] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState<string[]>([]);
  const [bonus, setBonus] = useState<string>('');

  const generateCard = () => {
    const shuffled = [...MILESTONES].sort(() => Math.random() - 0.5);
    const card: string[][] = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      card[r] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) card[r][c] = 'FREE';
        else { card[r][c] = shuffled[idx]; idx++; }
      }
    }
    return card;
  };

  const startGame = () => {
    setCard(generateCard());
    setMarked(new Set(['2-2']));
    setCalled([]);
    setScore(0);
    setWins([]);
    setBonus('');
    setPhase('playing');
  };

  const callItem = () => {
    const remaining = MILESTONES.filter(i => !called.includes(i));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCalled([...called, pick]);
    setBonus(pick);
    setTimeout(() => setBonus(''), 3000);
  };

  const toggleMark = (r: number, c: number) => {
    const key = `${r}-${c}`;
    setMarked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const checkWins = useCallback(() => {
    const newWins: string[] = [];
    WIN_PATTERNS.forEach(pattern => {
      if (pattern.cells.every(([r, c]) => marked.has(`${r}-${c}`)) && !wins.includes(pattern.name)) newWins.push(pattern.name);
    });
    if (newWins.length > 0) {
      setWins(w => [...w, ...newWins]);
      setScore(s => s + newWins.length * 30);
      if (newWins.includes('X Pattern') || newWins.includes('Four Corners')) setScore(s => s + 50);
    }
  }, [marked, wins]);

  useEffect(() => { checkWins(); }, [marked]);
  useEffect(() => { if (wins.length >= 3) setPhase('finished'); }, [wins]);

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
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-500" /><span className="font-bold text-gray-700">Milestone Bingo</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🗺️</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Milestone Bingo</h1>
              <p className="text-gray-600 mb-8 text-lg">Mark off relationship milestones as you achieve them!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {bonus && (
                <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-3 text-white text-center font-bold mb-4">
                  Called: {bonus}
                </motion.div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3">
                  <div className="grid grid-cols-5 gap-1">
                    {card.map((row, ri) => row.map((item, ci) => {
                      const isMarked = marked.has(`${ri}-${ci}`);
                      return (
                        <button key={`${ri}-${ci}`} onClick={() => toggleMark(ri, ci)} className={`aspect-square rounded-md text-xs font-bold flex items-center justify-center transition ${isMarked ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-100'}`}>
                          {isMarked ? '✓' : item.substring(0, 5)}
                        </button>
                      );
                    }))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Progress</h3>
                  <p className="text-sm text-gray-600 mb-3">{wins.length} patterns completed</p>
                  <button onClick={callItem} className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition mb-3">
                    <Shuffle className="w-4 h-4 inline mr-1" /> Call Milestone
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {called.map(item => <span key={item} className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-bold">{item}</span>)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Milestone Master!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}