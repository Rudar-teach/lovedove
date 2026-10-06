'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Activity } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const QUESTIONS = [
  { q: "What's your partner's favorite color?", points: 10 },
  { q: "What's your favorite shared memory?", points: 10 },
  { q: "What does your partner want for dinner tonight?", points: 15 },
  { q: "What's your partner's biggest fear?", points: 15 },
  { q: "Where was your first date?", points: 10 },
  { q: "What's your partner's love language?", points: 10 },
  { q: "What's your partner's favorite song?", points: 10 },
  { q: "What's a dream vacation together?", points: 15 },
  { q: "What's your partner's morning routine?", points: 10 },
  { q: "What makes your partner feel loved?", points: 15 },
  { q: "What's your partner's biggest pet peeve?", points: 15 },
  { q: "What's your favorite thing about your partner?", points: 10 },
];

export default function HeartMathPage() {
  const [phase, setPhase] = useState<'start' | 'p1' | 'p2' | 'result'>('start');
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p2Answers, setP2Answers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [p1Turn, setP1Turn] = useState(true);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setP1Score(0);
    setP2Score(0);
    setP1Answers([]);
    setP2Answers([]);
    setInput('');
    setFeedback('');
    setP1Turn(true);
    setTimer(15);
    setPhase('p1');
  };

  useEffect(() => {
    if (phase === 'start' || phase === 'result') return;
    timerRef.current = window.setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (phase === 'p1') {
            setP1Answers(a => [...a, 'timeout']);
            setP1Turn(false);
            setTimer(15);
            if (currentIdx + 1 >= questions.length) {
              setTimeout(() => { setPhase('p2'); setCurrentIdx(0); setInput(''); setFeedback(''); }, 1000);
            } else {
              setTimeout(() => { setCurrentIdx(i => i + 1); setInput(''); setFeedback(''); }, 1000);
            }
          } else {
            setP2Answers(a => [...a, 'timeout']);
            if (currentIdx + 1 >= questions.length) {
              setTimeout(() => setPhase('result'), 500);
            } else {
              setTimeout(() => { setCurrentIdx(i => i + 1); setInput(''); setFeedback(''); setTimer(15); }, 1000);
            }
          }
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentIdx, questions.length]);

  const submitAnswer = () => {
    if (!input.trim() || !questions[currentIdx]) return;
    const points = questions[currentIdx].points;
    if (p1Turn) {
      setP1Score(s => s + points);
      setP1Answers(a => [...a, input.trim()]);
      setFeedback(`+${points} points!`);
      setP1Turn(false);
      setTimer(15);
      if (currentIdx + 1 < questions.length) {
        setTimeout(() => { setCurrentIdx(i => i + 1); setInput(''); setFeedback(''); }, 1000);
      } else {
        setTimeout(() => { setPhase('p2'); setCurrentIdx(0); setInput(''); setFeedback(''); setP1Turn(false); setTimer(15); }, 1500);
      }
    } else {
      setP2Score(s => s + points);
      setP2Answers(a => [...a, input.trim()]);
      setFeedback(`+${points} points!`);
      if (currentIdx + 1 < questions.length) {
        setTimeout(() => { setCurrentIdx(i => i + 1); setInput(''); setFeedback(''); setTimer(15); }, 1000);
      } else {
        setTimeout(() => setPhase('result'), 1000);
      }
    }
    setInput('');
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Activity className="w-5 h-5 text-rose-500" /> Heart Math</h1>
            <div className="w-16" />
          </div>

          {phase === 'start' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">💓</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Heart Math</h2>
                  <p className="text-gray-600">Answer questions about your partner! Each answer scores points. Test how well you know each other!</p>
                  <div className="bg-pink-50 rounded-xl p-3 text-sm text-gray-600">
                    <p>Player 1 answers first, then Player 2. Same questions!</p>
                  </div>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Start 💓</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          {(phase === 'p1' || phase === 'p2') && questions[currentIdx] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">{p1Turn ? "💙 Player 1's Turn" : "💗 Player 2's Turn"}</span>
                <span className={`text-sm font-bold ${timer <= 5 ? 'text-rose-600' : 'text-gray-500'}`}>⏱️ {timer}s</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
              </div>

              <TiltCard intensity={4}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                  <p className="text-lg font-bold text-gray-800 mb-4 text-center">{questions[currentIdx].q}</p>
                  <p className="text-center text-sm text-pink-500 mb-4">Type your answer honestly! ({questions[currentIdx].points} pts)</p>
                  <div className="flex gap-3">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitAnswer()} autoFocus placeholder="Your answer..."
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-primary-400 outline-none text-center text-lg font-bold" />
                    <Button onClick={submitAnswer} variant="primary" disabled={!input.trim()}>Submit</Button>
                  </div>
                  {feedback && <p className="text-center text-lg font-bold text-primary-600 mt-3">{feedback}</p>}
                </div>
              </TiltCard>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <TiltCard intensity={5}>
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                  <div className="text-6xl">💓</div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Heart Math Results!</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4"><p className="text-blue-500 font-medium">💙 Player 1</p><p className="text-3xl font-black">{p1Score} pts</p></div>
                    <div className="bg-rose-50 rounded-xl p-4"><p className="text-rose-500 font-medium">💗 Player 2</p><p className="text-3xl font-black">{p2Score} pts</p></div>
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    {p1Score > p2Score ? '💙 Player 1 knows their partner better!' : p2Score > p1Score ? '💗 Player 2 knows their partner better!' : '🤝 Perfect match!'}
                  </p>
                  <Button onClick={startGame} variant="primary" size="lg" className="w-full">Play Again 💓</Button>
                </div>
              </TiltCard>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <Link href="/games"><Button variant="outline">← Back to Games</Button></Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
