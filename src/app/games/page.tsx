'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Users, Trophy, Sparkles, Flame, Gamepad2 } from 'lucide-react';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';

const GAMES_PER_ROW = 3;

const games = [
  // Classic
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find the pairs', gradient: 'from-purple-400 to-pink-500', category: 'Classic' },
  { name: 'Rock Paper Scissors', slug: 'rockpaperscissors', icon: '🪨📄✂️', desc: 'Classic hand game', gradient: 'from-gray-400 to-gray-600', category: 'Classic' },
  { name: 'Hangman Love', slug: 'hangman', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic' },
  { name: 'Number Guess Battle', slug: 'numberguess', icon: '🔢', desc: 'Guess the number', gradient: 'from-blue-400 to-indigo-500', category: 'Classic' },
  { name: '2048', slug: 'game2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-yellow-500', category: 'Classic' },
  { name: 'Snake', slug: 'snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-green-400 to-emerald-500', category: 'Classic' },
  // Arcade
  { name: 'Flappy Heart', slug: 'flappyheart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade' },
  { name: 'Pong 2 Player', slug: 'pong', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-cyan-400 to-blue-500', category: 'Arcade' },
  { name: 'Cupid\'s Arrow', slug: 'cupidsarrow', icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade' },
  { name: 'Heart Catcher', slug: 'heartcatcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade' },
  // Fun & Party
  { name: 'Truth or Dare', slug: 'truthordare', icon: '😈', desc: 'Spicy questions', gradient: 'from-purple-500 to-pink-500', category: 'Party' },
  { name: 'Love Calculator', slug: 'lovecalculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Fun' },
  { name: 'Kissing Spinner', slug: 'kissinggame', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party' },
  { name: 'Relationship Bingo', slug: 'relationshipbingo', icon: '🎯', desc: 'Couple bingo', gradient: 'from-blue-400 to-purple-500', category: 'Party' },
  { name: 'Drawing Challenge', slug: 'drawingchallenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-yellow-400 to-orange-500', category: 'Party' },
  { name: 'Emoji Story', slug: 'emojistory', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party' },
  { name: 'Couple Pictionary', slug: 'couplepictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-purple-500', category: 'Party' },
  // Quiz & Brain
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz' },
  { name: 'Trivia Battle', slug: 'triviabattle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-purple-400 to-indigo-500', category: 'Quiz' },
  { name: 'Love Song Quiz', slug: 'lovesongquiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Love Trivia', slug: 'lovetrivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz' },
  { name: 'Typing Race', slug: 'typingrace', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  // Love Special
  { name: 'Compatibility Test', slug: 'compatibilitytest', icon: '💞', desc: 'Test your compatibility', gradient: 'from-pink-400 to-red-500', category: 'Love' },
  { name: 'Couple\'s Scramble', slug: 'couplescramble', icon: '🔀', desc: 'Unscramble love words', gradient: 'from-violet-400 to-purple-500', category: 'Love' },
  { name: 'Love Maze', slug: 'lovemaze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-pink-400 to-purple-500', category: 'Love' },
  { name: 'Love Letter', slug: 'loveletter', icon: '✉️', desc: 'Write a love letter game', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'Promise Chain', slug: 'promisechain', icon: '⛓️', desc: 'Make promises together', gradient: 'from-amber-400 to-orange-500', category: 'Love' },
  { name: 'First Date Simulator', slug: 'firstdate', icon: '🌹', desc: 'Simulate your first date', gradient: 'from-pink-400 to-rose-500', category: 'Love' },
  { name: 'Puzzle Love', slug: 'puzzlelove', icon: '🧩', desc: 'Heart-shaped sliding puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Photo Quiz', slug: 'photoquiz', icon: '📸', desc: 'Guess your partner', gradient: 'from-purple-400 to-pink-500', category: 'Quiz' },
  { name: 'Love Letters', slug: 'loveletters', icon: '💌', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Love' },
  { name: 'Dance Challenge', slug: 'dancechallenge', icon: '💃', desc: 'Show your moves!', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party' },
  { name: 'Speed Date', slug: 'speeddate', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz' },
  { name: 'Memory Palace', slug: 'memorypalace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-violet-400 to-pink-500', category: 'Classic' },
  { name: 'Couple Golf', slug: 'couplegolfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-green-400 to-emerald-500', category: 'Love' },
  // Love 2
  { name: 'Love Crossword', slug: 'lovecrossword', icon: '✏️', desc: 'Solve love-themed crossword', gradient: 'from-rose-400 to-pink-500', category: 'Quiz' },
  { name: 'Heart Match', slug: 'heartmatch', icon: '💘', desc: 'Memory matching game', gradient: 'from-primary-400 to-rose-500', category: 'Classic' },
  { name: 'Couple Trivia 2', slug: 'coupletrivia2', icon: '💕', desc: '10 couple questions', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Couple Quiz 2', slug: 'couplequiz2', icon: '💝', desc: '10 relationship questions', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Love Bingo', slug: 'lovebingo', icon: '🎯', desc: 'Match 3 in a row', gradient: 'from-pink-400 to-purple-500', category: 'Party' },
  { name: 'Heart Puzzle', slug: 'heartpuzzle', icon: '🧩', desc: 'Arrange love pieces', gradient: 'from-rose-400 to-red-500', category: 'Love' },
  { name: 'Typing Love', slug: 'lovetyping', icon: '⌨️', desc: 'Type romantic quotes', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Memory Cards', slug: 'couplememory2', icon: '🎴', desc: 'Match 12 pairs of love symbols', gradient: 'from-purple-400 to-pink-500', category: 'Classic' },
  { name: 'Word Search', slug: 'lovewordsearch', icon: '🔎', desc: 'Unscramble 10 love words', gradient: 'from-yellow-400 to-orange-500', category: 'Quiz' },
  { name: 'Heart Quiz', slug: 'heartquiz', icon: '💝', desc: '12 heart knowledge questions', gradient: 'from-rose-400 to-red-500', category: 'Quiz' },
  { name: 'Couple Charades', slug: 'couplecharades', icon: '🎭', desc: 'Act out 16 romantic words!', gradient: 'from-purple-500 to-pink-500', category: 'Party' },
  { name: 'Love Math', slug: 'lovemath', icon: '➕', desc: 'Solve math in 60 seconds!', gradient: 'from-blue-400 to-indigo-500', category: 'Quiz' },
  { name: 'Heart Spelling', slug: 'heartspelling', icon: '✍️', desc: 'Spell 12 love words', gradient: 'from-teal-400 to-cyan-500', category: 'Quiz' },
  { name: 'Couple Riddles', slug: 'coupleriddles', icon: '🧩', desc: '12 love riddles', gradient: 'from-violet-400 to-purple-500', category: 'Quiz' },
  { name: 'Emoji Quiz', slug: 'loveemojiquiz', icon: '😀', desc: 'Guess the movie!', gradient: 'from-yellow-400 to-pink-500', category: 'Party' },
  { name: 'Color Quiz', slug: 'heartcolors', icon: '🎨', desc: '10 color questions', gradient: 'from-pink-400 to-rose-500', category: 'Quiz' },
  { name: 'Pattern Memory', slug: 'couplepatterns', icon: '🎨', desc: 'Memorize color patterns', gradient: 'from-indigo-400 to-purple-500', category: 'Classic' },
  { name: 'Number Sequence', slug: 'lovesequences', icon: '🔢', desc: 'Find next number', gradient: 'from-cyan-400 to-blue-500', category: 'Quiz' },
  { name: 'Heart Rhythm', slug: 'heartrhythm', icon: '💓', desc: 'Tap to the beat!', gradient: 'from-rose-400 to-red-500', category: 'Love' },
];

const categories = ['All', ...new Set(games.map(g => g.category))];

export default function GamesPage() {
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

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <span key={cat} className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-pink-100/60 text-sm font-semibold text-gray-700 shadow-sm">
                {cat}
              </span>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {games.map((game, i) => (
              <motion.div key={game.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-primary-600 font-bold text-sm">
                          <Gamepad2 className="w-4 h-4" /> Play
                        </div>
                        <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(window.location.origin + '/games/' + game.slug); }} className="text-xs text-gray-400 hover:text-primary-500 transition-colors">
                          Share
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
