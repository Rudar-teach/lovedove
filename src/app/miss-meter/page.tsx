'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart, Send, Loader2, Users, Sparkles, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getCoupleState,
  addMissedYouEntry,
  markEntriesRevealed,
  apartLabel,
} from '@/lib/couple';
import type { CoupleState, UnreadEntry } from '@/lib/couple';

type Tab = 'meter' | 'wall' | 'live';

const QUICK_PHRASES = [
  'I miss your smile 😊',
  'Can’t stop thinking about you',
  'This day felt too long without you',
  'Counting the hours until I see you',
  'You’re on my mind, always 💕',
  'Wish you were here',
];

export default function MissMeterPage() {
  const [tab, setTab] = useState<Tab>('meter');
  const [state, setState] = useState<CoupleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<UnreadEntry[]>([]);
  const [wallOpen, setWallOpen] = useState(false);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;
    setMe(userId ? { id: userId } : null);
    if (!userId) { setLoading(false); return; }
    const s = await getCoupleState(userId);
    setState(s);
    if (s.partner && s.unread.length > 0) {
      // Reveal what the partner sent the first time I see it
      markEntriesRevealed(userId, s.unread.map((e) => e.id)).then(() => {
        setState((prev) => (prev ? { ...prev, unread: [], unreadCount: 0 } : prev));
      });
    }
    // My own past "missed you" notes (last 10)
    const { data } = await supabase
      .from('missed_you_entries')
      .select('id, message, photo_url, created_at')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // presence + meter stay fresh
    return () => clearInterval(t);
  }, [load]);

  const sendNote = async () => {
    if (!me || !state?.partner || !message.trim()) return;
    setSending(true);
    const res = await addMissedYouEntry(me.id, state.partner.id, message.trim());
    setSending(false);
    if (res.ok) {
      setMessage('');
      await load();
    } else {
      alert(res.error || 'Could not send your note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const partner = state?.partner;
  const meterPct = state?.meterPct ?? 0;
  const daysApart = state?.daysApart ?? 0;
  const bothOnline = state?.bothOnlineNow ?? false;

  const fillLabel =
    meterPct >= 100 ? 'Overflowing — I miss you more than words' :
    daysApart === 0 ? 'Full of togetherness' :
    Math.round(meterPct) + '% missed you';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-pink-600 mb-4">
          ← Home
        </Link>

        {/* Hero */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{bothOnline ? '💞' : '💔'}</div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-gray-900">
            {partner ? `Miss Meter` : 'Miss Meter'}
          </h1>
          {partner ? (
            <p className="text-gray-500 mt-1">
              {bothOnline
                ? `You and ${partner.full_name || partner.username} are both here right now 💞`
                : `for ${partner.full_name || partner.username} · ${apartLabel(daysApart)}`}
            </p>
          ) : (
            <p className="text-gray-500 mt-1">Connect with your partner to start your miss meter.</p>
          )}
        </div>

        {partner ? (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {([
                ['meter', 'Miss Meter', Sparkles],
                ['wall', `Love Wall${state?.unreadCount ? ` (${state.unreadCount})` : ''}`, Heart],
                ['live', 'Live Presence', Users],
              ] as [Tab, string, typeof Sparkles][]).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    tab === id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Tab 1: The Meter ── */}
            {tab === 'meter' && (
              <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 sm:p-8 text-center">
                <div className="relative w-44 h-44 mx-auto mb-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#fce7f3" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="44" fill="none"
                      stroke="url(#meterGrad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(meterPct / 100) * 276.46} 276.46`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{Math.round(meterPct)}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">missed you</span>
                  </div>
                </div>
                <p className="font-bold text-gray-800 mb-1">{fillLabel}</p>
                <p className="text-xs text-gray-400 mb-6">
                  {meterPct >= 100
                    ? 'The meter is full — reunite and it will start filling with joy instead.'
                    : daysApart === 0
                      ? 'You were together today. The meter resets while you’re apart.'
                      : `Fills up the longer you’re apart (caps at 7 days). It resets to 0 the moment you’re back together.`}
                </p>

                {bothOnline ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                    <p className="font-bold text-emerald-700 mb-1">🎉 You are both online right now</p>
                    <p className="text-xs text-emerald-600 mb-3">Reunite — play a game together and reset this meter to togetherness.</p>
                    <Link
                      href={`/games/bollywood?friend=1`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-md"
                    >
                      <Users className="w-4 h-4" /> Reunite &amp; play
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-4">
                    When {partner.full_name || partner.username} comes back online, they’ll see this same meter:
                    <span className="font-semibold text-gray-600"> “{apartLabel(daysApart)} — missed you {meterPct}%.”</span>
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-3">Send them the meter so they see how much you miss them:</p>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/miss-meter`;
                    navigator.clipboard?.writeText(url).catch(() => {});
                    alert('Link copied! Send it to ' + (partner.full_name || partner.username) + ' so they can see how much you missed them. 💕');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" /> Copy “I missed you” link
                </button>
              </div>
            )}

            {/* ── Tab 2: Love Wall ── */}
            {tab === 'wall' && (
              <div className="space-y-4">
                {state && state.unread.length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-4">
                    <p className="font-bold text-pink-700 mb-2 text-sm">
                      💕 {partner.full_name || partner.username} missed you — {state.unread.length} note{state.unread.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {state.unread.map((e) => (
                        <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
                          {e.photo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.photo_url} alt="shared memory" className="max-h-40 rounded-lg object-cover mb-2" />
                          )}
                          <p className="text-sm text-gray-700">{e.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(e.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Leave a note on your Love Wall</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder={`Tell ${partner.full_name || partner.username} how much you miss them...`}
                    className="w-full bg-pink-50/50 border border-pink-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  />
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {QUICK_PHRASES.map((p) => (
                      <button key={p} onClick={() => setMessage(p)}
                        className="px-2.5 py-1 bg-white border border-pink-200 rounded-full text-[11px] text-gray-600 hover:bg-pink-50 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={sendNote}
                    disabled={sending || !message.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-40 transition-all"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send to {partner.full_name || partner.username}
                  </button>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Notes are private to the two of you. They appear here when your partner comes online.
                  </p>
                </div>

                {history.length > 0 && (
                  <div className="bg-white/60 rounded-2xl border border-pink-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your past notes</p>
                    <div className="space-y-1.5">
                      {history.map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate max-w-[80%]">{e.message}</span>
                          <span className="flex-shrink-0 text-gray-300">{new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 3: Live Presence ── */}
            {tab === 'live' && (
              <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6 text-center">
                {bothOnline ? (
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-5xl shadow-2xl shadow-pink-300/50 mb-4"
                  >
                    💞
                  </motion.div>
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl mb-4">
                    💭
                  </div>
                )}
                {bothOnline ? (
                  <>
                    <p className="text-xl font-black text-gray-900 mb-1">You&rsquo;re both here right now</p>
                    <p className="text-sm text-gray-500 mb-5">This is your moment — make it count.</p>
                    <Link
                      href="/games?friend=1"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Users className="w-4 h-4" /> Play together now
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-black text-gray-900 mb-1">
                      {partner.full_name || partner.username} is offline
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      {apartLabel(daysApart)} and counting…
                    </p>
                    <p className="text-xs text-gray-400 mb-5">
                      When they open the app, they&rsquo;ll see your meter and any Love Wall notes you leave.
                    </p>
                    <button onClick={() => setTab('wall')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-pink-50 transition-all">
                      <Heart className="w-4 h-4 text-pink-500" /> Leave a missed-you note
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 text-center">
            <div className="text-5xl mb-4">💌</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No partner linked yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Connect with your partner first — then the miss meter, love wall and live
              togetherness moments unlock automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/find-partner" className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-md">
                Find my partner
              </Link>
              <Link href="/add-friends" className="px-5 py-3 bg-white border border-pink-200 text-pink-600 text-sm font-bold rounded-xl hover:bg-pink-50 transition-all">
                Add a friend
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
