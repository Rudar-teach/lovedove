'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Users, Trophy, Sparkles } from 'lucide-react';

const games = [
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy game', color: 'from-primary-400 to-primary-600' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find matching pairs', color: 'from-rose-400 to-rose-600' },
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'Test how well you know each other', color: 'from-pink-400 to-pink-600' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices for couples', color: 'from-orange-400 to-orange-600' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building challenge', color: 'from-purple-400 to-purple-600' },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Game Lobby
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-3">Couple Games</h1>
          <p className="text-gray-600 max-w-lg mx-auto">Pick a game and have fun together with your special someone! 💕</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, i) => (
            <motion.div key={game.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link href={`/games/${game.slug}`}>
                <div className="group h-full bg-white rounded-3xl shadow-lg shadow-pink-500/5 border border-pink-100 p-8 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                  <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                  <p className="text-gray-500 mb-6">{game.desc}</p>
                  <div className="flex items-center text-primary-600 font-medium">
                    Play Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}