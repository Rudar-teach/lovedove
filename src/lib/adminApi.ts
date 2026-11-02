import { supabase } from './supabase';
import type { LoginTracking, ActiveUser, AdminStats } from './types';

export async function trackLogin(userId: string, email: string) {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
  const { error } = await supabase
    .from('login_tracking')
    .insert({ user_id: userId, email, user_agent: userAgent });

  if (error) console.error('Login tracking error:', error);
  return error;
}

export async function updateActiveStatus(userId: string) {
  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';
  await supabase.from('active_users').upsert(
    { user_id: userId, last_active: new Date().toISOString(), page_url: pageUrl, is_online: true },
    { onConflict: 'user_id' }
  );

  // Heartbeat every 30 seconds
  if (typeof window !== 'undefined') {
    const interval = setInterval(async () => {
      await supabase.from('active_users').upsert(
        { user_id: userId, last_active: new Date().toISOString(), is_online: true },
        { onConflict: 'user_id' }
      );
    }, 30000);
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      supabase.from('active_users').upsert(
        { user_id: userId, last_active: new Date().toISOString(), is_online: false },
        { onConflict: 'user_id' }
      );
    });
  }
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: totalUsers } = { count: 0 },
    { count: todayLogins } = { count: 0 },
    { count: weekLogins } = { count: 0 },
    { count: monthLogins } = { count: 0 },
    { count: currentlyOnline } = { count: 0 },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('login_tracking').select('*', { count: 'exact', head: true }).gte('logged_in_at', todayStart.toISOString()),
    supabase.from('login_tracking').select('*', { count: 'exact', head: true }).gte('logged_in_at', weekStart.toISOString()),
    supabase.from('login_tracking').select('*', { count: 'exact', head: true }).gte('logged_in_at', monthStart.toISOString()),
    supabase.from('active_users').select('*', { count: 'exact', head: true }).eq('is_online', true),
  ]);

  // Daily data for last 30 days
  const { data: dailyData } = await supabase
    .from('login_tracking')
    .select('logged_in_at')
    .gte('logged_in_at', monthStart.toISOString());

  const dailyMap: Record<string, number> = {};
  dailyData?.forEach((item: { logged_in_at: string }) => {
    const date = new Date(item.logged_in_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dailyMap[key] = (dailyMap[key] || 0) + 1;
  });

  const dailyChart = Object.entries(dailyMap)
    .map(([date, logins]) => ({ date, logins }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Hourly data for peak time
  const { data: hourlyRaw } = await supabase
    .from('login_tracking')
    .select('logged_in_at')
    .gte('logged_in_at', weekStart.toISOString());

  const hourlyMap: Record<number, number> = {};
  hourlyRaw?.forEach((item: { logged_in_at: string }) => {
    const h = new Date(item.logged_in_at).getHours();
    hourlyMap[h] = (hourlyMap[h] || 0) + 1;
  });

  const peakHour = Object.entries(hourlyMap).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const peakUsers = peakHour ? Number(peakHour[1]) : 0;

  const hourlyChart = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    users: hourlyMap[i] || 0,
  }));

  return {
    totalUsers: totalUsers || 0,
    todayLogins: todayLogins || 0,
    weekLogins: weekLogins || 0,
    monthLogins: monthLogins || 0,
    currentlyOnline: currentlyOnline || 0,
    peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
    peakUsers,
    dailyData: dailyChart,
    hourlyData: hourlyChart,
    categoryData: [],
    genderData: [],
  };
}

export async function getAllUsers() {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at, avatar_url, bio')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAllLogins(limit = 100) {
  const { data } = await supabase
    .from('login_tracking')
    .select('*')
    .order('logged_in_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getActiveUsersList() {
  const { data } = await supabase
    .from('active_users')
    .select('*')
    .eq('is_online', true)
    .order('last_active', { ascending: false });
  return data || [];
}
