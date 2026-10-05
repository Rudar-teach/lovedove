'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: "What's your partner's favorite love song?", options: ["I have no idea", "I know one or two", "I know their top 3", "I could sing it perfectly"], correct: 3 },
  { q: "How do you usually say 'I love you'?", options: ["I never say it", "Sometimes with gifts", "Words every day", "In a secret code only we know"], correct: 2 },
  { q: "What was your first date location?", options: ["Don't remember", "Sort of remember", "I remember perfectly", "It was magical and I remember every detail"], correct: 3 },
  { q: "How many times have you said 'I love you' today?", options: ["Zero!", "Once or twice", "Many times!", "I've lost count (but it's a lot)"], correct: 2 },
  { q: "What's your partner's love language?", options: ["Quality Time", "Words of Affirmation", "Physical Touch", "I know ALL of them!"], correct: 3 },
  { q: "Your ideal date night is...", options: ["Netflix & chill", "A fancy dinner", "An adventure!", "Whatever makes them happy"], correct: 3 },
  { q: "How do you show you care when they're sad?", options: ["Give them space", "Buy them snacks", "Hug them tight", "Listen and be present"], correct: 3 },
  { q: "What's the most romantic thing you've done?", options: ["Sent a sweet text", "Planned a surprise date", "Written a love letter", "I outdo myself every time!"], correct: 2 },
  { q: "How well do you know their coffee/tea order?", options: ["No clue", "I know if they like it", "I know exactly how they take it", "I make it for them every morning"], correct: 3 },
  { q: "What's your partner's biggest fear?", options: ["I don't know", "Spiders maybe?", "I have a rough idea", "I know and I help them face it"], correct: 3 },
  { q: "How do you celebrate anniversaries?", options: ["I forget them", "A simple card", "A big celebration!", "Every day feels like an anniversary"], correct: 2 },
  { q: "What makes your partner laugh the most?", options: ["I'm not sure", "My terrible jokes", "Inside jokes", "Just being myself"], correct: 2 },
  { q: "Your partner's favorite comfort food is...", options: ["Chocolate?", "Pizza for sure", "Whatever mom makes", "I cook it for them"], correct: 2 },
  { q: "How do you handle disagreements?", options: ["We argue", "I avoid conflict", "We talk it out calmly", "We fight... then make up passionately"], correct: 2 },
  { q: "What's your favorite thing about your partner?", options: ["They're nice", "Their smile", "Everything about them", "How they make me feel"], correct: 2 },
  { q: "How many selfies do you have together?", options: ["None, we're not that couple", "A few", "Hundreds!", "Thousands - we have a shared album"], correct: 2 },
  { q: "Your partner's dream vacation?", options: ["Beach for sure", "A city adventure", "A cozy cabin", "I planned it already!"], correct: 3 },
  { q: "How do you say goodnight?", options: ["Text 'gn'", "A quick hug", "A long goodnight kiss", "A full bedtime routine + cuddles"], correct: 2 },
  { q: "What gift would make them happiest?", options: ["Something expensive", "Something handmade", "Something from the heart", "My time and attention"], correct: 2 },
  { q: "How many inside jokes do you share?", options: ["A couple", "A handful", "We have our own language", "Too many to count!"], correct: 2 },
  { q: "What's your partner's zodiac sign?", options: ["Not sure", "I know the sign", "I know their full chart", "I plan dates around it"], correct: 1 },
  { q: "When they're stressed, you...", options: ["Give advice", "Leave them alone", "Hold them close", "Handle their responsibilities"], correct: 2 },
  { q: "Your go-to couple activity?", options: ["Watching movies", "Going out to eat", "Creating memories", "Just being together"], correct: 2 },
  { q: "What's a small thing that makes them happy?", options: ["I don't know", "Flowers maybe?", "A thoughtful note", "My presence"], correct: 2 },
  { q: "How well do you communicate feelings?", options: ["Poorly", "Okay, I think", "Very well", "We read each other's minds"], correct: 2 },
  { q: "What was your first impression of them?", options: ["Don't remember", "They were cute", "They were special", "I knew they were the one"], correct: 2 },
  { q: "How do you handle long distance?", options: ["It's too hard", "We text occasionally", "Video calls every day", "We make every moment count"], correct: 2 },
  { q: "Your partner's biggest pet peeve?", options: ["No idea", "Chewing sounds?", "Being late", "I never do it!"], correct: 2 },
  { q: "What song reminds you of them?", options: ["None come to mind", "Our song", "Many songs!", "Every love song"], correct: 2 },
  { q: "How many times have you cried happy tears with them?", options: ["Never", "Once or twice", "Several times", "I'm crying just thinking about it"], correct: 2 },
  { q: "What's your favorite memory together?", options: ["Our first date", "A vacation", "A simple quiet moment", "Every moment with them"], correct: 2 },
  { q: "How do you show appreciation?", options: ["I say thanks", "I do nice things", "I say it often", "I show it in everything I do"], correct: 2 },
  { q: "What's your partner's favorite season?", options: ["Not sure", "Summer maybe?", "I know exactly", "We celebrate it together"], correct: 1 },
];

type Phase = 'start' | 'player1' | 'player2' | 'result';

export default function TriviaBattlePage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [currentQ, setCurrentQ] = useState(0);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [toast, setToast] = useState(false);

  const shuffleQuestions = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
  };

  const startGame = () => {
    shuffleQuestions();
    setScore1(0);
    setScore2(0);
    setCurrentQ(0);
    setPhase('player1');
    setSelected(null);
    setShowResult(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (showResult || !questions[currentQ]) return;
    setSelected(optionIndex);
    setShowResult(true);

    const correct = optionIndex === questions[currentQ].correct;

    if (phase === 'player1') {
      if (correct) setScore1(s => s + 1);
      setTimeout(() => {
        setSelected(null);
        setShowResult(false);
        setPhase('player2');
      }, 1500);
    } else {
      if (correct) setScore2(s => s + 1);
      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ(q => q + 1);
          setSelected(null);
          setShowResult(false);
        } else {
          setPhase('result');
        }
      }, 1500);
    }
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Trivia Battle
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Start Screen */}
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">🧠💕</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Couple Trivia Battle</h2>
                    <p className="text-gray-600 mb-2">Test how well you know love, relationships, and each other!</p>
                    <p className="text-sm text-gray-500 mb-6">8 questions each - let&apos;s see who knows more!</p>
                    <Button onClick={startGame} variant="primary" size="lg">Start Battle! ⚔️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {/* Questions */}
            {(phase === 'player1' || phase === 'player2') && questions[currentQ] && (
              <motion.div key={`q-${currentQ}-${phase}`} initial={{ opacity: 0, x: phase === 'player1' ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: phase === 'player1' ? -50 : 50 }}>
                {/* Progress */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    {phase === 'player1' ? "👤 Player 1's Turn" : "👤 Player 2's Turn"}
                  </span>
                  <span className="text-sm text-gray-500">Q {currentQ + 1}/{questions.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full" animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>

                {/* Score */}
                <div className="flex justify-center gap-6 mb-4">
                  <div className={`px-4 py-2 rounded-xl font-bold ${phase === 'player1' ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-400' : 'bg-gray-100 text-gray-600'}`}>
                    👤 P1: {score1}
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold ${phase === 'player2' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400' : 'bg-gray-100 text-gray-600'}`}>
                    👤 P2: {score2}
                  </div>
                </div>

                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-xl font-bold text-gray-800 mb-6 text-center">{questions[currentQ].q}</p>
                    <div className="space-y-3">
                      {questions[currentQ].options.map((opt, i) => {
                        const isCorrect = i === questions[currentQ].correct;
                        const isSelected = selected === i;
                        return (
                          <motion.button
                            key={i}
                            whileHover={!showResult ? { scale: 1.02, x: 4 } : {}}
                            whileTap={!showResult ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswer(i)}
                            disabled={showResult}
                            className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${
                              showResult && isCorrect ? 'bg-green-100 border-green-400 text-green-800' :
                              showResult && isSelected && !isCorrect ? 'bg-red-100 border-red-400 text-red-800' :
                              'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span>{opt}</span>
                              {showResult && isCorrect && <span className="ml-auto">✅</span>}
                              {showResult && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {/* Result */}
            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.15)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-6xl mb-4">
                      {score1 > score2 ? '🏆' : score2 > score1 ? '🎉' : '🤝'}
                    </p>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">
                      {score1 > score2 ? 'Player 1 Wins!' : score2 > score1 ? 'Player 2 Wins!' : "It's a Tie!"}
                    </h2>
                    <div className="flex justify-center gap-6 mb-6">
                      <div className={`text-center p-4 rounded-2xl ${score1 > score2 ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <p className="text-3xl font-black text-primary-600">{score1}</p>
                        <p className="text-sm text-gray-600">Player 1</p>
                      </div>
                      <div className={`text-center p-4 rounded-2xl ${score2 > score1 ? 'bg-rose-100' : 'bg-gray-100'}`}>
                        <p className="text-3xl font-black text-rose-600">{score2}</p>
                        <p className="text-sm text-gray-600">Player 2</p>
                      </div>
                    </div>
                    <Button onClick={startGame} variant="primary" size="lg">Play Again 🔄</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}