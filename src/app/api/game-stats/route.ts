import { createClient } from '@supabase/supabase-js';
import { type GameStats } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAuthUser(
  request: Request
): Promise<{ user: { id: string } } | null> {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return { user: { id: user.id } };
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', authUser.user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(data ?? [], { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      game_type?: string;
      games_played?: number;
      total_time_played?: number;
      wins?: number;
      losses?: number;
    };

    if (!body.game_type) {
      return Response.json(
        { error: 'game_type is required' },
        { status: 400 }
      );
    }

    const upsertData: Partial<GameStats> = {
      user_id: authUser.user.id,
      game_type: body.game_type,
      games_played: body.games_played ?? 0,
      total_time_played: body.total_time_played ?? 0,
      wins: body.wins ?? 0,
      losses: body.losses ?? 0,
    };

    const { data, error } = await supabase
      .from('game_stats')
      .upsert(upsertData, {
        onConflict: 'user_id,game_type',
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
