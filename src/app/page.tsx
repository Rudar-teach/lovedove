'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Heart, Gamepad2, Trophy, Users, Sparkles, ChevronRight, Gift,
  Camera, MessageCircle, Star, Filter, Search, Zap, HeartHandshake, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import CanvasBackground from '@/components/premium/CanvasBackground';
import CinematicReveal from '@/components/premium/CinematicReveal';
import MagneticButton from '@/components/premium/MagneticButton';
import GlassCard from '@/components/premium/GlassCard';
import ShinyText from '@/components/premium/ShinyText';
import LuxuryAccordion from '@/components/premium/LuxuryAccordion';

const games = [
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find the pairs', gradient: 'from-rose-400 to-pink-500', category: 'Classic' },
  { name: 'Memory Palace', slug: 'memorypalace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-rose-400 to-rose-500', category: 'Classic' },
  { name: 'Rock Paper Scissors', slug: 'rockpaperscissors', icon: '🪨', desc: 'Classic hand game', gradient: 'from-stone-400 to-stone-600', category: 'Classic' },
  { name: 'Hangman Love', slug: 'hangman', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic' },
  { name: 'Number Guess', slug: 'numberguess', icon: '🔢', desc: 'Guess the number', gradient: 'from-sky-400 to-sky-600', category: 'Classic' },
  { name: '2048', slug: 'game2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-amber-500', category: 'Classic' },
  { name: 'Snake', slug: 'snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-lime-400 to-green-600', category: 'Classic' },
  { name: 'Flappy Heart', slug: 'flappyheart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade' },
  { name: 'Pong 2 Player', slug: 'pong', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-sky-400 to-sky-600', category: 'Arcade' },
  { name: "Cupid's Arrow", slug: 'cupidsarrow', icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade' },
  { name: 'Heart Catcher', slug: 'heartcatcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade' },
  { name: 'Hearts', slug: 'hearts', icon: '♥️', desc: 'Card game classic', gradient: 'from-red-500 to-rose-600', category: 'Arcade' },
  { name: 'Truth or Dare', slug: 'truthordare', icon: '😈', desc: 'Spicy questions', gradient: 'from-fuchsia-500 to-pink-500', category: 'Party' },
  { name: 'Kissing Spinner', slug: 'kissinggame', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party' },
  { name: 'Drawing Challenge', slug: 'drawingchallenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-amber-400 to-orange-500', category: 'Party' },
  { name: 'Emoji Story', slug: 'emojistory', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party' },
  { name: 'Couple Pictionary', slug: 'couplepictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-fuchsia-500', category: 'Party' },
  { name: 'Dance Challenge', slug: 'dancechallenge', icon: '💃', desc: 'Show your moves', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party' },
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz' },
  { name: 'Trivia Battle', slug: 'triviabattle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-fuchsia-400 to-indigo-500', category: 'Quiz' },
  { name: 'Love Song Quiz', slug: 'lovesongquiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Love Trivia', slug: 'lovetrivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz' },
  { name: 'Typing Race', slug: 'typingrace', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-sky-400 to-sky-600', category: 'Quiz' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building game', gradient: 'from-sky-400 to-sky-600', category: 'Quiz' },
  { name: 'Photo Quiz', slug: 'photoquiz', icon: '📸', desc: 'Guess your partner', gradient: 'from-fuchsia-400 to-pink-500', category: 'Quiz' },
  { name: 'Speed Date', slug: 'speeddate', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz' },
  { name: 'Compatibility Test', slug: 'compatibilitytest', icon: '💞', desc: 'Test your compatibility', gradient: 'from-pink-400 to-red-500', category: 'Love' },
  { name: 'Love Maze', slug: 'lovemaze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-rose-400 to-fuchsia-500', category: 'Love' },
  { name: 'Love Letters', slug: 'loveletters', icon: '💌', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'Puzzle Love', slug: 'puzzlelove', icon: '🧩', desc: 'Sliding puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Couple Golfs', slug: 'couplegolfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-lime-400 to-green-600', category: 'Love' },
  { name: 'Love Calculator', slug: 'lovecalculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Love' },
  // Classic games (12 more)
  { name: 'Simon Says', slug: 'simonsays', icon: '👆', desc: 'Memory sequence game', gradient: 'from-indigo-400 to-indigo-600', category: 'Classic' },
  { name: 'Word Scramble', slug: 'wordscramble', icon: '🔤', desc: 'Unscramble the word', gradient: 'from-teal-400 to-teal-600', category: 'Classic' },
  { name: 'Color Match', slug: 'colormatch', icon: '🎨', desc: 'Match the colors fast', gradient: 'from-violet-400 to-violet-600', category: 'Classic' },
  { name: 'Dice Roll', slug: 'diceroll', icon: '🎲', desc: 'Roll the dice game', gradient: 'from-red-400 to-red-600', category: 'Classic' },
  { name: 'Card Match', slug: 'cardmatch', icon: '🃏', desc: 'Match the cards', gradient: 'from-emerald-400 to-emerald-600', category: 'Classic' },
  { name: 'Quick Math', slug: 'quickmath', icon: '➕', desc: 'Speed math challenge', gradient: 'from-sky-400 to-sky-600', category: 'Classic' },
  { name: 'Sequence Memory', slug: 'sequencememory', icon: '🔢', desc: 'Remember the sequence', gradient: 'from-purple-400 to-purple-600', category: 'Classic' },
  { name: 'Balloon Pop', slug: 'balloonpop', icon: '🎈', desc: 'Pop the balloons', gradient: 'from-pink-400 to-pink-600', category: 'Classic' },
  { name: 'Stroop Test', slug: 'strooptest', icon: '🧠', desc: 'Color word challenge', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Classic' },
  { name: 'Pattern Match', slug: 'patternmatch', icon: '🔳', desc: 'Match the pattern', gradient: 'from-cyan-400 to-cyan-600', category: 'Classic' },
  { name: 'Reflex Test', slug: 'refluxtest', icon: '⚡', desc: 'Test your reflexes', gradient: 'from-yellow-400 to-yellow-600', category: 'Classic' },
  // Arcade games (12 more)
  { name: 'Space Invaders Love', slug: 'spaceinvaders', icon: '🚀', desc: 'Defend love in space', gradient: 'from-indigo-500 to-purple-600', category: 'Arcade' },
  { name: 'Brick Breaker', slug: 'brickbreaker', icon: '🧱', desc: 'Break the bricks', gradient: 'from-orange-400 to-red-500', category: 'Arcade' },
  { name: 'Fruit Ninja Love', slug: 'fruitninja', icon: '🍉', desc: 'Slice the love fruits', gradient: 'from-lime-400 to-green-600', category: 'Arcade' },
  { name: 'Helicopter Game', slug: 'helicopter', icon: '🚁', desc: 'Fly through obstacles', gradient: 'from-sky-500 to-sky-700', category: 'Arcade' },
  { name: 'Jetpack Joyride', slug: 'jetpack', icon: '🛸', desc: 'Fly with jetpack', gradient: 'from-violet-500 to-fuchsia-600', category: 'Arcade' },
  { name: 'Asteroids', slug: 'asteroids', icon: '☄️', desc: 'Destroy asteroids', gradient: 'from-gray-400 to-gray-600', category: 'Arcade' },
  { name: 'Endless Runner', slug: 'endlessrunner', icon: '🏃', desc: 'Run forever together', gradient: 'from-amber-400 to-orange-600', category: 'Arcade' },
  { name: 'Dodge the Blocks', slug: 'dodgeblocks', icon: '💫', desc: 'Dodge falling blocks', gradient: 'from-rose-400 to-rose-600', category: 'Arcade' },
  { name: 'Color Switch', slug: 'colorswitch', icon: '🔄', desc: 'Switch colors to pass', gradient: 'from-pink-400 to-pink-600', category: 'Arcade' },
  { name: 'Stack Tower', slug: 'stacktower', icon: '🏗️', desc: 'Stack blocks high', gradient: 'from-teal-400 to-teal-600', category: 'Arcade' },
  { name: 'Ball Bounce', slug: 'ballbounce', icon: '⚽', desc: 'Bounce the ball', gradient: 'from-sky-400 to-sky-600', category: 'Arcade' },
  { name: 'Pipe Connect', slug: 'pipeconnect', icon: '🔗', desc: 'Connect the pipes', gradient: 'from-green-400 to-green-600', category: 'Arcade' },
  // Party games (11 more)
  { name: 'Charades', slug: 'charades', icon: '🎭', desc: 'Act it out!', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Party' },
  { name: 'Never Have I Ever', slug: 'neverhaveiever', icon: '🙋', desc: 'Share secrets', gradient: 'from-pink-400 to-pink-600', category: 'Party' },
  { name: 'Two Truths One Lie', slug: 'twotruths', icon: '🎯', desc: 'Spot the lie', gradient: 'from-indigo-400 to-indigo-600', category: 'Party' },
  { name: 'Spin the Bottle', slug: 'spinthebottle', icon: '🍾', desc: 'Classic party game', gradient: 'from-rose-400 to-rose-600', category: 'Party' },
  { name: 'Love Riddle', slug: 'loveriddle', icon: '🧩', desc: 'Solve love riddles', gradient: 'from-purple-400 to-purple-600', category: 'Party' },
  { name: 'This or That', slug: 'thisorthat', icon: '👈', desc: 'Pick your side', gradient: 'from-cyan-400 to-cyan-600', category: 'Party' },
  { name: 'Love Bingo', slug: 'lovebingo', icon: '🅱️', desc: 'Couple bingo', gradient: 'from-red-400 to-red-600', category: 'Party' },
  { name: 'Scattergories', slug: 'scattergories', icon: '📝', desc: 'Word category game', gradient: 'from-amber-400 to-amber-600', category: 'Party' },
  { name: 'Guess the Photo', slug: 'guessthephoto', icon: '🖼️', desc: 'Guess old photos', gradient: 'from-teal-400 to-teal-600', category: 'Party' },
  { name: 'Love Mad Libs', slug: 'lovemadlibs', icon: '📖', desc: 'Fill in the blanks', gradient: 'from-sky-400 to-sky-600', category: 'Party' },
  { name: 'Movie Lines', slug: 'movielines', icon: '🎬', desc: 'Guess the movie', gradient: 'from-violet-400 to-violet-600', category: 'Party' },
  // Quiz games (16 more)
  { name: 'Love Trivia 2', slug: 'lovetrivia2', icon: '🌹', desc: 'More love trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz' },
  { name: 'Relationship Quiz', slug: 'relationshipquiz', icon: '💑', desc: 'Test relationship knowledge', gradient: 'from-pink-400 to-pink-600', category: 'Quiz' },
  { name: 'Movie Love Quiz', slug: 'movielovequiz', icon: '🎬', desc: 'Romantic movie quiz', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Quiz' },
  { name: 'Personality Quiz', slug: 'personalityquiz', icon: '🎭', desc: 'Discover personalities', gradient: 'from-indigo-400 to-indigo-600', category: 'Quiz' },
  { name: 'Food Preference', slug: 'foodpreference', icon: '🍕', desc: 'Test food knowledge', gradient: 'from-orange-400 to-orange-600', category: 'Quiz' },
  { name: 'Travel Quiz', slug: 'travelquiz', icon: '✈️', desc: 'Dream destinations', gradient: 'from-sky-400 to-sky-600', category: 'Quiz' },
  { name: 'Music Taste Quiz', slug: 'musictastequiz', icon: '🎵', desc: 'Test music taste', gradient: 'from-violet-400 to-violet-600', category: 'Quiz' },
  { name: 'Animal Quiz', slug: 'animalquiz', icon: '🐾', desc: 'Animal kingdom quiz', gradient: 'from-lime-400 to-lime-600', category: 'Quiz' },
  { name: 'History Love Quiz', slug: 'historylovequiz', icon: '📜', desc: 'Famous love stories', gradient: 'from-amber-400 to-amber-600', category: 'Quiz' },
  { name: 'Science of Love', slug: 'sciencelove', icon: '🔬', desc: 'Love science quiz', gradient: 'from-cyan-400 to-cyan-600', category: 'Quiz' },
  { name: 'Celebrity Couples', slug: 'celebritycouples', icon: '⭐', desc: 'Guess celebrity couples', gradient: 'from-yellow-400 to-yellow-600', category: 'Quiz' },
  { name: 'Color Personality', slug: 'colorpersonality', icon: '🌈', desc: 'Color meaning quiz', gradient: 'from-teal-400 to-teal-600', category: 'Quiz' },
  { name: 'Dream Interpretation', slug: 'dreaminterpretation', icon: '🌙', desc: 'Dream meaning quiz', gradient: 'from-purple-400 to-purple-600', category: 'Quiz' },
  { name: 'Emoji Quiz', slug: 'emojiquiz', icon: '😀', desc: 'Guess from emojis', gradient: 'from-pink-400 to-pink-600', category: 'Quiz' },
  { name: 'Memory Quiz', slug: 'memoryquiz', icon: '🧠', desc: 'Test your memory', gradient: 'from-rose-400 to-rose-600', category: 'Quiz' },
  { name: 'Spotify Quiz', slug: 'spotifyquiz', icon: '🎧', desc: 'Guess the song fast', gradient: 'from-green-400 to-green-600', category: 'Quiz' },
  // Love games (11 more)
  { name: 'Love Journal', slug: 'lovejournal', icon: '📔', desc: 'Write love entries', gradient: 'from-rose-400 to-rose-600', category: 'Love' },
  { name: 'Promise Circle', slug: 'promisecircle', icon: '💍', desc: 'Make promises', gradient: 'from-pink-400 to-pink-600', category: 'Love' },
  { name: 'Date Night Ideas', slug: 'datenightideas', icon: '🌹', desc: 'Discover date ideas', gradient: 'from-red-400 to-red-600', category: 'Love' },
  { name: 'Love Playlist', slug: 'loveplaylist', icon: '🎶', desc: 'Build a love playlist', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Love' },
  { name: 'Couple Goals', slug: 'couplegoals', icon: '🎯', desc: 'Set couple goals', gradient: 'from-indigo-400 to-indigo-600', category: 'Love' },
  { name: 'Memory Lane', slug: 'memorylane', icon: '🖼️', desc: 'Share memories', gradient: 'from-amber-400 to-amber-600', category: 'Love' },
  { name: 'Love Poems', slug: 'lovepoems', icon: '📜', desc: 'Write love poems', gradient: 'from-purple-400 to-purple-600', category: 'Love' },
  { name: 'Couple Bucket List', slug: 'couplebucketlist', icon: '📋', desc: 'Create bucket list', gradient: 'from-sky-400 to-sky-600', category: 'Love' },
  { name: 'Anniversary Planner', slug: 'anniversaryplanner', icon: '🎂', desc: 'Plan anniversaries', gradient: 'from-teal-400 to-teal-600', category: 'Love' },
  { name: 'Love Messages', slug: 'lovemessages', icon: '💌', desc: 'Write sweet messages', gradient: 'from-rose-400 to-rose-600', category: 'Love' },
  { name: 'Couple Challenges', slug: 'couplechallenges', icon: '🏆', desc: 'Complete challenges', gradient: 'from-lime-400 to-lime-600', category: 'Love' },
  { name: 'Love Confessions', slug: 'loveconfessions', icon: '💬', desc: 'Share confessions', gradient: 'from-rose-400 to-rose-600', category: 'Love' },
  { name: 'Couple Trivia', slug: 'coupletrivia', icon: '💑', desc: 'About each other', gradient: 'from-pink-400 to-pink-600', category: 'Quiz' },
  { name: 'Date Night Roulette', slug: 'datenightroulette', icon: '🎰', desc: 'Random date idea', gradient: 'from-fuchsia-400 to-fuchsia-600', category: 'Party' },
  { name: 'Love Compatibility', slug: 'lovecompatibility', icon: '💫', desc: 'Zodiac compatibility', gradient: 'from-violet-400 to-violet-600', category: 'Love' },
  { name: 'Couple Word Search', slug: 'couplewordsearch', icon: '🔍', desc: 'Find love words', gradient: 'from-sky-400 to-sky-600', category: 'Quiz' },
  { name: 'Love Tower Defense', slug: 'lovetowerdefense', icon: '🏰', desc: 'Defend the love castle', gradient: 'from-purple-400 to-purple-600', category: 'Arcade' },
];

const categories = ['All', 'Classic', 'Arcade', 'Party', 'Quiz', 'Love'];

const stats = [
  { value: '101+', label: 'Games', icon: '🎮' },
  { value: '10K+', label: 'Couples', icon: '💑' },
  { value: '50K+', label: 'Games Played', icon: '🏆' },
  { value: '∞', label: 'Love', icon: '💕' },
];

const features = [
  { icon: '🎂', title: 'Birthday Websites', description: 'Create beautiful birthday pages with photos, messages, and stunning themes.', gradient: 'from-pink-500 to-rose-500', delay: 0 },
  { icon: '🎮', title: '101 Couple Games', description: 'Play fun games together — quizzes, tic-tac-toe, memory match, and many more!', gradient: 'from-fuchsia-500 to-pink-500', delay: 0.1 },
  { icon: '👥', title: 'Connect with Friends', description: 'Add your partner as a friend and track your journey together.', gradient: 'from-sky-500 to-sky-600', delay: 0.2 },
  { icon: '🏆', title: 'Earn Badges', description: 'Unlock badges for playing together — 10 hours, 100 hours, and many more!', gradient: 'from-amber-500 to-orange-500', delay: 0.3 },
  { icon: '💌', title: 'Send Proposals', description: 'Customize and send beautiful proposals with email notifications.', gradient: 'from-rose-500 to-pink-500', delay: 0.4 },
  { icon: '⚡', title: 'Play Together Live', description: 'Share any game with a friend and play the same session in real-time.', gradient: 'from-indigo-500 to-fuchsia-500', delay: 0.5 },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, -200]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredGames = games.filter(g => {
    if (filter !== 'All' && g.category !== filter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const premiumBg = mounted ? (
    <>
      <CanvasBackground />
      <LuxuryCursor />
    </>
  ) : null;

  return (
    <>
      {premiumBg}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl text-gray-900">Love Dove</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login" className="hidden sm:block text-gray-700 hover:text-rose-600 font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all hover:bg-rose-50">
                Log In
              </Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-200/20 via-transparent to-transparent" />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['💕', '💖', '✨', '💗', '💝', '🕊️'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-4xl sm:text-6xl opacity-20"
              style={{
                left: `${15 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animation: `float ${6 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto pt-20"
        >
          <CinematicReveal direction="up" delay={0.2}>
            <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-xl border border-rose-100/60 text-rose-700 text-xs sm:text-sm font-semibold shadow-md mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span className="font-bold">Made with Love for Couples Everywhere</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
          </CinematicReveal>

          <CinematicReveal direction="up" delay={0.4}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-black text-gray-900 mb-4 sm:mb-6 leading-[1.05] tracking-tight">
              Where Hearts
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                Connect & Play
              </span>
            </h1>
          </CinematicReveal>

          <CinematicReveal direction="up" delay={0.6}>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-2">
              Create beautiful birthday websites, play <span className="font-bold text-rose-600">{games.length} fun couple games</span>, and celebrate your love story together.
            </p>
          </CinematicReveal>

          <CinematicReveal direction="up" delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <MagneticButton strength={0.2}>
                <Link href="/auth/signup">
                  <div className="group bg-gradient-to-r from-pink-500 to-rose-500 text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl group-hover:shadow-2xl transition-all duration-300 flex items-center gap-2">
                    Start Your Love Story
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link href="#games">
                  <div className="bg-white/80 backdrop-blur-xl text-gray-700 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg border-2 border-rose-100 hover:border-pink-300 transition-all duration-300 shadow-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    See All Games
                  </div>
                </Link>
              </MagneticButton>
            </div>
          </CinematicReveal>

          {/* Stats */}
          <CinematicReveal direction="up" delay={1}>
            <div className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </CinematicReveal>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 bg-pink-400 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <CinematicReveal direction="up" className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100/60 text-pink-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Everything for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Your Love Story</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light px-2">From birthday celebrations to gaming together, Love Dove has it all.</p>
          </CinematicReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <CinematicReveal key={i} direction="up" delay={feature.delay}>
                <GlassCard glow="pink" className="h-full p-6 sm:p-7 group cursor-default">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 text-xl`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                </GlassCard>
              </CinematicReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32 px-4 relative">
        <div className="max-w-6xl mx-auto relative">
          <CinematicReveal direction="up" className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100/60 text-pink-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Get Started in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">3 Steps</span>
            </h2>
          </CinematicReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', icon: '👤', title: 'Create Account', desc: 'Sign up with email and start your journey', gradient: 'from-pink-400 to-rose-500' },
              { step: '02', icon: '🎨', title: 'Add Photos & Details', desc: 'Upload photos and write a birthday message', gradient: 'from-fuchsia-400 to-pink-500' },
              { step: '03', icon: '🎉', title: 'Share & Play', desc: 'Share the link and play games together!', gradient: 'from-amber-400 to-orange-500' },
            ].map((s, i) => (
              <CinematicReveal key={i} direction="up" delay={i * 0.15}>
                <GlassCard glow="pink" className="text-center p-6 sm:p-8 group">
                  <div className="text-xs sm:text-sm font-bold text-rose-500 mb-3 sm:mb-4 tracking-widest">STEP {s.step}</div>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {s.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2 sm:mb-3">{s.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{s.desc}</p>
                </GlassCard>
              </CinematicReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20 sm:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <CinematicReveal direction="up" className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100/60 text-pink-700 text-xs font-semibold mb-4">
              <Gamepad2 className="w-3.5 h-3.5" />
              GAMES
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              All{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">{games.length} Games</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light px-2">Choose from classic, arcade, party, quiz, and love-themed games.</p>
          </CinematicReveal>

          {/* Search & Filter */}
          <CinematicReveal direction="up" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 justify-center items-center">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-xl border border-rose-100/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 w-full sm:w-64"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      filter === cat
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'bg-white/80 text-gray-600 hover:bg-rose-50 border border-rose-100/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </CinematicReveal>

          {/* Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredGames.map((game, i) => (
              <CinematicReveal key={i} direction="up" delay={i * 0.03}>
                <Link href={`/games/${game.slug}`}>
                  <GlassCard glow="pink" className="h-full p-4 sm:p-5 group cursor-pointer">
                    <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{game.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{game.desc}</p>
                    <span className={`text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${game.gradient}`}>
                      2 Players
                    </span>
                  </GlassCard>
                </Link>
              </CinematicReveal>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No games found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Badges Section */}
      <section className="py-20 sm:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/30 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <CinematicReveal direction="up" className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100/60 text-pink-700 text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5" />
              BADGES & REWARDS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Earn{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Badges Together</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light px-2">The more you play together, the more badges you unlock.</p>
          </CinematicReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '💕', name: 'First Game', desc: 'Play your first game', gradient: 'from-pink-400 to-rose-500' },
              { icon: '🔥', name: 'On Fire', desc: 'Play 3 days in a row', gradient: 'from-orange-400 to-red-500' },
              { icon: '⏱️', name: '10 Hours', desc: 'Played 10 hours together', gradient: 'from-amber-400 to-orange-500' },
              { icon: '🏆', name: 'Game Master', desc: 'Win 25 games', gradient: 'from-yellow-400 to-amber-500' },
              { icon: '💎', name: '100 Hours', desc: 'Played 100 hours together', gradient: 'from-cyan-400 to-sky-500' },
              { icon: '👑', name: 'Royal Couple', desc: 'Play every game', gradient: 'from-fuchsia-400 to-purple-500' },
              { icon: '🌟', name: 'Superstar', desc: 'Share with 10 friends', gradient: 'from-rose-400 to-pink-500' },
              { icon: '💫', name: 'Legendary', desc: 'Play 365 days', gradient: 'from-violet-400 to-fuchsia-500' },
            ].map((badge, i) => (
              <CinematicReveal key={i} direction="up" delay={i * 0.08}>
                <GlassCard glow="rose" className="p-5 sm:p-6 text-center group">
                  <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                  <div className={`mt-3 text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${badge.gradient}`}>
                    {badge.name} Badge
                  </div>
                </GlassCard>
              </CinematicReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <CinematicReveal direction="up" className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100/60 text-pink-700 text-xs font-semibold mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Got{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Questions?</span>
            </h2>
          </CinematicReveal>

          <CinematicReveal direction="up" delay={0.2}>
            <LuxuryAccordion
              items={[
                {
                  title: 'How do I create a birthday website?',
                  icon: '🎂',
                  content: 'Simply sign up, click on "Birthday Websites" in your dashboard, add photos, write your message, choose a theme, and share the link. It takes less than 5 minutes!',
                },
                {
                  title: 'How do I play games with my partner?',
                  icon: '🎮',
                  content: 'Browse our collection of 36 couple games, click on any game, and share the game code with your partner. They can join from their device and play together in real-time!',
                },
                {
                  title: 'Is Love Dove free?',
                  icon: '💕',
                  content: 'Yes! Love Dove is completely free to use. Create birthday websites, play games, add friends, and earn badges — all without paying a dime.',
                },
                {
                  title: 'How do badges work?',
                  icon: '🏆',
                  content: 'Badges are earned by playing games and spending time together. The more you play, the more badges you unlock. Check your profile to see your progress!',
                },
                {
                  title: 'Can I share games on social media?',
                  icon: '📱',
                  content: 'Absolutely! Share any game or birthday website on Instagram, WhatsApp, Twitter, or any platform. Your friends can join instantly.',
                },
              ]}
            />
          </CinematicReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <CinematicReveal direction="scale">
            <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-10 right-10 text-5xl opacity-20">💕</div>
                <div className="absolute bottom-10 left-10 text-5xl opacity-20">💖</div>
              </div>

              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl mb-6 sm:mb-8">💕</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 sm:mb-6">
                  Ready to Start Your Love Story?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-xl mx-auto font-light">
                  Join thousands of couples who are already playing, connecting, and celebrating together.
                </p>
                <MagneticButton strength={0.3}>
                  <Link href="/auth/signup">
                    <div className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                      Create Free Account
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </CinematicReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-rose-100/60 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-lg text-gray-900">Love Dove</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-rose-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-rose-600 transition-colors">Terms of Service</Link>
              <Link href="/auth/login" className="hover:text-rose-600 transition-colors">Log In</Link>
            </div>
            <p className="text-xs text-gray-400"> Love Dove. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
