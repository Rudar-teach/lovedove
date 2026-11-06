import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getClient(token?: string) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
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
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = getClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await client
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid credentials' }, { status: 401 });
    }

    // Verify admin privileges
    const authClient = getClient(data.session.access_token);
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Access denied: account is not an administrator' }, { status: 403 });
    }

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
      token: data.session.access_token,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  return NextResponse.json({ success: true });
}
