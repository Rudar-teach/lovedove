// FriendPanel - right-side panel that shows friend list + play-with-friend flow
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, X, CheckCircle2, Clock, Gamepad2, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  online: boolean;
  gamesPlayed: number;
}

export default function FriendPanel({
  gameName,
  gameSlug,
  open,
  onPlayFriend,
}: {
  gameName: string;
  gameSlug: string;
  open: boolean;
  onPlayFriend: (friend: Friend) => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setFriends([
            { id: '1', name: 'You', username: 'you', online: true, gamesPlayed: 0 },
          ]);
          setLoading(false);
          return;
        }

        const { data: matchData } = await supabase
          .from('matches')
          .select('*')
          .or(`and(user1_id.eq.${user.id},user1_accepted.eq.true),and(user2_id.eq.${user.id},user2_accepted.eq.true)`)
          .eq('is_active', true)
          .limit(20);

        const loaded: Friend[] = [];
        for (const m of matchData || []) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          const { data: other } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', otherId)
            .single();
          if (other) {
            const { count } = await supabase
              .from('game_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('friend_id', otherId);
            loaded.push({
              id: other.id,
              name: other.full_name || other.username || 'Friend',
              username: other.username || '',
              avatar: other.avatar_url,
              online: true,
              gamesPlayed: count || 0,
            });
          }
        }

        setFriends(loaded);
      } catch {
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed right-0 top-16 sm:top-20 bottom-0 w-80 sm:w-96 bg-white shadow-2xl border-l border-pink-100 z-50 flex flex-col"
        >
          {/* header */}
          <div className="p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-gray-900">Play with a friend</h3>
              </div>
              <Link
                href={`/games/${gameSlug}`}
                onClick={() => { /* close handled by parent */ }}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500 hover:bg-pink-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              Playing <span className="font-semibold text-pink-600">{gameName}</span>
            </p>
          </div>

          {/* friend list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading friends…</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No friends yet</p>
                <p className="text-xs text-gray-400 mb-4">
                  Add friends from the Find Partners page to challenge them here.
                </p>
                <Link
                  href="/find-partner"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Find partners
                </Link>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {friends.map((f) => (
                  <motion.button
                    key={f.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPlayFriend(f)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {f.name[0].toUpperCase()}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          f.online ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">
                        {f.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {f.gamesPlayed} games played
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Play
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* footer tip */}
          <div className="p-3 border-t border-pink-100 bg-pink-50/50">
            <div className="text-[11px] text-gray-500 leading-snug flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span>
                After you pick, your friend&apos;s turn will appear. Quiz answers reveal
                only after both finish.
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
