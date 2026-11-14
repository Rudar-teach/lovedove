'use client';

/**
 * Story Composer — the "add a story with your loved ones" card.
 *
 * Controls:
 *   - emoji + title + body
 *   - audience: Community (everyone on /stories) or Just my partner
 *   - "Post anonymously" toggle → name hidden on the feed
 *
 * Reused by /stories (community feed) and /our-story (couple wall).
 */

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Users, Heart, Eye, Send, Sparkles } from 'lucide-react';
import { addStory } from '@/lib/stories';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

export default function StoryComposer({
  partnerId,
  partnerLabel,
  defaultAudience = 'community',
  compact = false,
  onPosted,
}: {
  partnerId?: string | null;
  partnerLabel?: string;
  defaultAudience?: 'partner' | 'community';
  compact?: boolean;
  onPosted?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [emoji, setEmoji] = useState('💞');
  const [audience, setAudience] = useState<'partner' | 'community'>(
    partnerId ? defaultAudience : 'community'
  );
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  if (!user) {
    return (
      <div className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
        <p className="text-sm text-gray-500">
          <Link href="/auth/login" className="font-bold text-pink-500">Sign in</Link>{' '}
          to share a story with your loved ones 💕
        </p>
      </div>
    );
  }

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    const res = await addStory(user.id, {
      title,
      body,
      emoji,
      audience,
      partnerId: audience === 'partner' ? partnerId ?? null : null,
      isAnonymous: anonymous,
    });
    setPosting(false);
    if (res.ok) {
      toast.success(anonymous ? 'Posted anonymously 🎭' : 'Story shared with your loved ones 💕');
      setTitle('');
      setBody('');
      setAnonymous(false);
      setOpen(false);
      onPosted?.();
    } else {
      toast.error(res.error || 'Could not post your story');
    }
  };

  return (
    <div className="w-full">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shadow group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Add a story</p>
            <p className="text-[11px] text-gray-400">
              With your partner — or the whole community. You can hide your name.
            </p>
          </div>
        </button>
      ) : (
        <form onSubmit={post} className="bg-white rounded-2xl border border-pink-200 shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
              maxLength={4}
              aria-label="emoji"
              className="w-12 text-center text-2xl"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="A short title (optional)"
              className="flex-1 text-sm font-semibold focus:outline-none"
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={compact ? 2 : 3}
            maxLength={500}
            placeholder="Write a moment, memory or note for your person…"
            className="w-full text-sm bg-pink-50/40 border border-pink-100 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

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
              title={!partnerId ? 'Find your partner first' : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors disabled:opacity-40 ${
                audience === 'partner'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Just {partnerLabel ? partnerLabel : 'my partner'}
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
              <Eye className="w-3.5 h-3.5" /> {anonymous ? 'Hiding my name' : 'Hide my name'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={posting || body.trim().length < 3 || (audience === 'partner' && !partnerId)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-xl shadow disabled:opacity-40"
            >
              {posting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Share story
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
