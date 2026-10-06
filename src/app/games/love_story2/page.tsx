'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const CHAPTERS = [
  { title: 'Once Upon a Time', desc: 'Write the opening of your love story...', wordCount: [20, 100] },
  { title: 'The Spark', desc: 'Describe the moment you knew this was special...', wordCount: [15, 80] },
  { title: 'The Adventure', desc: 'Tell about an unforgettable adventure together...', wordCount: [20, 100] },
  { title: 'The Challenge', desc: 'Write about a challenge you overcame together...', wordCount: [25, 120] },
  { title: 'The Promise', desc: 'Conclude with your promise to each other...', wordCount: [10, 60] },
];

const ADJECTIVES = ['beautiful', 'extraordinary', 'magical', 'endless', 'fierce', 'gentle', 'wild', 'timeless'];

export default function LoveStory2Page() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'writing' | 'finished'>('idle');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [chapters, setChapters] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [score, setScore] = useState(0);

  const start = () => {
    setChapterIndex(0);
    setChapters([]);
    setCurrent('');
    setScore(0);
    setState('writing');
  };

  const submitChapter = () => {
    const words = current.trim().split(/\s+/).filter(Boolean).length;
    let s = 0;
    if (words >= CHAPTERS[chapterIndex].wordCount[0]) s += 20;
    if (words >= CHAPTERS[chapterIndex].wordCount[1]) s += 30;
    if (ADJECTIVES.some((a) => current.toLowerCase().includes(a))) s += 15;
    setScore((sc) => sc + s);
    const updated = [...chapters, current];
    setChapters(updated);
    setCurrent('');
    if (chapterIndex + 1 >= CHAPTERS.length) setState('finished');
    else setChapterIndex((i) => i + 1);
  };

  const currentChapter = CHAPTERS[chapterIndex];

  return (
    <PremiumBackground>
      <div className="min-h-screen p-4 md:p-8">
        <button onClick={() => router.push('/games')} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={20} /> Back to Games
        </button>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mt-20">
            <BookOpen className="w-20 h-20 text-rose-300 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Love Story 2</h1>
            <p className="text-white/80 mb-8 text-lg">Write a 5-chapter love story together. Each chapter is a new page in your forever.</p>
            <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl font-semibold flex items-center gap-2 mx-auto">
              <Play size={20} /> Begin Story
            </button>
          </motion.div>
        )}

        {state === 'writing' && (
          <motion.div key={chapterIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 text-white">
              <span className="bg-white/10 px-4 py-2 rounded-full">Chapter {chapterIndex + 1}/{CHAPTERS.length}</span>
              <span className="bg-white/10 px-4 py-2 rounded-full">Score: {score}</span>
            </div>
            <div className="flex gap-1 mb-6">
              {CHAPTERS.map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i <= chapterIndex ? 'bg-gradient-to-r from-rose-400 to-purple-400' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-4 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">{currentChapter.title}</h2>
              <p className="text-white/70 italic mb-2">{currentChapter.desc}</p>
              <p className="text-white/50 text-xs">{currentChapter.wordCount[0]}-{currentChapter.wordCount[1]} words</p>
            </div>
            <textarea
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              rows={8}
              className="w-full bg-white/95 text-gray-800 rounded-3xl p-6 outline-none resize-none shadow-2xl"
              placeholder="Once upon a time..."
            />
            <div className="text-right text-white/60 text-sm mt-2">{current.trim().split(/\s+/).filter(Boolean).length} words</div>
            <button onClick={submitChapter} className="w-full mt-4 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl font-semibold">
              {chapterIndex + 1 >= CHAPTERS.length ? 'Complete Story ✨' : 'Save Chapter →'}
            </button>
          </motion.div>
        )}

        {state === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
            <Sparkles className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6 text-center">Your Love Story</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 border border-white/20">
              <div className="text-6xl font-bold text-rose-300 mb-2">{score}</div>
              <div className="text-white/80">Story Score</div>
            </div>
            <div className="space-y-6 mb-8">
              {chapters.map((ch, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="bg-white/95 text-gray-800 rounded-3xl p-6 shadow-2xl">
                  <h3 className="font-bold text-rose-600 text-lg mb-2">{CHAPTERS[i].title}</h3>
                  <p className="text-gray-700 leading-relaxed">{ch}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl flex items-center gap-2">
                <RotateCcw size={18} /> Write New Story
              </button>
              <Link href="/games" className="px-6 py-3 bg-white/20 text-white rounded-2xl">More Games</Link>
            </div>
          </motion.div>
        )}
      </div>
    </PremiumBackground>
  );
}