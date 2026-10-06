'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Play, RotateCcw, Trophy, Sparkles, Calendar, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Challenge {
  title: string;
  description: string;
  category: 'communication' | 'fun' | 'romance' | 'adventure';
  duration: string;
  emoji: string;
  points: number;
}

const CHALLENGES: Challenge[] = [
  { title: "The Gratitude Exchange", description: "Each of you writes 3 things you appreciate about the other. Then read them aloud eye-to-eye.", category: "communication", duration: "Daily", emoji: "💬", points: 15 },
  { title: "Flash Dance Party", description: "Put on your favorite upbeat song and dance together for the full 3 minutes. No self-consciousness allowed!", category: "fun", duration: "Daily", emoji: "💃", points: 10 },
  { title: "Sunset Watch", description: "Find the most beautiful spot in your home and sit together in silence for 10 minutes watching the sunset.", category: "romance", duration: "Daily", emoji: "🌅", points: 20 },
  { title: "Try Something New", description: "Do one thing today that neither of you has ever done before - it can be a recipe, a game, or a new way to say 'I love you'.", category: "adventure", duration: "Daily", emoji: "🌟", points: 25 },
  { title: "The Appreciation Call", description: "Call or text one person you both love (family/friend) and tell them why they matter.", category: "communication", duration: "Weekly", emoji: "📞", points: 20 },
  { title: "Date Night Remix", description: "Plan and execute a date night using only $20. Be creative!", category: "fun", duration: "Weekly", emoji: "💰", points: 30 },
  { title: "Love Letter Remix", description: "Write a love letter but in the style of your partner's favorite author, musician, or movie character.", category: "romance", duration: "Weekly", emoji: "✍️", points: 25 },
  { title: "Adventure Scouting", description: "Explore a new neighborhood, park, or cafe together that neither of you has visited.", category: "adventure", duration: "Weekly", emoji: "🗺️", points: 30 },
  { title: "Phone-Free Dinner", description: "Eat dinner together with no phones, TV, or distractions. Just conversation.", category: "communication", duration: "Daily", emoji: "📵", points: 15 },
  { title: "The Laughter Challenge", description: "Try to make each other laugh until you cry. First one to laugh loses! Winner picks the next activity.", category: "fun", duration: "Daily", emoji: "😂", points: 15 },
  { title: "Stargazing Date", description: "Lie outside together and find 3 constellations. Make up stories about them.", category: "romance", duration: "Weekly", emoji: "⭐", points: 25 },
  { title: "Surprise Adventure", description: "Plan a surprise mini-adventure for your partner - a walk, a detour, a small discovery.", category: "adventure", duration: "Weekly", emoji: "🎒", points: 30 },
  { title: "The Check-In", description: "Each answer 3 questions: 'How are you feeling?' 'What do you need from me?' 'What are you excited about?'", category: "communication", duration: "Daily", emoji: "✅", points: 15 },
  { title: "Cook Together", description: "Make a meal together from scratch. You both have to participate in every step!", category: "fun", duration: "Weekly", emoji: "👨‍🍳", points: 25 },
  { title: "Memory Lane", description: "Share your favorite memory of each other. Then recreate it together.", category: "romance", duration: "Weekly", emoji: "📸", points: 20 },
  { title: "Local Explorer", description: "Visit a local landmark or museum you've never been to. Take photos together!", category: "adventure", duration: "Weekly", emoji: "🏛️", points: 30 },
];

const CATEGORY_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  communication: { icon: "💬", label: "Communication", color: "from-blue-500 to-cyan-500" },
  fun: { icon: "🎉", label: "Fun", color: "from-green-500 to-emerald-500" },
  romance: { icon: "💕", label: "Romance", color: "from-pink-500 to-rose-500" },
  adventure: { icon: "🌟", label: "Adventure", color: "from-amber-500 to-orange-500" },
};

const WEEKLY_CHALLENGES = CHALLENGES.filter(c => c.duration === "Weekly");
const DAILY_CHALLENGES = CHALLENGES.filter(c => c.duration === "Daily");

export default function LoveChallenges() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'select' | 'active' | 'finished'>('idle');
  const [challengeType, setChallengeType] = useState<'daily' | 'weekly' | 'mixed'>('mixed');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [generated, setGenerated] = useState(false);

  const getRandomChallenges = () => {
    if (challengeType === 'daily') {
      const shuffled = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 5);
    } else if (challengeType === 'weekly') {
      return [...WEEKLY_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
      const mixed = [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 6);
      return mixed;
    }
  };

  const startGame = () => {
    const selected = getRandomChallenges();
    setChallenges(selected);
    setCurrentChallenge(selected[0]);
    setCompletedChallenges([]);
    setTotalScore(0);
    setDailyStreak(0);
    setGenerated(true);
    setGameState('active');
  };

  const completeChallenge = () => {
    if (!currentChallenge) return;
    const points = currentChallenge.points;
    setTotalScore(s => s + points);
    setDailyStreak(s => s + 1);
    setCompletedChallenges(c => [...c, currentChallenge!]);

    const remaining = challenges.filter(c => !completedChallenges.find(done => done.title === c.title));
    if (remaining.length > 1) {
      const nextIdx = remaining.findIndex(c => c.title !== currentChallenge!.title);
      if (nextIdx !== -1) {
        setCurrentChallenge(remaining[nextIdx]);
      }
    } else {
      setCurrentChallenge(null);
      setGameState('finished');
    }
  };

  const generateNew = () => {
    const selected = getRandomChallenges();
    setChallenges(selected);
    setCurrentChallenge(selected[0]);
    setCompletedChallenges([]);
    setTotalScore(0);
    setDailyStreak(0);
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-gray-700">Challenges</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Challenges</h1>
              <p className="text-gray-600 mb-8 text-lg">Daily & weekly challenges to grow your relationship together!</p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
                {Object.entries(CATEGORY_ICONS).map(([key, cat]) => (
                  <div key={key} className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-white text-center`}>
                    <span className="text-3xl block mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Challenge Types</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📅 <strong>Daily:</strong> Quick, meaningful tasks for every day</li>
                  <li>📆 <strong>Weekly:</strong> Deeper challenges for quality time</li>
                  <li>🎯 <strong>Mixed:</strong> A balanced blend of both</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {(['daily', 'weekly', 'mixed'] as const).map(type => (
                  <button key={type} onClick={() => { setChallengeType(type); setGameState('select'); }} className={`w-full py-4 rounded-2xl font-bold transition-all hover:scale-105 capitalize ${type === 'mixed' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl' : 'bg-white/70 text-gray-700 border border-pink-100'}`}>
                    {type === 'daily' ? `📅 Daily Challenges` : type === 'weekly' ? `📆 Weekly Challenges` : `🎯 Mixed (Recommended)`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'select' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-6xl mb-6">📋</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2 capitalize">{challengeType} Challenges</h2>
              <p className="text-gray-600 mb-8">Ready for your {challengeType} challenges?</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Play className="w-5 h-5 inline mr-2" /> Begin!
              </button>
            </motion.div>
          )}

          {gameState === 'active' && currentChallenge && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${CATEGORY_ICONS[currentChallenge.category].color} text-white`}>
                  {CATEGORY_ICONS[currentChallenge.category].icon} {CATEGORY_ICONS[currentChallenge.category].label}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700">{dailyStreak} 🔥 streak</span>
                </div>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(completedChallenges.length / challenges.length) * 100}%` }} />
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] shadow-2xl p-10 mb-6 text-white text-center">
                <div className="text-5xl mb-3">{currentChallenge.emoji}</div>
                <h3 className="text-2xl font-black mb-2">{currentChallenge.title}</h3>
                <p className="text-white/80 mb-3">{currentChallenge.description}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{currentChallenge.duration}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">+{currentChallenge.points} pts</span>
                </div>
              </div>

              <button onClick={completeChallenge} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-xl transition text-lg">
                Challenge Complete! +{currentChallenge.points} pts
              </button>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Challenges Complete!</h2>
              <p className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-8">{totalScore} points</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Progress
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_ICONS).map(([key, cat]) => {
                    const count = completedChallenges.filter(c => c.category === key).length;
                    return (
                      <div key={key} className="text-center">
                        <span className="text-2xl block">{cat.icon}</span>
                        <span className="text-2xl font-black text-gray-800">{count}</span>
                        <span className="text-xs text-gray-500 capitalize block">{key}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-3">Completed Challenges</h3>
                {completedChallenges.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-sm text-gray-600">{c.title}</span>
                    <span className="text-xs text-gray-400 ml-auto">+{c.points}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={generateNew} className="px-8 py-3 bg-white/70 rounded-2xl font-bold hover:bg-white transition">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> New Challenges
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-bold hover:shadow-xl transition">
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
