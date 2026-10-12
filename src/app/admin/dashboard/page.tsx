'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, TrendingUp, Gamepad2, Heart, MessageCircle,
  Clock, Activity, Calendar, Award, ArrowUpRight, ArrowDownRight,
  UserPlus, AlertTriangle, RefreshCw, LogOut, BarChart3
} from 'lucide-react';

interface DailyData {
  date: string;
  count: number;
}

interface TopGame {
  slug: string;
  name: string;
  emoji: string;
  play_count: number;
  category: string;
}

interface RecentUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

interface OverviewData {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeNow: number;
  activeLast24h: number;
  activeLast7d: number;
  activeLast30d: number;
  gamesThisWeek: number;
  matchesThisWeek: number;
  messagesLast24h: number;
  peakHour: number;
  peakUserCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [signupChart, setSignupChart] = useState<DailyData[]>([]);
  const [topGames, setTopGames] = useState<TopGame[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [error, setError] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      if (data.success) fetchStats();
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) { setError('Failed to load stats'); return; }
      const data = await res.json();
      setOverview(data.overview);
      setSignupChart(data.signupChart || []);
      setTopGames(data.topGames || []);
      setRecentUsers(data.recentUsers || []);
      setError('');
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = () => {
    fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const StatCard = ({ icon, label, value, sub, color, trend }: any) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-purple-200 mt-1">{label}</p>
        {sub && <p className="text-xs text-purple-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-200 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Love Dove Admin
            </Link>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/" className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <BarChart3 className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-300" />}
            label="Total Users"
            value={overview?.totalUsers || 0}
            sub={`+${overview?.newUsersThisWeek || 0} this week`}
            color="bg-blue-500/20"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-green-300" />}
            label="Online Now"
            value={overview?.activeNow || 0}
            sub={`${overview?.activeLast24h || 0} in last 24h`}
            color="bg-green-500/20"
          />
          <StatCard
            icon={<Gamepad2 className="w-5 h-5 text-purple-300" />}
            label="Games This Week"
            value={overview?.gamesThisWeek || 0}
            sub={`Peak at ${formatHour(overview?.peakHour || 0)}`}
            color="bg-purple-500/20"
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-pink-300" />}
            label="Matches This Week"
            value={overview?.matchesThisWeek || 0}
            color="bg-pink-500/20"
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5 text-cyan-300" />}
            label="Messages (24h)"
            value={overview?.messagesLast24h || 0}
            color="bg-cyan-500/20"
          />
          <StatCard
            icon={<UserPlus className="w-5 h-5 text-amber-300" />}
            label="New This Month"
            value={overview?.newUsersThisMonth || 0}
            sub={`${overview?.newUsersThisWeek || 0} this week`}
            color="bg-amber-500/20"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-indigo-300" />}
            label="Peak Traffic"
            value={formatHour(overview?.peakHour || 0)}
            sub={`${overview?.peakUserCount || 0} users at peak`}
            color="bg-indigo-500/20"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-300" />}
            label="7-Day Active"
            value={overview?.activeLast7d || 0}
            sub={`${overview?.activeLast30d || 0} in 30 days`}
            color="bg-emerald-500/20"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signups Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              New Signups (Last 30 Days)
            </h3>
            <div className="h-64 flex items-end gap-1">
              {signupChart.map((day, i) => {
                const max = Math.max(...signupChart.map(d => d.count), 1);
                const height = max > 0 ? (day.count / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-sm hover:from-purple-400 hover:to-pink-300 transition-all relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      {day.count > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.count} users
                        </div>
                      )}
                    </div>
                    {i % 5 === 0 && (
                      <span className="text-[10px] text-purple-300">{day.date}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Games */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-pink-300" />
              Top Games
            </h3>
            <div className="space-y-3">
              {topGames.map((game, i) => (
                <div key={game.slug} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-300 w-6">{i + 1}</span>
                  <span className="text-xl">{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{game.name}</p>
                    <p className="text-xs text-purple-300 capitalize">{game.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-purple-200">{game.play_count}</span>
                  <span className="text-xs text-purple-400">plays</span>
                </div>
              ))}
              {topGames.length === 0 && (
                <p className="text-purple-300 text-sm text-center py-8">No game data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-300" />
              Recent Users
            </h3>
            <span className="text-sm text-purple-300">{recentUsers.length} shown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          {(user.full_name || user.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.full_name || user.username || 'Unknown'}</p>
                          <p className="text-xs text-purple-300">@{user.username || 'no_username'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-200">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-purple-300">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-purple-300">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
