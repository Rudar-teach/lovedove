'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Calendar, Sparkles, Clock, Gift, Plus, ChevronRight,
  Wifi, WifiOff, ArrowLeft, BookOpen, MessageCircleHeart,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { resolvePartner, type PartnerInfo } from '@/lib/couple';
import {
  upsertCouple, daysBetween, daysUntilAnniversary,
  getUnrevealedReasons, unlockNextReason, getRevealedCount, addLoveReason,
  getMilestones, addMilestone, logAutoMilestone,
  type LoveReason, type Milestone,
} from '@/lib/relationship';
import { fetchPartnerStories, type Story } from '@/lib/stories';
import StoryComposer from '@/components/StoryComposer';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

/** Live-ticking "X days, H:MM:SS together" clock. */
function useTogetherTicker(startDate: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startDate) return null;
  const start = new Date(startDate.length === 10 ? startDate + 'T00:00:00' : startDate).getTime();
  if (Number.isNaN(start)) return null;
  const delta = Math.max(0, now - start);
  const days = Math.floor(delta / 86400000);
  const hours = Math.floor((delta % 86400000) / 3600000);
  const mins = Math.floor((delta % 3600000) / 60000);
  const secs = Math.floor((delta % 60000) / 1000);
  return { days, hours, mins, secs };
}

export default function OurStoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [anniversaryDate, setAnniversaryDate] = useState<string | null>(null);
  const [settingAnniversary, setSettingAnniversary] = useState(false);
  const [anniversaryInput, setAnniversaryInput] = useState('');

  const [unrevealed, setUnrevealed] = useState<LoveReason[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [lastUnlocked, setLastUnlocked] = useState<LoveReason | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [sendingReason, setSendingReason] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', emoji: '💕' });
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const [partnerStories, setPartnerStories] = useState<Story[]>([]);

  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const p = await resolvePartner(user.id);
    setPartner(p);

    if (p) {
      // Partner presence (profiles.is_online via the same query path as the navbar pill)
      const { data } = await supabase
        .from('profiles')
        .select('is_online')
        .eq('id', p.id)
        .maybeSingle();
      setPartnerOnline(Boolean(data?.is_online));

      // Couple dates — lazily create the row (match day as default start date).
      const { data: matchData } = await supabase
        .from('matches')
        .select('created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
        .limit(1);
      const matchDay = matchData?.[0]?.created_at
        ? new Date(matchData[0].created_at).toISOString().slice(0, 10)
        : user.created_at?.slice(0, 10);

      const dates = await upsertCouple(user.id, p.id, {
        startDate: matchDay || null,
      });
      setStartDate(dates.startDate || matchDay || null);
      setAnniversaryDate(dates.anniversaryDate || user.anniversary_date || null);

      // Auto-log the one-shot "first match" milestone.
      void logAutoMilestone(user.id, 'first_match', `We found each other`, '💞');
    }

    if (p) {
      const [u, rc, ms, ps] = await Promise.all([
        getUnrevealedReasons(user.id),
        getRevealedCount(user.id),
        getMilestones(user.id, p.id),
        fetchPartnerStories(user.id, p.id),
      ]);
      setUnrevealed(u);
      setRevealedCount(rc);
      setMilestones(ms);
      setPartnerStories(ps);
    }
    setLoaded(true);
  }, [user]);

  /** Re-pull just the partner stories after posting a new one. */
  const refreshPartnerStories = useCallback(async () => {
    if (!user || !partner) return;
    setPartnerStories(await fetchPartnerStories(user.id, partner.id));
  }, [user, partner]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void load();
  }, [authLoading, isAuthenticated, load]);

  // Auto-log "first game together" when the couple completes a session (runs once
  // per session in GameSessionProvider; safe to call here too — upsert dedupes).
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('game_sessions')
        .select('id')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .eq('status', 'completed')
        .limit(1);
      if (mounted && data && data.length > 0) {
        void logAutoMilestone(user.id, 'first_game', 'Our first game together', '🎮');
        const { data: ms } = await supabase
          .from('milestones')
          .select('id, type, title, description, emoji, created_at')
          .in('user_id', partner ? [user.id, partner.id] : [user.id])
          .order('created_at', { ascending: false })
          .limit(60);
        if (mounted && ms) {
          setMilestones(ms as unknown as Milestone[]);
        }
      }
    })();
    return () => { mounted = false; };
  }, [user, partner]);

  const ticker = useTogetherTicker(startDate);

  const handleReveal = async () => {
    if (!user || unlocking) return;
    setUnlocking(true);
    const reason = await unlockNextReason(user.id);
    if (reason) {
      setLastUnlocked(reason);
      setUnrevealed((prev) => prev.slice(1));
      setRevealedCount((c) => c + 1);
    } else {
      toast('No new reasons waiting 💌');
    }
    setUnlocking(false);
  };

  const handleSendReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partner) return;
    const text = newReason.trim();
    if (text.length < 3) return;
    // Optimistic: the input clears the instant you hit send.
    setNewReason('');
    setSendingReason(true);
    const res = await addLoveReason(user.id, partner.id, text);
    setSendingReason(false);
    if (res.ok) {
      toast.success(`Sent to @${partner.username} — it'll wait there for them to unlock 💗`);
    } else {
      // Roll back the cleared input so the draft isn't lost.
      setNewReason(text);
      toast.error(res.error || 'Could not send');
    }
  };

  const handleSaveAnniversary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partner || !anniversaryInput) return;
    const { error } = await supabase
      .from('couples')
      .upsert(
        {
          user1_id: user.id,
          user2_id: partner.id,
          anniversary_date: anniversaryInput,
        },
        { onConflict: 'user1_id,user2_id' }
      );
    if (error) {
      // Legacy row shape (partner-first) — try the flipped key.
      await supabase
        .from('couples')
        .upsert(
          { user1_id: partner.id, user2_id: user.id, anniversary_date: anniversaryInput },
          { onConflict: 'user1_id,user2_id' }
        );
    }
    setAnniversaryDate(anniversaryInput);
    setAnniversaryInput('');
    setSettingAnniversary(false);
    toast.success('Anniversary saved 🎂');
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const title = newMilestone.title.trim();
    if (title.length < 2) return;

    // Optimistic: the memory card lands on the timeline instantly.
    const temp: Milestone = {
      id: `local-${crypto.randomUUID()}`,
      type: 'memory',
      title,
      description: newMilestone.description?.trim() || null,
      emoji: newMilestone.emoji || '💕',
      author_username: user.username || null,
      created_at: new Date().toISOString(),
    };
    setMilestones((prev) => [temp, ...prev]);
    setNewMilestone({ title: '', description: '', emoji: '💕' });
    setShowMilestoneForm(false);

    setAddingMilestone(true);
    const res = await addMilestone(user.id, { ...newMilestone, title });
    setAddingMilestone(false);
    if (res.ok) {
      // Reconcile in the background: real row replaces the temp id.
      if (partner) {
        void (async () => {
          const { data } = await supabase
            .from('milestones')
            .select('id, type, title, description, emoji, created_at')
            .in('user_id', [user.id, partner.id])
            .order('created_at', { ascending: false })
            .limit(60);
          if (data) setMilestones(data as unknown as Milestone[]);
        })();
      }
      toast.success('Added to our story ✨');
    } else {
      // Roll back: drop the temp card and restore the form so the user can retry.
      setMilestones((prev) => prev.filter((m) => m.id !== temp.id));
      setNewMilestone({ title, description: newMilestone.description || '', emoji: newMilestone.emoji });
      setShowMilestoneForm(true);
      toast.error(res.error || 'Could not save');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <Heart className="w-12 h-12 text-pink-500 mx-auto" fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg"
        >
          Sign in to see your story <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const annDays = anniversaryDate ? daysUntilAnniversary(anniversaryDate) : null;

  return (
    <PremiumBackground>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href={partner ? '/dashboard' : '/find-partner'}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Story
            </h1>
            <div className="w-16" />
          </div>

          {!partner ? (
            /* No partner yet — but you can still write stories (community or anonymous) */
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/30 border border-pink-100 p-10 sm:p-12 text-center">
                <div className="text-6xl mb-4">💞</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your story is waiting to begin</h2>
                <p className="text-gray-500 mb-6">
                  Find your partner first — then this page becomes your shared memory wall,
                  live day counter, and &ldquo;reasons I love you&rdquo; vault.
                </p>
                <Link
                  href="/find-partner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                  <Heart className="w-4 h-4" /> Find your partner
                </Link>
              </div>

              {/* You can still share stories with the community — or anonymously */}
              <div className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" /> Add a story with your loved ones
                  </h3>
                  <Link
                    href="/stories"
                    className="text-xs font-bold text-purple-500 hover:text-purple-700 flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> See everyone&apos;s stories
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Share a moment with the whole community — or hide your name and post as
                  &ldquo;Anonymous&rdquo;.
                </p>
                <StoryComposer defaultAudience="community" onPosted={() => void load()} />
              </div>
            </div>
          ) : (
            <>
              {/* ── Live together counter ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-8 sm:p-10 text-white shadow-2xl shadow-pink-300/40"
              >
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Together since {startDate || 'we met here'}</p>
                    <h2 className="text-2xl sm:text-3xl font-display font-black">
                      {user.full_name?.split(' ')[0] || user.username}{' '}
                      <span className="opacity-70">&amp;</span>{' '}
                      {partner.full_name?.split(' ')[0] || partner.username}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/15 rounded-full px-3 py-1.5">
                    {partnerOnline ? (
                      <><Wifi className="w-3.5 h-3.5 text-green-300" /> {partner.username} is online now</>
                    ) : (
                      <><WifiOff className="w-3.5 h-3.5" /> {partner.username} offline</>
                    )}
                  </div>
                </div>

                {ticker ? (
                  <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3 max-w-md">
                    {[
                      { v: ticker.days, l: 'days' },
                      { v: ticker.hours, l: 'hours' },
                      { v: ticker.mins, l: 'mins' },
                      { v: ticker.secs, l: 'secs' },
                    ].map((b) => (
                      <div key={b.l} className="bg-white/15 rounded-2xl py-3 text-center backdrop-blur-sm">
                        <p className="text-2xl sm:text-3xl font-black tabular-nums">
                          {String(b.v).padStart(2, '0')}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-white/70">{b.l}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-white/80 text-lg">
                    <Sparkles className="w-5 h-5 inline mr-1" />
                    Days counting from your first day here…
                  </p>
                )}
              </motion.div>

              {/* ── Anniversary card ──────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 p-6 flex items-center gap-4 flex-wrap"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  {anniversaryDate ? (
                    <>
                      <p className="font-bold text-gray-900">
                        Anniversary {anniversaryDaysLabel(annDays)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(anniversaryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        {annDays !== null && annDays > 0 && <> · {annDays} days to go 🎂</>}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No anniversary set yet.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {settingAnniversary ? (
                    <form onSubmit={handleSaveAnniversary} className="flex items-center gap-2">
                      <input
                        type="date"
                        required
                        value={anniversaryInput}
                        onChange={(e) => setAnniversaryInput(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                      <button type="submit" className="px-3 py-2 bg-pink-500 text-white text-xs font-bold rounded-xl">
                        Save
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSettingAnniversary(true)}
                      className="px-3 py-2 rounded-xl bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition-colors"
                    >
                      {anniversaryDate ? 'Change date' : 'Set anniversary'}
                    </button>
                  )}
                </div>
              </motion.div>

              {/* ── Reasons I love you ────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircleHeart className="w-5 h-5 text-pink-500" /> Reasons I love you
                  </h3>
                  <p className="text-xs font-bold text-pink-500 bg-pink-50 rounded-full px-3 py-1">
                    {revealedCount} unlocked · {unrevealed.length} waiting
                  </p>
                </div>

                {/* Unlocked one — the emotional beat */}
                <AnimatePresence mode="wait">
                  {lastUnlocked ? (
                    <motion.div
                      key={lastUnlocked.id}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-5"
                    >
                      <p className="text-lg italic text-gray-800 leading-relaxed">
                        &ldquo;{lastUnlocked.text}&rdquo;
                      </p>
                      <p className="text-xs text-pink-500 font-bold mt-2">
                        — @{lastUnlocked.sender_username || 'your person'} 💗
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleReveal}
                    disabled={unlocking || unrevealed.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200/50 disabled:opacity-40 transition-all"
                  >
                    <Gift className="w-4 h-4" />
                    {unlocking ? 'Opening…' : 'Unlock one 💝'}
                  </motion.button>
                  <p className="text-xs text-gray-400">
                    {unrevealed.length > 0
                      ? 'A new reason unlocked each time you open a gift — go slow, it&apos;s special.'
                      : 'No gifts waiting. Send one to start!'}
                  </p>
                </div>

                <form onSubmit={handleSendReason} className="mt-5 flex gap-2">
                  <input
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    maxLength={280}
                    placeholder={`Write a reason you love @${partner.username}…`}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-pink-100 bg-pink-50/40 text-sm focus:outline-none focus:border-pink-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sendingReason || newReason.trim().length < 3}
                    className="px-4 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-purple-600 transition-colors"
                  >
                    {sendingReason ? '…' : 'Send'}
                  </button>
                </form>
              </motion.div>

              {/* ── Timeline: Our Story ───────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" /> Our Story
                  </h3>
                  <button
                    onClick={() => setShowMilestoneForm((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add a memory
                  </button>
                </div>

                {showMilestoneForm && (
                  <form onSubmit={handleAddMilestone} className="mb-5 rounded-2xl bg-purple-50/60 border border-purple-100 p-4 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        value={newMilestone.emoji}
                        onChange={(e) => setNewMilestone((m) => ({ ...m, emoji: e.target.value.slice(0, 4) }))}
                        className="w-14 text-center px-2 py-2 rounded-lg bg-white border border-purple-200 text-lg focus:outline-none"
                        maxLength={4}
                        aria-label="emoji"
                      />
                      <input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone((m) => ({ ...m, title: e.target.value }))}
                        maxLength={80}
                        placeholder="What happened? (e.g. First date 🍜)"
                        className="flex-1 px-3 py-2 rounded-lg bg-white border border-purple-200 text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <textarea
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone((m) => ({ ...m, description: e.target.value }))}
                      maxLength={500}
                      rows={2}
                      placeholder="Tell it like it matters — because it does. (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-sm focus:outline-none focus:border-purple-400 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={addingMilestone || newMilestone.title.trim().length < 2}
                      className="px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold disabled:opacity-40"
                    >
                      {addingMilestone ? 'Adding…' : 'Add to our story'}
                    </button>
                  </form>
                )}

                {milestones.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-4xl mb-2">📖</p>
                    <p className="text-sm text-gray-400">Your story is just starting. Add the first page!</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* the spine */}
                    <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-pink-300 via-purple-200 to-transparent" />
                    <div className="space-y-4">
                      {milestones.map((m, i) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i, 8) * 0.04 }}
                          className="relative flex gap-4"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ring-4 ring-white z-10">
                            {m.emoji}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <p className="font-bold text-gray-900">{m.title}</p>
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(m.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                              {m.author_username && m.author_username !== user.username && (
                                <span className="text-[10px] font-bold text-purple-500 bg-purple-50 rounded-full px-2 py-0.5">
                                  by @{m.author_username}
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{m.description}</p>
                            )}
                            {m.type === 'first_match' && (
                              <p className="text-[11px] font-bold text-pink-500 mt-1">✦ auto-logged · your very first match</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Stories with my person ──────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100 p-6"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" /> Stories with {partner.username}
                  </h3>
                  <Link
                    href="/stories"
                    className="text-xs font-bold text-purple-500 hover:text-purple-700 flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Community stories
                  </Link>
                </div>

                <StoryComposer
                  partnerId={partner.id}
                  partnerLabel={partner.username}
                  defaultAudience="partner"
                  compact
                  onPosted={refreshPartnerStories}
                />

                {partnerStories.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {partnerStories.slice(0, 12).map((s) => {
                      const byPartner = s.author_id !== user.id;
                      const anon = s.is_anonymous;
                      return (
                        <div
                          key={s.id}
                          className={`rounded-2xl p-4 border ${
                            byPartner
                              ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100'
                              : 'bg-gray-50/70 border-gray-100'
                          }`}
                        >
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {s.emoji && <span className="mr-1">{s.emoji}</span>}
                            {s.title && <b className="block text-gray-900 mb-1">{s.title}</b>}
                            {s.body}
                          </p>
                          <p className="text-[11px] mt-2 font-bold flex items-center gap-1 text-gray-400">
                            {anon ? (
                              <><span>🎭 Anonymous</span> {byPartner && <span className="text-pink-500">· from {partner.username}</span>}</>
                            ) : byPartner ? (
                              <><span className="text-pink-500">@{partner.username}</span> · for you</>
                            ) : (
                              <><span>@{user.username}</span> · {new Date(s.created_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* CTA to games */}
              <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Keep the story growing</p>
                    <p className="text-xs text-gray-500">Every game you finish together becomes a moment here.</p>
                  </div>
                </div>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Play together <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}

function anniversaryDaysLabel(days: number | null): string {
  if (days === null) return '· next one coming up';
  if (days === 0) return '— today! 🎉';
  if (days === 1) return '— tomorrow!';
  return `— in ${days} days`;
}
