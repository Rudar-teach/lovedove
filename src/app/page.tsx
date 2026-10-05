'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Gamepad2, Trophy, Users, Sparkles, ChevronRight, Gift, Camera, MessageCircle, Star, Filter, Search, Zap, Flame, Music, Target, Brain, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const games = [
  // Classic
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find the pairs', gradient: 'from-purple-400 to-pink-500', category: 'Classic' },
  { name: 'Memory Palace', slug: 'memorypalace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-violet-400 to-pink-500', category: 'Classic' },
  { name: 'Rock Paper Scissors', slug: 'rockpaperscissors', icon: '🪨', desc: 'Classic hand game', gradient: 'from-gray-400 to-gray-600', category: 'Classic' },
  { name: 'Hangman Love', slug: 'hangman', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic' },
  { name: 'Number Guess', slug: 'numberguess', icon: '🔢', desc: 'Guess the number', gradient: 'from-blue-400 to-indigo-500', category: 'Classic' },
  { name: '2048', slug: 'game2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-yellow-500', category: 'Classic' },
  { name: 'Snake', slug: 'snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-green-400 to-emerald-500', category: 'Classic' },
  // Arcade
  { name: 'Flappy Heart', slug: 'flappyheart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade' },
  { name: 'Pong 2 Player', slug: 'pong', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-cyan-400 to-blue-500', category: 'Arcade' },
  { name: "Cupid's Arrow", slug: 'cupidsarrow', icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade' },
  { name: 'Heart Catcher', slug: 'heartcatcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade' },
  { name: 'Hearts', slug: 'hearts', icon: '♥️', desc: 'Card game classic', gradient: 'from-red-500 to-rose-600', category: 'Arcade' },
  // Party
  { name: 'Truth or Dare', slug: 'truthordare', icon: '😈', desc: 'Spicy questions', gradient: 'from-purple-500 to-pink-500', category: 'Party' },
  { name: 'Kissing Spinner', slug: 'kissinggame', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party' },
  { name: 'Relationship Bingo', slug: 'relationshipbingo', icon: '🎯', desc: 'Couple bingo', gradient: 'from-blue-400 to-purple-500', category: 'Party' },
  { name: 'Drawing Challenge', slug: 'drawingchallenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-yellow-400 to-orange-500', category: 'Party' },
  { name: 'Emoji Story', slug: 'emojistory', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party' },
  { name: 'Couple Pictionary', slug: 'couplepictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-purple-500', category: 'Party' },
  { name: 'Dance Challenge', slug: 'dancechallenge', icon: '💃', desc: 'Show your moves!', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party' },
  // Quiz
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz' },
  { name: 'Trivia Battle', slug: 'triviabattle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-purple-400 to-indigo-500', category: 'Quiz' },
  { name: 'Love Song Quiz', slug: 'lovesongquiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Love Trivia', slug: 'lovetrivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz' },
  { name: 'Typing Race', slug: 'typingrace', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Photo Quiz', slug: 'photoquiz', icon: '📸', desc: 'Guess your partner', gradient: 'from-purple-400 to-pink-500', category: 'Quiz' },
  { name: 'Speed Date', slug: 'speeddate', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz' },
  // Love Special
  { name: 'Compatibility Test', slug: 'compatibilitytest', icon: '💞', desc: 'Test your compatibility', gradient: 'from-pink-400 to-red-500', category: 'Love' },
  { name: "Couple's Scramble", slug: 'couplescramble', icon: '🔀', desc: 'Unscramble love words', gradient: 'from-violet-400 to-purple-500', category: 'Love' },
  { name: 'Love Maze', slug: 'lovemaze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-pink-400 to-purple-500', category: 'Love' },
  { name: 'Love Letters', slug: 'loveletters', icon: '💌', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'Puzzle Love', slug: 'puzzlelove', icon: '🧩', desc: 'Sliding puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Couple Golfs', slug: 'couplegolfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-green-400 to-emerald-500', category: 'Love' },
  { name: 'Love Calculator', slug: 'lovecalculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Love' },
];

const categories = ['All', 'Classic', 'Arcade', 'Party', 'Quiz', 'Love'];

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredGames = games.filter(g => {
    if (filter !== 'All' && g.category !== filter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const features = [
    { icon: <Gift className="w-7 h-7" />, title: 'Birthday Websites', description: 'Create beautiful birthday pages with photos, messages, and stunning themes.', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
    { icon: <Gamepad2 className="w-7 h-7" />, title: '36 Couple Games', description: 'Play fun games together - quizzes, tic-tac-toe, memory match, and many more!', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
    { icon: <Users className="w-7 h-7" />, title: 'Connect with Friends', description: 'Add your partner as a friend and track your journey together.', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { icon: <Trophy className="w-7 h-7" />, title: 'Earn Badges', description: 'Unlock badges for playing together - 10 hours, 100 hours, and many more!', color: 'from-yellow-500 to-orange-500', shadow: 'shadow-yellow-500/20' },
    { icon: <HeartHandshake className="w-7 h-7" />, title: 'Send Proposals', description: 'Customize and send beautiful proposals with email notifications.', color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
    { icon: <Zap className="w-7 h-7" />, title: 'Play Together Live', description: 'Share any game with a friend and play the same session in real-time.', color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/20' },
  ];

  return (
    <PremiumBackground>
      {/* Navigation */}
      <nav className="relative z-20 sticky top-0 backdrop-blur-xl bg-white/40 border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white heart-beat" fill="white" />
              </div>
              <span className="font-display font-black text-2xl sm:text-3xl gradient-text-animated">Love Dove</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login" className="hidden sm:block text-gray-700 hover:text-primary-600 font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all hover:bg-white/60 backdrop-blur-sm">
                Log In
              </Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-primary-500 to-rose-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-10 pb-16">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 text-primary-700 text-xs sm:text-sm font-semibold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="bg-gradient-to-r from-primary-600 to-rose-600 bg-clip-text text-transparent font-bold">
                Made with Love for Couples Everywhere
              </span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-gray-900 mb-4 sm:mb-6 leading-[1.05] tracking-tight"
          >
            Where Hearts
            <br />
            <span className="gradient-text-animated">Connect & Play</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block ml-2"
            >💕</motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-2"
          >
            Create beautiful birthday websites, play <span className="font-bold text-primary-600">36 fun couple games</span>, and celebrate your love story together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link href="/auth/signup" className="group relative w-full sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-rose-500 rounded-2xl opacity-50 group-hover:opacity-80 blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="relative bg-gradient-to-r from-primary-500 to-rose-500 text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-primary-500/30 group-hover:shadow-3xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                Start Your Love Story
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="#games" className="w-full sm:w-auto bg-white/80 backdrop-blur-xl text-gray-700 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg border-2 border-white/80 hover:border-primary-300 hover:scale-105 transition-all duration-300 shadow-lg text-center">
              🎮 See All 36 Games
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-2 sm:gap-5 text-xs sm:text-sm text-gray-500 font-medium px-2"
          >
            {[
              { icon: '💕', text: 'Made for Couples' },
              { icon: '🔒', text: '100% Private' },
              { icon: '🎨', text: 'Beautiful Themes' },
              { icon: '🎮', text: '36 Fun Games' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/50 shadow-sm">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Everything for{' '}
              <span className="gradient-text-animated">Your Love Story</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light px-2">From birthday celebrations to gaming together, Love Dove has it all.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <TiltCard intensity={6} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className={`h-full p-6 sm:p-7 bg-white/80 backdrop-blur-xl rounded-3xl border border-pink-100/60 shadow-lg ${feature.shadow} hover:shadow-2xl transition-all duration-300 group`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/40 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Get Started in{' '}
              <span className="gradient-text-animated">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', icon: '👤', title: 'Create Account', desc: 'Sign up with email and start your journey', gradient: 'from-pink-400 to-rose-500' },
              { step: '02', icon: '🎨', title: 'Add Photos & Details', desc: 'Upload photos and write a birthday message', gradient: 'from-purple-400 to-pink-500' },
              { step: '03', icon: '🎉', title: 'Share & Play', desc: 'Share the link and play games together!', gradient: 'from-orange-400 to-pink-500' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <TiltCard intensity={5}>
                  <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-pink-100/60 shadow-lg hover:shadow-2xl transition-all duration-500 group">
                    <div className="text-xs sm:text-sm font-bold text-primary-500 mb-3 sm:mb-4 tracking-widest">STEP {s.step}</div>
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${s.gradient} rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {s.icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2 sm:mb-3">{s.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section — ALL 36 GAMES */}
      <section id="games" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 text-primary-700 text-xs sm:text-sm font-semibold shadow-lg mb-4 sm:mb-5">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
              <span className="font-bold">Game Library</span>
              <span className="bg-gradient-to-r from-primary-600 to-rose-600 bg-clip-text text-transparent font-black">36 Games</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Fun <span className="gradient-text-animated">Couple Games</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light px-2">Challenge your partner and have fun together!</p>
          </motion.div>

          {/* Filter & Search */}
          <div className="mb-8 sm:mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search 36 games..."
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm sm:text-base text-gray-700 placeholder-gray-400 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                      filter === cat
                        ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg scale-105'
                        : 'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/60 hover:bg-white hover:border-primary-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Showing <span className="font-bold text-primary-600">{filteredGames.length}</span> of <span className="font-bold">{games.length}</span> games
            </p>
          </div>

          {/* All Games Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          >
            <AnimatePresence>
              {filteredGames.map((game, i) => (
                <motion.div
                  key={game.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                >
                  <Link href={`/games/${game.slug}`}>
                    <TiltCard intensity={6} glowColor="rgba(236, 72, 153, 0.15)">
                      <div className="group h-full p-4 sm:p-5 bg-white/80 backdrop-blur-xl rounded-2xl border border-pink-100/60 shadow-md hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          {game.icon}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5 leading-tight">{game.name}</h3>
                        <p className="text-xs text-gray-500 leading-tight hidden sm:block">{game.desc}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                          {game.category}
                        </span>
                      </div>
                    </TiltCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500">No games match your search</p>
            </div>
          )}
        </div>
      </section>

      {/* Themes Preview */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 mb-3 sm:mb-4 px-2">
              Stunning <span className="gradient-text-animated">Birthday Themes</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light px-2">Choose from 6 beautiful themes for your birthday site.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { name: 'Pink Romance', gradient: 'from-pink-400 to-rose-500', emoji: '💕' },
              { name: 'Purple Dreams', gradient: 'from-purple-400 to-indigo-500', emoji: '🔮' },
              { name: 'Ocean Blue', gradient: 'from-blue-400 to-cyan-500', emoji: '🌊' },
              { name: 'Garden Green', gradient: 'from-green-400 to-emerald-500', emoji: '🌿' },
              { name: 'Golden Glow', gradient: 'from-yellow-400 to-orange-500', emoji: '✨' },
              { name: 'Dark Elegance', gradient: 'from-gray-700 to-gray-900', emoji: '🌙' },
            ].map((theme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <TiltCard intensity={4}>
                  <div className={`h-32 sm:h-44 bg-gradient-to-br ${theme.gradient} rounded-2xl sm:rounded-3xl shadow-xl flex items-end p-4 sm:p-5 text-white font-bold hover:shadow-2xl transition-all duration-300 cursor-pointer group`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform">{theme.emoji}</span>
                      <span className="text-sm sm:text-base">{theme.name}</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary-500 via-rose-500 to-pink-500 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-16 text-center overflow-hidden shadow-2xl shadow-primary-500/40"
          >
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl sm:text-6xl mb-4 sm:mb-6"
              >💕</motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-3 sm:mb-4 drop-shadow-lg">
                Ready to Start?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-lg mx-auto font-light px-2">
                Join couples creating memories and having fun together!
              </p>
              <Link href="/auth/signup" className="inline-block relative group">
                <div className="absolute -inset-1 bg-white/30 rounded-2xl blur-md group-hover:blur-xl transition-all duration-300" />
                <div className="relative bg-white text-primary-600 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
                  Create Your Account ✨
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-rose-900/20" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white heart-beat" fill="white" />
            </div>
            <span className="font-display font-black text-xl sm:text-2xl">Love Dove</span>
          </div>
          <p className="text-gray-400 mb-2 text-sm sm:text-base">Where Hearts Connect · 36 Couple Games</p>
          <p className="text-gray-600 text-xs sm:text-sm">Made with 💕 by Rudar Salaria</p>
        </div>
      </footer>
    </PremiumBackground>
  );
}
