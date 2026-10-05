'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Users, Trophy, Sparkles, Flame } from 'lucide-react';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';

const games = [
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy game', color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/15' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find matching pairs', color: 'from-purple-400 to-pink-500', shadow: 'shadow-purple-500/15' },
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'Test how well you know each other', color: 'from-rose-400 to-red-500', shadow: 'shadow-rose-500/15' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices for couples', color: 'from-orange-400 to-pink-500', shadow: 'shadow-orange-500/15' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building challenge', color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/15' },
];

export default function GamesPage() {
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong border border-white/50 text-primary-700 text-sm font-semibold shadow-lg mb-5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Game Lobby
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black gradient-text-animated mb-4">Couple Games</h1>
            <p className="text-gray-600 max-w-lg mx-auto text-lg font-light">Pick a game and have fun together with your special someone! 💕</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, i) => (
              <motion.div key={game.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/games/${game.slug}`}>
                  <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                    <div className="group h-full bg-white rounded-[1.5rem] shadow-lg border border-pink-100/60 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                      <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        {game.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                      <p className="text-gray-500 mb-6 text-sm">{game.desc}</p>
                      <div className="flex items-center text-primary-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                        Play Now <ArrowRight className="w-4 h-4" />
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
