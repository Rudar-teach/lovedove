'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Star, Grid3x3, Shuffle, Timer } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface WordData { word: string; emoji: string; hint: string; }

const WORD_DATA: WordData[] = [
  { word: 'LOVE', emoji: '❤️', hint: 'The strongest emotion' },
  { word: 'KISS', emoji: '💋', hint: 'What couples share' },
  { word: 'HUGS', emoji: '🤗', hint: 'Warm embrace' },
  { word: 'HEART', emoji: '💖', hint: 'Symbol of love' },
  { word: 'SOUL', emoji: '✨', hint: 'Deep connection' },
  { word: 'PASSION', emoji: '🔥', hint: 'Intense desire' },
  { word: 'DREAM', emoji: '🌈', hint: 'Wish for the future' },
  { word: 'CHERISH', emoji: '💝', hint: 'Hold dear' },
  { word: 'CUDDLE', emoji: '🫂', hint: 'Close comfort' },
  { word: 'TENDER', emoji: '🌸', hint: 'Gentle and loving' },
  { word: 'FOREVER', emoji: '♾️', hint: 'Eternal promise' },
  { word: 'ADORE', emoji: '😍', hint: 'Deep love' },
  { word: 'TREASURE', emoji: '💎', hint: 'Precious finding' },
  { word: 'GENTLE', emoji: '🌿', hint: 'Soft and kind' },
  { word: 'DEAR', emoji: '💌', hint: 'Beloved one' },
  { word: 'SMILE', emoji: '😊', hint: 'Happy face' },
  { word: 'JOY', emoji: '🎉', hint: 'Great happiness' },
  { word: 'WISH', emoji: '⭐', hint: 'Hopeful desire' },
  { word: 'BLISS', emoji: '😇', hint: 'Perfect happiness' },
  { word: 'DAZZLE', emoji: '💫', hint: 'Impressive sparkle' },
];

const WIN_PATTERNS: { name: string; cells: number[][] }[] = [
  { name: 'Row', cells: [[0,0],[0,1],[0,2],[0,3],[0,4]] },
  { name: 'Row', cells: [[1,0],[1,1],[1,2],[1,3],[1,4]] },
  { name: 'Row', cells: [[2,0],[2,1],[2,2],[2,3],[2,4]] },
  { name: 'Row', cells: [[3,0],[3,1],[3,2],[3,3],[3,4]] },
  { name: 'Row', cells: [[4,0],[4,1],[4,2],[4,3],[4,4]] },
  { name: 'Column', cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { name: 'Column', cells: [[0,1],[1,1],[2,1],[3,1],[4,1]] },
  { name: 'Column', cells: [[0,2],[1,2],[2,2],[3,2],[4,2]] },
  { name: 'Column', cells: [[0,3],[1,3],[2,3],[3,3],[4,3]] },
  { name: 'Column', cells: [[0,4],[1,4],[2,4],[3,4],[4,4]] },
  { name: 'Diagonal', cells: [[0,0],[1,1],[2,2],[3,3],[4,4]] },
  { name: 'Diagonal', cells: [[0,4],[1,3],[2,2],[3,1],[4,0]] },
  { name: 'X', cells: [[0,0],[1,1],[2,2],[3,3],[4,4],[0,4],[1,3],[2,2],[3,1],[4,0]] },
  { name: 'Corners', cells: [[0,0],[0,4],[4,0],[4,4]] },
];

export default function LoveBingoAltPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished'>('start');
  const [mode, setMode] = useState<'normal' | 'speed'>('normal');
  const [card, setCard] = useState<string[][]>([]);
  const [wordMap, setWordMap] = useState<Map<string, WordData>>(new Map());
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [called, setCalled] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState<string[]>([]);
  const [speedTimer, setSpeedTimer] = useState(120);
  const intervalRef = useRef<any>(null);

  const generateCard = () => {
    const shuffled = [...WORD_DATA].sort(() => Math.random() - 0.5);
    const card: string[][] = [];
    const wm = new Map<string, WordData>();
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      card[r] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) { card[r][c] = 'FREE'; wm.set('FREE', { word: 'FREE', emoji: '⭐', hint: 'Free space!' }); }
        else { const item = shuffled[idx]; card[r][c] = item.word; wm.set(item.word, item); idx++; }
      }
    }
    return { card, wordMap: wm };
  };

  const startGame = (m: 'normal' | 'speed') => {
    const { card: c, wordMap: wm } = generateCard();
    setCard(c); setWordMap(wm);
    setMarked(new Set(['2-2'])); setCalled([]); setScore(0); setWins([]);
    setMode(m);
    if (m === 'speed') { setSpeedTimer(120); const iv = setInterval(() => { setSpeedTimer(t => { if (t <= 1) { clearInterval(iv); setPhase('finished'); return 0; } return t - 1; }); }, 1000); intervalRef.current = iv; }
    setPhase('playing');
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    const newWins: string[] = [];
    const pts: number[] = [];
    WIN_PATTERNS.forEach(pattern => {
      const allMarked = pattern.cells.every(([r, c]) => marked.has(`${r}-${c}`));
      if (allMarked && !wins.includes(pattern.name)) { newWins.push(pattern.name); pts.push(['X', 'Corners'].includes(pattern.name) ? 50 : 25); }
    });
    if (newWins.length > 0) { setWins(w => [...w, ...newWins]); setScore(s => s + pts.reduce((a, b) => a + b, 0)); }
  }, [marked]);

  useEffect(() => { if (wins.length >= 5 || (wins.length >= 1 && speedTimer === 0 && mode === 'speed')) setPhase('finished'); }, [wins, speedTimer, mode]);

  const callItem = () => {
    const remaining = WORD_DATA.filter(i => !called.includes(i.word));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setCalled([...called, pick.word]);
  };

  const toggleMark = (r: number, c: number) => {
    const key = `${r}-${c}`;
    setMarked(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
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
                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /><span className="font-bold text-gray-700">Bingo</span></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎱</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Bingo</h1>
              <p className="text-gray-600 mb-8 text-lg">Fill your card with romantic activities!</p>
              <div className="flex gap-3 justify-center mb-8">
                <button onClick={() => startGame('normal')} className="px-6 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">Normal</button>
                <button onClick={() => startGame('speed')} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white font-bold">Speed (2min)</button>
              </div>
              <button onClick={() => startGame('normal')} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition"><Play className="w-5 h-5 inline mr-2" /> Start</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">Wins: {wins.length}</span>
                {mode === 'speed' && <span className={`text-sm font-black ${speedTimer <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}><Timer className="w-4 h-4 inline mr-1" />{speedTimer}s</span>}
                <span className="text-sm font-bold text-gray-700">Score: {score}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-3">
                  <div className="grid grid-cols-5 gap-1">
                    {card.map((row, ri) => row.map((item, ci) => {
                      const isMarked = marked.has(`${ri}-${ci}`);
                      const isFree = item === 'FREE';
                      return (
                        <button key={`${ri}-${ci}`} onClick={() => !isFree && toggleMark(ri, ci)} className={`aspect-square rounded-md text-xs font-bold flex items-center justify-center transition ${isMarked ? 'bg-green-500 text-white' : isFree ? 'bg-purple-200 text-purple-800' : 'bg-white text-gray-700 hover:bg-pink-100'}`}>
                          {isFree ? '⭐' : (wordMap.get(item)?.emoji || '')}
                        </button>
                      );
                    }))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Called:</h3>
                  <div className="flex flex-wrap gap-1 mb-3 max-h-32 overflow-y-auto">
                    {called.map(item => { const wd = wordMap.get(item); return wd ? <span key={item} className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">{wd.emoji} {item}</span> : null; })}
                  </div>
                  <button onClick={callItem} disabled={called.length >= 20} className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition disabled:opacity-50">
                    <Shuffle className="w-4 h-4 inline mr-1" /> Call Next ({20 - called.length})
                  </button>
                </div>
              </div>

              {wins.length > 0 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold">BINGO: {wins[wins.length - 1]}!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Bingo Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">{score} pts</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => startGame(mode)} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}