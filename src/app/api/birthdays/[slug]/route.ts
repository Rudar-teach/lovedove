import { createClient } from '@supabase/supabase-js';
import { type BirthdaySite } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const { data, error } = await supabase
      .from('birthday_sites')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return Response.json({ error: 'Birthday site not found' }, { status: 404 });
    }

    // Increment view count (best-effort, don't block on failure)
    await supabase
      .from('birthday_sites')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', data.id);

    const updated: BirthdaySite = { ...data, view_count: (data.view_count ?? 0) + 1 };
    return Response.json(updated, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
