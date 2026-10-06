'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Users, Flame, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Scenario {
  situation: string;
  emoji: string;
}

const SCENARIOS: Scenario[] = [
  { situation: "You both have to choose a movie to watch. You hate their pick, they hate yours. What do you do?", emoji: "🎬" },
  { situation: "Your partner wants to move to a different city for their dream job. Your dream job is here. What's the move?", emoji: "🏙️" },
  { situation: "Your partner's best friend makes a flirtatious comment about you at a party. How do you handle it?", emoji: "🍸" },
  { situation: "You win a free luxury vacation for two... to a place your partner has always wanted to visit. But you have work obligations. What do you do?", emoji: "✈️" },
  { situation: "Your partner wants to get a pet, but you're allergic to cats (and it's a kitten). How do you approach this?", emoji: "🐱" },
  { situation: "Your partner's ex messages them asking for 'just 5 minutes' to talk about something important. What's your reaction?", emoji: "📱" },
];

const COMPATIBILITY_MESSAGES = [
  { min: 85, title: "Soulmates!", desc: "Your answers are incredibly aligned!", emoji: "💕" },
  { min: 70, title: "Great Match!", desc: "You share a strong bond!", emoji: "💖" },
  { min: 50, title: "Good Vibes!", desc: "Solid foundation with room to grow!", emoji: "💗" },
  { min: 0, title: "Keep Communicating!", desc: "Every couple has differences to bridge!", emoji: "💝" },
];

export default function LoveScenarios() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'p1' | 'p2' | 'results'>('idle');
  const [current, setCurrent] = useState(0);
  const [shuffled, setShuffled] = useState<Scenario[]>([]);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p2Answers, setP2Answers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [scores, setScores] = useState<{ scenario: string; p1: string; p2: string; match: number }[]>([]);

  const startGame = () => {
    const s = [...SCENARIOS].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setCurrent(0);
    setP1Answers([]);
    setP2Answers([]);
    setCurrentAnswer('');
    setScores([]);
    setGameState('p1');
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const answer = currentAnswer.trim();

    if (gameState === 'p1') {
      const newP1 = [...p1Answers, answer];
      setP1Answers(newP1);
      if (current < shuffled.length - 1) {
        setCurrent(c => c + 1);
        setCurrentAnswer('');
      } else {
        setCurrent(0);
        setCurrentAnswer('');
        setGameState('p2');
      }
    } else if (gameState === 'p2') {
      const newP2 = [...p2Answers, answer];
      setP2Answers(newP2);

      const p1Ans = p1Answers[current] || '';
      const p2Ans = answer;
      const words1 = p1Ans.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const words2 = p2Ans.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const common = words1.filter(w => words2.includes(w));
      const totalWords = new Set([...words1, ...words2]).size;
      const matchScore = totalWords > 0 ? Math.min(100, Math.round(((common.length + 1) / (totalWords + 1)) * 100) + Math.floor(Math.random() * 15)) : Math.floor(Math.random() * 30) + 20;

      const newScores = [...scores, {
        scenario: shuffled[current].situation,
        p1: p1Ans,
        p2: p2Ans,
        match: matchScore,
      }];
      setScores(newScores);

      if (current < shuffled.length - 1) {
        setCurrent(c => c + 1);
        setCurrentAnswer('');
      } else {
        setGameState('results');
      }
    }
  };

  const overallCompatibility = scores.length > 0
    ? Math.round(scores.reduce((acc, s) => acc + s.match, 0) / scores.length)
    : 0;

  const getCompatibility = () => COMPATIBILITY_MESSAGES.find(c => overallCompatibility >= c.min) || COMPATIBILITY_MESSAGES[COMPATIBILITY_MESSAGES.length - 1];

  const partnerLabel = gameState === 'p1' ? "💕 Partner 1" : "💖 Partner 2";

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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-gray-700">Love Scenarios</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">💑</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Scenarios</h1>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Both partners answer 6 relationship scenarios separately, then discover your compatibility together!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-rose-500" /> How It Works</h3>
                <div className="space-y-3">
                  {["Pass the device to Partner 1", "Partner 1 answers all scenarios honestly", "Pass to Partner 2 - same scenarios", "Compare answers and see your compatibility!"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-600">{i + 1}</div>
                      <span className="text-sm text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-rose-500/40 transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(gameState === 'p1' || gameState === 'p2') && shuffled[current] && (
              <motion.div key={`${gameState}-${current}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${gameState === 'p1' ? 'bg-rose-100 text-rose-700' : 'bg-pink-100 text-pink-700'}`}>
                    {partnerLabel}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">Scenario {current + 1}/{shuffled.length}</span>
                </div>
                <div className="w-full h-3 bg-white/50 rounded-full mb-8 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${gameState === 'p1' ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-pink-500 to-purple-400'}`}
                    style={{ width: `${((current + 1) / shuffled.length) * 100}%` }}
                  />
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                  <div className="text-4xl mb-4 text-center">{shuffled[current].emoji}</div>
                  <p className="text-lg font-bold text-gray-900 leading-relaxed text-center">{shuffled[current].situation}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {gameState === 'p1' ? "💕 Partner 1" : "💖 Partner 2"}, describe what you would do:
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your honest answer here..."
                    rows={4}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white resize-none mb-4 outline-none focus:border-rose-300 transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition"
                  >
                    {gameState === 'p1' ? (current < shuffled.length - 1 ? 'Next Scenario →' : 'Pass to Partner 2 →') : (current < shuffled.length - 1 ? 'Next Scenario →' : 'See Results →')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameState === 'results' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">💖</div>
                <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Compatibility Results</h2>
                <p className="text-gray-600">Here's how well you both think alike!</p>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-[2rem] shadow-2xl p-8 mb-8 text-white text-center">
                <div className="text-5xl font-black mb-2">{overallCompatibility}%</div>
                <p className="text-rose-100 text-lg mb-1">{getCompatibility().title}</p>
                <p className="text-sm text-rose-200 mb-3">{getCompatibility().desc}</p>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < Math.ceil(overallCompatibility / 20) ? 'fill-yellow-300 text-yellow-300' : 'text-white/30'}`} />
                  ))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Scenario Breakdown</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scores.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-pink-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{i + 1}</span>
                        <p className="text-sm font-medium text-gray-700">{s.scenario.substring(0, 50)}...</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-rose-50 rounded-xl p-2 text-xs">
                          <p className="font-semibold text-rose-600 mb-1">💕 P1</p>
                          <p className="text-gray-600">{s.p1.substring(0, 60)}{s.p1.length > 60 ? '...' : ''}</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-2 text-xs">
                          <p className="font-semibold text-pink-600 mb-1">💖 P2</p>
                          <p className="text-gray-600">{s.p2.substring(0, 60)}{s.p2.length > 60 ? '...' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Scenario {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-bold text-orange-600">{s.match}% match</span>
                        </div>
                      </div>
                      <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.match}%` }} className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}