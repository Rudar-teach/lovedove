import { createClient } from '@supabase/supabase-js';
import { type BirthdaySite } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
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
      name?: string;
      message?: string;
      photos?: string[];
      theme?: string;
      slug?: string;
      is_public?: boolean;
    };

    if (!body.name || !body.message || !body.slug) {
      return Response.json(
        { error: 'Missing required fields: name, message, slug' },
        { status: 400 }
      );
    }

    const insertData: Partial<BirthdaySite> = {
      user_id: user.id,
      name: body.name,
      message: body.message,
      photos: body.photos ?? [],
      theme: body.theme ?? 'default',
      slug: body.slug,
      is_public: body.is_public ?? true,
    };

    const { data, error } = await supabase
      .from('birthday_sites')
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
