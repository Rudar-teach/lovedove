'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Music } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const SONGS = [
  { song: "I Will Always Love You", artist: "Whitney Houston", options: ["Whitney Houston", "Mariah Carey", "Celine Dion", "Aretha Franklin"], hint: "From The Bodyguard soundtrack" },
  { song: "My Heart Will Go On", artist: "Celine Dion", options: ["Celine Dion", "Adele", "Shakira", "Leona Lewis"], hint: "From Titanic" },
  { song: "Thinking Out Loud", artist: "Ed Sheeran", options: ["Ed Sheeran", "John Legend", "Sam Smith", "James Arthur"], hint: "Sheeran hit from 2014" },
  { song: "All of Me", artist: "John Legend", options: ["John Legend", "Ed Sheeran", "Bruno Mars", "Justin Timberlake"], hint: "Written for his wife Chrissy Teigen" },
  { song: "Perfect", artist: "Ed Sheeran", options: ["Ed Sheeran", "Shawn Mendes", "Maroon 5", "Charlie Puth"], hint: "From the album Divide" },
  { song: "A Thousand Years", artist: "Christina Perri", options: ["Christina Perri", "Adele", "Alicia Keys", "Katy Perry"], hint: "From Twilight Breaking Dawn" },
  { song: "At Last", artist: "Etta James", options: ["Etta James", "Diana Ross", "Nina Simone", "Billie Holiday"], hint: "Classic love song from 1960" },
  { song: "Can't Help Falling in Love", artist: "Elvis Presley", options: ["Elvis Presley", "Frank Sinatra", "Nat King Cole", "Dean Martin"], hint: "The King of Rock" },
];

export default function CoupleMusicQuiz() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [questions, setQuestions] = useState<typeof SONGS>([]);

  useEffect(() => {
    setQuestions([...SONGS].sort(() => Math.random() - 0.5).slice(0, 6));
  }, []);

  const start = () => {
    setGameState('playing');
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setShowHint(false);
    setQuestions([...SONGS].sort(() => Math.random() - 0.5).slice(0, 6));
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === questions[current].artist) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setShowHint(false);
      } else {
        setGameState('finished');
      }
    }, 1200);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">🎵</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Music Quiz</h1>
              <p className="text-gray-600 mb-8 text-lg">Guess the artist of famous love songs!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-blue-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-blue-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🎵 Read the song title</li>
                  <li>🎤 Guess the artist</li>
                  <li>💡 Use hints when stuck</li>
                  <li>⭐ Prove your music knowledge!</li>
                </ul>
              </div>
              <button onClick={start} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && questions[current] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Q {current + 1}/{questions.length}</span>
                <span className="text-sm font-medium text-blue-600 font-bold">Score: {score}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-blue-100/60 p-6 sm:p-8 mb-6">
                <div className="text-4xl text-center mb-4">🎵</div>
                <p className="text-sm text-gray-500 text-center mb-2">Who sang this love song?</p>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">"{questions[current].song}"</h2>
                {showHint && <p className="text-sm text-blue-600 text-center mt-3">Hint: {questions[current].hint}</p>}
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-blue-100/60 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questions[current].options.map((option, i) => {
                    const isCorrect = option === questions[current].artist;
                    const isSelected = selected === option;
                    let btnClass = 'bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700';
                    if (answered) {
                      if (isCorrect) btnClass = 'bg-green-500 border-2 border-green-500 text-white';
                      else if (isSelected && !isCorrect) btnClass = 'bg-red-500 border-2 border-red-500 text-white';
                      else btnClass = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(option)} disabled={answered}
                        className={`p-4 rounded-2xl font-semibold text-sm transition-all ${btnClass}`}>
                        {option}
                      </button>
                    );
                  })}
                </div>
                {!answered && !showHint && (
                  <button onClick={() => setShowHint(true)} className="w-full mt-3 py-2 text-sm text-blue-600 font-medium hover:underline">
                    💡 Need a hint?
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🎵</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-5xl font-black gradient-text mb-2">{score}/{questions.length}</p>
              <p className="text-gray-600 mb-8">
                {score === questions.length ? "Music expert! 🎶" : score >= questions.length / 2 ? "Not bad! 🎵" : "Time to update your playlist! 🎧"}
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={start} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 shadow-lg">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white font-bold shadow-lg">
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
