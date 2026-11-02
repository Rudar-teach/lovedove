'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cake, Plus, Eye, Trash2, Copy, Check, ExternalLink, Link2,
  ArrowLeft, Loader2, Globe, Lock, ImageIcon, Calendar, Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';

interface Site {
  id: string;
  name: string;
  message: string | null;
  photos: string[] | null;
  theme: string;
  slug: string;
  is_public: boolean;
  view_count: number | null;
  created_at: string;
  from_name: string | null;
  age: number | null;
}

const THEME_COLORS: Record<string, string> = {
  pink: 'from-pink-400 to-rose-500',
  purple: 'from-purple-400 to-indigo-500',
  red: 'from-red-400 to-rose-500',
  blue: 'from-blue-400 to-indigo-500',
  sunset: 'from-orange-400 to-amber-500',
  mint: 'from-emerald-400 to-teal-500',
  lavender: 'from-violet-400 to-pink-500',
  gold: 'from-yellow-400 to-amber-500',
};

export default function MySitesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('birthday_sites')
      .select('id, name, message, photos, theme, slug, is_public, view_count, created_at, from_name, age')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSites(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    void loadSites();
  }, [authLoading, isAuthenticated, user, router, loadSites]);

  const siteUrl = (slug: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/birthday/${slug}` : '';

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(siteUrl(slug));
      setCopiedSlug(slug);
      toast.success('Link copied!');
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const togglePublic = async (site: Site) => {
    const { error } = await supabase
      .from('birthday_sites')
      .update({ is_public: !site.is_public })
      .eq('id', site.id);
    if (error) toast.error('Could not update');
    else {
      toast.success(site.is_public ? 'Site is now private' : 'Site is now public!');
      void loadSites();
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from('birthday_sites').delete().eq('id', id);
    setDeleting(null);
    setConfirmDelete(null);
    if (error) toast.error('Could not delete');
    else { toast.success('Site deleted'); void loadSites(); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <Cake className="w-12 h-12 text-pink-400 mx-auto animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200/40 select-none"
            style={{ left: `${(i * 12.7) % 100}%`, fontSize: `${16 + (i % 3) * 8}px` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            {['🎂', '🎁', '💖', '🎈'][i % 4]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/70 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                My Birthday Sites
              </h1>
              <p className="text-sm text-gray-500">{sites.length} site{sites.length !== 1 ? 's' : ''} created</p>
            </div>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-pink-200/50 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-12 text-center">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No birthday sites yet</h3>
            <p className="text-gray-500 mb-6">Create your first birthday surprise in just a few steps.</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" /> Create your first site
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sites.map((site, i) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Cover */}
                    <div className={`w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${THEME_COLORS[site.theme] || THEME_COLORS.pink} flex items-center justify-center relative overflow-hidden`}>
                      {site.photos && site.photos.length > 0 ? (
                        <img src={site.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">🎂</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 sm:p-5 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{site.name}</h3>
                          <p className="text-xs text-gray-500">
                            {site.from_name && `from ${site.from_name} · `}
                            {new Date(site.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                          site.is_public ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {site.is_public ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
                        </span>
                      </div>

                      {site.message && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{site.message}</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {site.view_count ?? 0}</span>
                        {site.photos && site.photos.length > 0 && (
                          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {site.photos.length}</span>
                        )}
                        {site.age && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {site.age}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/birthday/${site.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold hover:shadow-md transition-shadow"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                        <button
                          onClick={() => copyLink(site.slug)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                          {copiedSlug === site.slug ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Link</>}
                        </button>
                        <button
                          onClick={() => togglePublic(site)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          {site.is_public ? <><Lock className="w-3 h-3" /> Private</> : <><Globe className="w-3 h-3" /> Publish</>}
                        </button>
                        {confirmDelete === site.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(site.id)}
                              disabled={deleting === site.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deleting === site.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Sure?
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(site.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Share link info */}
        {sites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 text-white text-center shadow-2xl shadow-pink-300/40"
          >
            <Link2 className="w-8 h-8 mx-auto mb-2" />
            <h3 className="text-xl font-black mb-1">Share the surprise</h3>
            <p className="text-white/80 text-sm mb-4">Copy any site link and send it on WhatsApp, Instagram, or anywhere.</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" /> Create another
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
