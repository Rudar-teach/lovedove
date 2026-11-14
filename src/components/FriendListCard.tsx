'use client';

/**
 * Love Dove — "Your People" dashboard card with messaging + miss-meter ranking.
 *
 * Shows the full roster (partner first, then friends) with:
 *   - live online dot (real profiles.is_online presence)
 *   - love-ladder rank: #1 = the friend you've exchanged the most messages
 *     with; every message you send moves you up
 *   - unread-message badge ("2 new")
 *   - Message button → /chat/friend/<id> (they get a notification when they open the site)
 *   - Play button → their online game night
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, MessageCircle, Trophy, Wifi, WifiOff, Gamepad2, Heart,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  fetchFriendRoster, type RosterFriend,
} from '@/lib/friendRoster';

function lastSeenLabel(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function FriendListCard() {
  const user = useAuthStore((s) => s.user);
  const [roster, setRoster] = useState<RosterFriend[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRoster(await fetchFriendRoster(user.id));
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    void load();
    // Keep online dots + unread badges reasonably fresh.
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  if (!user) return null;

  const online = roster.filter((f) => f.is_online).length;

  return (
    <div className="bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-500" />
          Your People
          {online > 0 && (
            <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {online} online
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          <Link href="/stories" className="text-[11px] font-bold text-purple-500 hover:text-purple-700">
            Stories
          </Link>
          <Link href="/add-friends" className="text-[11px] font-bold text-pink-500 hover:text-pink-700">
            + Add friend
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="py-6 text-center">
          <div className="w-7 h-7 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Checking who&apos;s online…</p>
        </div>
      ) : roster.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-3xl mb-2">💌</p>
          <p className="text-sm text-gray-600 font-medium mb-1">Your friends will live here</p>
          <p className="text-xs text-gray-400 mb-4">
            Add a friend by @username — then message them, play together and climb the love ladder.
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/add-friends"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow hover:scale-105 transition-transform"
            >
              Add a friend
            </Link>
            <Link
              href="/find-partner"
              className="px-4 py-2 bg-pink-50 text-pink-600 text-xs font-bold rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
            >
              <Heart className="w-3 h-3 inline mr-1" fill="currentColor" /> Find partner
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {roster.slice(0, 8).map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-2xl border border-pink-50 bg-gradient-to-br from-pink-50/50 to-purple-50/30 hover:shadow-md transition-shadow"
            >
              {/* avatar + online dot */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow overflow-hidden">
                  {f.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.avatar_url} alt="" className="w-11 h-11 object-cover" />
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

              {/* name + ladder rank */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {f.name}
                    {f.via === 'partner' && <Heart className="w-3 h-3 text-pink-500 inline ml-1" fill="currentColor" />}
                  </p>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                  {f.is_online ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <Wifi className="w-3 h-3" /> online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> {lastSeenLabel(f.last_seen)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-px">
                    <Trophy className="w-2.5 h-2.5" />
                    {f.rank > 0 ? `#${f.rank}` : 'new'} · {f.ranking.exchanged} msgs
                  </span>
                  {f.ranking.unreadForMe > 0 && (
                    <span className="font-black text-pink-600 bg-pink-50 border border-pink-200 rounded-full px-1.5 py-px">
                      {f.ranking.unreadForMe} new
                    </span>
                  )}
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  href={`/chat/friend/${f.id}`}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[11px] font-bold shadow hover:scale-105 transition-transform flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> Msg
                </Link>
                {f.is_online && (
                  <Link
                    href="/games?friend=1"
                    className="px-3 py-2 rounded-xl bg-green-50 text-green-600 border border-green-200 text-[11px] font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Gamepad2 className="w-3 h-3" /> Play
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
          {roster.length > 8 && (
            <p className="text-xs text-gray-400 text-center">+{roster.length - 8} more friends</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-4 leading-snug">
        💡 <b>Love ladder:</b> the more messages you exchange with a friend, the higher they rank —
        messages you send land in their notifications the moment they open the site.
      </p>
    </div>
  );
}
