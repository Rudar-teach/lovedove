'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getAdminStats, getAllUsers, getAllLogins, getActiveUsersList } from '@/lib/adminApi';
import type { AdminStats } from '@/lib/types';

const ADMIN_EMAIL = 'manithakur123450@gmail.com';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'logins' | 'active'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      alert('Access Denied! Admin only.');
      router.push('/');
      return;
    }
    setIsAdmin(true);
    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const statsData = await getAdminStats();
    if (statsData) setStats(statsData);

    const usersData = await getAllUsers();
    if (usersData) setUsers(usersData);

    const loginsData = await getAllLogins(200);
    if (loginsData) setLogins(loginsData);

    const activeData = await getActiveUsersList();
    if (activeData) setActiveUsers(activeData);
  }

  function formatNumber(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">💕</div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-2xl font-bold">Love Dove Admin</h1>
            </div>
            <p className="text-gray-400 text-sm">Logged in as {ADMIN_EMAIL}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Live Stats Bar */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-bold">LIVE</span>
            <span className="text-green-100">Currently Online: <strong>{stats?.currentlyOnline || 0}</strong></span>
          </div>
          <button onClick={loadData} className="text-white bg-white/20 px-4 py-1 rounded-lg text-sm hover:bg-white/30 transition-colors">
            🔄 Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Overview', icon: '📊' },
            { key: 'users', label: '👥 Users', icon: '👥' },
            { key: 'logins', label: '🔑 Login History', icon: '🔑' },
            { key: 'active', label: '🟢 Active Users', icon: '🟢' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${tab === t.key ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && stats && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-blue-600', icon: '👥' },
                { label: 'Today Logins', value: stats.todayLogins, color: 'from-green-500 to-green-600', icon: '📅' },
                { label: 'Week Logins', value: stats.weekLogins, color: 'from-purple-500 to-purple-600', icon: '📆' },
                { label: 'Month Logins', value: stats.monthLogins, color: 'from-pink-500 to-pink-600', icon: '🗓️' },
                { label: 'Online Now', value: stats.currentlyOnline, color: 'from-green-400 to-green-500', icon: '🟢' },
                { label: 'Peak Hour', value: stats.peakHour, color: 'from-orange-500 to-orange-600', icon: '🔥', isText: true },
              ].map(stat => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.isText ? String(stat.value) : formatNumber(Number(stat.value))}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Peak Traffic Info */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <h3 className="font-bold text-lg mb-2">🔥 Peak Traffic Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Peak Hour</p>
                  <p className="text-xl font-bold text-orange-600">{stats.peakHour}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Peak Users</p>
                  <p className="text-xl font-bold text-red-600">{formatNumber(stats.peakUsers)}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Online Now</p>
                  <p className="text-xl font-bold text-green-600">{stats.currentlyOnline}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg/Day (Week)</p>
                  <p className="text-xl font-bold text-blue-600">{stats.weekLogins > 0 ? Math.round(stats.weekLogins / 7) : 0}</p>
                </div>
              </div>
            </div>

            {/* Daily Logins Chart */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">📈 Daily Logins (Last 30 Days)</h3>
              <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                {stats.dailyData.map((day, i) => {
                  const max = Math.max(...stats.dailyData.map(d => d.logins), 1);
                  const height = (day.logins / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center min-w-[20px] flex-1">
                      <div className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-md transition-all hover:from-pink-600 hover:to-pink-500 relative group"
                        style={{ height: `${Math.max(height, 2)}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          {day.logins} logins
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 rotate-[-45deg] whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Traffic Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">📊 Hourly Traffic (Last 7 Days)</h3>
              <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                {stats.hourlyData.map((h, i) => {
                  const max = Math.max(...stats.hourlyData.map(d => d.users), 1);
                  const height = (h.users / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center min-w-[24px] flex-1">
                      <span className="text-[9px] text-gray-400 mb-1">{h.users}</span>
                      <div className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md"
                        style={{ height: `${Math.max(height, 2)}%` }} />
                      <span className="text-[9px] text-gray-400 mt-1">{i % 3 === 0 ? h.hour : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold">👥 All Registered Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Bio</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-pink-50">
                      <td className="p-3 font-medium">{u.full_name}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-gray-400 truncate max-w-[200px]">{u.bio || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Login History Tab */}
        {tab === 'logins' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold">🔑 Recent Login History ({logins.length} entries)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Login Time</th>
                    <th className="text-left p-3">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map(l => (
                    <tr key={l.id} className="border-b hover:bg-pink-50">
                      <td className="p-3">
                        <div className="font-medium">{l.email}</div>
                        <div className="text-xs text-gray-400">{l.user_id}</div>
                      </td>
                      <td className="p-3 text-gray-600">{new Date(l.logged_in_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-400 text-xs max-w-[300px] truncate">{l.user_agent || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Users Tab */}
        {tab === 'active' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">🟢 Currently Active Users ({activeUsers.length})</h3>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            {activeUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">😴</div>
                <p>No users currently active</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {activeUsers.map(au => (
                  <div key={au.user_id} className="border rounded-lg p-3 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{users.find(u => u.id === au.user_id)?.full_name || au.user_id}</p>
                      <p className="text-xs text-gray-400">{au.page_url || '/'}</p>
                      <p className="text-xs text-gray-400">{new Date(au.last_active).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
