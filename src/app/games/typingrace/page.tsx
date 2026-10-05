'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';
import { supabase } from '@/lib/supabase';

const QUOTES = [
  "You are my today and all of my tomorrows.",
  "I love you more than yesterday but less than tomorrow.",
  "You are the finest, loveliest, tenderest, and most beautiful person I have ever known.",
  "I have found the one whom my soul loves.",
  "If I know what love is, it is because of you.",
  "The best thing to hold onto in life is each other.",
  "You are my heart, my life, my one and only thought.",
  "In all the world, there is no heart for me like yours.",
  "Love is composed of a single soul inhabiting two bodies.",
  "To the world you may be one person, but to me you are the world.",
  "Every love story is beautiful, but ours is my favorite.",
  "You are the answer to every prayer I've ever prayed.",
  "If you live to be a hundred, I want to live to be a hundred minus one day so I never live without you.",
  "I would rather spend one lifetime with you than face all the ages of this world alone.",
  "My love for you has no depth, its boundaries are ever expanding.",
  "You are the source of my joy, the center of my world, and the whole of my heart.",
  "When I saw you I fell in love, and you smiled because you knew.",
  "The greatest thing you'll ever learn is to love and be loved in return.",
  "You are every reason, every hope, and every dream I have ever had.",
  "Whatever our souls are made of, his and mine are the same.",
  "I carry your heart with me, I carry it in my heart.",
  "Love is friendship that has caught fire.",
  "Because of you, I laugh a little harder, cry a little less, and smile a lot more.",
  "If I could give you one thing in life, I would give you the ability to see yourself through my eyes.",
  "You don't love someone for their looks or their clothes or their fancy car, but because they sing a song only you can hear.",
  "I love you, not only for what you are, but for what I am when I am with you.",
  "You are my sunshine on cloudy days, my umbrella in the rain, my calm in the storm.",
  "If I had to choose between breathing and loving you, I would use my last breath to say I love you.",
  "You are the poem I never knew how to write and this life is the story I never knew how to live.",
  "With you, I am home.",
];

export default function TypingRacePage() {
  const [quote, setQuote] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'typingrace',
      players: [session.user.id],
      game_state: { quote: '', wpm: 0 },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  useEffect(() => {
    createSession();
  }, []);

  const newQuote = useCallback(() => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
    setTyped('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(0);
    setFinished(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    newQuote();
  }, [newQuote]);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/typingrace?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const value = e.target.value;
    setTyped(value);

    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }

    if (value === quote) {
      const end = Date.now();
      setEndTime(end);
      const minutes = (end - (startTime || end)) / 60000;
      const wordCount = quote.split(' ').length;
      const calcWpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;
      setWpm(calcWpm);

      let correct = 0;
      for (let i = 0; i < quote.length; i++) {
        if (quote[i] === value[i]) correct++;
      }
      const acc = Math.round((correct / quote.length) * 100);
      setAccuracy(acc);
      setFinished(true);
    }
  };

  const getCharClass = (index: number) => {
    if (index >= typed.length) return 'text-gray-300';
    return typed[index] === quote[index] ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getGrade = (w: number) => {
    if (w >= 70) return { grade: 'S+', msg: 'Lightning typer! ⚡', color: 'text-yellow-500' };
    if (w >= 55) return { grade: 'A', msg: 'Amazing speed! 🔥', color: 'text-primary-600' };
    if (w >= 45) return { grade: 'B', msg: 'Great typing! 💕', color: 'text-green-600' };
    if (w >= 30) return { grade: 'C', msg: 'Good job! 💛', color: 'text-blue-600' };
    if (w >= 20) return { grade: 'D', msg: 'Keep practicing! 💪', color: 'text-orange-600' };
    return { grade: 'F', msg: 'Take your time! 💙', color: 'text-gray-600' };
  };

  const grade = finished ? getGrade(wpm) : null;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Typing Race
            </h1>
            <div className="w-10" />
          </div>

          {/* Invite Button */}
          <div className="flex justify-center mb-4">
            <Button onClick={copyInvite} variant="outline" size="sm">
              {inviteCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friend
                </>
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
                    <p className="text-center text-sm font-medium text-gray-500 mb-4">
                      Type the quote below as fast as you can!
                    </p>

                    {/* Quote Display */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 border-2 border-gray-100">
                      <p className="text-xl md:text-2xl leading-relaxed font-mono tracking-wide">
                        {quote.split('').map((char, i) => (
                          <span key={i} className={getCharClass(i)}>
                            {char}
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={typed}
                      onChange={handleType}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="opacity-0 absolute"
                    />

                    {/* Visual input mimic */}
                    <div
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 text-lg"
                      onClick={() => inputRef.current?.focus()}
                    >
                      {typed || <span className="text-gray-400">Click here and start typing...</span>}
                      <span className="animate-pulse">|</span>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-3">
                      Tip: Click above or press any key to start
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h2 className="text-3xl font-display font-bold gradient-text mb-4">Race Complete!</h2>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-primary-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-500">WPM</p>
                        <p className="text-3xl font-black text-primary-600">{wpm}</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-500">Accuracy</p>
                        <p className="text-3xl font-black text-green-600">{accuracy}%</p>
                      </div>
                      <div className="bg-yellow-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className={`text-3xl font-black ${grade?.color}`}>{grade?.grade}</p>
                      </div>
                    </div>

                    <p className="text-xl text-gray-700 mb-6">
                      {grade?.msg}
                    </p>

                    <div className="flex gap-3">
                      <Button onClick={newQuote} variant="primary" className="flex-1">
                        Race Again 🚀
                      </Button>
                      <Link href="/games" className="flex-1">
                        <Button variant="outline" className="w-full">Back to Games</Button>
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            <GameSharePanel gameSlug="typingrace" />
      </PremiumBackground>
  );
}
