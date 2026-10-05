'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, Calendar, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const THEMES: Record<string, { gradient: string; bg: string; text: string }> = {
  pink: { gradient: 'from-pink-400 via-rose-400 to-red-400', bg: 'from-pink-100 via-rose-50 to-white', text: 'text-gray-900' },
  purple: { gradient: 'from-purple-400 via-violet-400 to-indigo-400', bg: 'from-purple-100 via-violet-50 to-white', text: 'text-gray-900' },
  blue: { gradient: 'from-blue-400 via-cyan-400 to-teal-400', bg: 'from-blue-100 via-cyan-50 to-white', text: 'text-gray-900' },
  green: { gradient: 'from-green-400 via-emerald-400 to-teal-400', bg: 'from-green-100 via-emerald-50 to-white', text: 'text-gray-900' },
  gold: { gradient: 'from-yellow-400 via-amber-400 to-orange-400', bg: 'from-yellow-100 via-amber-50 to-white', text: 'text-gray-900' },
  dark: { gradient: 'from-gray-700 via-gray-800 to-gray-900', bg: 'from-gray-200 via-gray-100 to-white', text: 'text-gray-900' },
};

export default function BirthdayPage({ params }: { params: { slug: string } }) {
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSite();
  }, [params.slug]);

  const loadSite = async () => {
    const { data, error } = await supabase.from('birthday_sites').select('*').eq('slug', params.slug).maybeSingle();
    if (error) { setError('Birthday site not found'); setLoading(false); return; }
    if (data) {
      setSite(data);
      // Increment view count
      await supabase.from('birthday_sites').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
      setLoading(false);
    } else { setError('Birthday site not found'); setLoading(false); }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) navigator.share({ title: `${site.name}'s Birthday!`, url });
    else { navigator.clipboard.writeText(url); alert('Link copied!'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <Heart className="w-12 h-12 text-primary-500 heart-beat" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <p className="text-6xl mb-4">😢</p>
          <p className="text-xl font-medium text-gray-700">{error || 'Site not found'}</p>
        </div>
      </div>
    );
  }

  const theme = THEMES[site.theme] || THEMES.pink;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative overflow-hidden`}>
      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0 }}
            animate={{ y: window.innerHeight + 50, opacity: [0, 0.5, 0] }}
            transition={{ duration: 8 + Math.random() * 5, delay: Math.random() * 5, repeat: Infinity }}
            className="absolute text-2xl"
          >
            {['💕', '❤️', '💖', '💝', '🎂', '🎉', '🕊️'][i % 7]}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${theme.gradient} py-20 px-4 text-center overflow-hidden`}>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto relative z-10">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-6">🎂</motion.div>
          <p className="text-xl md:text-2xl text-white font-medium mb-4">Happy Birthday</p>
          <h1 className="text-5xl md:text-7xl font-display font-black mb-6 text-white drop-shadow-lg">{site.name}!</h1>
          <p className="text-xl md:text-2xl text-white/90">Wishing you a day filled with love and joy 💕</p>
        </motion.div>
      </section>

      {/* Message Section */}
      {site.message && (
        <section className="py-16 px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-pink-100 text-center">
            <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-gray-800 italic leading-relaxed whitespace-pre-wrap">{site.message}</p>
            <Heart className="w-8 h-8 text-primary-500 mx-auto mt-6 heart-beat" />
          </motion.div>
        </section>
      )}

      {/* Photos Section */}
      {site.photos && site.photos.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-display font-bold text-center gradient-text mb-12">
              Memories Together 📸
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {site.photos.map((url: string, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl overflow-hidden shadow-lg aspect-square">
                  <img src={url} alt={`Memory ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`bg-gradient-to-br ${theme.gradient} rounded-3xl p-8 md:p-12 text-white shadow-2xl`}>
            <Gift className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Wishing You All The Best!</h2>
            <p className="text-xl mb-8">May your special day be as amazing as you are! 💖</p>
            <button onClick={handleShare} className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 transition-all inline-flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share This Page
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl py-6 text-center text-gray-600 text-sm">
        Made with <Heart className="w-4 h-4 inline text-primary-500" /> using <a href="/" className="text-primary-600 font-semibold hover:underline">Love Dove</a>
      </footer>
    </div>
  );
}