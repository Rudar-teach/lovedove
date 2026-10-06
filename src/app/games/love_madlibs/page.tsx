'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, Wand2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

type MadLib = {
  title: string;
  emoji: string;
  template: string[];
  blanks: { wordType: string; label: string }[];
  answers: (string | number)[];
};

const MAD_LIBS: MadLib[] = [
  {
    title: 'Our Perfect Date',
    emoji: '💕',
    template: [
      'Last Saturday, we went on a {0} to {1}.',
      'I was wearing my favorite {2} and you looked absolutely {3}.',
      'We ate {4} at a {5} restaurant by the {6}.',
      'You held my hand and whispered {7} in my ear.',
      'It was the most {8} evening of my life!',
    ],
    blanks: [
      { wordType: 'noun', label: 'A place' },
      { wordType: 'place', label: 'A location' },
      { wordType: 'clothing', label: 'An outfit' },
      { wordType: 'adjective', label: 'An adjective' },
      { wordType: 'food', label: 'A food' },
      { wordType: 'adjective', label: 'Another adjective' },
      { wordType: 'nature', label: 'Nature word' },
      { wordType: 'romantic', label: 'A romantic phrase' },
      { wordType: 'adjective', label: 'One more adjective' },
    ],
    answers: [],
  },
  {
    title: 'Our Proposal',
    emoji: '💍',
    template: [
      'It was a {0} evening when I got down on one {1}.',
      'The {2} was shining above as I said, "Will you {3} me?"',
      'You cried {4} tears and whispered "Yes!"',
      'Our families cheered and the {5} rang out.',
      'That was the most {6} moment of my entire life.',
    ],
    blanks: [
      { wordType: 'adjective', label: 'An adjective' },
      { wordType: 'body', label: 'A body part' },
      { wordType: 'nature', label: 'Nature word' },
      { wordType: 'verb', label: 'A verb' },
      { wordType: 'emotion', label: 'Emotion' },
      { wordType: 'sound', label: 'A sound' },
      { wordType: 'adjective', label: 'An adjective' },
    ],
    answers: [],
  },
  {
    title: 'Our Wedding Vows',
    emoji: '💒',
    template: [
      'I promise to {0} you through sunshine and {1}.',
      'To laugh at your jokes, even the {2} ones.',
      'To share my {3} with you every single day.',
      'To be your {4} when you need me most.',
      'I love you more than {5}, and always will.',
    ],
    blanks: [
      { wordType: 'verb', label: 'A verb (support action)' },
      { wordType: 'weather', label: 'Weather word' },
      { wordType: 'adjective', label: 'An adjective' },
      { wordType: 'food', label: 'A food item' },
      { wordType: 'support', label: 'A supportive word' },
      { wordType: 'superlative', label: 'Something precious' },
    ],
    answers: [],
  },
];

const WORD_SUGGESTIONS: Record<string, string[]> = {
  noun: ['journey', 'adventure', 'picnic', 'hike', 'dance', 'walk'],
  place: ['the beach', 'the park', 'Paris', 'home', 'a rooftop', 'the mountains'],
  clothing: ['dress', 'suit', 'casual outfit', 'favorite jacket', 'sundress'],
  adjective: ['beautiful', 'gorgeous', 'wonderful', 'amazing', 'stunning', 'lovely'],
  food: ['pizza', 'sushi', 'pasta', 'ice cream', 'chocolate', 'steak'],
  nature: ['moon', 'stars', 'ocean', 'sunset', 'river', 'trees'],
  romantic: ['"I love you"', '"You\'re perfect"', '"Forever yours"', '"My heart is yours"'],
  body: ['knee', 'foot', 'hand'],
  verb: ['marry', 'love', 'cherish', 'adore', 'choose'],
  emotion: ['happy', 'joyful', 'overwhelmed', 'ecstatic'],
  sound: ['bells', 'applause', 'cheers', 'music'],
  weather: ['rain', 'snow', 'storms', 'winds'],
  superlative: ['chocolate', 'starlight', 'paradise', 'the ocean', 'infinity'],
  support: ['rock', 'shoulder', 'strength', 'comfort'],
};

export default function LoveMadLibsPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [madLibIdx, setMadLibIdx] = useState(0);
  const [blankIdx, setBlankIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);

  const startGame = () => {
    setMadLibIdx(0);
    setBlankIdx(0);
    setAnswers([]);
    setScore(0);
    setInputVal('');
    setPhase('playing');
  };

  const current = MAD_LIBS[madLibIdx];
  const totalBlanks = current ? current.blanks.length : 0;
  const currentBlank = current ? current.blanks[blankIdx] : null;

  const submitAnswer = () => {
    if (!inputVal.trim()) return;
    const newAnswers = [...answers, inputVal.trim()];
    setAnswers(newAnswers);
    setScore(s => s + 10);
    setInputVal('');
    if (blankIdx < totalBlanks - 1) {
      setBlankIdx(b => b + 1);
    } else {
      setTimeout(() => {
        if (madLibIdx < MAD_LIBS.length - 1) {
          setMadLibIdx(i => i + 1);
          setBlankIdx(0);
          setAnswers([]);
          setScore(s => s + 25);
        } else {
          setScore(s => s + 50);
          setPhase('finished');
        }
      }, 800);
    }
  };

  const getFilledStory = () => {
    if (!current) return [];
    return current.template.map((line, i) => {
      let filled = line;
      answers.forEach((ans, ai) => {
        filled = filled.replace(`{${ai}}`, String(ans));
      });
      return filled;
    });
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/games" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>

          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Love Mad Libs</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Fill in the blanks to create hilarious romantic stories! The sillier, the better.</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Stories</h3>
                  <div className="space-y-2">
                    {MAD_LIBS.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 bg-rose-50 p-2 rounded-lg">
                        <span className="text-xl">{m.emoji}</span>
                        <span className="font-medium text-rose-700">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Mad Libs
                </button>
              </motion.div>
            )}

            {phase === 'playing' && current && (
              <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="flex justify-between items-center mb-4 bg-white/80 rounded-xl p-3 shadow flex-wrap gap-2">
                  <span className="text-rose-700 font-semibold">{current.emoji} {current.title}</span>
                  <span className="text-pink-600 font-semibold">⭐ {score} pts</span>
                  <span className="text-rose-600 font-semibold">{blankIdx + 1}/{totalBlanks}</span>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg text-rose-700 mb-1">Fill in the blank:</h3>
                    <p className="text-2xl font-bold text-rose-700">a {currentBlank?.label || 'word'}</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); submitAnswer(); }} className="flex justify-center gap-2 mb-4">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder={`Enter a ${currentBlank?.wordType || 'word'}...`}
                      className="border-2 border-rose-200 rounded-full px-4 py-2 text-center focus:outline-none focus:border-rose-500 w-64"
                      autoFocus
                    />
                    <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-rose-600 transition">Next</button>
                  </form>

                  {WORD_SUGGESTIONS[currentBlank?.wordType || ''] && (
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {WORD_SUGGESTIONS[currentBlank!.wordType].map(s => (
                        <button key={s} onClick={() => setInputVal(s)} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs hover:bg-rose-200 transition">{s}</button>
                      ))}
                    </div>
                  )}
                </div>

                {answers.length > 0 && (
                  <div className="bg-pink-50 rounded-xl p-4 text-left max-w-md mx-auto">
                    <p className="text-sm text-pink-700 font-semibold mb-1">Story so far:</p>
                    {getFilledStory().slice(0, answers.length + 1).map((line, i) => (
                      <p key={i} className="text-sm text-pink-600 italic">{line}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <Wand2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-4">Your Love Stories</h2>
                <div className="text-left bg-rose-50 rounded-xl p-4 mb-4 max-h-80 overflow-y-auto">
                  {MAD_LIBS.map((m, mi) => {
                    const startIdx = MAD_LIBS.slice(0, mi).reduce((sum, ml) => sum + ml.blanks.length, 0);
                    const libAnswers = answers.slice(startIdx, startIdx + m.blanks.length);
                    const filled = m.template.map((line, li) => {
                      let l = line;
                      libAnswers.forEach((ans, ai) => { l = l.replace(`{${ai}}`, String(ans)); });
                      return l;
                    });
                    return (
                      <div key={mi} className="mb-3">
                        <p className="font-semibold text-rose-700">{m.emoji} {m.title}</p>
                        {filled.map((l, i) => (
                          <p key={i} className="text-sm text-pink-600 italic">{l}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link href="/games" className="bg-pink-100 text-rose-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-200 transition">More Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
