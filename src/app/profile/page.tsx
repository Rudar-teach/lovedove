'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trophy, Clock, Gamepad2, Flame, Award, Users, Heart, Target, Star, Medal } from 'lucide-react';

const BADGE_INFO: Record<string, { emoji: string; name: string; desc: string; color: string }> = {
  'first_game': { emoji: '🎮', name: 'First Game', desc: 'Played your first game', color: 'from-blue-400 to-blue-600' },
  'first_win': { emoji: '🏆', name: 'First Victory', desc: 'Won your first game', color: 'from-yellow-400 to-orange-500' },
  'hour_1': { emoji: '⏱️', name: '1 Hour Together', desc: 'Played for 1 hour', color: 'from-green-400 to-green-600' },
  'hour_5': { emoji: '⭐', name: '5 Hours Together', desc: 'Played for 5 hours', color: 'from-purple-400 to-purple-600' },
  'hour_10': { emoji: '💎', name: '10 Hours Together', desc: 'Played for 10 hours! Amazing!', color: 'from-pink-400 to-rose-600' },
  'hour_24': { emoji: '👑', name: '24 Hour Lovers', desc: 'Played for 24 hours together!', color: 'from-yellow-400 to-red-500' },
  'game_5': { emoji: '🎯', name: 'Game Explorer', desc: 'Played 5 different games', color: 'from-cyan-400 to-blue-600' },
  'streak_3': { emoji: '🔥', name: '3 Day Streak', desc: 'Played 3 days in a row', color: 'from-red-400 to-orange-600' },
  'couple_connected': { emoji: '💕', name: 'Connected Hearts', desc: 'Found and connected with a partner', color: 'from-pink-400 to-rose-600' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [gameStats, setGameStats] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Safety: never let the page spin forever.
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    loadProfile();

    async function loadProfile() {
      try {
        // 1) Fast auth read (local session first, no network round-trip on happy path)
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!session?.user) {
          clearTimeout(timeout);
          router.replace('/auth/login');
          return;
        }
        const u = session.user;
        if (cancelled) return;
        setUser(u);

        // 2) Fire ALL three queries in parallel — this is the big speed win.
        const [profileRes, statsRes, badgeRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, username, email, avatar_url, bio, created_at').eq('id', u.id).maybeSingle(),
          supabase.from('game_stats').select('id, game_type, games_played, total_time_played, wins, losses, last_played').eq('user_id', u.id).order('total_time_played', { ascending: false }),
          supabase.from('user_badges').select('id, earned_at, badge_id, badges(badge_key, name, description)').eq('user_id', u.id).order('earned_at', { ascending: false }),
        ]);
        if (cancelled) return;

        if (profileRes.data) setProfile(profileRes.data);

        const stats = statsRes.data || [];
        setGameStats(stats);
        setTotalTime(stats.reduce((s, x) => s + (x.total_time_played || 0), 0));
        setTotalWins(stats.reduce((s, x) => s + (x.wins || 0), 0));
        setTotalGames(stats.reduce((s, x) => s + (x.games_played || 0), 0));

        if (badgeRes.data) {
          setBadges(badgeRes.data.map((ub: any) => {
            const key = ub.badges?.badge_key || '';
            return {
              ...BADGE_INFO[key],
              name: ub.badges?.name || BADGE_INFO[key]?.name || 'Badge',
              desc: ub.badges?.description || BADGE_INFO[key]?.desc || '',
              earnedAt: ub.earned_at,
              id: ub.id,
            };
          }));
        }
      } catch (err) {
        console.error('Profile load failed', err);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }

    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">💕</div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const hours = Math.floor(totalTime / 3600);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="text-xl">←</button>
            <span className="text-2xl">👤</span>
            <h1 className="text-xl font-bold gradient-text">My Profile</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600 hover:text-pink-600">Dashboard</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}</p>
            </div>
          </div>
          {profile?.bio && (
            <div className="mt-4 p-4 bg-pink-50 rounded-xl">
              <p className="text-gray-700 italic">"{profile.bio}"</p>
            </div>
          )}
        </div>

        {/* Playtime Achievement Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
          <div className="text-center">
            <div className="text-5xl mb-3">{hours >= 24 ? '👑' : hours >= 10 ? '💎' : hours >= 5 ? '⭐' : '⏱️'}</div>
            <h3 className="text-2xl font-bold mb-1">{hours >= 24 ? 'You\'re a Legend!' : hours >= 10 ? 'Power Couple!' : hours >= 5 ? 'Great Together!' : 'Keep Playing!'}</h3>
            <p className="text-4xl font-black mb-2">{formatTime(totalTime)}</p>
            <p className="text-pink-100">Total time spent with your partner</p>
            {hours > 0 && (
              <div className="mt-4 inline-block bg-white/20 rounded-full px-6 py-2">
                <span className="text-lg font-bold">🏆 {hours} hour{hours > 1 ? 's' : ''} of love! 🏆</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Games Played', value: totalGames, icon: Gamepad2, color: 'from-blue-500 to-blue-600' },
            { label: 'Time Played', value: formatTime(totalTime), icon: Clock, color: 'from-green-500 to-green-600' },
            { label: 'Wins', value: totalWins, icon: Flame, color: 'from-orange-500 to-red-600' },
            { label: 'Badges', value: badges.length, icon: Trophy, color: 'from-yellow-500 to-orange-600' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
              <stat.icon className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievements ({badges.length})
          </h3>

          {badges.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No badges yet. Start playing games to earn achievements!</p>
              <button onClick={() => router.push('/games')} className="mt-3 text-pink-600 font-semibold">
                Start Playing →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className={`bg-gradient-to-br ${badge.color || 'from-gray-400 to-gray-500'} rounded-2xl p-4 text-white text-center shadow-lg`}>
                  <div className="text-4xl mb-2">{badge.emoji}</div>
                  <p className="font-bold text-sm">{badge.name}</p>
                  <p className="text-xs text-white/80 mt-1">{badge.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Stats */}
        {gameStats.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-500" />
              Game Statistics
            </h3>
            <div className="space-y-3">
              {gameStats.map(stat => (
                <div key={stat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg">
                      🎮
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">{stat.game_type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">
                        {stat.games_played} games · {formatTime(stat.total_time_played || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{stat.wins}W</p>
                    <p className="text-xs text-red-500">{stat.losses}L</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
