import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build a client scoped to the caller's access token. Storage RLS is
    // evaluated from the request's JWT, so verifying the token with an
    // anon client and then uploading with that same anon client would
    // still fail the "Auth users upload photos" policy — the upload
    // request itself has to carry the user's identity.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

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

    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'Only image files can be uploaded.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: 'Image is larger than the 10 MB limit.' },
        { status: 400 }
      );
    }

    // Sanitize filename and create a unique path
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
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
