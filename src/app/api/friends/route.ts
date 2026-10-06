import { createClient } from '@supabase/supabase-js';
import { type Profile, type FriendRequest } from '@/lib/supabase';

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
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey(id, full_name, username, avatar_url),
        receiver:profiles!friend_requests_receiver_id_fkey(id, full_name, username, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${authUser.user.id},receiver_id.eq.${authUser.user.id}`);

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

    const body = (await request.json()) as { receiver_username?: string };

    if (!body.receiver_username) {
      return Response.json(
        { error: 'receiver_username is required' },
        { status: 400 }
      );
    }

    // Look up the receiver profile by username
    const { data: receiverProfile, error: receiverError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', body.receiver_username)
      .maybeSingle();

    if (receiverError || !receiverProfile) {
      return Response.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    if (receiverProfile.id === authUser.user.id) {
      return Response.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check for existing request
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(
        `and(sender_id.eq.${authUser.user.id},receiver_id.eq.${receiverProfile.id}),and(sender_id.eq.${receiverProfile.id},receiver_id.eq.${authUser.user.id})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        return Response.json(
          { error: 'Already friends' },
          { status: 400 }
        );
      }
      if (existing.status === 'pending') {
        return Response.json(
          { error: 'Friend request already pending' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: authUser.user.id,
        receiver_id: receiverProfile.id,
        status: 'pending' as const,
      } as Partial<FriendRequest>)
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
