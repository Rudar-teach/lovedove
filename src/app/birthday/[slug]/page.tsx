'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ChevronLeft, ChevronRight, X, Cake, Sparkles, Eye, Calendar, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Guestbook from '@/components/Guestbook';

interface SiteData {
  id: string;
  name: string;
  message: string | null;
  photos: string[] | null;
  theme: string;
  slug: string;
  is_public: boolean;
  view_count: number | null;
  birthday_date: string | null;
  age: number | null;
  from_name: string | null;
  relationship: string | null;
  spotify_url: string | null;
  accent_color: string;
  font_family: string;
  confetti: boolean;
  music_autoplay: boolean;
  created_at: string;
}

const THEMES: Record<string, { from: string; to: string; bg: string; text: string; muted: string }> = {
  pink:     { from: '#fbcfe8', to: '#fda4af', bg: '#fff1f2', text: '#831843', muted: '#be185d' },
  purple:   { from: '#e9d5ff', to: '#c4b5fd', bg: '#faf5ff', text: '#581c87', muted: '#7e22ce' },
  red:      { from: '#fecaca', to: '#fda4af', bg: '#fef2f2', text: '#7f1d1d', muted: '#b91c1c' },
  blue:     { from: '#bfdbfe', to: '#a5b4fc', bg: '#eff6ff', text: '#1e3a8a', muted: '#1d4ed8' },
  sunset:   { from: '#fed7aa', to: '#fbbf24', bg: '#fffbeb', text: '#78350f', muted: '#c2410c' },
  mint:     { from: '#a7f3d0', to: '#6ee7b7', bg: '#ecfdf5', text: '#064e3b', muted: '#047857' },
  lavender: { from: '#ddd6fe', to: '#fbcfe8', bg: '#f5f3ff', text: '#4c1d95', muted: '#6d28d9' },
  gold:     { from: '#fef08a', to: '#fcd34d', bg: '#fefce8', text: '#713f12', muted: '#a16207' },
};

const FONT_MAP: Record<string, string> = {
  inter: 'Inter, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  cursive: '"Segoe Script", "Brush Script MT", cursive',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
};

function Confetti({ color }: { color: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        size: 6 + Math.random() * 8,
        emoji: ['🎉', '🎊', '✨', '💖', '🎈', '⭐'][i % 6],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.left}%`, fontSize: p.size * 2 }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '100vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

export default function BirthdaySitePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('birthday_sites')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) { setNotFound(true); setLoading(false); return; }
      // is_published is null on rows written before the column existed, so
      // only an explicit false hides a site. The guestbook API agrees on this.
      if (!data.is_public || data.is_published === false) { setNotFound(true); setLoading(false); return; }

      setSite(data as SiteData);
      setLoading(false);

      // Count the view once per page load
      if (!viewCounted) {
        setViewCounted(true);
        await supabase.rpc('increment_site_views', { site_slug: slug });
        setSite(s => (s ? { ...s, view_count: (s.view_count || 0) + 1 } : s));
      }
    })();

    return () => { cancelled = true; };
  }, [slug, viewCounted]);

  const theme = site ? THEMES[site.theme] || THEMES.pink : THEMES.pink;
  const font = site ? FONT_MAP[site.font_family] || FONT_MAP.inter : FONT_MAP.inter;
  const photos = site?.photos || [];
  const viewCount = site?.view_count ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
        <div className="text-center">
          <Cake className="w-14 h-14 mx-auto animate-bounce" style={{ color: theme.muted }} />
          <p className="mt-4 font-semibold" style={{ color: theme.text }}>Opening your surprise…</p>
        </div>
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
        <div className="text-center max-w-sm">
          <Lock className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-800 mb-2">Site not found</h1>
          <p className="text-gray-500 mb-6">This birthday site is private or no longer exists.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg inline-block">
            Go to Love Dove
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.from})`, fontFamily: font }}
    >
      {site.confetti && <Confetti color={site.accent_color} />}

      {/* Floating hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute select-none opacity-20"
            style={{ left: `${(i * 12.5) % 100}%`, fontSize: `${20 + (i % 3) * 10}px` }}
            animate={{ y: [0, -40, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            💕
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-7xl sm:text-8xl mb-4"
          >
            🎂
          </motion.div>

          <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: theme.muted }}>
            Happy Birthday
          </p>
          <h1 className="text-5xl sm:text-6xl font-black mb-4" style={{ color: theme.text }}>
            {site.name}
          </h1>

          {site.age !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="inline-block px-5 py-2 rounded-full text-white font-black text-lg shadow-lg mb-3"
              style={{ background: site.accent_color }}
            >
              Turning {site.age} 🎉
            </motion.div>
          )}

          {site.from_name && (
            <p className="text-base font-medium" style={{ color: theme.muted }}>
              from {site.from_name} 💕
            </p>
          )}
        </motion.div>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/40 backdrop-blur-sm aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={photoIdx}
                  src={photos[photoIdx]}
                  alt=""
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightbox(true)}
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === photoIdx ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setPhotoIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-white scale-105' : 'border-transparent opacity-60'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Message card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-7 sm:p-9 mb-8"
        >
          <Sparkles className="w-8 h-8 mb-4 mx-auto" style={{ color: site.accent_color }} />
          <p className="text-lg sm:text-xl leading-relaxed whitespace-pre-wrap text-center" style={{ color: theme.text }}>
            {site.message}
          </p>
          <div className="mt-6 pt-6 border-t border-pink-100 flex items-center justify-center gap-2 text-sm" style={{ color: theme.muted }}>
            <Heart className="w-4 h-4" fill="currentColor" />
            <span>
              {site.relationship && `${site.relationship} · `}
              {site.from_name && `from ${site.from_name}`}
            </span>
          </div>
        </motion.div>

        {/* Spotify */}
        {site.spotify_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-5 mb-8"
          >
            <button
              onClick={() => setShowMusic(!showMusic)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-800">Your birthday song</p>
                <p className="text-xs text-gray-500">Tap to {showMusic ? 'hide' : 'play'} on Spotify</p>
              </div>
            </button>
            <AnimatePresence>
              {showMusic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl overflow-hidden">
                    <iframe
                      src={site.spotify_url.replace('/track/', '/embed/track/')}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="block"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Guestbook */}
        <Guestbook
          siteId={site.id}
          siteSlug={site.slug}
          accentColor={site.accent_color}
          textColor={theme.text}
          mutedColor={theme.muted}
        />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-xs font-medium" style={{ color: theme.muted }}>
            <Eye className="w-3.5 h-3.5" />
            {viewCount.toLocaleString()} view{viewCount !== 1 ? 's' : ''}            {site.birthday_date && (
              <>
                <span className="mx-1">·</span>
                <Calendar className="w-3.5 h-3.5" />
                {new Date(site.birthday_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </>
            )}
          </div>
          <p className="mt-4 text-xs" style={{ color: theme.muted }}>
            Made with <Heart className="w-3 h-3 inline" fill="currentColor" /> on{' '}
            <Link href="/" className="font-bold hover:underline">Love Dove</Link>
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={photos[photoIdx]}
              alt=""
              className="max-w-full max-h-full rounded-xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
