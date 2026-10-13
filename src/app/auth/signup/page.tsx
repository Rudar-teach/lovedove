'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, Heart, Mail, Lock, User, ArrowRight, Sparkles,
  AtSign, Check, X as XIcon, Loader2
} from 'lucide-react';
import CanvasBackground from '@/components/premium/CanvasBackground';
import ShinyText from '@/components/premium/ShinyText';
import GlassCard from '@/components/premium/GlassCard';
import CinematicReveal from '@/components/premium/CinematicReveal';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Username availability check (debounced)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) { setUsernameStatus('idle'); return; }
    if (!USERNAME_RE.test(clean)) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', clean)
          .maybeSingle();
        if (error) {
          // Treat DB errors as "unknown" — let the server validate on submit
          setUsernameStatus('idle');
        } else if (data) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      toast.error('Username must be 3-20 characters, letters, numbers, and underscores only');
      return;
    }
    if (usernameStatus === 'taken') {
      toast.error('That username is already taken');
      return;
    }
    setLoading(true);
    try {
      // Server-side guard: re-check username uniqueness right before sign-up
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();
      if (taken) {
        toast.error('That username was just taken. Please pick another one.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim() || 'User',
            username: cleanUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || 'Signup failed');
        setLoading(false);
        return;
      }
      if (!data.user) {
        toast.error('Signup failed — please try again');
        setLoading(false);
        return;
      }

      // Create the profile row immediately (the auth trigger also creates one,
      // but we want to control the username and update the auth metadata copy).
      const fullName = name.trim() || 'User';
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          username: cleanUsername,
          email: email.trim(),
          bio: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // 23505 = unique_violation on username
        if (profileError.code === '23505') {
          toast.error('That username was just taken. Please pick another one.');
          setLoading(false);
          return;
        }
      }

      // If the project has email confirmation OFF, signInWithPassword works now.
      // If it's ON, the user will land on /auth/callback after confirming.
      // Either way, route to /add-friends so they can find their first partner.
      if (data.session) {
        toast.success('Account created! Let\'s add your first friend 💕');
        router.push('/add-friends');
      } else {
        toast.success('Account created! Check your email to confirm, then sign in.');
        router.push('/auth/login');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = (() => {
    switch (usernameStatus) {
      case 'checking': return <span className="text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking…</span>;
      case 'available': return <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> @{username.trim().toLowerCase()} is available!</span>;
      case 'taken': return <span className="text-red-500 flex items-center gap-1"><XIcon className="w-3 h-3" /> That username is already taken</span>;
      case 'invalid': return <span className="text-red-500 flex items-center gap-1"><XIcon className="w-3 h-3" /> 3-20 chars · letters, numbers, underscores</span>;
      default: return <span className="text-gray-400">3-20 characters · letters, numbers, underscores</span>;
    }
  })();

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
              Pick a unique username, add friends, and play couple games together in real time.
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
              <CinematicReveal direction="up" delay={0.05}>
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

              <CinematicReveal direction="up" delay={0.1}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Username <span className="text-pink-600">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="pick_a_username"
                      maxLength={20}
                      autoComplete="username"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 transition-all ${
                        usernameStatus === 'available' ? 'border-emerald-300 focus:ring-emerald-500/30' :
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-300 focus:ring-red-500/30' :
                        'border-rose-100/80 focus:ring-pink-500/30 focus:border-pink-300'
                      }`}
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                      {usernameStatus === 'available' && <Check className="w-4 h-4 text-emerald-500" />}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XIcon className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  <p className="text-xs mt-1.5 px-1">{usernameHint}</p>
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
                  disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
