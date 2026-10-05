'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import PremiumBackground from '@/components/PremiumBackground';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [loading, setStateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setStateLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed');
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profileError) throw profileError;
      setUser(profile);
      setLoading(false);
      toast.success(`Welcome back! 💕`);
      router.push('/dashboard');
    } catch (error: any) { toast.error(error.message || 'Login failed. Please check your credentials.'); }
    finally { setStateLoading(false); }
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
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-primary-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <Heart className="w-7 h-7 text-white heart-beat" fill="white" />
              </div>
              <span className="font-display font-black text-3xl gradient-text-animated">Love Dove</span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Welcome Back 💕</h1>
            <p className="text-gray-600">Log in to continue your love story</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass-strong rounded-[2rem] shadow-2xl shadow-pink-500/10 border border-white/60 p-8 sm:p-10"
          >
            <form onSubmit={handleLogin} className="space-y-5">
              <Input name="email" type="email" label="Email" placeholder="you@example.com" icon={<Mail className="w-5 h-5" />} required />
              <div className="relative">
                <Input name="password" type={showPassword ? 'text' : 'password'} label="Password" placeholder="Enter your password" icon={<Lock className="w-5 h-5" />} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[2.2rem] text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                {loading ? 'Logging in...' : <>Log In <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </form>
            <div className="mt-8 text-center text-sm text-gray-600 pt-6 border-t border-pink-100/60">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-600 font-bold hover:underline">Sign up</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PremiumBackground>
  );
}
