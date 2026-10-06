'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Trophy, Star, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const GOALS = [
  { title: 'Morning Routine Together', desc: 'Wake up early and make breakfast together', points: 20 },
  { title: 'Sunset Watch', desc: 'Watch a sunset from a beautiful spot', points: 15 },
  { title: 'Learn a Dance', desc: 'Learn salsa, tango, or ballroom dancing', points: 25 },
  { title: 'Garden Together', desc: 'Plant a garden with flowers and herbs', points: 20 },
  { title: 'Write a Song', desc: 'Write and record a love song together', points: 30 },
  { title: 'Cook World Cuisine', desc: 'Try cooking 5 cuisines from different countries', points: 20 },
  { title: 'Night Sky Camping', desc: 'Camp under the stars with no phones', points: 25 },
  { title: 'Volunteer Together', desc: 'Volunteer at an animal shelter', points: 20 },
  { title: 'Create Art', desc: 'Paint or draw a portrait of each other', points: 20 },
  { title: 'Fitness Challenge', desc: 'Complete a fitness challenge together', points: 15 },
  { title: 'Book Club', desc: 'Read and discuss a book together', points: 15 },
  { title: 'Photo Project', desc: 'Take one photo every day for a month', points: 25 },
  { title: 'Concert Together', desc: 'Go to a live concert of your favorite band', points: 20 },
  { title: 'Spa Day', desc: 'Have a spa day at home with massages', points: 15 },
  { title: 'Video Game Night', desc: 'Play co-op video games together', points: 10 },
  { title: 'Mountain Hike', desc: 'Hike a challenging mountain trail', points: 25 },
  { title: 'Language Learning', desc: 'Learn 100 phrases in a new language', points: 30 },
  { title: 'Baking Challenge', desc: 'Bake a wedding cake from scratch', points: 20 },
  { title: 'Pottery Class', desc: 'Make matching mugs in a pottery class', points: 20 },
  { title: 'Bucket List', desc: 'Create a shared bucket list together', points: 15 },
  { title: 'Sunrise Yoga', desc: 'Do yoga together at sunrise', points: 15 },
  { title: 'Board Game Master', desc: 'Beat 10 classic board games together', points: 15 },
  { title: 'Road Trip', desc: 'Plan a 3-day road trip with no itinerary', points: 30 },
  { title: 'Music Playlist', desc: 'Create a 100-song couple playlist', points: 15 },
];

const LEVELS = [
  { emoji: '🌱', label: 'Sprout', color: 'from-green-400 to-green-600' },
  { emoji: '🌸', label: 'Budding', color: 'from-pink-400 to-pink-600' },
  { emoji: '🌺', label: 'Blooming', color: 'from-rose-400 to-rose-600' },
  { emoji: '💐', label: 'Flourishing', color: 'from-purple-400 to-purple-600' },
  { emoji: '🏆', label: 'Thriving', color: 'from-yellow-400 to-orange-500' },
];

export default function CoupleGoals2Page() {
  const [state, setState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const b = localStorage.getItem('goals2_best');
    if (b) setBest(Number(b));
  }, []);

  const startGame = useCallback(() => {
    setSelectedGoals([]);
    setScore(0);
    setTimeLeft(45);
    setLevel(0);
    setStreak(0);
    setState('playing');
  }, []);

  const toggleGoal = (idx: number) => {
    if (state !== 'playing') return;
    const goal = GOALS[idx];
    if (selectedGoals.includes(idx)) {
      setSelectedGoals((s) => s.filter((i) => i !== idx));
      setScore((sc) => sc - goal.points);
      setStreak(0);
    } else {
      setSelectedGoals((s) => [...s, idx]);
      setScore((sc) => sc + goal.points);
      setStreak((st) => {
        const newStreak = st + 1;
        if (newStreak >= 5 && level < LEVELS.length - 1) {
          setLevel((l) => l + 1);
        }
        return newStreak;
      });
    }
  };

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      setState('finished');
      if (score > best) {
        setBest(score);
        localStorage.setItem('goals2_best', String(score));
      }
      return;
    }
    const t = setInterval(() => setTimeLeft((tt) => tt - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, state, score, best]);

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="text-pink-400" /> Couple Goals
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-white/60 text-xs uppercase">Score</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-xs uppercase">Level</div>
                <div className={`text-xl font-bold bg-gradient-to-r ${LEVELS[level].color} bg-clip-text text-transparent`}>
                  {LEVELS[level].emoji} {LEVELS[level].label}
                </div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Streak</div>
                <div className="text-xl font-bold text-yellow-300">{streak}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase">Time</div>
                <div className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <motion.div
                animate={{ width: `${Math.min(streak / 5 * 100, 100)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${LEVELS[level].color}`}
              />
            </div>

            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <Target className="text-pink-400 mx-auto mb-4" size={48} />
                <p className="text-white text-lg mb-2">Couple Goals Builder</p>
                <p className="text-white/60 text-sm mb-4">Pick goals to achieve together! Build streaks for levels!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Play size={20} /> Start
                </button>
              </motion.div>
            )}

            {state === 'playing' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {GOALS.map((goal, idx) => {
                  const isSelected = selectedGoals.includes(idx);
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => toggleGoal(idx)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-xl text-left transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className={`text-sm ${isSelected ? 'text-white/70' : 'text-white/40'}`}>
                            {goal.desc}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-pink-300'}`}>
                            +{goal.points}
                          </span>
                          {isSelected && <Star size={16} className="text-white" fill="white" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <AnimatePresence>
              {state === 'finished' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <Trophy className="text-yellow-400 mx-auto mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {score >= 300 ? '🏆 Goal Crush!' : score >= 150 ? '💖 Dreamers!' : '💕 Future Stars!'}
                    </h2>
                    <p className="text-white/70">
                      {selectedGoals.length} goals • Level {LEVELS[level].label}
                    </p>
                    <p className="text-white/70">
                      Score: <span className="text-pink-300 font-bold">{score}</span>
                    </p>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RotateCcw size={20} /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}