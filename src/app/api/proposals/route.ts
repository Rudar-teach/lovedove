import { createClient } from '@supabase/supabase-js';
import { type Proposal } from '@/lib/supabase';

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
      .from('proposals')
      .select(
        `
        *,
        sender:profiles!proposals_sender_id_fkey(id, full_name, username, avatar_url),
        receiver:profiles!proposals_receiver_id_fkey(id, full_name, username, avatar_url)
      `
      )
      .or(`sender_id.eq.${authUser.user.id},receiver_id.eq.${authUser.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json((data ?? []) as Proposal[], { status: 200 });
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
      title?: string;
      message?: string;
      category?: string;
      receiver_id?: string;
    };

    if (!body.title || !body.message || !body.receiver_id) {
      return Response.json(
        { error: 'Missing required fields: title, message, receiver_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        sender_id: authUser.user.id,
        receiver_id: body.receiver_id,
        title: body.title,
        message: body.message,
        category: body.category ?? 'other',
        response: null,
        responded_at: null,
        email_sent: false,
      } as Partial<Proposal>)
      .select(
        `
        *,
        sender:profiles!proposals_sender_id_fkey(id, full_name, username, avatar_url),
        receiver:profiles!proposals_receiver_id_fkey(id, full_name, username, avatar_url)
      `
      )
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(data as Proposal, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
