'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Play, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

type Phase = 'idle' | 'playing' | 'finished';

interface StoryStep {
  id: number;
  prompt: string;
  context: string;
  input: string;
  placeholder: string;
}

interface CompletedStory {
  step: number;
  text: string;
}

const STORY_TEMPLATES: { title: string; emoji: string; steps: StoryStep[] }[] = [
  {
    title: 'Our First Encounter',
    emoji: '👀',
    steps: [
      { id: 1, prompt: 'Set the scene', context: 'It was a beautiful afternoon when we first locked eyes. The sky was...', input: '', placeholder: 'Describe the weather and atmosphere...' },
      { id: 2, prompt: 'The Moment', context: 'Then, something magical happened. They walked into the room and...', input: '', placeholder: 'What drew you to them?' },
      { id: 3, prompt: 'The Conversation', context: 'You approached each other and the conversation flowed. They said...', input: '', placeholder: 'What was the first thing they said?' },
      { id: 4, prompt: 'The Spark', context: 'Time seemed to slow down. You felt...', input: '', placeholder: 'How did your heart feel?' },
      { id: 5, prompt: 'The Ending', context: 'As the day ended, you both knew this was just the beginning of...', input: '', placeholder: 'Finish the story with your hopes...' },
    ],
  },
  {
    title: 'The Proposal',
    emoji: '💍',
    steps: [
      { id: 1, prompt: 'The Planning', context: 'I had been planning this for weeks. I chose...', input: '', placeholder: 'Where did you plan the proposal?' },
      { id: 2, prompt: 'The Setup', context: 'Everything was perfectly arranged. The venue was...', input: '', placeholder: 'Describe the perfect setting...' },
      { id: 3, prompt: 'The Words', context: 'I got down on one knee and said...', input: '', placeholder: 'Your heartfelt words...' },
      { id: 4, prompt: 'The Reaction', context: 'Their face lit up and they cried...', input: '', placeholder: 'Describe their beautiful reaction...' },
      { id: 5, prompt: 'The Future', context: 'Now as we plan our future together, we know that...', input: '', placeholder: 'Your dreams together...' },
    ],
  },
];

export default function CoupleStory2Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [storyIdx, setStoryIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState<StoryStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<CompletedStory[]>([]);
  const [score, setScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setPhase('finished');
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const startGame = () => {
    setStoryIdx(0);
    setStepIdx(0);
    setCompletedSteps([]);
    setScore(0);
    setTimeLeft(120);
    setTimerActive(true);
    setCurrentStep(STORY_TEMPLATES[0].steps[0]);
    setPhase('playing');
  };

  const currentStory = STORY_TEMPLATES[storyIdx];

  const submitStep = () => {
    if (!currentStep || !currentStep.input.trim()) return;
    const words = currentStep.input.trim().split(/\s+/);
    const pts = words.length * 2;
    setScore(s => s + pts);
    setWordCount(w => w + words.length);
    setCompletedSteps(cs => [...cs, { step: currentStep.id, text: currentStep.input }]);

    if (stepIdx < currentStory.steps.length - 1) {
      setStepIdx(i => i + 1);
      setCurrentStep(currentStory.steps[stepIdx + 1]);
    } else if (storyIdx < STORY_TEMPLATES.length - 1) {
      setStoryIdx(i => i + 1);
      setStepIdx(0);
      setCurrentStep(STORY_TEMPLATES[storyIdx + 1].steps[0]);
    } else {
      setTimerActive(false);
      setPhase('finished');
    }
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
                <div className="text-6xl mb-4">📖</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">Couple Story</h1>
                <p className="text-gray-700 mb-6 max-w-xl mx-auto">Write a romantic story together, one prompt at a time. Collaborate to create a beautiful love narrative!</p>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-xl mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-rose-700 mb-3">Stories</h3>
                  <div className="space-y-2">
                    {STORY_TEMPLATES.map((s, i) => (
                      <div key={i} className="bg-rose-50 p-3 rounded-lg text-left">
                        <span className="text-2xl mr-2">{s.emoji}</span>
                        <span className="font-medium text-rose-700">{s.title}</span>
                        <span className="text-xs text-gray-500 block">({s.steps.length} steps)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                  <Play className="w-5 h-5" /> Start Writing
                </button>
              </motion.div>
            )}

            {phase === 'playing' && currentStep && (
              <motion.div key={stepIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/90 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-4">
                  <span className="text-rose-500 text-sm">{currentStory.emoji} {currentStory.title} - Step {stepIdx + 1}/{currentStory.steps.length}</span>
                  <span className="text-pink-600 text-sm ml-4">⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                </div>
                <h3 className="text-xl font-bold text-rose-700 mb-4 text-center">{currentStep.prompt}</h3>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 mb-4 italic text-gray-700 text-center">
                  {currentStep.context}
                </div>
                <textarea
                  value={currentStep.input}
                  onChange={e => {
                    setCurrentStep({ ...currentStep, input: e.target.value });
                  }}
                  placeholder={currentStep.placeholder}
                  className="w-full p-4 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:outline-none min-h-[120px] resize-y"
                  autoFocus
                />
                <div className="text-xs text-gray-500 mt-1">{wordCount} words so far</div>
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={submitStep} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
                    ✍️ Add to Story
                  </button>
                </div>

                {completedSteps.length > 0 && (
                  <div className="mt-6 bg-rose-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-rose-700 mb-2">📜 Your Story So Far</h4>
                    {completedSteps.map(cs => (
                      <p key={cs.step} className="text-sm text-gray-700 mb-1">{cs.text}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'finished' && (
              <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-rose-700 mb-2">Story Complete!</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent my-4">{score}</div>
                <p className="text-xl text-pink-600 mb-2">{wordCount} words written</p>
                <p className="text-gray-700 mb-6">{score >= 100 ? 'Bestselling authors! 📚' : 'Beautiful story! 💖'}</p>
                <div className="bg-rose-50 rounded-xl p-4 mb-6 text-left max-w-lg mx-auto">
                  <h4 className="text-sm font-semibold text-rose-700 mb-2">📖 Complete Story</h4>
                  {completedSteps.map(cs => (
                    <p key={cs.step} className="text-sm text-gray-700 mb-1 italic">"{cs.text}"</p>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Write Again
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
