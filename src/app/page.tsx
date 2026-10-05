'use client';

import { motion } from 'framer-motion';
import { Heart, Gamepad2, Trophy, Users, Sparkles, ChevronRight, Gift, Camera, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';

export default function Home() {
  const features = [
    { icon: <Gift className="w-7 h-7" />, title: 'Birthday Websites', description: 'Create beautiful birthday pages with photos, messages, and stunning themes.', color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
    { icon: <Gamepad2 className="w-7 h-7" />, title: 'Couple Games', description: 'Play fun games together - quizzes, tic-tac-toe, memory match, and more!', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
    { icon: <Users className="w-7 h-7" />, title: 'Connect with Friends', description: 'Add your partner as a friend and track your journey together.', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { icon: <Trophy className="w-7 h-7" />, title: 'Earn Badges', description: 'Unlock badges for playing together - 10 hours, 100 hours, and many more!', color: 'from-yellow-500 to-orange-500', shadow: 'shadow-yellow-500/20' },
  ];

  const games = [
    { name: 'Tic-Tac-Toe', icon: '⭕', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500' },
    { name: 'Memory Match', icon: '🎴', desc: 'Find the pairs', gradient: 'from-purple-400 to-pink-500' },
    { name: 'Couple Quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500' },
    { name: 'Would You Rather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500' },
    { name: 'Word Chain', icon: '🔤', desc: 'Build the chain', gradient: 'from-cyan-400 to-blue-500' },
  ];

  return (
    <PremiumBackground>
      {/* Navigation */}
      <nav className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Heart className="w-6 h-6 text-white heart-beat" fill="white" />
              </div>
              <span className="font-display font-black text-3xl gradient-text-animated">Love Dove</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="hidden sm:block text-gray-700 hover:text-primary-600 font-semibold px-5 py-2.5 rounded-full transition-all hover:bg-white/60 backdrop-blur-sm">
                Log In
              </Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-primary-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all btn-shine">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 pt-10">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full glass-strong border border-white/50 text-primary-700 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="bg-gradient-to-r from-primary-600 to-rose-600 bg-clip-text text-transparent font-bold">
                Made with Love for Couples Everywhere
              </span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-gray-900 mb-6 leading-[1.05] tracking-tight"
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
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Create beautiful birthday websites, play fun couple games, and celebrate your love story together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup" className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-rose-500 rounded-full opacity-40 group-hover:opacity-70 blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="relative bg-gradient-to-r from-primary-500 to-rose-500 text-white px-9 py-4 rounded-full font-bold text-lg shadow-2xl shadow-primary-500/30 group-hover:shadow-3xl group-hover:scale-105 transition-all duration-300 flex items-center gap-2 btn-shine">
                Start Your Love Story
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="#features" className="glass-strong text-gray-700 px-9 py-4 rounded-full font-bold text-lg border border-white/60 hover:border-primary-300 hover:scale-105 transition-all duration-300 shadow-lg">
              Explore Features
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-5 text-xs sm:text-sm text-gray-500 font-medium"
          >
            {[
              { icon: '💕', text: 'Made for Couples' },
              { icon: '🔒', text: '100% Private' },
              { icon: '🎨', text: 'Beautiful Themes' },
              { icon: '🎮', text: '5 Fun Games' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 glass px-4 py-2 rounded-full border border-white/50 shadow-sm">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4">
              Everything for{' '}
              <span className="gradient-text-animated">Your Love Story</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">From birthday celebrations to gaming together, Love Dove has it all.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <TiltCard intensity={6} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className={`h-full p-7 bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg ${feature.shadow} hover:shadow-2xl transition-all duration-300 group`}>
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/40 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4">
              Get Started in{' '}
              <span className="gradient-text-animated">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <div className="text-center p-8 bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg premium-shadow group hover:premium-shadow-lg transition-all duration-500">
                    <div className="text-sm font-bold text-primary-500 mb-4 tracking-widest">STEP {s.step}</div>
                    <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{s.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4">
              Fun <span className="gradient-text-animated">Couple Games</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">Challenge your partner and have fun together!</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {games.map((game, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="group h-full p-6 bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg shadow-pink-500/5 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-500">{game.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes Preview */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-gray-900 mb-4">
              Stunning <span className="gradient-text-animated">Birthday Themes</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-light">Choose from 6 beautiful themes for your birthday site.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <div className={`h-44 bg-gradient-to-br ${theme.gradient} rounded-[1.5rem] shadow-xl flex items-end p-5 text-white font-bold hover:shadow-2xl transition-all duration-300 cursor-pointer group`}>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl group-hover:scale-125 transition-transform">{theme.emoji}</span>
                      <span className="text-lg">{theme.name}</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary-500 via-rose-500 to-pink-500 rounded-[2.5rem] p-10 sm:p-16 text-center overflow-hidden shadow-2xl shadow-primary-500/40"
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
                className="text-6xl mb-6"
              >💕</motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white mb-4 drop-shadow-lg">
                Ready to Start?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-lg mx-auto font-light">
                Join couples creating memories and having fun together!
              </p>
              <Link href="/auth/signup" className="inline-block relative group">
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-md group-hover:blur-xl transition-all duration-300" />
                <div className="relative bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
                  Create Your Account ✨
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-rose-900/20" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white heart-beat" fill="white" />
            </div>
            <span className="font-display font-black text-2xl">Love Dove</span>
          </div>
          <p className="text-gray-400 mb-2">Where Hearts Connect</p>
          <p className="text-gray-600 text-sm">Made with 💕 by Rudar Salaria</p>
        </div>
      </footer>
    </PremiumBackground>
  );
}
