'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Play, RotateCcw, Trophy, Users, Sparkles, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Scenario {
  situation: string;
  emoji: string;
  options: { text: string }[];
  ideal: number;
}

const SCENARIOS: Scenario[] = [
  { emoji: "💬", situation: "Your partner comes home upset after a bad day. What do you do?",
    options: ["Give them space and let them vent", "Immediately try to fix the problem", "Make them their favorite meal", "Ask lots of questions to understand"], ideal: 3 },
  { emoji: "🏖️", situation: "You plan a surprise vacation, but your partner wanted a quiet staycation. What do you do?",
    options: ["Cancel the vacation", "Find a middle ground", "Proceed anyway - it's a surprise!", "Make it a surprise staycation"], ideal: 1 },
  { emoji: "💰", situation: "Your partner spent $200 on something you think is wasteful. How do you react?",
    options: ["Get angry about it immediately", "Calmly discuss money boundaries", "Say nothing to avoid conflict", "Demand they return it"], ideal: 1 },
  { emoji: "👨‍👩‍👧", situation: "Your partner's best friend is going through a breakup and needs them every night. How do you handle it?",
    options: ["Feel neglected and jealous", "Be supportive and flexible", "Ask them to limit it to weekdays", "Demand they choose you instead"], ideal: 1 },
  { emoji: "🎭", situation: "Your partner wants to take a dance class but you're terrible at dancing. What do you do?",
    options: ["Encourage them to go alone", "Join them and embrace being bad at it", "Find a different activity", "Tell them you don't like dancing"], ideal: 1 },
  { emoji: "📱", situation: "Your partner has been on their phone during dinner every night. What do you do?",
    options: ["Laugh it off and join them", "Gently mention it bothers you", "Take out your phone too", "Demand they put it away immediately"], ideal: 1 },
];

export default function LoveScenariosPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'p1' | 'p2' | 'compare' | 'result'>('start');
  const [shuffled, setShuffled] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [p1Answers, setP1Answers] = useState<number[]>([]);
  const [p2Answers, setP2Answers] = useState<number[]>([]);
  const [p1Selected, setP1Selected] = useState<number | null>(null);
  const [p2Selected, setP2Selected] = useState<number | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [compatibility, setCompatibility] = useState<{ scenario: number; match: number; name: string }[]>([]);

  const startGame = () => {
    const s = [...SCENARIOS].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setCurrent(0);
    setP1Answers([]);
    setP2Answers([]);
    setP1Selected(null);
    setP2Selected(null);
    setP1Score(0);
    setP2Score(0);
    setCompatibility([]);
    setGameState('p1');
  };

  const selectAnswer = (answerIdx: number) => {
    if (currentPlayer === 1 && p1Selected !== null) return;
    if (currentPlayer === 2 && p2Selected !== null) return;

    const ideal = shuffled[current].ideal;
    const diff = Math.abs(ideal - answerIdx);
    const matchScore = Math.max(0, 10 - diff * 3);

    if (currentPlayer === 1) {
      setP1Answers(a => [...a, answerIdx]);
      setP1Score(s => s + matchScore);
      setP1Selected(answerIdx);
      setCurrentPlayer(2);
    } else {
      setP2Answers(a => [...a, answerIdx]);
      setP2Score(s => s + matchScore);
      setP2Selected(answerIdx);

      const p1Ans = p1Answers.length > current ? p1Answers[current] : (currentPlayer === 2 ? p1Answers[current] : p1Answers[current]);
      const p1Actual = currentPlayer === 1 ? p1Answers[current] ?? answerIdx : p1Answers[current] ?? answerIdx;

      setTimeout(() => {
        setCompatibility(c => [...c, {
          scenario: current + 1,
          match: Math.round((1 - Math.abs((p1Answers[current] ?? answerIdx) - answerIdx) / 3) * 100),
          name: shuffled[current].situation.substring(0, 30)
        }]);
      }, 100);

      if (current < shuffled.length - 1) {
        setCurrent(c => c + 1);
        setP1Selected(null);
        setP2Selected(null);
        setCurrentPlayer(1);
      } else {
        setGameState('result');
      }
    }
  };

  const getOverallCompatibility = () => {
    if (compatibility.length === 0) return 50;
    return Math.round(compatibility.reduce((a, c) => a + c.match, 0) / compatibility.length);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-gray-700">Couple Scenarios</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💑</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Scenarios</h1>
              <p className="text-gray-600 mb-8 text-lg">Both partners answer hypothetical situations, then compare your answers!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> How It Works</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>👥 Partner 1 answers first</li>
                  <li>👥 Partner 2 answers without seeing P1's choices</li>
                  <li>📊 Compare answers and see compatibility</li>
                  <li>💕 {SCENARIOS.length} scenarios about real situations</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {(gameState === 'p1' || gameState === 'p2') && shuffled[current] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${gameState === 'p1' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  {gameState === 'p1' ? '👤 Partner 1' : '👤 Partner 2'}
                </span>
                <span className="text-sm text-gray-500 font-medium">Question {current + 1}/{shuffled.length}</span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className={`h-full rounded-full ${gameState === 'p1' ? 'bg-blue-400' : 'bg-pink-400'}`} style={{ width: `${((current + 1) / shuffled.length) * 100}%` }} />
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6 text-center">
                <div className="text-5xl mb-4">{shuffled[current].emoji}</div>
                <p className="text-lg font-bold text-gray-900 leading-relaxed">{shuffled[current].situation}</p>
              </div>

              <div className="space-y-3">
                {shuffled[current].options.map((opt, i) => {
                  const isSelected = gameState === 'p1' ? p1Selected === i : p2Selected === i;
                  const isOther = (gameState === 'p1' ? p1Answers[current] : p2Answers[current]) === i;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      whileHover={{ scale: isSelected || isOther ? 1 : 1.01 }}
                      disabled={isSelected || isOther}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${isSelected ? 'bg-blue-50 border-blue-400' : isOther ? 'bg-green-50 border-green-400' : 'bg-white/70 border-gray-200 hover:border-blue-300 cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-gray-700">{opt.text}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {gameState === 'p2' && p1Selected !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-sm text-blue-700">Partner 1 chose: "{shuffled[current].options[p1Selected].text}"</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">📊</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Results!</h2>

              <div className={`bg-gradient-to-br rounded-[2rem] shadow-2xl p-8 mb-6 text-white ${getOverallCompatibility() >= 70 ? 'from-green-500 to-emerald-500' : getOverallCompatibility() >= 40 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-pink-500'}`}>
                <p className="text-sm text-white/70 mb-2">Overall Compatibility</p>
                <p className="text-6xl font-black mb-2">{getOverallCompatibility()}%</p>
                <p className="text-white/80">{getOverallCompatibility() >= 70 ? '💕 Perfect match!' : getOverallCompatibility() >= 40 ? '💛 Good chemistry!' : '💔 Room to grow together'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-5 text-center">
                  <p className="text-sm text-gray-500 mb-1">Partner 1</p>
                  <p className="text-3xl font-black text-blue-600">{p1Score}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-5 text-center">
                  <p className="text-sm text-gray-500 mb-1">Partner 2</p>
                  <p className="text-3xl font-black text-pink-600">{p2Score}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" /> Scenario Breakdown</h3>
                {compatibility.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3 p-3 bg-white/50 rounded-xl">
                    <span className="text-2xl">{shuffled[i]?.emoji}</span>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full ${c.match >= 70 ? 'bg-green-500' : c.match >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${c.match}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{c.match}%</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
          <div className="text-center mt-6"><Link href="/games"><button className="px-6 py-3 bg-white/70 rounded-2xl font-bold text-sm hover:bg-white transition">← Back to Games</button></Link></div>
        </div>
      </div>
    </PremiumBackground>
  );
}