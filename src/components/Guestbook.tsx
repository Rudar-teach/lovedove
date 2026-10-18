'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, BookHeart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Guestbook for a public birthday site.
 *
 * Anonymous by design: the birthday person's guests usually have no account.
 * Name + message + optional photo, keyed by site slug. New entries arrive
 * over Supabase Realtime so an open birthday page updates live.
 */

export interface GuestEntry {
  id: string;
  guest_name: string;
  message: string;
  photo_url: string | null;
  hearts: number;
  created_at: string;
}

const HEART_TOKEN_KEY = 'lovedove_guestbook_heart_token';

/** A browser-local id so "you hearted this" works without login. */
function heartToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(HEART_TOKEN_KEY);
  if (!token) {
    token = Math.random().toString(16).slice(2) + Date.now().toString(16);
    localStorage.setItem(HEART_TOKEN_KEY, token);
  }
  return token;
}

interface GuestbookProps {
  /** Row id — used for queries and the realtime filter. */
  siteId: string;
  /** Slug — what the POST endpoint needs, since entries are keyed by slug. */
  siteSlug: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Guestbook({ siteId, siteSlug, accentColor, textColor, mutedColor }: GuestbookProps) {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [myHearts, setMyHearts] = useState<Set<string>>(() => new Set());
  const [totals, setTotals] = useState({ entries: 0, total_hearts: 0 });

  const token = useMemo(() => heartToken(), []);

  /** Tell other open tabs of this same site to refresh. */
  const emitUpdate = () => {
    try {
      supabase
        .channel(`guestbook-${siteId}`)
        .send({ type: 'broadcast', event: 'guestbook-update', payload: {} });
    } catch { /* channel not subscribed yet — the poll will catch it */ }
  };

  const load = async () => {
    const { data, error: err } = await supabase
      .from('birthday_guest_entries')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (!err && data) {
      setEntries(data);
      setTotals({
        entries: data.length,
        total_hearts: data.reduce((sum, e) => sum + (e.hearts || 0), 0),
      });
    }
  };

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);

    // Live updates come two ways:
    //  - 'broadcast' is the version the installed supabase-js actually types
    //    (postgres_changes needs @realtime/postgres-changes-js), so another
    //    tab of this page writes to it the moment it saves or hearts.
    //  - a slow poll catches other devices, where broadcast can't reach us.
    const channel = supabase
      .channel(`guestbook-${siteId}`)
      .on('broadcast', { event: 'guestbook-update' }, () => { void load(); })
      .subscribe();

    const poll = setInterval(() => void load(), 25000);
    const first = load().then(() => setLoading(false));

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
      void first;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: siteSlug,
          guest_name: name.trim(),
          message: message.trim(),
          photo_url: photoUrl.trim() || null,
          heart_token: token,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Could not save your wish');
        return;
      }
      setMessage('');
      setPhotoUrl('');
      setShowForm(false);
      emitUpdate();
      void load();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  };

  const toggleHeart = async (entryId: string) => {
    const already = myHearts.has(entryId);
    setMyHearts(prev => {
      const next = new Set(prev);
      if (already) next.delete(entryId); else next.add(entryId);
      return next;
    });
    setEntries(prev => prev.map(en =>
      en.id === entryId ? { ...en, hearts: Math.max(0, en.hearts + (already ? -1 : 1)) } : en
    ));
    setTotals(t => ({ ...t, total_hearts: Math.max(0, t.total_hearts + (already ? -1 : 1)) }));
    emitUpdate();

    try {
      const res = await fetch('/api/guestbook/heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId, heart_token: token }),
      });
      if (!res.ok) {
        // Revert: a heart that failed shouldn't show as a heart.
        setMyHearts(prev => {
          const next = new Set(prev);
          if (already) next.add(entryId); else next.delete(entryId);
          return next;
        });
        setEntries(prev => prev.map(en =>
          en.id === entryId ? { ...en, hearts: Math.max(0, en.hearts + (already ? 1 : -1)) } : en
        ));
      }
    } catch { /* keep optimistic state; corrected on next load */ }
  };

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-white/90 border border-white/80 text-sm outline-none focus:border-pink-300 transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-7 mb-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}22` }}>
          <BookHeart className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg leading-tight" style={{ color: textColor }}>
            Guestbook
          </h2>
          <p className="text-xs" style={{ color: mutedColor }}>
            {totals.entries === 0
              ? 'Be the first to leave a wish'
              : `${totals.entries} wish${totals.entries === 1 ? '' : 'es'} · ${totals.total_hearts} ${totals.total_hearts === 1 ? 'heart' : 'hearts'}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
          style={{ background: accentColor }}
        >
          {showForm
            ? <span className="text-xs">Close</span>
            : <><Send className="w-3.5 h-3.5" /> Leave a wish</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={submit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="space-y-2.5 pb-1">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                placeholder="Your name"
                className={inputClasses}
              />
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Write something nice…"
                className={`${inputClasses} resize-none`}
              />
              <input
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                maxLength={300}
                placeholder="Photo URL (optional)"
                className={inputClasses}
              />
              {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={sending || !name.trim() || !message.trim()}
                className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-opacity"
                style={{ background: accentColor }}
              >
                {sending ? 'Sending…' : 'Send wish'}
              </button>
              <p className="text-center text-[11px]" style={{ color: mutedColor }}>
                No account needed — anyone can write here
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-6 text-center text-sm" style={{ color: mutedColor }}>
          Loading wishes…
        </div>
      ) : entries.length === 0 && !showForm ? (
        <p className="py-2 text-center text-sm" style={{ color: mutedColor }}>
          No wishes yet.{' '}
          <button onClick={() => setShowForm(true)} className="font-bold underline" style={{ color: accentColor }}>
            Start the list
          </button>
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-3 rounded-2xl bg-white/70"
            >
              <button
                onClick={() => toggleHeart(entry.id)}
                className="flex flex-col items-center min-w-[2.75rem] pt-0.5"
                aria-label="Send a heart"
              >
                <Heart
                  className="w-5 h-5 transition-colors"
                  fill={myHearts.has(entry.id) ? '#ec4899' : 'none'}
                  style={{ color: myHearts.has(entry.id) ? '#ec4899' : mutedColor }}
                />
                <span className="text-xs font-bold mt-0.5" style={{ color: textColor }}>
                  {entry.hearts > 0 ? entry.hearts : '♡'}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: textColor }}>{entry.guest_name}</span>
                  <span className="text-[11px]" style={{ color: mutedColor }}>{timeAgo(entry.created_at)}</span>
                </div>
                <p className="text-sm leading-snug whitespace-pre-wrap break-words mt-0.5" style={{ color: textColor }}>
                  {entry.message}
                </p>
                {entry.photo_url && (
                  <a href={entry.photo_url} target="_blank" rel="noreferrer" className="mt-2 block">
                    <img src={entry.photo_url} alt="" className="max-h-44 rounded-xl object-cover" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
