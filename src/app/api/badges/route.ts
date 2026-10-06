import { createClient } from '@supabase/supabase-js';
import { type Badge, type UserBadge } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const getAll = url.searchParams.get('all');

    // If ?all=true, return all available badges without auth
    if (getAll === 'true') {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name');

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json(data ?? [], { status: 200 });
    }

    // Otherwise, require auth and return user's badges
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select(
        `
        *,
        badge:badges(*)
      `
      )
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json((data ?? []) as UserBadge[], { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
