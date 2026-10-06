import { createClient } from '@supabase/supabase-js';
import { type GameSession } from '@/lib/supabase';

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
      .from('game_sessions')
      .select('*')
      .or(`player1.eq.${authUser.user.id},player2.eq.${authUser.user.id}`)
      .order('started_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json((data ?? []) as GameSession[], { status: 200 });
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
      player2?: string;
      game_state?: Record<string, any>;
    };

    if (!body.game_type || !body.player2) {
      return Response.json(
        { error: 'game_type and player2 are required' },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = {
      game_type: body.game_type,
      player1: authUser.user.id,
      player2: body.player2,
      current_turn: authUser.user.id,
      game_state: body.game_state ?? {},
      status: 'active',
      winner_id: null,
      started_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('game_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
