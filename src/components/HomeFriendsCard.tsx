'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, Gamepad2, Heart, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

interface HomeFriend {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
  via: 'partner' | 'friend';
}

/**
 * "Your People" — homepage card showing your partner + friends with live
 * online status, and one-tap routes to play / our story / add more.
 *
 * Data sources (all resilient):
 *   - accepted `matches` rows (production uses a single `status` column;
 *     legacy DBs still carry user1_accepted — we try both)
 *   - accepted `friend_requests` rows
 *   - profiles WITH is_online presence (real green dots, not guesses)
 *
 * Anonymous visitors get a lightweight "join" variant instead of a blank.
 */
export default function HomeFriendsCard() {
  const user = useAuthStore((s) => s.user);
  const [friends, setFriends] = useState<HomeFriend[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) { setLoaded(true); return; }
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser || cancelled) { setLoaded(true); return; }

        // Partner(s) via matches — production status column, legacy fallback.
        let partnerIds: string[] = [];
        const { data: matchData, error: mErr } = await supabase
          .from('matches')
          .select('user1_id, user2_id, status')
          .or(
            `and(user1_id.eq.${authUser.id},status.in.(accepted,connected)),` +
            `and(user2_id.eq.${authUser.id},status.in.(accepted,connected))`
          )
          .limit(10);
        if (!mErr) {
          partnerIds = (matchData || [])
            .map((m: any) => (m.user1_id === authUser.id ? m.user2_id : m.user1_id));
        } else {
          const { data: legacy } = await supabase
            .from('matches')
            .select('user1_id, user2_id')
            .or(
              `and(user1_id.eq.${authUser.id},user1_accepted.eq.true),` +
              `and(user2_id.eq.${authUser.id},user2_accepted.eq.true)`
            )
            .limit(10);
          partnerIds = (legacy || []).map((m: any) =>
            m.user1_id === authUser.id ? m.user2_id : m.user1_id
          );
        }

        // Friends via the friend system.
        const { data: reqData } = await supabase
          .from('friend_requests')
          .select('sender_id, receiver_id')
          .eq('status', 'accepted')
          .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
          .limit(20);
        const friendIds = (reqData || []).map((r: any) =>
          r.sender_id === authUser.id ? r.receiver_id : r.sender_id
        );

        const seen = new Set<string>();
        const rows: { id: string; via: HomeFriend['via'] }[] = [];
        const collect = (ids: string[], via: HomeFriend['via']) => {
          for (const id of ids) {
            if (id && !seen.has(id)) { seen.add(id); rows.push({ id, via }); }
          }
        };
        collect(partnerIds, 'partner');
        collect(friendIds, 'friend');

        if (rows.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, is_online, last_seen')
            .in('id', rows.map((r) => r.id));
          const byId = new Map((profiles || []).map((p: any) => [p.id, p]));
          const resolved: HomeFriend[] = rows
            .map((r) => {
              const p = byId.get(r.id);
              if (!p) return null;
              return {
                id: r.id,
                name: p.full_name || p.username || 'Friend',
                username: p.username || '',
                avatar_url: p.avatar_url,
                is_online: Boolean(p.is_online),
                last_seen: p.last_seen,
                via: r.via,
              };
            })
            .filter((f): f is HomeFriend => f !== null);
          // Partners first, then online people — the ones you can play with NOW.
          resolved.sort((a, b) => {
            if (a.via !== b.via) return a.via === 'partner' ? -1 : 1;
            return Number(b.is_online) - Number(a.is_online);
          });
          if (!cancelled) setFriends(resolved);
        }
      } catch {
        /* degrade: empty card state */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user]);

  const online = friends.filter((f) => f.is_online).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8 sm:mt-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-pink-100/60 p-6 sm:p-8"
    >
      {!user ? (
        /* ── Anonymous visitor: social proof + CTA ─────────────────── */
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3">
            {['🩷', '💜', '🧡'].map((e, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white"
                style={{ zIndex: 3 - i, marginLeft: i > 0 ? -12 : 0, position: 'relative' } as any}
              >
                {e}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 justify-center">
              <Users className="w-5 h-5 text-pink-500" /> Your future couple hub
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Sign in and this space becomes <b>your</b> friends — with live
              &ldquo;online now&rdquo; status so you always know who to play with.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-pink-200/50 hover:scale-105 transition-transform"
          >
            <Heart className="w-4 h-4" fill="currentColor" /> Claim your spot
          </Link>
        </div>
      ) : !loaded ? (
        <div className="flex flex-col items-center py-6">
          <div className="w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 mt-3">Checking who&apos;s online…</p>
        </div>
      ) : friends.length === 0 ? (
        /* ── Signed in, no friends yet ────────────────────────────── */
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your people will live here</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Find your partner or add a friend by @username — the moment you
            connect, they show up here with a live &ldquo;online now&rdquo; dot.
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Link
              href="/find-partner"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" /> Find my partner
            </Link>
            <Link
              href="/add-friends"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-pink-50 text-pink-600 text-xs font-bold rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Add a friend
            </Link>
          </div>
        </div>
      ) : (
        /* ── The card itself: your people, live ────────────────────── */
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Your People
              {online > 0 && (
                <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {online} online now
                </span>
              )}
            </h3>
            <Link
              href="/add-friends"
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Manage friends <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {friends.slice(0, 6).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50/60 to-purple-50/40 hover:shadow-md transition-shadow"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow">
                    {f.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.avatar_url} alt="" loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      f.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      f.is_online ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{f.name}</p>
                    {f.via === 'partner' && (
                      <Heart className="w-3 h-3 text-pink-500 flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    {f.is_online ? (
                      <><Wifi className="w-3 h-3 text-green-500" /> online now</>
                    ) : (
                      <><WifiOff className="w-3 h-3" /> offline</>
                    )}
                    <span className="font-mono">@{f.username}</span>
                  </p>
                </div>
                <Link
                  href={f.is_online ? `/add-friends` : `/our-story`}
                  className="flex-shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[11px] font-bold shadow hover:scale-105 transition-transform"
                >
                  <Gamepad2 className="w-3 h-3 inline mr-1" />
                  {f.is_online ? 'Play' : 'Story'}
                </Link>
              </div>
            ))}
          </div>

          {friends.length > 6 && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              +{friends.length - 6} more in your friend list
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
