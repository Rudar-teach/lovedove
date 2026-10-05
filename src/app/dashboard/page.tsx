'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, Gift, Gamepad2, Trophy, Users, Settings, Clock, Sparkles, ChevronRight, Flame, Zap, Mail, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile, GameStats, UserBadge } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';

const GAME_INFO: Record<string, { name: string; icon: string; color: string }> = {
  tictactoe: { name: 'Tic-Tac-Toe', icon: '⭕❌', color: 'from-pink-400 to-rose-500' },
  memory: { name: 'Memory Match', icon: '🎴', color: 'from-purple-400 to-pink-500' },
  quiz: { name: 'Couple Quiz', icon: '💡', color: 'from-rose-400 to-red-500' },
  wouldyourather: { name: 'Would You Rather', icon: '🤔', color: 'from-orange-400 to-pink-500' },
  wordchain: { name: 'Word Chain', icon: '🔤', color: 'from-cyan-400 to-blue-500' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!user) return;
    const { data: stats } = await supabase.from('game_stats').select('*').eq('user_id', user.id).order('last_played', { ascending: false });
    if (stats) { setGameStats(stats); setTotalTime(stats.reduce((sum, s) => sum + s.total_time_played, 0)); }
    const { data: userBadges } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id).order('earned_at', { ascending: false });
    if (userBadges) setBadges(userBadges);
    const { data: sessions } = await supabase.from('game_sessions').select('*').or(`player1.eq.${user.id},player2.eq.${user.id}`).order('started_at', { ascending: false }).limit(5);
    if (sessions) setRecentGames(sessions);
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

  const statCards = [
    { label: 'Games', value: gameStats.length, icon: Gamepad2, gradient: 'from-primary-500 to-rose-500', bg: 'bg-primary-50' },
    { label: 'Time Played', value: `${hours}h ${minutes}m`, icon: Clock, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Badges', value: badges.length, icon: Trophy, gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50' },
    { label: 'Wins', value: gameStats.reduce((a, b) => a + b.wins, 0), icon: Flame, gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-50' },
  ];

  return (
    <PremiumBackground>
      <div className="min-h-screen">
        {/* Navbar */}
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <Heart className="w-4 h-4 text-white heart-beat" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                  <div className="hidden md:flex items-center gap-1">
                    <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl">Dashboard</Link>
                    <Link href="/games" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Games</Link>
                    <Link href="/proposals" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors flex items-center gap-1">Proposals <Mail className="w-3.5 h-3.5" /></Link>
                    <Link href="/notifications" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors flex items-center gap-1">Alerts <Bell className="w-3.5 h-3.5" /></Link>
                    <Link href="/friends" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Friends</Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/birthday/new" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:scale-105 transition-all">
                    🎂 Create
                  </Link>
                  <Link href="/profile">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg text-sm">
                      {user.full_name?.[0]?.toUpperCase()}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">💕</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900">
                  {greeting}, <span className="gradient-text-animated">{user.full_name}</span>
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg font-light mt-1 ml-1">Here&apos;s what&apos;s happening in your love story...</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div className={`${stat.bg} rounded-[1.5rem] p-5 border border-pink-100/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Games */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary-500" />
                  Play Games Together
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(GAME_INFO).map(([key, game]) => (
                    <Link key={key} href={`/games/${key}`}>
                      <div className="group bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-5 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            {game.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{game.name}</h3>
                            <p className="text-sm text-gray-500">Play with partner</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
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
                      <div key={i} className="bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg p-4 flex items-center justify-between hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{GAME_INFO[game.game_type]?.icon || '🎮'}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{GAME_INFO[game.game_type]?.name || game.game_type}</p>
                            <p className="text-sm text-gray-500">{game.status === 'completed' ? `Completed` : 'In Progress'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(game.started_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg p-10 text-center">
                    <Sparkles className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No games played yet. Start playing with your partner!</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Badges */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Your Badges
                  </h3>
                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((ub) => (
                        <div
                          key={ub.id}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform cursor-default"
                          title={(ub as any).badges?.name}
                        >
                          {(ub as any).badges?.icon}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Play games to earn badges! 🏆</p>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="bg-white rounded-[1.5rem] border border-pink-100/60 shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/friends"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Users className="w-4 h-4" /> Manage Friends</span><ChevronRight className="w-4 h-4" /></Button></Link>
                    <Link href="/proposals"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Proposals</span><ChevronRight className="w-4 h-4" /></Button></Link>
                    <Link href="/notifications"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</span><ChevronRight className="w-4 h-4" /></Button></Link>
                    <Link href="/birthday/new"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Gift className="w-4 h-4" /> Birthday Site</span><ChevronRight className="w-4 h-4" /></Button></Link>
                    <Link href="/profile"><Button variant="outline" className="w-full justify-between"><span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Edit Profile</span><ChevronRight className="w-4 h-4" /></Button></Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors font-medium text-sm">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
