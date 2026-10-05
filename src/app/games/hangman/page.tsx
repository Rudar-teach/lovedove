'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const WORDS: string[] = [
  'VALENTINE', 'CUPID', 'ROMANCE', 'SWEETHEART', 'DARLING', 'PASSION',
  'LOVEBIRD', 'ETERNITY', 'CHERISH', 'BLOSSOM', 'AMOUR', 'WEDDING',
  'KISSING', 'SOULMATE', 'COURTSHIP', 'BEAUTIFUL', 'HONEYMOON',
  'ENCHANTED', 'WHISPER', 'EMBRACE', 'DEVOTED', 'INFATUATED',
  'STARGAZER', 'MOONLIGHT', 'SUGARPLUM', 'AFFECTION', 'CARESS',
  'FOREVER', 'BELOVED', 'ADORABLE', 'TREASURE', 'TWINKLE',
  'WONDERFUL', 'ELEGANT', 'PASSIONATE', 'HARMONY', 'ROMANTIC',
  'KISSABLE', 'LOVELACE', 'BABYLON', 'CUPCAKE', 'DREAMER',
  'ENAMORED', 'FANTASIA', 'GENTLE', 'HEARTFELT', 'INNOCENT',
  'JASMINE', 'KINDRED', 'LOLLIPOP', 'MAGNOLIA', 'NIRVANA',
  'OVERTURE', 'PERFUME', 'QUICKSAND', 'RAINBOW', 'SERENADE',
];

const HANGMAN_STAGES = [
  // Stage 0: just the gallows
  { head: false, body: false, leftArm: false, rightArm: false, leftLeg: false, rightLeg: false },
  // Stage 1: head
  { head: true, body: false, leftArm: false, rightArm: false, leftLeg: false, rightLeg: false },
  // Stage 2: head + body
  { head: true, body: true, leftArm: false, rightArm: false, leftLeg: false, rightLeg: false },
  // Stage 3: head + body + left arm
  { head: true, body: true, leftArm: true, rightArm: false, leftLeg: false, rightLeg: false },
  // Stage 4: head + body + both arms
  { head: true, body: true, leftArm: true, rightArm: true, leftLeg: false, rightLeg: false },
  // Stage 5: head + body + both arms + left leg
  { head: true, body: true, leftArm: true, rightArm: true, leftLeg: true, rightLeg: false },
  // Stage 6: full hangman (game over)
  { head: true, body: true, leftArm: true, rightArm: true, leftLeg: true, rightLeg: true },
];

export default function HangmanPage() {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const createSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('game_sessions').insert({
      game_type: 'hangman',
      players: [session.user.id],
      game_state: { word: '', guessed: [] },
      status: 'active',
      current_turn: session.user.id,
    }).select('id').single();
    if (data) setSessionId(data.id);
  };

  const pickWord = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setGuessed(new Set());
    setWrongGuesses(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    createSession();
    pickWord();
  }, [pickWord]);

  const copyInvite = () => {
    const url = `${window.location.origin}/games/hangman?session=${sessionId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleGuess = (letter: string) => {
    if (status !== 'playing' || guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= HANGMAN_STAGES.length - 1) {
        setStatus('lost');
        saveGame(false);
      }
    } else {
      if (word.split('').every(l => newGuessed.has(l))) {
        setStatus('won');
        saveGame(true);
      }
    }
  };

  const saveGame = async (won: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !sessionId) return;
    await supabase.from('game_sessions').update({
      game_state: { word, guessed: Array.from(guessed) },
      status: 'completed',
      winner_id: won ? session.user.id : null,
    }).eq('id', sessionId);
  };

  const displayWord = word.split('').map(l => (guessed.has(l) ? l : '_')).join(' ');

  const stage = wrongGuesses >= HANGMAN_STAGES.length - 1
    ? HANGMAN_STAGES[HANGMAN_STAGES.length - 1]
    : HANGMAN_STAGES[wrongGuesses];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Hangman
            </h1>
            <button onClick={pickWord} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw className="w-6 h-6 text-primary-500" />
            </button>
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

          {/* Word Display */}
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              <div className="flex flex-col items-center gap-6">
                {/* Hangman SVG */}
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                  {/* Gallows */}
                  <line x1="20" y1="190" x2="180" y2="190" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
                  <line x1="60" y1="190" x2="60" y2="20" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
                  <line x1="60" y1="20" x2="140" y2="20" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
                  <line x1="140" y1="20" x2="140" y2="40" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />

                  {/* Head */}
                  {stage.head && (
                    <circle cx="140" cy="55" r="18" fill="none" stroke="#ec4899" strokeWidth="3" />
                  )}
                  {/* Body */}
                  {stage.body && (
                    <line x1="140" y1="73" x2="140" y2="120" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                  )}
                  {/* Left Arm */}
                  {stage.leftArm && (
                    <line x1="140" y1="85" x2="115" y2="105" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                  )}
                  {/* Right Arm */}
                  {stage.rightArm && (
                    <line x1="140" y1="85" x2="165" y2="105" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                  )}
                  {/* Left Leg */}
                  {stage.leftLeg && (
                    <line x1="140" y1="120" x2="115" y2="150" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                  )}
                  {/* Right Leg */}
                  {stage.rightLeg && (
                    <line x1="140" y1="120" x2="165" y2="150" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                  )}
                </svg>

                {/* Word */}
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-mono font-bold tracking-widest text-gray-800 mb-2">
                    {displayWord}
                  </p>
                  <p className="text-sm text-gray-500">
                    Wrong guesses: {wrongGuesses} / {HANGMAN_STAGES.length - 1}
                  </p>
                </div>

                {/* Alphabet */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {alphabet.map(letter => {
                    const guessedL = guessed.has(letter);
                    const inWord = word.includes(letter);
                    return (
                      <motion.button
                        key={letter}
                        whileHover={{ scale: guessedL || status !== 'playing' ? 1 : 1.1 }}
                        whileTap={{ scale: guessedL || status !== 'playing' ? 1 : 0.9 }}
                        onClick={() => handleGuess(letter)}
                        disabled={guessedL || status !== 'playing'}
                        className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                          guessedL
                            ? inWord
                              ? 'bg-green-100 text-green-700 border-2 border-green-300'
                              : 'bg-red-100 text-red-400 border-2 border-red-200 line-through'
                            : status === 'playing'
                              ? 'bg-white border-2 border-pink-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                              : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }`}
                      >
                        {letter}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Win/Lose Message */}
          <AnimatePresence>
            {status !== 'playing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6">
                  <div className="text-5xl mb-3">{status === 'won' ? '🎉' : '💔'}</div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    {status === 'won' ? 'You Won!' : 'You Lost!'}
                  </h2>
                  <p className="text-xl text-gray-700 mb-1">
                    The word was: <span className="font-bold text-primary-600">{word}</span>
                  </p>
                  <Button onClick={pickWord} variant="primary" className="mt-4">
                    Play Again 🎮
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <Link href="/games">
              <Button variant="outline" className="mt-8">← Back to Games</Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
