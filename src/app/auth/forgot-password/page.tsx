'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Heart, Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import CanvasBackground from '@/components/premium/CanvasBackground';
import ShinyText from '@/components/premium/ShinyText';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';
import { supabase } from '@/lib/supabase';
import { friendlyAuthError } from '@/lib/authErrors';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovedove.vercel.app';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (supabase) {
      // Keep the session restored if the user already has one
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/auth/reset-password`,
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600">
      {/* Left side - Hero */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-9xl mb-8"
          >
            💌
          </motion.div>
          <h2 className="text-4xl xl:text-5xl font-display font-black text-white mb-4">
            Forgot Your
            <br />
            <ShinyText text="Password?" className="text-5xl xl:text-6xl" />
          </h2>
          <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
            No problem — enter your email and we will send you a link to reset it right away.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6 relative">
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
                {sent ? 'Check Your Email' : 'Reset Your Password'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {sent ? 'We sent you a magic link to get back in.' : 'We will email you a reset link — it takes seconds.'}
              </p>
            </div>
          </CinematicReveal>

          {sent ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700 mb-1 font-semibold">Confirmation email sent to</p>
              <p className="text-pink-600 font-bold mb-4">{email || 'your inbox'}</p>
              <p className="text-xs text-gray-500 mb-6">
                Tap the link inside to choose a new password. Did not get it? Check spam, or wait a minute and try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm font-semibold text-pink-600 hover:text-pink-800 mb-4 block"
              >
                Send it to a different email
              </button>
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <CinematicReveal direction="up" delay={0.1}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                      required
                    />
                  </div>
                </div>
              </CinematicReveal>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
              )}

              <CinematicReveal direction="up" delay={0.2}>
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
                      Send Reset Link
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </CinematicReveal>

              <p className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" /> Remembered it? Sign in
                </button>
              </p>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
