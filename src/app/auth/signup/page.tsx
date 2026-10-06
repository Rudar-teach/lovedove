'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Loader2, ArrowRight, Sparkles, Eye, EyeOff, WifiOff, AtSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import PremiumBackground from '@/components/PremiumBackground';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', username: '' });

  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
        setConnectionError(true);
        return false;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`${url}/auth/v1/health`, { method: 'GET', headers: { apikey: key }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Supabase not reachable');
        return true;
      } catch (e) {
        clearTimeout(timeout);
        const res2 = await fetch(`${url}/rest/v1/`, { method: 'GET', headers: { apikey: key }, signal: controller.signal });
        clearTimeout(timeout);
        return res2.ok;
      }
    } catch {
      setConnectionError(true);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionError(false);
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (formData.username.length < 3) { toast.error('Username must be at least 3 characters'); return; }

    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      toast.error('Cannot connect to server. Please check your internet and try again.', { duration: 5000 });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName, username: formData.username },
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined,
        },
      });
      if (signUpError) {
        if (signUpError.message.includes('fetch') || signUpError.message.includes('Failed to')) setConnectionError(true);
        throw signUpError;
      }
      if (!authData.user) throw new Error('Signup failed');

      // Profile is auto-created by the DB trigger (handle_new_user).
      // If the trigger hasn't fired yet, fall back to a manual upsert.
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          username: formData.username,
          theme_color: '#e91e63',
        });
      }

      toast.success('Account created! Check your email to verify, then log in. 💕');
      router.push('/auth/login');
    } catch (error: any) {
      const msg = error.message || 'Something went wrong';
      if (msg.includes('fetch') || msg.includes('Failed to') || msg.includes('Network')) {
        setConnectionError(true);
        toast.error('Connection error. Please check your internet and try again.', { duration: 5000 });
      } else {
        toast.error(msg, { duration: 4000 });
      }
    } finally { setLoading(false); }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Heart className="w-7 h-7 text-white heart-beat" fill="white" />
              </div>
              <span className="font-display font-black text-3xl gradient-text-animated">Love Dove</span>
            </Link>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl font-display font-bold text-gray-900 mb-2">
              Create Your Account
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-gray-600">Join us and start your love story 💕</motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="glass-strong rounded-[2rem] shadow-2xl shadow-pink-500/10 border border-white/60 p-8 sm:p-10"
          >
            {connectionError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3"
              >
                <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Connection Error</p>
                  <p className="text-xs text-red-600 mt-1">Cannot connect to the server. Please check your internet and try again.</p>
                </div>
              </motion.div>
            )}
            <form onSubmit={handleSignup} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Rudar Salaria"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                icon={<User className="w-5 h-5" />}
                required
              />
              <Input
                label="Username"
                placeholder="rudar_teach"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                icon={<span className="text-lg font-bold text-gray-400">@</span>}
                required
              />
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail className="w-5 h-5" />}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[2.2rem] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                {loading ? 'Creating Account...' : <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600 pt-6 border-t border-pink-100/60">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 font-bold hover:underline">
                Log in
              </Link>
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing up, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </PremiumBackground>
  );
}
