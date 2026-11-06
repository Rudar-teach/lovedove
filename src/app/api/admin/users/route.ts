import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient(token?: string) {
  return createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

async function resolveToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim();
  }
  const cookieStore = await cookies();
  return cookieStore.get('admin_token')?.value || null;
}

export async function GET(request: Request) {
  try {
    const token = await resolveToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authClient = getClient(token);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await authClient.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = getClient(token);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';

    let query = supabase.from('profiles').select('*', { count: 'exact' }).neq('username', 'admin');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users: users || [], total: count || 0, limit, offset });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
