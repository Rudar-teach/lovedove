import { createClient } from '@supabase/supabase-js';
import { type Profile } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(request: Request) {
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
      bio?: string;
      anniversary_date?: string;
      theme_color?: string;
      full_name?: string;
      avatar_url?: string;
      cover_image_url?: string;
      partner_id?: string;
    };

    // Only include fields that are present in the body (avoid overwriting with undefined)
    const updateData: Record<string, unknown> = {};
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.anniversary_date !== undefined) updateData.anniversary_date = body.anniversary_date;
    if (body.theme_color !== undefined) updateData.theme_color = body.theme_color;
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url;
    if (body.partner_id !== undefined) updateData.partner_id = body.partner_id;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData as Partial<Profile>)
      .eq('id', user.id)
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
