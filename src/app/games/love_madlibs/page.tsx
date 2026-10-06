'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

type BlankType = 'noun' | 'verb' | 'adjective' | 'name' | 'place' | 'food';

interface StoryTemplate {
  title: string;
  blanks: BlankType[];
  text: string;
  answers: string[];
}

const TEMPLATES: StoryTemplate[] = [
  {
    title: "Our Magical First Date",
    blanks: ['noun', 'place', 'adjective', 'food', 'verb', 'noun', 'name'],
    text: "On our first date, we went to the {0}. The {1} was so {2}! We ate {3} and I couldn't stop {4}ing. You gave me a {5} and I knew {6} was special.",
    answers: []
  },
  {
    title: "The Perfect Proposal",
    blanks: ['place', 'adjective', 'noun', 'verb', 'food', 'name', 'noun'],
    text: "It happened at the {0} under a {1} sky. I got down on one {2} and started to {3}. We celebrated with {4} and {5} said yes! The {6} was perfect.",
    answers: []
  },
  {
    title: "Our Dream Vacation",
    blanks: ['place', 'adjective', 'noun', 'food', 'verb', 'name', 'noun'],
    text: "We traveled to {0} and stayed in a {1} villa. We watched the {2} every evening. We ate delicious {3} and went {4}ing on the beach. {5} held my hand and it felt like a {6}.",
    answers: []
  },
  {
    title: "The Day We Met",
    blanks: ['place', 'adjective', 'noun', 'verb', 'food', 'name', 'noun'],
    text: "I first saw {0} at the {1}. You were wearing a {2} and {3}ing with your friends. I brought you a {4} and {5} smiled. That was the start of our {6}.",
    answers: []
  },
];

const PLACEHOLDER_TEXT: Record<BlankType, string> = {
  noun: 'a noun (e.g. ring, flower, puppy)',
  verb: 'a verb (e.g. dance, sing, fly)',
  adjective: 'an adjective (e.g. beautiful, magical)',
  name: "your partner's name",
  place: 'a place (e.g. Paris, beach, cafe)',
  food: 'a food (e.g. pizza, cake, pasta)',
};

export default function LoveMadlibs() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'filling' | 'story' | 'finished'>('idle');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [completedStories, setCompletedStories] = useState<{title: string; text: string}[]>([]);
  const [currentStory, setCurrentStory] = useState('');

  const startGame = () => {
    setTemplateIdx(0);
    setInputs([]);
    setCompletedStories([]);
    setGameState('filling');
  };

  const currentTemplate = TEMPLATES[templateIdx];

  const handleInput = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const buildStory = (): string => {
    let text = currentTemplate.text;
    let finalAnswers = [...inputs];
    for (let i = finalAnswers.length; i < currentTemplate.blanks.length; i++) {
      finalAnswers.push(`[???]`);
    }
    let result = text;
    finalAnswers.forEach((ans, i) => {
      result = result.replace(`{${i}}`, ans || `[???]`);
    });
    return result;
  };

  const submitStory = () => {
    const text = buildStory();
    setCurrentStory(text);
    setCompletedStories(prev => [...prev, { title: currentTemplate.title, text }]);
    setGameState('story');
  };

  const nextTemplate = () => {
    if (templateIdx < TEMPLATES.length - 1) {
      setTemplateIdx(i => i + 1);
      setInputs([]);
      setGameState('filling');
    } else {
      setGameState('finished');
    }
  };

  const allFilled = inputs.length >= currentTemplate.blanks.length && currentTemplate.blanks.every((_, i) => inputs[i]?.trim());

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">📝</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Love Mad Libs</h1>
              <p className="text-gray-600 mb-8 text-lg">Fill in the blanks and create your own hilarious love story!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Play className="w-5 h-5 inline mr-2" /> Start Writing</button>
            </motion.div>
          )}
          {gameState === 'filling' && currentTemplate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">Story {templateIdx + 1} of {TEMPLATES.length}: {currentTemplate.title}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${((templateIdx + 1) / TEMPLATES.length) * 100}%` }} />
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/60 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{currentTemplate.title}</h3>
                {currentTemplate.blanks.map((blank, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i + 1}. Enter {PLACEHOLDER_TEXT[blank]}:
                    </label>
                    <input
                      type="text"
                      value={inputs[i] || ''}
                      onChange={e => handleInput(i, e.target.value)}
                      placeholder={PLACEHOLDER_TEXT[blank]}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none bg-white/80"
                    />
                  </motion.div>
                ))}
                <button
                  onClick={submitStory}
                  disabled={!allFilled}
                  className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                >
                  Create My Story ✨
                </button>
              </div>
            </motion.div>
          )}
          {gameState === 'story' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-5xl mb-6">📖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{currentTemplate.title}</h3>
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2rem] shadow-2xl p-8 mb-8 text-white">
                <p className="text-xl leading-relaxed font-medium">{currentStory}</p>
              </div>
              <button onClick={nextTemplate} className="w-full px-6 py-4 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition-colors">
                {templateIdx < TEMPLATES.length - 1 ? 'Next Story →' : 'See All Stories 🏆'}
              </button>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Your Love Stories!</h2>
              <p className="text-gray-600 mb-8">You created {completedStories.length} stories!</p>
              <div className="space-y-4 mb-8 text-left">
                {completedStories.map((story, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-100/60">
                    <h3 className="font-bold text-amber-600 mb-2">{story.title}</h3>
                    <p className="text-sm text-gray-700">{story.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
