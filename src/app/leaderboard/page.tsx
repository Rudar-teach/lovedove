'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Crown, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import PremiumBackground from '@/components/PremiumBackground';

interface CoupleRow {
  player1_username: string;
  player2_username: string;
  games_played: number;
  wins: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState<CoupleRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('weekly_couple_leaderboard');
      if (data && (data as CoupleRow[]).length > 0) {
        setRows(data as CoupleRow[]);
      } else {
        setError(true);
      }
      setLoaded(true);
    })();
  }, []);

  const medal = (i: number) =>
    i === 0 ? Crown : i === 1 ? Trophy : i === 2 ? Sparkles : null;
  const MedalIcon = rows.length ? null : null; // (icons chosen per row below)

  return (
    <PremiumBackground>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-amber-500 to-pink-600 bg-clip-text text-transparent">
              Couples of the Week
            </h1>
            <div className="w-16" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-pink-100/40 border border-pink-100 p-6"
          >
            <p className="text-sm text-gray-500 mb-5 text-center">
              The most playful couples this week — ranked by games played together.
              Resets every Monday. 🏆
            </p>

            {!loaded ? (
              <div className="py-10 text-center text-gray-400 text-sm">Loading this week&apos;s couples…</div>
            ) : error || rows.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-5xl mb-3">🎮</div>
                <p className="text-gray-600 font-medium mb-1">No couples ranked yet this week</p>
                <p className="text-xs text-gray-400 mb-5">Be the first — finish a two-player game together.</p>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg"
                >
                  <Gamepad2 className="w-4 h-4" /> Play a game
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((r, i) => {
                  const M = medal(i);
                  const Icon = M as any;
                  return (
                    <motion.div
                      key={`${r.player1_username}-${r.player2_username}-${i}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i, 8) * 0.05 }}
                      className={`flex items-center gap-4 rounded-2xl p-4 border ${
                        i === 0
                          ? 'bg-gradient-to-r from-amber-50 to-pink-50 border-amber-200'
                          : 'bg-white border-pink-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-white font-black text-lg flex-shrink-0 shadow-md">
                        {i < 3 ? (
                          <Icon className="w-5 h-5" fill={i === 0 ? 'white' : 'none'} />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                          <span className="truncate">@{r.player1_username}</span>
                          <HeartMini />
                          <span className="truncate">@{r.player2_username}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.games_played} games together · {r.wins} wins
                        </p>
                      </div>
                      {i === 0 && (
                        <span className="text-[10px] font-black uppercase tracking-wide bg-amber-400 text-white rounded-full px-2.5 py-1 shadow">
                          #1 this week
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {isAuthenticated && !error && rows.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 mb-3">
                Not in the top 25 yet? Every two-player game you finish this week counts.
              </p>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-pink-600 text-sm font-bold rounded-xl hover:bg-pink-100 transition-colors"
              >
                Play a two-player game <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}

/** Tiny heart divider between two usernames. */
function HeartMini() {
  return <span className="text-pink-400 text-xs">♥</span>;
}
