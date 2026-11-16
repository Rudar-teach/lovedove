'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Heart, Lock, Check, AlertCircle, Mail } from 'lucide-react';
import CanvasBackground from '@/components/premium/CanvasBackground';
import ShinyText from '@/components/premium/ShinyText';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';
import { supabase } from '@/lib/supabase';
import { friendlyAuthError } from '@/lib/authErrors';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [noLink, setNoLink] = useState(false);

  // The reset link from the email carries the recovery token; after Supabase
  // processes it we get a session. If there is no session (user typed the URL),
  // offer to start over from the forgot-password page.
  useEffect(() => {
    let cancelled = false;
    if (!supabase) { setWaiting(false); setNoLink(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setWaiting(false);
      } else {
        // Give Supabase a beat to process the token, then check once more.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (cancelled) return;
            if (d2.session) setWaiting(false);
            else { setWaiting(false); setNoLink(true); }
          });
        }, 1200);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setWaiting(false);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(friendlyAuthError(authError.message));
      setLoading(false);
      return;
    }
    setSuccess(true);
    // Instantly signed in with the new password — send them into the app.
    setTimeout(() => router.replace('/'), 2200);
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
            {success ? '🎉' : '🔐'}
          </motion.div>
          <h2 className="text-4xl xl:text-5xl font-display font-black text-white mb-4">
            {success ? 'Password Updated!' : 'Set a New'}
            <br />
            <ShinyText text={success ? 'Welcome Back' : 'Password'} className="text-5xl xl:text-6xl" />
          </h2>
          <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
            {success
              ? 'Done! We are signing you in with your new password right now.'
              : 'Almost there — pick something strong and we will update it instantly.'}
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6 relative">
        <CanvasBackground />
        <GlassCard intensity="light" className="w-full max-w-md p-6 sm:p-10 relative z-10">
          {waiting ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto mb-4 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Opening your reset link…</p>
            </div>
          ) : noLink ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="text-xl font-display font-black text-gray-900 mb-2">No reset link found</h1>
              <p className="text-sm text-gray-600 mb-6">
                This page is opened from the link in your email. Did not get it?
                Request a new one — it takes seconds.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm"
              >
                <Mail className="w-4 h-4" /> Resend reset email
              </Link>
            </div>
          ) : success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-display font-black text-gray-900 mb-2">You&apos;re all set!</h1>
              <p className="text-gray-600 text-sm mb-2">Your new password is live — signing you in now…</p>
            </motion.div>
          ) : (
            <>
              <CinematicReveal direction="up">
                <div className="text-center mb-8 sm:mb-10">
                  <Link href="/" className="inline-flex items-center gap-2.5 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
                    </div>
                  </Link>
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-gray-900 mb-2">
                    New Password
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">Update it instantly — it applies the moment you save.</p>
                </div>
              </CinematicReveal>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <CinematicReveal direction="up" delay={0.1}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="At least 6 characters"
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

                <CinematicReveal direction="up" delay={0.15}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                        placeholder="Type it one more time"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100/80 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                </CinematicReveal>

                {password.length > 0 && password !== confirm && (
                  <p className="text-amber-600 text-xs text-center bg-amber-50 p-2 rounded-lg">Passwords do not match yet</p>
                )}

                {error && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                <CinematicReveal direction="up" delay={0.2}>
                  <motion.button
                    type="submit"
                    disabled={loading || password.length < 6 || password !== confirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password <Check className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </CinematicReveal>
              </form>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
