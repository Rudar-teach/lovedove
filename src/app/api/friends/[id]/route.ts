import { createClient } from '@supabase/supabase-js';
import { type FriendRequest } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      status?: 'accepted' | 'rejected';
    };

    if (!body.status || !['accepted', 'rejected'].includes(body.status)) {
      return Response.json(
        { error: 'Invalid status. Must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status: body.status })
      .eq('id', params.id)
      .eq('receiver_id', user.id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return Response.json(
        { error: 'Friend request not found or you are not the receiver' },
        { status: 404 }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}