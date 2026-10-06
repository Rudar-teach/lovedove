'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Timer, Crown } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const RULES_QUESTIONS = [
  { id: 1, question: "If a stranger girl kissed your BF in public, what would you do?", scenario: "Public Kiss Scenario", icon: "💋" },
  { id: 2, question: "If your BF forgot your birthday completely, would you forgive him?", scenario: "Birthday Forgotten", icon: "🎂" },
  { id: 3, question: "Your BF likes another girl's Instagram photo from 2 years ago. Reaction?", scenario: "Instagram Issue", icon: "📱" },
  { id: 4, question: "If your BF chose his friends over your anniversary dinner, what do you do?", scenario: "Anniversary Conflict", icon: "🍽️" },
  { id: 5, question: "Your BF's ex messages him saying 'I miss you'. What's your move?", scenario: "Ex Message", icon: "💌" },
  { id: 6, question: "If your BF didn't reply to your texts for 6 hours, how do you react?", scenario: "No Reply", icon: "📵" },
  { id: 7, question: "Your BF wants to go on a trip with his boys and forgot to invite you.", scenario: "Trip Without You", icon: "✈️" },
  { id: 8, question: "Your BF commented '🔥' on a random girl's photo. Is that okay?", scenario: "Suspicious Comment", icon: "🔥" },
  { id: 9, question: "If your BF said 'You've gained weight' as a joke. Your response?", scenario: "Body Comment", icon: "💭" },
  { id: 10, question: "Your BF forgot your favorite food on your date night.", scenario: "Date Night Fail", icon: "🍕" },
  { id: 11, question: "If a girl flirts with your BF at a party, what do you do?", scenario: "Party Flirt", icon: "🎉" },
  { id: 12, question: "Your BF wants to watch a movie alone with a female friend. Okay?", scenario: "Movie Alone", icon: "🎬" },
  { id: 13, question: "Your BF calls you by his ex's name by mistake. Reaction?", scenario: "Wrong Name", icon: "😱" },
  { id: 14, question: "If your BF wants to add his ex on social media again.", scenario: "Adding Ex", icon: "➕" },
  { id: 15, question: "Your BF says 'I need space' for a week. What do you do?", scenario: "Needs Space", icon: "🚀" },
];

export default function GirlfriendRulesGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState<{ question: string; answer: string; scenario: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState<typeof RULES_QUESTIONS>([]);

  useEffect(() => {
    setQuestions([...RULES_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      if (currentAnswer.trim()) {
        saveAnswer(currentAnswer.trim());
      } else {
        saveAnswer('⏰ No answer!');
      }
    }
  }, [timeLeft, gameState, currentIndex]);

  const saveAnswer = (answer: string) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = { question: questions[currentIndex].question, answer, scenario: questions[currentIndex].scenario };
      return updated;
    });

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setCurrentAnswer('');
        setTimeLeft(15);
      } else {
        setGameState('finished');
      }
    }, 500);
  };

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    saveAnswer(currentAnswer.trim());
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setTimeLeft(15);
    setAnswers([]);
    setCurrentAnswer('');
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5).slice(0, 10));
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">👸</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Girlfriend Rules</h1>
              <p className="text-gray-600 mb-3 text-lg">How would you react in tricky situations?</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Crown className="w-5 h-5 text-pink-500" /> Rules:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>⏱️ <strong>15 seconds</strong> to answer each question</li>
                  <li>💭 Write your <strong>real reaction</strong></li>
                  <li>👀 Your BF will see all your answers!</li>
                  <li>💕 Be honest - this is about your boundaries</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={currentIndex}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Question {currentIndex + 1}/{questions.length}</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse text-lg' : 'bg-white/70 text-gray-700'}`}>
                  <Timer className="w-4 h-4" />
                  {timeLeft}s
                </div>
              </div>

              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8 mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-4">
                  {questions[currentIndex]?.scenario}
                </div>
                <div className="text-4xl mb-4 text-center">{questions[currentIndex]?.icon}</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center leading-relaxed">
                  {questions[currentIndex]?.question}
                </h2>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👸 Your answer (Be honest!):
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="What would you do..."
                  rows={3}
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none resize-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={startGame} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                    Restart
                  </button>
                  <button onClick={handleSubmit} disabled={!currentAnswer.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                    Submit Answer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">👸</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Rules Submitted!</h2>
              <p className="text-gray-600 mb-8">Your BF can now see all your answers!</p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Your Answers:</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {answers.map((ans, i) => (
                    <div key={i} className="bg-pink-50 rounded-2xl p-4">
                      <div className="text-xs font-semibold text-pink-600 mb-1">Q{i + 1}: {ans.scenario}</div>
                      <p className="text-sm text-gray-600 italic">"{ans.question}"</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">You: {ans.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white font-bold shadow-lg">
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
