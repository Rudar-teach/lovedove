import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const last24h = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsersResult,
      newUsersWeekResult,
      newUsersMonthResult,
      active24hResult,
      active7dResult,
      active30dResult,
      activeSessionsResult,
      gamesResult,
      matchesResult,
      messagesResult,
      analyticsWeekResult,
      peakHourResult,
      topGamesResult,
      recentUsersResult,
      dailySignupsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('username', 'admin'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('active_sessions').select('user_id', { count: 'exact', head: true }).gte('last_seen', last24h.toISOString()),
      supabase.from('active_sessions').select('user_id', { count: 'exact', head: true }).gte('last_seen', last7d.toISOString()),
      supabase.from('active_sessions').select('user_id', { count: 'exact', head: true }).gte('last_seen', last30d.toISOString()),
      supabase.from('active_sessions').select('user_id').eq('is_active', true).gte('last_seen', last24h.toISOString()),
      supabase.from('game_sessions').select('id', { count: 'exact', head: true }).gte('started_at', startOfWeek.toISOString()),
      supabase.from('matches').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
      supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', last24h.toISOString()),
      supabase.from('analytics_daily').select('*').gte('date', startOfWeek.toISOString().split('T')[0]).order('date', { ascending: true }),
      supabase.from('analytics_daily').select('peak_hour, peak_users').order('date', { ascending: false }).limit(7),
      supabase.from('games_catalog').select('slug, name, emoji, play_count, category').order('play_count', { ascending: false }).limit(10),
      supabase.from('profiles').select('id, username, full_name, email, avatar_url, created_at').neq('username', 'admin').order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('created_at').neq('username', 'admin').gte('created_at', last30d.toISOString()).order('created_at', { ascending: true }),
    ]);

    const uniqueActive24h = new Set(activeSessionsResult.data?.map(s => s.user_id) || []).size;

    // Calculate daily signups chart data
    const dailySignupsMap: Record<string, number> = {};
    dailySignupsResult.data?.forEach(u => {
      const date = new Date(u.created_at).toISOString().split('T')[0];
      dailySignupsMap[date] = (dailySignupsMap[date] || 0) + 1;
    });

    const now = new Date();
    const signupChartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      return { date: key.slice(5), count: dailySignupsMap[key] || 0 };
    });

    // Hourly activity for peak hour
    const hourlyCount: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyCount[h] = 0;
    analyticsWeekResult.data?.forEach(day => {
      if (day.peak_hour !== null) hourlyCount[day.peak_hour] = (hourlyCount[day.peak_hour] || 0) + day.peak_users;
    });
    let peakHour = 0;
    let peakCount = 0;
    for (let h = 0; h < 24; h++) {
      if (hourlyCount[h] > peakCount) { peakCount = hourlyCount[h]; peakHour = h; }
    }

    return NextResponse.json({
      overview: {
        totalUsers: totalUsersResult.count || 0,
        newUsersThisWeek: newUsersWeekResult.count || 0,
        newUsersThisMonth: newUsersMonthResult.count || 0,
        activeNow: uniqueActive24h,
        activeLast24h: active24hResult.count || 0,
        activeLast7d: active7dResult.count || 0,
        activeLast30d: active30dResult.count || 0,
        gamesThisWeek: gamesResult.count || 0,
        matchesThisWeek: matchesResult.count || 0,
        messagesLast24h: messagesResult.count || 0,
        peakHour,
        peakUserCount: peakCount,
      },
      signupChart: signupChartData,
      topGames: topGamesResult.data || [],
      recentUsers: recentUsersResult.data || [],
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
