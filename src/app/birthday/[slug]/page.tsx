'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, Camera, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';

const THEME_MAP: Record<string, { bg: string; card: string; text: string; accent: string }> = {
  pink: { bg: 'from-pink-300 via-rose-400 to-pink-400', card: 'bg-white/20 backdrop-blur-md border-white/30', text: 'text-white', accent: 'from-pink-300 to-rose-300' },
  purple: { bg: 'from-purple-400 via-violet-500 to-indigo-500', card: 'bg-white/20 backdrop-blur-md border-white/30', text: 'text-white', accent: 'from-purple-300 to-indigo-300' },
  blue: { bg: 'from-blue-400 via-cyan-500 to-blue-500', card: 'bg-white/20 backdrop-blur-md border-white/30', text: 'text-white', accent: 'from-blue-300 to-cyan-300' },
  green: { bg: 'from-green-400 via-emerald-500 to-green-500', card: 'bg-white/20 backdrop-blur-md border-white/30', text: 'text-white', accent: 'from-green-300 to-emerald-300' },
  gold: { bg: 'from-amber-400 via-orange-500 to-yellow-500', card: 'bg-white/20 backdrop-blur-md border-white/30', text: 'text-white', accent: 'from-yellow-300 to-orange-300' },
  dark: { bg: 'from-gray-800 via-gray-900 to-black', card: 'bg-white/10 backdrop-blur-md border-white/10', text: 'text-white', accent: 'from-gray-400 to-gray-300' },
};

export default function BirthdayViewPage({ params }: { params: { slug: string } }) {
  const [site, setSite] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('birthday_sites').select('*, profiles(*)').eq('slug', params.slug).single();
      if (data) { setSite(data); setOwner(data.profiles); }
      setLoading(false);
    };
    load();
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles className="w-12 h-12 text-primary-500" /></motion.div>
    </div>
  );

  if (!site) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="text-center">
        <p className="text-6xl mb-4">😔</p>
        <h1 className="text-2xl font-display font-bold text-gray-900">Birthday site not found</h1>
        <p className="text-gray-500 mt-2">This page might have been removed or doesn't exist.</p>
      </div>
    </div>
  );

  const theme = THEME_MAP[site.theme] || THEME_MAP.pink;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Hero */}
      <div className={`relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br ${theme.bg} overflow-hidden`}>
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${1 + Math.random() * 1.5}rem`,
              }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            >
              {['✨', '💕', '💖', '🌸', '🕊️'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
        <div className="relative z-10 text-center px-4 py-16">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1, type: 'spring' }} className="text-8xl mb-6">
            🎂
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`text-5xl md:text-7xl font-display font-black ${theme.text} mb-4 drop-shadow-lg`}>
            {site.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`text-xl ${theme.text}/80 font-light max-w-xl mx-auto`}>
            {site.message}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-strong border border-white/50 shadow-lg mb-4">
            <Heart className="w-5 h-5 text-primary-500 heart-beat" fill="currentColor" />
            <span className="font-semibold text-gray-700">Created with Love by {owner?.full_name || 'Someone'}</span>
          </div>
        </motion.div>

        {/* Photos */}
        {site.photos && site.photos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
            <h2 className="text-2xl font-display font-bold text-center gradient-text mb-6 flex items-center justify-center gap-2">
              <Camera className="w-6 h-6" /> Photo Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {site.photos.map((url: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className={`rounded-2xl overflow-hidden shadow-xl ${theme.card} border`}>
                    <img src={url} alt="" className="w-full h-52 object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
          <div className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${theme.accent} rounded-full text-white font-bold text-lg shadow-xl`}>
            <Sparkles className="w-5 h-5" />
            Happy Birthday!
            <Heart className="w-5 h-5 heart-beat" fill="white" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
