'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Heart, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import CanvasBackground from '@/components/premium/CanvasBackground';
import ShinyText from '@/components/premium/ShinyText';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <>
      <div className="min-h-screen flex relative overflow-hidden">
        {/* Left - Visual */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-fuchsia-500 to-pink-500 items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 right-20 w-40 h-40 bg-white/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-60 h-60 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10 text-center px-12">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-9xl mb-8"
            >
              💖
            </motion.div>
            <h2 className="text-4xl xl:text-5xl font-display font-black text-white mb-4">
              Join the
              <br />
              <ShinyText text="Love Dove" className="text-5xl xl:text-6xl" color="from-white via-pink-100 to-white" />
            </h2>
            <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
              Create beautiful birthday websites, play couple games, and celebrate love together.
            </p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative">
          <CanvasBackground />
          <GlassCard intensity="light" className="w-full max-w-md p-6 sm:p-10 relative z-10">
            <CinematicReveal direction="up">
              <div className="text-center mb-8 sm:mb-10">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-5 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
                  </div>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Start your love journey today</p>
              </div>
            </CinematicReveal>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <CinematicReveal direction="up" delay={0.1}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </CinematicReveal>

              <CinematicReveal direction="up" delay={0.15}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </CinematicReveal>

              <CinematicReveal direction="up" delay={0.2}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CinematicReveal>

              <CinematicReveal direction="up" delay={0.25}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </CinematicReveal>

              <CinematicReveal direction="up" delay={0.3}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </CinematicReveal>
            </form>

            <CinematicReveal direction="up" delay={0.4}>
              <p className="text-center text-sm text-gray-600 mt-6 sm:mt-8">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-pink-600 font-bold hover:text-rose-600 transition-colors">
                  Sign In
                </Link>
              </p>
            </CinematicReveal>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
