'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Trophy, Timer, MessageCircle, Gift } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface LoveLangQuestion {
  q: string;
  options: string[];
  languages: number[];
}

const QUESTIONS: LoveLangQuestion[] = [
  { q: 'When you feel down, what helps most?', options: ['A hug', 'Someone listening', 'A thoughtful gift', 'Quality time together'], languages: [4, 1, 3, 2] },
  { q: "What makes you feel most appreciated?", options: ['A sincere compliment', 'When someone helps without being asked', 'Receiving a surprise', 'Spending uninterrupted time together'], languages: [0, 2, 3, 4] },
  { q: 'How do you prefer to show love?', options: ['Say it out loud', 'Do helpful things', 'Give meaningful gifts', 'Be fully present with them'], languages: [0, 2, 3, 4] },
  { q: 'What makes you feel closest to your partner?', options: ['Holding hands or cuddling', 'Deep conversations', 'They bring me small surprises', 'We have date nights together'], languages: [4, 1, 3, 2] },
  { q: 'For your birthday, what would mean the most?', options: ['A heartfelt letter', 'They handle a chore for me', 'A thoughtful present', 'A planned day of activities'], languages: [0, 2, 3, 4] },
  { q: 'When your partner is stressed, what do you naturally do?', options: ['Tell them "I love you"', 'Make them dinner or run errands', 'Buy their favorite treat', 'Sit with them and listen'], languages: [0, 2, 3, 1] },
  { q: 'What makes you feel truly seen?', options: ['When they verbalize it', 'When they take action for me', 'When they bring me something meaningful', 'When they make time just for me'], languages: [0, 2, 3, 4] },
  { q: 'How do you reconnect after a fight?', options: ['Talk about feelings', 'Do something kind for them', 'Give a small gift or gesture', 'Spend quality time together'], languages: [1, 2, 3, 4] },
  { q: "Your partner's love language makes you feel...", options: ['Loved through words', 'Loved through actions', 'Loved through gifts', 'Loved through presence'], languages: [0, 2, 3, 4] },
  { q: 'What makes a moment truly romantic?', options: ['Hearing sweet words', 'Acts that show care', 'A meaningful surprise', 'Being fully together in the moment'], languages: [0, 2, 3, 4] },
];

type LoveLang = 'Words of Affirmation' | 'Physical Touch' | 'Acts of Service' | 'Quality Time' | 'Receiving Gifts';

const LOVE_LANGS: LoveLang[] = ['Words of Affirmation', 'Physical Touch', 'Acts of Service', 'Quality Time', 'Receiving Gifts'];

const LANG_EMOJI: Record<number, string> = [0, '💬', '🤗', '🎁', '⏳', '💝'];
const LANG_DESC: Record<string, string> = {
  'Words of Affirmation': 'You feel loved when you hear kind, affirming words from your partner. Compliments, encouragement, and verbal expressions mean the most.',
  'Physical Touch': 'You feel loved through physical closeness. Hugs, hand-holding, and affectionate touch speak louder than words.',
  'Acts of Service': 'You feel loved when your partner shows they care through helpful actions. It\'s the little things they do that matter most.',
  'Quality Time': 'You feel loved when your partner gives you their full, undivided attention. Being together is everything.',
  'Receiving Gifts': 'You feel loved through thoughtful, meaningful gifts. It\'s not about the price — it\'s about the thought behind it.',
};

export default function LoveLanguageTest() {
  const router = useRouter();
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [showNext, setShowNext] = useState(false);

  const startGame = () => {
    setCurrent(0);
    setSelected(null);
    setScores([0, 0, 0, 0, 0]);
    setShowNext(false);
    setPhase('playing');
  };

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setScores(s => {
      const ns = [...s];
      QUESTIONS[current].languages.forEach(lang => { ns[lang]++; });
      return ns;
    });
    setShowNext(true);
  };

  const next = () => {
    setSelected(null);
    setShowNext(false);
    if (current + 1 >= QUESTIONS.length) {
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const sorted = [...scores].map((s, i) => ({ score: s, lang: LOVE_LANGS[i], emoji: LANG_EMOJI[i] })).sort((a, b) => b.score - a.score);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const maxScore = Math.max(...scores);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-pink-500" /> Love Language Test
            </h1>
            <button onClick={copyLink} className="p-2 hover:bg-white rounded-full transition-colors">
              <Sparkles className="w-5 h-5 text-pink-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">💬💕</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Discover Your Love Language</h2>
                    <p className="text-gray-600">How do you give and receive love? Take this test to discover your primary love language!</p>
                    <p className="text-sm text-gray-500">10 questions • No time limit • 5 love languages</p>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {['💬 Words', '🤗 Touch', '🎁 Acts', '⏳ Time', '💝 Gifts'].map(l => (
                        <span key={l} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold">{l}</span>
                      ))}
                    </div>
                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Discover Now 💫</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playing' && QUESTIONS[current] && (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-full h-2 bg-pink-100 rounded-full mb-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-4 text-center">Question {current + 1} of {QUESTIONS.length}</p>

                <TiltCard intensity={4}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-lg font-bold text-center text-gray-800 mb-6">{QUESTIONS[current].q}</p>
                    <div className="space-y-3">
                      {QUESTIONS[current].options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={selected === null ? { scale: 1.02, x: 4 } : {}}
                          whileTap={selected === null ? { scale: 0.98 } : {}}
                          onClick={() => handlePick(i)}
                          disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${selected === i ? 'bg-pink-100 border-pink-400 text-pink-800' : 'bg-white border-gray-200 hover:border-pink-300'} ${selected !== null && selected !== i ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-sm font-bold text-pink-600">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {showNext && (
                      <Button onClick={next} variant="primary" className="w-full mt-4">
                        {current + 1 < QUESTIONS.length ? 'Next →' : 'See Results 💫'}
                      </Button>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={5}>
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">{top1.emoji}</div>
                    <h2 className="text-xl font-display font-black text-gray-800">Your Primary Love Language</h2>
                    <p className="text-3xl font-black gradient-text">{top1.lang}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{LANG_DESC[top1.lang]}</p>

                    <div className="bg-pink-50 rounded-xl p-3">
                      <p className="text-sm text-pink-700 font-medium">Second Language: {top2.emoji} {top2.lang}</p>
                      <p className="text-xs text-gray-500 mt-1">{LANG_DESC[top2.lang].substring(0, 80)}...</p>
                    </div>

                    <div className="space-y-2">
                      {LOVE_LANGS.map((lang, i) => {
                        const pct = maxScore > 0 ? Math.round((scores[i] / maxScore) * 100) : 0;
                        const emoji = LANG_EMOJI[i + 1] || '💬';
                        return (
                          <div key={lang}>
                            <div className="flex justify-between text-sm font-semibold mb-1">
                              <span>{emoji} {lang}</span>
                              <span className="text-gray-500">{scores[i]}/{maxScore}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }}
                                className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-500" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button onClick={startGame} variant="primary" size="lg" className="w-full">Discover Again 💫</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'start' && (
            <div className="text-center mt-6">
              <Link href="/games"><Button variant="ghost" size="sm">← Back to Games</Button></Link>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
