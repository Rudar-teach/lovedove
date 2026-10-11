'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowLeft, Share2, Users, Trophy, Sparkles, Play } from 'lucide-react';
import CanvasBackground from '@/components/premium/CanvasBackground';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';

const gameData: Record<string, { name: string; icon: string; desc: string; gradient: string; category: string; players: string; color: string }> = {
  tictactoe: { name: 'Tic-Tac-Toe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic', players: '2 Players', color: '#ec4899' },
  memory: { name: 'Memory Match', icon: '🎴', desc: 'Find the pairs', gradient: 'from-rose-400 to-pink-500', category: 'Classic', players: '2 Players', color: '#f43f5e' },
  memorypalace: { name: 'Memory Palace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-rose-400 to-rose-500', category: 'Classic', players: '2 Players', color: '#e11d48' },
  rockpaperscissors: { name: 'Rock Paper Scissors', icon: '🪨', desc: 'Classic hand game', gradient: 'from-stone-400 to-stone-600', category: 'Classic', players: '2 Players', color: '#78716c' },
  hangman: { name: 'Hangman Love', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic', players: '2 Players', color: '#be123c' },
  numberguess: { name: 'Number Guess', icon: '🔢', desc: 'Guess the number', gradient: 'from-sky-400 to-sky-600', category: 'Classic', players: '2 Players', color: '#0284c7' },
  game2048: { name: '2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-amber-500', category: 'Classic', players: '2 Players', color: '#ea580c' },
  snake: { name: 'Snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-lime-400 to-green-600', category: 'Classic', players: '2 Players', color: '#16a34a' },
  simonsays: { name: 'Simon Says', icon: '👆', desc: 'Memory sequence game', gradient: 'from-indigo-400 to-indigo-600', category: 'Classic', players: '2 Players', color: '#4f46e5' },
  wordscramble: { name: 'Word Scramble', icon: '🔤', desc: 'Unscramble the word', gradient: 'from-teal-400 to-teal-600', category: 'Classic', players: '2 Players', color: '#0d9488' },
  colormatch: { name: 'Color Match', icon: '🎨', desc: 'Match the colors fast', gradient: 'from-violet-400 to-violet-600', category: 'Classic', players: '2 Players', color: '#7c3aed' },
  diceroll: { name: 'Dice Roll', icon: '🎲', desc: 'Roll the dice game', gradient: 'from-red-400 to-red-600', category: 'Classic', players: '2 Players', color: '#dc2626' },
  cardmatch: { name: 'Card Match', icon: '🃏', desc: 'Match the cards', gradient: 'from-emerald-400 to-emerald-600', category: 'Classic', players: '2 Players', color: '#059669' },
  quickmath: { name: 'Quick Math', icon: '➕', desc: 'Speed math challenge', gradient: 'from-sky-400 to-sky-600', category: 'Classic', players: '2 Players', color: '#0284c7' },
  sequencememory: { name: 'Sequence Memory', icon: '🔢', desc: 'Remember the sequence', gradient: 'from-purple-400 to-purple-600', category: 'Classic', players: '2 Players', color: '#9333ea' },
  balloonpop: { name: 'Balloon Pop', icon: '🎈', desc: 'Pop the balloons', gradient: 'from-pink-400 to-pink-600', category: 'Classic', players: '2 Players', color: '#db2777' },
  strooptest: { name: 'Stroop Test', icon: '🧠', desc: 'Color word challenge', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Classic', players: '2 Players', color: '#c026d3' },
  patternmatch: { name: 'Pattern Match', icon: '🔳', desc: 'Match the pattern', gradient: 'from-cyan-400 to-cyan-600', category: 'Classic', players: '2 Players', color: '#06b6d4' },
  refluxtest: { name: 'Reflex Test', icon: '⚡', desc: 'Test your reflexes', gradient: 'from-yellow-400 to-yellow-600', category: 'Classic', players: '2 Players', color: '#ca8a04' },
  flappyheart: { name: 'Flappy Heart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade', players: '2 Players', color: '#ec4899' },
  pong: { name: 'Pong 2 Player', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-sky-400 to-sky-600', category: 'Arcade', players: '2 Players', color: '#0284c7' },
  cupidsarrow: { name: "Cupid's Arrow", icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade', players: '2 Players', color: '#dc2626' },
  heartcatcher: { name: 'Heart Catcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade', players: '2 Players', color: '#f43f5e' },
  hearts: { name: 'Hearts', icon: '♥️', desc: 'Card game classic', gradient: 'from-red-500 to-rose-600', category: 'Arcade', players: '2 Players', color: '#be123c' },
  spaceinvaders: { name: 'Space Invaders Love', icon: '🚀', desc: 'Defend love in space', gradient: 'from-indigo-500 to-purple-600', category: 'Arcade', players: '2 Players', color: '#4f46e5' },
  brickbreaker: { name: 'Brick Breaker', icon: '🧱', desc: 'Break the bricks', gradient: 'from-orange-400 to-red-500', category: 'Arcade', players: '2 Players', color: '#ea580c' },
  fruitninja: { name: 'Fruit Ninja Love', icon: '🍉', desc: 'Slice the love fruits', gradient: 'from-lime-400 to-green-600', category: 'Arcade', players: '2 Players', color: '#16a34a' },
  helicopter: { name: 'Helicopter Game', icon: '🚁', desc: 'Fly through obstacles', gradient: 'from-sky-500 to-sky-700', category: 'Arcade', players: '2 Players', color: '#0369a1' },
  jetpack: { name: 'Jetpack Joyride', icon: '🛸', desc: 'Fly with jetpack', gradient: 'from-violet-500 to-fuchsia-600', category: 'Arcade', players: '2 Players', color: '#7c3aed' },
  asteroids: { name: 'Asteroids', icon: '☄️', desc: 'Destroy asteroids', gradient: 'from-gray-400 to-gray-600', category: 'Arcade', players: '2 Players', color: '#4b5563' },
  endlessrunner: { name: 'Endless Runner', icon: '🏃', desc: 'Run forever together', gradient: 'from-amber-400 to-orange-600', category: 'Arcade', players: '2 Players', color: '#d97706' },
  dodgeblocks: { name: 'Dodge the Blocks', icon: '💫', desc: 'Dodge falling blocks', gradient: 'from-rose-400 to-rose-600', category: 'Arcade', players: '2 Players', color: '#e11d48' },
  colorswitch: { name: 'Color Switch', icon: '🔄', desc: 'Switch colors to pass', gradient: 'from-pink-400 to-pink-600', category: 'Arcade', players: '2 Players', color: '#db2777' },
  stacktower: { name: 'Stack Tower', icon: '🏗️', desc: 'Stack blocks high', gradient: 'from-teal-400 to-teal-600', category: 'Arcade', players: '2 Players', color: '#0d9488' },
  ballbounce: { name: 'Ball Bounce', icon: '⚽', desc: 'Bounce the ball', gradient: 'from-sky-400 to-sky-600', category: 'Arcade', players: '2 Players', color: '#0284c7' },
  pipeconnect: { name: 'Pipe Connect', icon: '🔗', desc: 'Connect the pipes', gradient: 'from-green-400 to-green-600', category: 'Arcade', players: '2 Players', color: '#16a34a' },
  lovetowerdefense: { name: 'Love Tower Defense', icon: '🏰', desc: 'Defend the love castle', gradient: 'from-purple-400 to-purple-600', category: 'Arcade', players: '2 Players', color: '#9333ea' },
  truthordare: { name: 'Truth or Dare', icon: '😈', desc: 'Spicy questions', gradient: 'from-fuchsia-500 to-pink-500', category: 'Party', players: '2 Players', color: '#c026d3' },
  kissinggame: { name: 'Kissing Spinner', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party', players: '2 Players', color: '#dc2626' },
  drawingchallenge: { name: 'Drawing Challenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-amber-400 to-orange-500', category: 'Party', players: '2 Players', color: '#d97706' },
  emojistory: { name: 'Emoji Story', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party', players: '2 Players', color: '#14b8a6' },
  couplepictionary: { name: 'Couple Pictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-fuchsia-500', category: 'Party', players: '2 Players', color: '#6366f1' },
  dancechallenge: { name: 'Dance Challenge', icon: '💃', desc: 'Show your moves', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party', players: '2 Players', color: '#db2777' },
  charades: { name: 'Charades', icon: '🎭', desc: 'Act it out!', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Party', players: '2 Players', color: '#c026d3' },
  neverhaveiever: { name: 'Never Have I Ever', icon: '🙋', desc: 'Share secrets', gradient: 'from-pink-400 to-pink-600', category: 'Party', players: '2 Players', color: '#db2777' },
  twotruths: { name: 'Two Truths One Lie', icon: '🎯', desc: 'Spot the lie', gradient: 'from-indigo-400 to-indigo-600', category: 'Party', players: '2 Players', color: '#4f46e5' },
  spinthebottle: { name: 'Spin the Bottle', icon: '🍾', desc: 'Classic party game', gradient: 'from-rose-400 to-rose-600', category: 'Party', players: '2 Players', color: '#e11d48' },
  loveriddle: { name: 'Love Riddle', icon: '🧩', desc: 'Solve love riddles', gradient: 'from-purple-400 to-purple-600', category: 'Party', players: '2 Players', color: '#9333ea' },
  thisorthat: { name: 'This or That', icon: '👈', desc: 'Pick your side', gradient: 'from-cyan-400 to-cyan-600', category: 'Party', players: '2 Players', color: '#06b6d4' },
  lovebingo: { name: 'Love Bingo', icon: '🅱️', desc: 'Couple bingo', gradient: 'from-red-400 to-red-600', category: 'Party', players: '2 Players', color: '#dc2626' },
  scattergories: { name: 'Scattergories', icon: '📝', desc: 'Word category game', gradient: 'from-amber-400 to-amber-600', category: 'Party', players: '2 Players', color: '#d97706' },
  guessthephoto: { name: 'Guess the Photo', icon: '🖼️', desc: 'Guess old photos', gradient: 'from-teal-400 to-teal-600', category: 'Party', players: '2 Players', color: '#0d9488' },
  lovemadlibs: { name: 'Love Mad Libs', icon: '📖', desc: 'Fill in the blanks', gradient: 'from-sky-400 to-sky-600', category: 'Party', players: '2 Players', color: '#0284c7' },
  movielines: { name: 'Movie Lines', icon: '🎬', desc: 'Guess the movie', gradient: 'from-violet-400 to-violet-600', category: 'Party', players: '2 Players', color: '#7c3aed' },
  datenightroulette: { name: 'Date Night Roulette', icon: '🎰', desc: 'Random date idea', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Party', players: '2 Players', color: '#c026d3' },
  quiz: { name: 'Couple Quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz', players: '2 Players', color: '#e11d48' },
  wouldyourather: { name: 'Would You Rather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz', players: '2 Players', color: '#f97316' },
  triviabattle: { name: 'Trivia Battle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-fuchsia-400 to-indigo-500', category: 'Quiz', players: '2 Players', color: '#9333ea' },
  lovesongquiz: { name: 'Love Song Quiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2 Players', color: '#ec4899' },
  lovetrivia: { name: 'Love Trivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz', players: '2 Players', color: '#dc2626' },
  typingrace: { name: 'Typing Race', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2 Players', color: '#0284c7' },
  wordchain: { name: 'Word Chain', icon: '🔤', desc: 'Word building game', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2 Players', color: '#0ea5e9' },
  photoquiz: { name: 'Photo Quiz', icon: '📸', desc: 'Guess your partner', gradient: 'from-fuchsia-400 to-pink-500', category: 'Quiz', players: '2 Players', color: '#d946ef' },
  speeddate: { name: 'Speed Date', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz', players: '2 Players', color: '#f43f5e' },
  lovetrivia2: { name: 'Love Trivia 2', icon: '🌹', desc: 'More love trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz', players: '2 Players', color: '#be123c' },
  relationshipquiz: { name: 'Relationship Quiz', icon: '💑', desc: 'Test relationship knowledge', gradient: 'from-pink-400 to-pink-600', category: 'Quiz', players: '2 Players', color: '#db2777' },
  movielovequiz: { name: 'Movie Love Quiz', icon: '🎬', desc: 'Romantic movie quiz', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Quiz', players: '2 Players', color: '#c026d3' },
  personalityquiz: { name: 'Personality Quiz', icon: '🎭', desc: 'Discover personalities', gradient: 'from-indigo-400 to-indigo-600', category: 'Quiz', players: '2 Players', color: '#4f46e5' },
  foodpreference: { name: 'Food Preference', icon: '🍕', desc: 'Test food knowledge', gradient: 'from-orange-400 to-orange-600', category: 'Quiz', players: '2 Players', color: '#ea580c' },
  travelquiz: { name: 'Travel Quiz', icon: '✈️', desc: 'Dream destinations', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2 Players', color: '#0284c7' },
  musictastequiz: { name: 'Music Taste Quiz', icon: '🎵', desc: 'Test music taste', gradient: 'from-violet-400 to-violet-600', category: 'Quiz', players: '2 Players', color: '#7c3aed' },
  animalquiz: { name: 'Animal Quiz', icon: '🐾', desc: 'Animal kingdom quiz', gradient: 'from-lime-400 to-lime-600', category: 'Quiz', players: '2 Players', color: '#65a30d' },
  historylovequiz: { name: 'History Love Quiz', icon: '📜', desc: 'Famous love stories', gradient: 'from-amber-400 to-amber-600', category: 'Quiz', players: '2 Players', color: '#d97706' },
  sciencelove: { name: 'Science of Love', icon: '🔬', desc: 'Love science quiz', gradient: 'from-cyan-400 to-cyan-600', category: 'Quiz', players: '2 Players', color: '#06b6d4' },
  celebritycouples: { name: 'Celebrity Couples', icon: '⭐', desc: 'Guess celebrity couples', gradient: 'from-yellow-400 to-yellow-600', category: 'Quiz', players: '2 Players', color: '#ca8a04' },
  colorpersonality: { name: 'Color Personality', icon: '🌈', desc: 'Color meaning quiz', gradient: 'from-teal-400 to-teal-600', category: 'Quiz', players: '2 Players', color: '#0d9488' },
  dreaminterpretation: { name: 'Dream Interpretation', icon: '🌙', desc: 'Dream meaning quiz', gradient: 'from-purple-400 to-purple-600', category: 'Quiz', players: '2 Players', color: '#9333ea' },
  emojiquiz: { name: 'Emoji Quiz', icon: '😀', desc: 'Guess from emojis', gradient: 'from-pink-400 to-pink-600', category: 'Quiz', players: '2 Players', color: '#db2777' },
  memoryquiz: { name: 'Memory Quiz', icon: '🧠', desc: 'Test your memory', gradient: 'from-rose-400 to-rose-600', category: 'Quiz', players: '2 Players', color: '#e11d48' },
  spotifyquiz: { name: 'Spotify Quiz', icon: '🎧', desc: 'Guess the song fast', gradient: 'from-green-400 to-green-600', category: 'Quiz', players: '2 Players', color: '#16a34a' },
  coupletrivia: { name: 'Couple Trivia', icon: '💑', desc: 'About each other', gradient: 'from-pink-400 to-pink-600', category: 'Quiz', players: '2 Players', color: '#db2777' },
  couplewordsearch: { name: 'Couple Word Search', icon: '🔍', desc: 'Find love words', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2 Players', color: '#0284c7' },
  compatibilitytest: { name: 'Compatibility Test', icon: '💞', desc: 'Test your compatibility', gradient: 'from-pink-400 to-red-500', category: 'Love', players: '2 Players', color: '#ec4899' },
  lovemaze: { name: 'Love Maze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-rose-400 to-fuchsia-500', category: 'Love', players: '2 Players', color: '#f43f5e' },
  loveletters: { name: 'Love Letters', icon: '💌', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Love', players: '2 Players', color: '#e11d48' },
  puzzlelove: { name: 'Puzzle Love', icon: '🧩', desc: 'Sliding puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love', players: '2 Players', color: '#dc2626' },
  couplegolfs: { name: 'Couple Golfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-lime-400 to-green-600', category: 'Love', players: '2 Players', color: '#16a34a' },
  lovecalculator: { name: 'Love Calculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Love', players: '2 Players', color: '#ec4899' },
  lovejournal: { name: 'Love Journal', icon: '📔', desc: 'Write love entries', gradient: 'from-rose-400 to-rose-600', category: 'Love', players: '2 Players', color: '#e11d48' },
  promisecircle: { name: 'Promise Circle', icon: '💍', desc: 'Make promises', gradient: 'from-pink-400 to-pink-600', category: 'Love', players: '2 Players', color: '#db2777' },
  datenightideas: { name: 'Date Night Ideas', icon: '🌹', desc: 'Discover date ideas', gradient: 'from-red-400 to-red-600', category: 'Love', players: '2 Players', color: '#dc2626' },
  loveplaylist: { name: 'Love Playlist', icon: '🎶', desc: 'Build a love playlist', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Love', players: '2 Players', color: '#c026d3' },
  couplegoals: { name: 'Couple Goals', icon: '🎯', desc: 'Set couple goals', gradient: 'from-indigo-400 to-indigo-600', category: 'Love', players: '2 Players', color: '#4f46e5' },
  memorylane: { name: 'Memory Lane', icon: '🖼️', desc: 'Share memories', gradient: 'from-amber-400 to-amber-600', category: 'Love', players: '2 Players', color: '#d97706' },
  lovepoems: { name: 'Love Poems', icon: '📜', desc: 'Write love poems', gradient: 'from-purple-400 to-purple-600', category: 'Love', players: '2 Players', color: '#9333ea' },
  couplebucketlist: { name: 'Couple Bucket List', icon: '📋', desc: 'Create bucket list', gradient: 'from-sky-400 to-sky-600', category: 'Love', players: '2 Players', color: '#0284c7' },
  anniversaryplanner: { name: 'Anniversary Planner', icon: '🎂', desc: 'Plan anniversaries', gradient: 'from-teal-400 to-teal-600', category: 'Love', players: '2 Players', color: '#0d9488' },
  lovemessages: { name: 'Love Messages', icon: '💌', desc: 'Write sweet messages', gradient: 'from-rose-400 to-rose-600', category: 'Love', players: '2 Players', color: '#e11d48' },
  couplechallenges: { name: 'Couple Challenges', icon: '🏆', desc: 'Complete challenges', gradient: 'from-lime-400 to-lime-600', category: 'Love', players: '2 Players', color: '#65a30d' },
  loveconfessions: { name: 'Love Confessions', icon: '💬', desc: 'Share confessions', gradient: 'from-rose-400 to-rose-600', category: 'Love', players: '2 Players', color: '#f43f5e' },
  lovecompatibility: { name: 'Love Compatibility', icon: '💫', desc: 'Zodiac compatibility', gradient: 'from-violet-400 to-violet-600', category: 'Love', players: '2 Players', color: '#7c3aed' },
};

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const game = gameData[slug];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💕</div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-3xl font-display font-black text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">This game doesn&apos;t exist yet.</p>
          <Link href="/#games" className="text-pink-600 font-bold hover:text-rose-600">← Back to Games</Link>
        </div>
      </div>
    );
  }

  const startGame = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
    setGameStarted(true);
  };

  return (
    <>
      {mounted && (
        <>
          <CanvasBackground />
          <LuxuryCursor />
        </>
      )}

      <div className="min-h-screen relative">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-rose-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                </div>
                <span className="font-display font-black text-xl sm:text-2xl text-gray-900">Love Dove</span>
              </Link>
              <Link href="/#games" className="flex items-center gap-1.5 text-gray-700 hover:text-rose-600 font-semibold text-sm">
                <ArrowLeft className="w-4 h-4" />
                All Games
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-20 sm:pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            {!gameStarted ? (
              <CinematicReveal direction="up">
                <GlassCard glow="pink" className="p-6 sm:p-10 text-center">
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{game.icon}</div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-3 sm:mb-4">{game.name}</h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-2">{game.desc}</p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <span className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${game.gradient} text-white text-xs sm:text-sm font-semibold`}>
                      {game.category}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {game.players}
                    </span>
                  </div>

                  <div className="bg-rose-50/80 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">How to Play</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Share the game code with your partner and start playing together!
                      Create a session and send the code to your loved one.
                    </p>
                  </div>

                  <motion.button
                    onClick={startGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </motion.button>
                </GlassCard>
              </CinematicReveal>
            ) : (
              <CinematicReveal direction="scale">
                <GlassCard glow="pink" className="p-6 sm:p-10 text-center">
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{game.icon}</div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-900 mb-3 sm:mb-4">{game.name}</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6">Share this code with your partner:</p>

                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-3xl sm:text-5xl font-black tracking-widest px-6 sm:px-10 py-4 sm:py-6 rounded-2xl mb-4 sm:mb-6 inline-block shadow-2xl">
                    {sessionCode}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigator.clipboard.writeText(sessionCode)}
                      className="bg-white text-rose-600 border-2 border-rose-200 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Copy Code
                    </motion.button>
                    <button className="bg-gray-100 text-gray-700 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 transition-all">
                      Waiting for partner...
                    </button>
                  </div>

                  <div className="mt-6 sm:mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-amber-700 text-sm">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Game content coming soon! The session system is ready.
                    </p>
                  </div>
                </GlassCard>
              </CinematicReveal>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
