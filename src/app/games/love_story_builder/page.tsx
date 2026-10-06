'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const PARTS = [
  { name: 'The Meeting', emoji: '☕', questions: ['Where did you first see each other?', 'What were you wearing?', 'What was the first thing you noticed?'] },
  { name: 'First Date', emoji: '🍽️', questions: ['Where did you go?', 'What did you order?', 'What was the best moment?'] },
  { name: 'First Kiss', emoji: '💋', questions: ['Where did it happen?', 'What happened before?', 'How did it feel?'] },
  { name: 'Saying I Love You', emoji: '💬', questions: ['Who said it first?', 'Where were you?', 'What did they do after?'] },
  { name: 'Future Dreams', emoji: '🏡', questions: ['Where do you want to live?', 'What traditions will you start?', 'What is your biggest dream together?'] },
];

export default function LoveStoryBuilderPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'building' | 'finished'>('idle');
  const [partIndex, setPartIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: { question: string; answer: string; quality: number } }>({});
  const [score, setScore] = useState(0);

  const start = () => {
    setPartIndex(0);
    setAnswers({});
    setScore(0);
    setState('building');
  };

  const answerQ = (part: string, q: string, val: string) => {
    const key = `${part}-${q}`;
    setAnswers((a) => ({ ...a, [key]: { question: q, answer: val, quality: val.length > 30 ? 3 : val.length > 10 ? 2 : 1 } }));
  };

  const nextPart = () => {
    const part = PARTS[partIndex];
    let partScore = 0;
    part.questions.forEach((q) => {
      const key = `${part.name}-${q}`;
      if (answers[key]) partScore += answers[key].quality * 5;
    });
    setScore((s) => s + partScore);
    if (partIndex + 1 >= PARTS.length) setState('finished');
    else setPartIndex((i) => i + 1);
  };

  const current = PARTS[partIndex];
  const answeredCount = current.questions.filter((q) => answers[`${current.name}-${q}`]?.answer).length;

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <BookOpen className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Love Story Builder</h1>
            <p className="text-white/80 mb-8 text-lg">Construct your unique love story chapter by chapter. Every detail makes it more beautiful.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Start Writing
            </button>
          </motion.div>
        )}

        {state === 'building' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">{current.emoji} {current.name}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="flex gap-1 mb-6">
              {PARTS.map((p, i) => (
                <div key={p.name} className={`flex-1 h-2 rounded-full ${i < partIndex || answers[`${p.name}-${p.questions[0]}`] ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
              <div className="text-4xl mb-3 text-center">{current.emoji}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{current.name}</h2>
              <p className="text-white/70 text-center text-sm mb-4">{answeredCount}/{current.questions.length} answered</p>
            </div>
            <div className="bg-white/95 text-gray-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="font-bold text-indigo-600 mb-4 flex items-center gap-2"><BookOpen size={18} /> {current.name}</h3>
              <div className="space-y-4">
                {current.questions.map((q) => (
                  <div key={q}>
                    <label className="block text-gray-700 font-semibold text-sm mb-1">{q}</label>
                    <textarea
                      value={answers[`${current.name}-${q}`]?.answer || ''}
                      onChange={(e) => answerQ(current.name, q, e.target.value)}
                      rows={2}
                      className="w-full bg-indigo-50 rounded-xl px-4 py-3 outline-none resize-none text-sm"
                      placeholder="Write your answer..."
                    />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={nextPart} className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold">
              {partIndex + 1 >= PARTS.length ? 'Complete Story ✨' : 'Next Chapter →'}
            </button>
          </div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Story Complete!</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
              <div className="text-6xl font-bold text-indigo-300">{score}</div>
              <div className="text-white/80 mt-2">Story Score</div>
              <p className="mt-6 text-white/80 italic">"A love story is not written in ink, but in the moments you share."</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Rewrite Story
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}