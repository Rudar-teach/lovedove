'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Sparkles, Gamepad2, X } from 'lucide-react';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';

// Only include slugs that actually have a page.tsx in src/app/games/<slug>/
const games = [
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find the pairs', gradient: 'from-purple-400 to-pink-500', category: 'Classic' },
  { name: 'Rock Paper Scissors', slug: 'rockpaperscissors', icon: '🪨📄✂️', desc: 'Classic hand game', gradient: 'from-gray-400 to-gray-600', category: 'Classic' },
  { name: 'Hangman Love', slug: 'hangman', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic' },
  { name: 'Number Guess', slug: 'numberguess', icon: '🔢', desc: 'Guess the number', gradient: 'from-blue-400 to-indigo-500', category: 'Classic' },
  { name: '2048', slug: 'game2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-yellow-500', category: 'Classic' },
  { name: 'Snake', slug: 'snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-green-400 to-emerald-500', category: 'Classic' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building', gradient: 'from-cyan-400 to-blue-500', category: 'Classic' },
  { name: 'Pong 2 Player', slug: 'pong', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-cyan-400 to-blue-500', category: 'Arcade' },
  { name: 'Flappy Heart', slug: 'flappyheart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade' },
  { name: "Cupid's Arrow", slug: 'cupidsarrow', icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade' },
  { name: 'Heart Catcher', slug: 'heartcatcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade' },
  { name: 'Couple Golf', slug: 'couplegolfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-green-400 to-emerald-500', category: 'Love' },
  { name: 'Heart Math', slug: 'heartmath', icon: '➕', desc: 'Love math challenges', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Couple Reflex', slug: 'couple_reflex', icon: '⚡', desc: 'Who has faster reflexes?', gradient: 'from-green-500 to-emerald-500', category: 'Classic' },
  // Fun & Party
  { name: 'Truth or Dare', slug: 'truthordare', icon: '😈', desc: 'Spicy questions', gradient: 'from-purple-500 to-pink-500', category: 'Party' },
  { name: 'Love Calculator', slug: 'lovecalculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Fun' },
  { name: 'Kissing Spinner', slug: 'kissinggame', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party' },
  { name: 'Relationship Bingo', slug: 'relationshipbingo', icon: '🎯', desc: 'Couple bingo', gradient: 'from-blue-400 to-purple-500', category: 'Party' },
  { name: 'Drawing Challenge', slug: 'drawingchallenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-yellow-400 to-orange-500', category: 'Party' },
  { name: 'Emoji Story', slug: 'emojistory', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party' },
  { name: 'Couple Pictionary', slug: 'couplepictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-purple-500', category: 'Party' },
  { name: 'Dance Challenge', slug: 'dancechallenge', icon: '💃', desc: 'Show your moves!', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party' },
  { name: 'Couple Charades', slug: 'couplecharades', icon: '🎭', desc: 'Act out romantic words', gradient: 'from-purple-500 to-pink-500', category: 'Party' },
  { name: 'Couple Drawing', slug: 'couple_drawing', icon: '🖌️', desc: 'Drawing challenges', gradient: 'from-purple-500 to-indigo-500', category: 'Party' },
  // Quiz & Brain
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz' },
  { name: 'Trivia Battle', slug: 'triviabattle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-purple-400 to-indigo-500', category: 'Quiz' },
  { name: 'Love Song Quiz', slug: 'lovesongquiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Love Trivia', slug: 'lovetrivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz' },
  { name: 'Typing Race', slug: 'typingrace', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Speed Date', slug: 'speeddate', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz' },
  { name: 'Love Crossword', slug: 'lovecrossword', icon: '✏️', desc: 'Solve love-themed crossword', gradient: 'from-rose-400 to-pink-500', category: 'Quiz' },
  { name: 'Heart Match', slug: 'heartmatch', icon: '💘', desc: 'Memory matching', gradient: 'from-primary-400 to-rose-500', category: 'Classic' },
  { name: 'Couple Trivia 2', slug: 'coupletrivia2', icon: '💕', desc: '10 couple questions', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Couple Quiz 2', slug: 'couplequiz2', icon: '💝', desc: '10 relationship questions', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Heart Puzzle', slug: 'heartpuzzle', icon: '🧩', desc: 'Arrange love pieces', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Typing Love', slug: 'lovetyping', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Heart Quiz', slug: 'heartquiz', icon: '💝', desc: '12 heart questions', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Love Math', slug: 'lovemath', icon: '➕', desc: 'Solve math in 60 seconds!', gradient: 'from-blue-400 to-indigo-500', category: 'Quiz' },
  { name: 'Couple Riddles', slug: 'coupleriddles', icon: '🧩', desc: '12 love riddles', gradient: 'from-violet-400 to-purple-500', category: 'Quiz' },
  { name: 'Emoji Quiz', slug: 'loveemojiquiz', icon: '😀', desc: 'Guess the phrase', gradient: 'from-yellow-400 to-pink-500', category: 'Party' },
  { name: 'Color Quiz', slug: 'heartcolors', icon: '🎨', desc: '10 color questions', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Pattern Memory', slug: 'couplepatterns', icon: '🎨', desc: 'Memorize color patterns', gradient: 'from-indigo-400 to-purple-500', category: 'Classic' },
  { name: 'Love Language Test', slug: 'love_language_test', icon: '🗣️', desc: 'Find your love language', gradient: 'from-rose-500 to-pink-500', category: 'Quiz' },
  { name: 'Relationship Quiz', slug: 'relationship_quiz', icon: '💑', desc: 'Test your relationship IQ', gradient: 'from-amber-500 to-rose-500', category: 'Quiz' },
  { name: 'Couple Typing Race', slug: 'couple_typing_race', icon: '⌨️', desc: 'Type love quotes fast', gradient: 'from-blue-500 to-indigo-500', category: 'Classic' },
  { name: 'Love Emoji Quiz', slug: 'love_emoji_quiz', icon: '😍', desc: 'Guess phrases from emojis', gradient: 'from-rose-500 to-pink-500', category: 'Party' },
  { name: 'Love Word Scramble', slug: 'love_word_scramble', icon: '🔀', desc: 'Unscramble romantic words', gradient: 'from-red-500 to-rose-500', category: 'Quiz' },
  { name: 'Girlfriend Rules', slug: 'girlfriend_rules', icon: '👸', desc: 'Hypotheticals for GF', gradient: 'from-pink-500 to-rose-500', category: 'Quiz' },
  { name: 'Boyfriend Rules', slug: 'boyfriend_rules', icon: '🤴', desc: 'Hypotheticals for BF', gradient: 'from-blue-500 to-indigo-500', category: 'Quiz' },
  { name: 'Couple Music Quiz', slug: 'couple_music_quiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-blue-500 to-indigo-500', category: 'Quiz' },
  { name: 'Love Quotes Quiz', slug: 'love_quotes_quiz', icon: '💬', desc: 'Guess who said it', gradient: 'from-amber-500 to-orange-500', category: 'Quiz' },
  // Love Special
  { name: 'Love Maze', slug: 'lovemaze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-pink-400 to-purple-500', category: 'Love' },
  { name: 'Couple Scramble', slug: 'couplescramble', icon: '🔀', desc: 'Unscramble love words', gradient: 'from-violet-400 to-purple-500', category: 'Love' },
  { name: 'Love Letter', slug: 'loveletter', icon: '✉️', desc: 'Write a love letter game', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'Promise Chain', slug: 'promisechain', icon: '⛓️', desc: 'Make promises together', gradient: 'from-amber-400 to-orange-500', category: 'Love' },
  { name: 'First Date Simulator', slug: 'firstdate', icon: '🌹', desc: 'Simulate your first date', gradient: 'from-pink-400 to-rose-500', category: 'Love' },
  { name: 'Puzzle Love', slug: 'puzzlelove', icon: '🧩', desc: 'Heart-shaped puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Love Letters', slug: 'loveletters', icon: '💌', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'How Well Did You Meet', slug: 'howwell_met', icon: '💞', desc: 'Memory game about your first meeting', gradient: 'from-pink-500 to-rose-500', category: 'Love' },
  { name: 'Couple Poetry', slug: 'couple_poetry', icon: '📝', desc: 'Write poetry together', gradient: 'from-rose-500 to-red-500', category: 'Love' },
  { name: 'Love Challenges', slug: 'love_challenges', icon: '🔥', desc: '30-day love challenges', gradient: 'from-orange-500 to-rose-500', category: 'Love' },
  { name: 'Love Word Scramble 2', slug: 'love_word_scramble2', icon: '🔤', desc: 'Sentence scrambles', gradient: 'from-red-500 to-rose-500', category: 'Quiz' },
  { name: 'Couple Word Search', slug: 'couple_word_search', icon: '🔎', desc: 'Find love words', gradient: 'from-pink-500 to-rose-500', category: 'Quiz' },
  { name: 'Couple Word Search 2', slug: 'couple_word_search2', icon: '🔎', desc: 'More word search', gradient: 'from-blue-500 to-indigo-500', category: 'Quiz' },
  { name: 'Love Story Builder', slug: 'love_story_builder', icon: '📚', desc: 'Build a story together', gradient: 'from-amber-500 to-orange-500', category: 'Love' },
  { name: 'Couple Goals', slug: 'couple_goals', icon: '🎯', desc: 'Achieve goals together', gradient: 'from-amber-500 to-yellow-500', category: 'Love' },
  { name: 'Couple Goals 2', slug: 'couple_goals2', icon: '🎯', desc: 'Bucket list together', gradient: 'from-teal-500 to-blue-500', category: 'Love' },
  { name: 'Couple Bucket List', slug: 'couple_bucketlist', icon: '✅', desc: 'Do it all together', gradient: 'from-teal-500 to-blue-500', category: 'Love' },
  { name: 'Relationship Goals', slug: 'relationship_goals', icon: '🌱', desc: 'Track your goals', gradient: 'from-green-500 to-teal-500', category: 'Love' },
  { name: 'Love Journal', slug: 'love_journal', icon: '📖', desc: 'Write daily love notes', gradient: 'from-rose-500 to-pink-500', category: 'Love' },
  { name: 'Couple Playlist', slug: 'couple_playlist', icon: '🎧', desc: 'Build shared playlist', gradient: 'from-purple-500 to-violet-500', category: 'Love' },
  { name: 'Anniversary Planner', slug: 'anniversary_planner', icon: '🎂', desc: 'Plan perfect anniversary', gradient: 'from-red-500 to-rose-500', category: 'Love' },
  { name: 'Couple Photo Story', slug: 'couple_photo_story', icon: '📸', desc: 'Tell your story', gradient: 'from-amber-500 to-orange-500', category: 'Love' },
  { name: 'Couple Photo Challenge', slug: 'couple_photo', icon: '📸', desc: 'Photo challenges', gradient: 'from-purple-500 to-indigo-500', category: 'Party' },
  { name: 'Love Story Builder 2', slug: 'love_story2', icon: '📚', desc: 'More story builders', gradient: 'from-amber-500 to-orange-500', category: 'Love' },
  { name: 'Love Horoscope', slug: 'love_horoscope', icon: '⭐', desc: 'Your daily love horoscope', gradient: 'from-indigo-500 to-purple-500', category: 'Fun' },
  { name: 'Future Together', slug: 'future_together', icon: '🔮', desc: 'Predict your future', gradient: 'from-blue-500 to-purple-500', category: 'Love' },
  { name: 'Love Dares', slug: 'love_dares', icon: '💪', desc: 'Romantic dares for couples', gradient: 'from-red-500 to-pink-500', category: 'Party' },
  { name: 'Love Dares 2', slug: 'love_dares2', icon: '💪', desc: 'More romantic dares', gradient: 'from-red-500 to-pink-500', category: 'Party' },
  { name: 'Couple Truths', slug: 'couple_truths', icon: '💕', desc: 'Truth time for couples', gradient: 'from-rose-500 to-red-500', category: 'Love' },
  { name: 'Couple Scenarios', slug: 'couple_scenarios', icon: '🎭', desc: 'Real-life scenarios', gradient: 'from-blue-500 to-indigo-500', category: 'Love' },
  { name: 'Love Mad Libs', slug: 'love_madlibs', icon: '📝', desc: 'Fill in the blanks', gradient: 'from-amber-500 to-orange-500', category: 'Fun' },
  { name: 'Love Story 2', slug: 'love_story2', icon: '📚', desc: 'Branching love story', gradient: 'from-amber-500 to-orange-500', category: 'Love' },
  { name: 'Love Q&A', slug: 'love_qna', icon: '💬', desc: 'Q&A about your relationship', gradient: 'from-rose-500 to-red-500', category: 'Love' },
  { name: 'Love Scenarios', slug: 'love_scenario', icon: '🌟', desc: 'What would you do?', gradient: 'from-purple-500 to-pink-500', category: 'Quiz' },
  { name: 'Love Bingo', slug: 'love_bingo', icon: '🎯', desc: 'Couple activities bingo', gradient: 'from-green-500 to-emerald-500', category: 'Party' },
  { name: 'Love Truths', slug: 'love_truths', icon: '💭', desc: 'Deep truth questions', gradient: 'from-pink-500 to-purple-500', category: 'Love' },
  { name: 'Love Wheel', slug: 'love_wheel', icon: '🎡', desc: 'Spin for romance', gradient: 'from-purple-500 to-violet-500', category: 'Fun' },
  { name: 'Love Countdown', slug: 'love_countdown', icon: '⏰', desc: 'Count special days', gradient: 'from-rose-500 to-red-500', category: 'Love' },
  { name: 'Love Resolutions', slug: 'love_resolutions', icon: '🌱', desc: 'Love goals together', gradient: 'from-green-500 to-emerald-500', category: 'Love' },
  { name: 'Love Achievements', slug: 'love_achievements', icon: '🏆', desc: 'Unlockable badges', gradient: 'from-yellow-500 to-amber-500', category: 'Fun' },
  { name: 'Couple Time Capsule', slug: 'couple_timecapsule', icon: '⏳', desc: 'Save memories', gradient: 'from-amber-500 to-orange-500', category: 'Love' },
  { name: 'Couple Quiz (Advanced)', slug: 'couple_quiz', icon: '❓', desc: 'Relationship quiz', gradient: 'from-amber-500 to-rose-500', category: 'Quiz' },
  { name: 'Couple Love Bingo', slug: 'lovebingo', icon: '🎯', desc: 'Match 3 in a row', gradient: 'from-pink-400 to-purple-500', category: 'Party' },
  { name: 'Memory Palace', slug: 'memorypalace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-violet-400 to-pink-500', category: 'Classic' },
  { name: 'Heart Spelling', slug: 'heartspelling', icon: '✍️', desc: 'Spell love words', gradient: 'from-teal-400 to-cyan-500', category: 'Quiz' },
  { name: 'Couple Memory Match', slug: 'couple_memory_match', icon: '🎴', desc: 'Card flip memory', gradient: 'from-purple-500 to-pink-500', category: 'Classic' },
  { name: 'Couple Word Search', slug: 'lovewordsearch', icon: '🔎', desc: 'Find love words', gradient: 'from-yellow-400 to-orange-500', category: 'Quiz' },
  { name: 'Memory Cards', slug: 'couplememory2', icon: '🎴', desc: 'Match 12 pairs', gradient: 'from-purple-400 to-pink-500', category: 'Classic' },
  { name: 'Word Search', slug: 'lovewordsearch', icon: '🔎', desc: 'Unscramble love words', gradient: 'from-yellow-400 to-orange-500', category: 'Quiz' },
  { name: 'Love Scramble 2', slug: 'love_scramble2', icon: '🔤', desc: 'More word scrambles', gradient: 'from-red-500 to-rose-500', category: 'Quiz' },
  { name: 'Love Hangman 2', slug: 'lovehangman2', icon: '💌', desc: 'Guess love words', gradient: 'from-rose-400 to-pink-500', category: 'Classic' },
];

const categories = ['All', ...Array.from(new Set(games.map(g => g.category)))];

export default function GamesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = games.filter(g => {
    const matchCat = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong border border-white/50 text-primary-700 text-sm font-semibold shadow-lg mb-5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Game Lobby — {games.length} Games
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black gradient-text-animated mb-4">Couple Games</h1>
            <p className="text-gray-600 max-w-lg mx-auto text-lg font-light">Pick a game and have fun together with your special someone! 💕</p>
          </motion.div>

          {/* Proposal CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-10">
            <Link href="/proposals">
              <div className="bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 rounded-[2rem] p-6 sm:p-8 text-center shadow-2xl shadow-primary-500/30 hover:shadow-3xl hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                <div className="text-4xl mb-3">💌</div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-2">Send a Special Proposal</h2>
                <p className="text-white/80 max-w-md mx-auto">Create a custom purpose/proposal and send it to your partner. They&apos;ll get an email notification! 💕</p>
              </div>
            </Link>
          </motion.div>

          {/* Search + Category filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center justify-center">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(cat => {
                const isActive = activeCategory === cat;
                const count = cat === 'All' ? games.length : games.filter(g => g.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-105'
                        : 'bg-white/70 text-gray-600 hover:bg-white border border-pink-100/60'
                    }`}
                  >
                    {cat}
                    <span className={`ml-1.5 text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          <p className="text-center text-sm text-gray-500 mb-6">
            Showing {filtered.length} {filtered.length === 1 ? 'game' : 'games'}
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </p>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((game, i) => (
                <motion.div
                  key={game.slug}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <Link href={`/games/${game.slug}`}>
                    <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                      <div className="group h-full bg-white rounded-[1.5rem] shadow-lg border border-pink-100/60 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            {game.icon}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{game.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{game.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{game.desc}</p>
                        <div className="flex items-center text-primary-500 text-sm font-semibold group-hover:gap-2 transition-all">
                          <Gamepad2 className="w-4 h-4" />
                          <span>Play Now</span>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-500 text-lg">No games found. Try a different search or category.</p>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-12 pb-8">
            Made with 💕 by Love Dove — {games.length} couple games and growing!
          </p>
        </div>
      </div>
    </PremiumBackground>
  );
}
