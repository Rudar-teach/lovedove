'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Gamepad2, Trophy, ChevronRight, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Birthday Websites',
      description: 'Create beautiful birthday pages with photos, messages, and stunning themes.',
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Couple Games',
      description: 'Play fun games together - quizzes, tic-tac-toe, memory match, and more!',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Connect with Friends',
      description: 'Add your partner as a friend and track your journey together.',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Earn Badges',
      description: 'Unlock badges for playing together - 10 hours, 100 hours, and many more!',
    },
  ];

  const games = [
    { name: 'Tic-Tac-Toe', icon: '⭕❌', players: '2 Players', difficulty: 'Easy' },
    { name: 'Memory Match', icon: '🎴', players: '2 Players', difficulty: 'Medium' },
    { name: 'Couple Quiz', icon: '💡', players: '2 Players', difficulty: 'Fun' },
    { name: 'Would You Rather', icon: '🤔', players: '2 Players', difficulty: 'Fun' },
    { name: 'Word Chain', icon: '🔤', players: '2 Players', difficulty: 'Medium' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-rose-200/40 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/40 to-pink-200/40 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-pink-200/30 to-primary-200/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium">
              <Heart className="w-4 h-4 text-primary-500 heart-beat" />
              Made with Love for Couples 💕
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-display font-black text-gray-900 mb-6 leading-tight"
          >
            Welcome to{' '}
            <span className="gradient-text">Love Dove</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Create beautiful birthday websites and play fun games together with your special someone 💑
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="min-w-[200px]">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Floating hearts */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-16 text-6xl"
          >
            💕🕊️💕
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fdf2f8"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-pink-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Everything for{' '}
              <span className="gradient-text">Your Love Story</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From birthday celebrations to gaming together, Love Dove has it all.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-full p-8 bg-white rounded-3xl border border-pink-100 shadow-lg shadow-pink-500/5 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-rose-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-500/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Fun <span className="gradient-text">Couple Games</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Challenge your partner and have fun together!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="p-6 bg-white rounded-3xl border border-pink-100 shadow-lg shadow-pink-500/5 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-2 transition-all duration-300 text-center cursor-pointer">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-500">{game.players}</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                    {game.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary-500 to-rose-500 rounded-[2rem] p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-primary-500/30"
          >
            {/* Decorative elements */}
            <div className="absolute top-6 left-8 text-6xl opacity-20">💕</div>
            <div className="absolute bottom-6 right-8 text-6xl opacity-20">🕊️</div>
            <div className="absolute top-1/2 left-4 text-4xl opacity-10">❤️</div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Start?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto">
                Join thousands of couples creating memories and having fun together!
              </p>
              <Link href="/auth/signup">
                <button className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
                  Create Your Account ✨
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-3xl mb-4">🕊️ Love Dove</div>
          <p className="text-gray-400 mb-6">Where Hearts Connect</p>
          <p className="text-gray-500 text-sm">
            Made with 💕 by Rudar
          </p>
        </div>
      </footer>
    </div>
  );
}
