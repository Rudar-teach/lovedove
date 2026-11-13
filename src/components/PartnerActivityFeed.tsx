'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Sparkles, Trophy } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { usePartnerPresence } from '@/lib/usePartnerPresence';
import { getPartnerActivity } from '@/lib/relationship';

const GAME_NAMES: Record<string, string> = {
  tictactoe: 'Tic-Tac-Toe',
  memory: 'Memory Match',
  pong: 'Pong',
  flappyheart: 'Flappy Heart',
  quiz: 'Couple Quiz',
  love_duo_quiz: 'Love Duo Quiz',
  rockpaperscissors: 'Rock Paper Scissors',
  wouldyourather: 'Would You Rather',
  triviabattle: 'Trivia Battle',
  speeddate: 'Speed Date',
};

function gameLabel(slug: string): string {
  return GAME_NAMES[slug] || slug.replace(/_/g, ' ');
}

function timeShort(iso: string | null): string {
  if (!iso) return 'just now';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * "What your partner's been up to" — a live-ish feed of the partner's
 * recent two-player sessions. Reads game_sessions through the couples RLS
 * policy (added in the relationship migration), so it degrades to a
 * gentle empty state until you've played something together.
 */
export default function PartnerActivityFeed() {
  const user = useAuthStore((s) => s.user);
  const { partner } = usePartnerPresence(user?.id ?? null);
  const [activities, setActivities] = useState<
    { session_id: string; game_type: string; status: string; ended_at: string | null }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !partner) return;
    let cancelled = false;
    void getPartnerActivity(user.id, partner.id).then((rows) => {
      if (cancelled) return;
      setActivities(rows);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, partner]);

  if (!user) return null;

  if (!partner) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 p-5 text-center">
        <p className="text-sm text-gray-500 mb-3">
          No partner yet — this is where their game nights will show up here.
        </p>
        <Link
          href="/find-partner"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow"
        >
          <Sparkles className="w-3.5 h-3.5" /> Find your partner
        </Link>
      </div>
    );
  }

  const finished = activities.filter((a) => a.status === 'completed');

  return (
    <div className="rounded-2xl bg-white/80 border border-pink-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-pink-500" />
          {partner.username}'s game nights
        </h3>
        <Link href="/our-story" className="text-[11px] font-bold text-purple-500 hover:text-purple-700">
          Our Story →
        </Link>
      </div>

      {!loaded ? (
        <p className="text-xs text-gray-400 py-3 text-center">Loading…</p>
      ) : finished.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400 mb-3">Nothing finished together yet this week.</p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-pink-50 text-pink-600 text-xs font-bold rounded-xl hover:bg-pink-100 transition-colors"
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Play together
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" /> Climb the leaderboard
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {finished.slice(0, 3).map((a) => (
            <li key={a.session_id} className="flex items-center gap-2.5 text-sm">
              <span className="text-base">🎮</span>
              <span className="flex-1 min-w-0 truncate text-gray-700">
                Finished <b>{gameLabel(a.game_type)}</b>
              </span>
              <span className="text-[11px] text-gray-400 flex-shrink-0">{timeShort(a.ended_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
