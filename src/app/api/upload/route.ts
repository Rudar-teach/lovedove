import { createClient } from '@supabase/supabase-js';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: 'No file provided. Expected multipart/form-data with a "file" field.' },
        { status: 400 }
      );
    }

    // Sanitize filename and create a unique path
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExt = originalName.split('.').pop() ?? 'bin';
    const fileName = `${user.id}/${Date.now()}_${originalName}`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    // Build public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('photos').getPublicUrl(data.path);

    return Response.json(
      { url: publicUrl, path: data.path },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
