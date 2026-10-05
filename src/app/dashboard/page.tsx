'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, Gift, Gamepad2, Trophy, Users, Settings, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile, GameStats, UserBadge } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const GAME_INFO: Record<string, { name: string; icon: string }> = {
  tictactoe: { name: 'Tic-Tac-Toe', icon: '⭕❌' },
  memory: { name: 'Memory Match', icon: '🎴' },
  quiz: { name: 'Couple Quiz', icon: '💡' },
  wouldyourather: { name: 'Would You Rather', icon: '🤔' },
  wordchain: { name: 'Word Chain', icon: '🔤' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!user) return;
    const { data: stats, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('last_played', { ascending: false });
    if (stats && !error) {
      setGameStats(stats);
      const total = stats.reduce((sum, s) => sum + s.total_time_played, 0);
      setTotalTime(total);
    }

    const { data: userBadges, error: badgeError } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });
    if (userBadges && !badgeError) setBadges(userBadges);

    const { data: sessions, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .or(`player1.eq.${user.id},player2.eq.${user.id}`)
      .order('started_at', { ascending: false })
      .limit(5);
    if (sessions && !sessionError) setRecentGames(sessions);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated || !user) return null;

  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary-500 heart-beat" />
              <span className="font-display font-bold text-xl gradient-text">Love Dove</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Logout">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Hello, <span className="gradient-text">{user.full_name}</span>! 💕
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Here&apos;s what&apos;s happening in your love story...</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Gamepad2 className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{gameStats.length}</p>
                <p className="text-sm text-gray-500">Games Played</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{hours}h {minutes}m</p>
                <p className="text-sm text-gray-500">Total Time</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{badges.length}</p>
                <p className="text-sm text-gray-500">Badges</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{user.partner_id ? '✓' : '—'}</p>
                <p className="text-sm text-gray-500">Partner</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Play Games */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary-500" />
                Play Games Together
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(GAME_INFO).map(([key, game]) => (
                  <Link key={key} href={`/games/${key}`}>
                    <Card hover className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{game.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{game.name}</h3>
                          <p className="text-sm text-gray-500">Play with partner</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Games */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary-500" />
                Recent Games
              </h2>
              {recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.map((game, i) => (
                    <Card key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {GAME_INFO[game.game_type]?.icon || '🎮'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {GAME_INFO[game.game_type]?.name || game.game_type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {game.status === 'completed' ? `Completed - Winner: ${game.winner_id === user.id ? 'You' : 'Partner'}` : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(game.started_at).toLocaleDateString()}
                      </span>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary-300" />
                  <p>No games played yet. Start playing with your partner!</p>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Your Badges
                </h3>
                {badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((ub) => (
                      <div
                        key={ub.id}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg"
                        title={(ub as any).badges?.name}
                      >
                        {(ub as any).badges?.icon}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Play games to earn badges! 🏆
                  </p>
                )}
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/friends">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Manage Friends</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/birthday/new">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2"><Gift className="w-4 h-4" /> Birthday Site</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Edit Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}