'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Brain, Sparkles, Lightbulb, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Scenario {
  situation: string;
  emoji: string;
  options: { text: string; points: number }[];
}

const SCENARIOS: Scenario[] = [
  { emoji: "🌅", situation: "You wake up 10 minutes before your alarm. What do you do?",
    options: [{ text: "Kiss them gently and go back to sleep", points: 20 }, { text: "Start their day with coffee in bed", points: 30 }, { text: "Wake them up with cuddles", points: 25 }, { text: "Send them a sweet morning text", points: 15 }] },
  { emoji: "💼", situation: "Your partner gets a new job that pays more but requires traveling 3 days a week. How do you react?",
    options: [{ text: "Celebrate with them and plan weekly check-ins", points: 30 }, { text: "Feel worried but support their dreams", points: 20 }, { text: "Suggest negotiating a remote option", points: 25 }, { text: "Ask them to find a closer opportunity", points: 5 }] },
  { emoji: "🏠", situation: "Your partner's family doesn't like you. They say you're 'not good enough'. What do you do?",
    options: [{ text: "Sit down with them and show them who you are", points: 30 }, { text: "Ask your partner to talk to their family", points: 20 }, { text: "Respect their opinion but stay true to your love", points: 25 }, { text: "Ignore it and hope it goes away", points: 10 }] },
  { emoji: "📱", situation: "You accidentally see a flirty text on your partner's phone. What happens next?",
    options: [{ text: "Calmly discuss it with them directly", points: 30 }, { text: "Snoop a bit more before confronting", points: 5 }, { text: "Trust them and pretend you didn't see it", points: 10 }, { text: "Confide in a friend for advice first", points: 15 }] },
  { emoji: "💰", situation: "Your partner wants to spend $500 on something you think is frivolous. How do you handle it?",
    options: [{ text: "Listen to why it matters to them first", points: 30 }, { text: "Suggest a compromise or waiting period", points: 25 }, { text: "Agree because they deserve happiness", points: 15 }, { text: "Say no firmly to what you see as waste", points: 10 }] },
  { emoji: "👶", situation: "Your partner wants kids, but you're not ready. This comes up unexpectedly on date night. What now?",
    options: [{ text: "Have an honest, calm conversation about timelines", points: 30 }, { text: "Dodge the topic and change the subject", points: 5 }, { text: "Tell them you need time to think about it", points: 20 }, { text: "Say yes just to make them happy", points: 10 }] },
  { emoji: "🎉", situation: "You forget your partner's birthday. What's the best recovery?",
    options: [{ text: "Plan an amazing surprise celebration that week", points: 30 }, { text: "Plan the most heartfelt apology + date", points: 25 }, { text: "Get an expensive gift and flowers", points: 15 }, { text: "Make up any excuse and move on", points: 0 }] },
  { emoji: "🚗", situation: "You're on a road trip and your partner wants to stop at every tourist trap. You're in a hurry. What do you do?",
    options: [{ text: "Embrace the detour - it's about the journey, not the destination", points: 30 }, { text: "Suggest a compromise - one planned stop", points: 25 }, { text: "Put on their favorite music and make it fun", points: 20 }, { text: "Keep driving and make up an excuse", points: 5 }] },
];

const PERSONALITIES = [
  { min: 0, title: "The Caretaker", emoji: "🌿", color: "from-green-500 to-emerald-500", desc: "You prioritize your partner's happiness above your own." },
  { min: 40, title: "The Romantic", emoji: "💕", color: "from-pink-500 to-rose-500", desc: "You lead with your heart and always choose love." },
  { min: 70, title: "The Partner", emoji: "💪", color: "from-blue-500 to-cyan-500", desc: "You balance love with logic. A true equal partner." },
  { min: 100, title: "The Dream Lover", emoji: "✨", color: "from-purple-500 to-pink-500", desc: "You're the total package - romantic, wise, and thoughtful." },
  { min: 150, title: "The Soulmate", emoji: "💖", color: "from-amber-500 to-red-500", desc: "You make every relationship feel like a fairy tale." },
];

export default function LoveScenarioPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [shuffled, setShuffled] = useState<Scenario[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startGame = () => {
    const s = [...SCENARIOS].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setScore(0);
    setGameState('playing');
  };

  const selectAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const pts = shuffled[current].options[idx].points;
    setScore(s => s + pts);
    setAnswers(a => [...a, idx]);

    setTimeout(() => {
      if (current < shuffled.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
      } else {
        setGameState('result');
      }
    }, 1200);
  };

  const getPersonality = () => {
    const sorted = [...PERSONALITIES].reverse();
    return sorted.find(p => score >= p.min) || PERSONALITIES[0];
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
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-gray-700">Love Scenario</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🧠</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Scenario</h1>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Test your relationship wisdom! Choose the best response to each scenario and discover your love personality.</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> How It Works</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🧠 8 romantic scenarios to analyze</li>
                  <li>🎯 Choose the best response from 4 options</li>
                  <li>⭐ Each answer scores differently</li>
                  <li>💖 Discover your unique love personality</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {gameState === 'playing' && shuffled[current] && (
              <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">Scenario {current + 1}/{shuffled.length}</span>
                  <span className="text-sm text-gray-500 font-medium">Score: {score}</span>
                </div>
                <div className="w-full h-3 bg-white/50 rounded-full mb-8 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${((current + 1) / shuffled.length) * 100}%` }} />
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6 text-center">
                  <div className="text-5xl mb-4">{shuffled[current].emoji}</div>
                  <p className="text-lg font-bold text-gray-900 leading-relaxed">{shuffled[current].situation}</p>
                </div>

                <div className="space-y-3">
                  {shuffled[current].options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = selected !== null && i === selected && opt.points >= 25;
                    const isWrong = selected !== null && i === selected && opt.points < 25;
                    const isPast = selected !== null;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => selectAnswer(i)}
                        whileHover={{ scale: isPast ? 1 : 1.01 }}
                        disabled={isPast}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-green-50 border-green-400' : isWrong ? 'bg-red-50 border-red-300' : isPast ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-white/70 border-gray-200 hover:border-pink-300 hover:bg-white cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-green-500 text-white' : isWrong ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className={`font-medium ${isCorrect ? 'text-green-800' : isWrong ? 'text-red-700' : 'text-gray-700'}`}>{opt.text}</span>
                          {isCorrect && <Star className="w-4 h-4 text-yellow-500 ml-auto" fill="currentColor" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gameState === 'result' && (() => {
            const personality = getPersonality();
            return (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="text-7xl mb-4">{personality.emoji}</div>
                <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Your Love Personality</h2>
                <div className={`bg-gradient-to-br ${personality.color} rounded-[2rem] shadow-2xl p-8 mb-6 text-white`}>
                  <h3 className="text-3xl font-black mb-2">{personality.title}</h3>
                  <p className="text-white/80 text-lg">{personality.desc}</p>
                </div>
                <p className="text-5xl font-black gradient-text mb-8">{score}/{Math.max(...SCENARIOS.map(s => Math.max(...s.options.map(o => o.points))))} pts</p>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Your Answers</h3>
                  {shuffled.map((scen, i) => {
                    const chosenIdx = answers[i] ?? 0;
                    const chosen = scen.options[chosenIdx];
                    return (
                      <div key={i} className="flex items-start gap-3 mb-3 p-3 bg-white/50 rounded-xl">
                        <span className="text-2xl">{scen.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{scen.situation}</p>
                          <p className="text-xs text-gray-500 mt-1">Your answer: {chosen.text}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-600">+{chosen.points}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 justify-center">
                  <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition"><RotateCcw className="w-5 h-5 inline mr-2" /> Play Again</button>
                  <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl text-white font-bold">More Games</Link>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </PremiumBackground>
  );
}