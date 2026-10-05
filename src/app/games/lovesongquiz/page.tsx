'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Zap, Star, Flame } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

type Song = {
  lyrics: string;
  title: string;
  artist: string;
  options: string[];
  answer: number;
  category: string;
  fact: string;
};

const SONGS: Song[] = [
  {
    title: 'Tum Hi Ho', artist: 'Arijit Singh',
    lyrics: 'Hum tere bin ab reh nahi sakte / Tere bina kya wajood mera',
    options: ['Tum Hi Ho', 'Ae Dil Hai Mushkil', 'Channa Mereya', 'Raabta'],
    answer: 0, category: 'Bollywood',
    fact: 'One of the most romantic Bollywood songs ever! Sung by Arijit Singh.',
  },
  {
    title: 'Perfect', artist: 'Ed Sheeran',
    lyrics: 'Baby, I\'m dancing in the dark / With you between my arms',
    options: ['Shape of You', 'Perfect', 'Thinking Out Loud', 'Photograph'],
    answer: 1, category: 'English',
    fact: 'Ed Sheeran wrote this for his wife Cherry Seaborn!',
  },
  {
    title: 'Kun Faya Kun', artist: 'A.R. Rahman',
    lyrics: 'Masti mein doobe jeevan apna / Paake aagosh tera',
    options: ['Khwaja Mere Khwaja', 'Kun Faya Kun', 'Maahi Ve', 'Saans'],
    answer: 1, category: 'Bollywood',
    fact: 'From the movie Rockstar, filmed at the Nizamuddin Dargah.',
  },
  {
    title: 'All of Me', artist: 'John Legend',
    lyrics: 'Love your curves and all your edges / All your perfect imperfections',
    options: ['All of Me', 'Ordinary People', 'Love Me Now', 'Green Light'],
    answer: 0, category: 'English',
    fact: 'Written by John Legend for his wife Chrissy Teigen!',
  },
  {
    title: 'Tujhe Dekha To', artist: 'Kumar Sanu',
    lyrics: 'Tujhe dekha to ye jaana sanam / Pyaar ho gaya',
    options: ['Tujhe Dekha To', 'Dil Hai Chhota Sa', 'Mehndi Laga Ke', 'Pehla Nasha'],
    answer: 0, category: 'Classic Bollywood',
    fact: 'From Dilwale Dulhania Le Jayenge - iconic 90s romance!',
  },
  {
    title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley',
    lyrics: 'Wise men say only fools rush in / But I can\'t help falling in love with you',
    options: ['Unchained Melody', 'Can\'t Help Falling in Love', 'At Last', 'Moon River'],
    answer: 1, category: 'Classic',
    fact: 'Based on a melody by Jean-Paul-Ercal called "Plaisir d\'amour".',
  },
  {
    title: 'Channa Mereya', artist: 'Arijit Singh',
    lyrics: 'Channa mereya mereya / Channa mereya mereya beliya',
    options: ['Channa Mereya', 'Ae Dil Hai Mushkil', 'Aashiq Banaya', 'Humnava'],
    answer: 0, category: 'Bollywood',
    fact: 'Pritam composed this and it became an instant breakup anthem!',
  },
  {
    title: 'Thinking Out Loud', artist: 'Ed Sheeran',
    lyrics: 'Take me into your loving arms / Kiss me under the light of a thousand stars',
    options: ['Photograph', 'Thinking Out Loud', 'I See Fire', 'Lego House'],
    answer: 1, category: 'English',
    fact: 'One of the most streamed love songs on Spotify!',
  },
  {
    title: 'Pehla Nasha', artist: 'Udit Narayan',
    lyrics: 'Pehla nasha pehla khumaar / Naya pyaar hai nabaar',
    options: ['Pehla Nasha', 'Dil Hai Chhota Sa', 'Do Pal Ka Jeena', 'Ae Zindagi'],
    answer: 0, category: 'Classic Bollywood',
    fact: 'From Jo Jeeta Wohi Sikandar - a nostalgic 90s classic!',
  },
  {
    title: 'At Last', artist: 'Etta James',
    lyrics: 'At last, my love has come along / My lonely days are over',
    options: ['At Last', 'Respect', 'I\'d Rather Go Blind', 'Tell Mama'],
    answer: 0, category: 'Classic',
    fact: 'Etta James recorded this in 1960. It\'s become the first dance classic!',
  },
  {
    title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh',
    lyrics: 'Ae dil hai mushkil jeena yahan / Zara haadsaa na le yahan',
    options: ['Ae Dil Hai Mushkil', 'Aashiq Banaya', 'Gerua', 'Janam Janam'],
    answer: 0, category: 'Bollywood',
    fact: 'Amitabh Bhattacharya wrote these relatable lyrics about unrequited love.',
  },
  {
    title: 'I Won\'t Give Up', artist: 'Jason Mraz',
    lyrics: 'When I look into your eyes / It\'s like watching the night sky',
    options: ['I\'m Yours', 'I Won\'t Give Up', 'Lucky', '93 Million Miles'],
    answer: 1, category: 'English',
    fact: 'Written about Jason Mraz\'s relationship with his wife!',
  },
];

type Category = 'all' | 'Bollywood' | 'English' | 'Classic';

export default function LoveSongQuizPage() {
  const [category, setCategory] = useState<Category>('all');
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [done, setDone] = useState(false);

  const startGame = (cat: Category) => {
    const pool = cat === 'all' ? SONGS : SONGS.filter(s => s.category === cat);
    setShuffledSongs(shuffleArray(pool).slice(0, 10));
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setDone(false);
    setShowResult(false);
    setShowFact(false);
  };

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const correct = idx === shuffledSongs[current].answer;
    if (correct) {
      const bonus = Math.min(streak * 5, 25);
      setScore(s => s + 10 + bonus);
      setStreak(s => { const ns = s + 1; setBestStreak(prev => Math.max(prev, ns)); return ns; });
    } else {
      setStreak(0);
    }
    setTimeout(() => setShowFact(true), 600);
  };

  const next = () => {
    setShowResult(false);
    setShowFact(false);
    setSelected(null);
    if (current + 1 >= shuffledSongs.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const shareLink = () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'Love Song Quiz', url: typeof window !== 'undefined' ? window.location.href : '' });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
    }
  };

  const progress = shuffledSongs.length > 0 ? ((current + (showResult ? 1 : 0)) / shuffledSongs.length) * 100 : 0;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" /> Love Song Quiz
            </h1>
            <div className="w-10" />
          </div>

          {!done && shuffledSongs.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-4">
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-6xl">🎵</span>
                  </motion.div>
                  <p className="text-gray-700 font-semibold">Guess the love song! 🎶</p>
                  <p className="text-sm text-gray-500">Read the lyrics and guess the song title!</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['all', 'Bollywood', 'English', 'Classic'] as Category[]).map(cat => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => startGame(cat)}
                        className="bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl py-2 font-bold text-sm shadow"
                      >
                        {cat === 'all' ? '🎵 All' : cat}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {!done && shuffledSongs.length > 0 && (
            <>
              <div className="flex justify-center gap-2 mb-3 text-sm font-bold flex-wrap">
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-primary-600 shadow border border-pink-100">
                  {current + 1}/{shuffledSongs.length}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-rose-600 shadow border border-pink-100">
                  Score: {score}
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-orange-600 shadow border border-pink-100">
                  🔥 {streak} streak
                </div>
              </div>

              <div className="mb-3 h-2 bg-pink-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>

              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 relative">
                  <div className="text-center mb-1">
                    <span className="inline-block bg-pink-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                      {shuffledSongs[current].category} 🎵
                    </span>
                  </div>

                  <motion.div
                    className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={current}
                  >
                    <p className="text-gray-700 text-center italic text-lg leading-relaxed">
                      "{shuffledSongs[current].lyrics}"
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence mode="wait">
                      {shuffledSongs[current].options.map((opt, i) => {
                        const isCorrect = i === shuffledSongs[current].answer;
                        const isSelected = selected === i;
                        let btnClass = 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-100 hover:border-primary-300';
                        if (showResult) {
                          if (isCorrect) btnClass = 'bg-green-100 border-green-400';
                          else if (isSelected && !isCorrect) btnClass = 'bg-red-100 border-red-400';
                        }
                        return (
                          <motion.button
                            key={i}
                            whileTap={{ scale: showResult ? 1 : 0.97 }}
                            onClick={() => handleAnswer(i)}
                            disabled={showResult}
                            className={`${btnClass} rounded-2xl p-3 text-left font-semibold text-gray-700 border-2 transition-colors flex items-center gap-2`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <span className="text-xl">{isCorrect && showResult ? '✅' : isSelected && !isCorrect ? '❌' : ['A','B','C','D'][i]}</span>
                            {opt}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showFact && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-yellow-50 rounded-xl p-3 border border-yellow-200 text-sm text-gray-600"
                      >
                        <span className="font-bold text-yellow-700">💡 Fun Fact:</span> {shuffledSongs[current].fact}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TiltCard>

              {showResult && (
                <div className="flex justify-center mt-3">
                  <Button onClick={next} variant="primary" size="sm">
                    {current + 1 >= shuffledSongs.length ? 'See Results' : 'Next →'}
                  </Button>
                </div>
              )}
            </>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <TiltCard>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                  <h2 className="text-3xl font-display font-black gradient-text-animated">Quiz Complete! 🎵</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Score</div>
                      <div className="text-3xl font-bold text-primary-600">{score}</div>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Best Streak</div>
                      <div className="text-3xl font-bold text-rose-600">🔥 {bestStreak}</div>
                    </div>
                  </div>
                  <p className="text-lg text-primary-600">
                    {score >= 100 ? 'Music Maestro! 🎶' : score >= 70 ? 'Melody Lover! 💕' : score >= 40 ? 'Romantic Heart! 💗' : 'Keep Listening! 🎵'}
                  </p>
                  <Button onClick={() => startGame('all')} variant="primary"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={shareLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}