'use client';

/**
 * Love Dove — Community Story Wall
 *
 * "Add a story with your loved ones" — a shared feed of little memory
 * cards. Every story can be:
 *   - partner-only (just the couple can read it)
 *   - community    (everyone on the site can read it)
 * and the author can post anonymously (name hidden).
 *
 * Anonymous authors are still allowed to post (they just pick the
 * "Anonymous" toggle); signed-in users get a composer with the
 * audience + anonymity controls.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Heart, Eye, User, Send, Sparkles, Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  fetchCommunityStories, addStory, toggleStoryLike, fetchStoryLikes,
  type Story,
} from '@/lib/stories';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

export default function StoriesPage() {
  const user = useAuthStore((s) => s.user);
  const [stories, setStories] = useState<Story[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // composer
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [emoji, setEmoji] = useState('💞');
  const [audience, setAudience] = useState<'partner' | 'community'>('community');
  const [anonymous, setAnonymous] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [posting, setPosting] = useState(false);

  // Resolve "my partner" so partner-only stories have someone to be for.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: matches } = await supabase
        .from('matches')
        .select('user1_id, user2_id, status')
        .or(`and(user1_id.eq.${user.id},status.in.(accepted,connected)),and(user2_id.eq.${user.id},status.in.(accepted,connected))`)
        .limit(1);
      const m = matches?.[0] as any;
      if (!m || cancelled) return;
      const pid = m.user1_id === user.id ? m.user2_id : m.user1_id;
      setPartnerId(pid);
      const { data: p } = await supabase.from('profiles').select('full_name, username').eq('id', pid).maybeSingle();
      if (!cancelled) setPartnerName((p?.full_name || p?.username || '') as string);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const load = useCallback(async () => {
    const list = await fetchCommunityStories(60);
    setStories(list);
    const likes = user ? await fetchStoryLikes(list.map((s) => s.id), user.id) : new Set<string>();
    setLiked(likes);
    setLoaded(true);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setPosting(true);
    const res = await addStory(user.id, {
      title, body, emoji, audience,
      partnerId: audience === 'partner' ? partnerId : null,
      isAnonymous: anonymous,
    });
    setPosting(false);
    if (res.ok) {
      toast.success(anonymous ? 'Posted anonymously 🎭' : 'Story shared 💕');
      setTitle(''); setBody(''); setAnonymous(false);
      setShowComposer(false);
      await load();
    } else {
      toast.error(res.error || 'Could not post');
    }
  };

  const like = async (s: Story) => {
    if (!user) { toast('Sign in to like stories 💕'); return; }
    const current = liked.has(s.id);
    setLiked((prev) => {
      const next = new Set(prev);
      if (current) next.delete(s.id); else next.add(s.id);
      return next;
    });
    await toggleStoryLike(s.id, user.id, current);
  };

  const authorLabel = (s: Story) => {
    if (s.is_anonymous) return { name: 'Anonymous', handle: '🎭 no name', anon: true };
    const name = s.author_username ? `@${s.author_username}` : 'Love Dove';
    return { name: s.author_username ? s.author_username : 'Love Dove', handle: name, anon: false };
  };

  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-display font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8 text-pink-500" /> Stories
            </h1>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              Little memory cards shared between loved ones — or the whole community.
              You can post your name or stay anonymous.
            </p>
          </div>

          {/* Composer */}
          <div>
            {!showComposer ? (
              <button
                onClick={() => setShowComposer(true)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shadow">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  {user ? 'Share a story with your loved ones…' : 'Sign in to share a story'}
                </span>
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePost}
                className="bg-white rounded-2xl border border-pink-200 shadow-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
                    className="w-12 text-center text-2xl"
                    maxLength={4}
                    aria-label="emoji"
                  />
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="A short title (optional)"
                    maxLength={60}
                    className="flex-1 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  placeholder="Write your story, memory or note for your person…"
                  maxLength={500}
                  className="w-full text-sm bg-pink-50/40 border border-pink-100 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
                />

                {/* audience + anonymity controls */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAudience('community')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      audience === 'community'
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Community
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience('partner')}
                    disabled={!partnerId}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-40 ${
                      audience === 'partner'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Just {partnerName ? partnerName : 'my partner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnonymous((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      anonymous
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> {anonymous ? 'Anonymous on' : 'Post anonymously'}
                  </button>
                </div>
                {audience === 'partner' && !partnerId && (
                  <p className="text-[11px] text-gray-400">
                    You need a partner to post partner-only — switch to Community for now, or{' '}
                    <Link href="/find-partner" className="text-pink-500 font-bold">find your partner</Link>.
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting || body.trim().length < 3 || (audience === 'partner' && !partnerId)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-xl shadow disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" /> {posting ? 'Posting…' : 'Share story'}
                  </button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Feed */}
          {!loaded ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 bg-white/60 rounded-2xl border border-pink-100">
              <p className="text-4xl mb-2">📖</p>
              <p className="font-bold text-gray-700">No stories yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first — share a little moment above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {stories.map((s) => {
                  const a = authorLabel(s);
                  const isLiked = liked.has(s.id);
                  return (
                    <motion.article
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow ${
                          a.anon ? 'bg-gray-100' : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
                        }`}>
                          {a.anon ? '🎭' : s.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            {a.anon ? 'Anonymous' : (s.author_username ? `@${s.author_username}` : 'Love Dove')}
                            {a.anon && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">name hidden</span>}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {timeAgo(s.created_at)}
                            {s.audience === 'partner' && (
                              <span className="text-pink-500 font-bold">· partner-only</span>
                            )}
                          </p>
                        </div>
                        {s.title && (
                          <h3 className="font-black text-gray-900 text-base truncate flex-1 text-right">{s.title}</h3>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.body}</p>

                      <div className="flex items-center gap-4 mt-4">
                        <button
                          onClick={() => like(s)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                            isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                          {s.likes_count} {s.likes_count === 1 ? 'like' : 'likes'}
                        </button>
                        <span className="text-[11px] text-gray-300 flex items-center gap-1">
                          <User className="w-3 h-3" /> {s.likes_count > 0 ? 'loved by the community' : 'new story'}
                        </span>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
