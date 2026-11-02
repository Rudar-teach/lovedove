import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * Guestbook API.
 *
 * GET  /api/guestbook?site=<slug>   -> entries, newest first, plus totals
 * POST /api/guestbook               -> write an entry
 * POST /api/guestbook/heart         -> toggle a heart (own route file)
 *
 * Authorization lives in Postgres, not here. Entries are readable only from
 * public published sites — the RLS policy and the SECURITY DEFINER function
 * both re-check is_public and is_published — so this route needs no bearer
 * token of its own. That matters: the point of the guestbook is that the
 * birthday person's guests often have no Love Dove account at all.
 */

const GUEST_NAME_MAX = 60;
const MESSAGE_MAX = 2000;
const SLUG_MAX = 80;

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('site')?.trim() || '';
  if (!slug || slug.length > SLUG_MAX) {
    return NextResponse.json({ error: 'Missing site slug' }, { status: 400 });
  }

  const { data: site } = await supabase
    .from('birthday_sites')
    .select('id, is_public, is_published')
    .eq('slug', slug)
    .maybeSingle();

  // Unknown, private, or unpublished sites return an empty guestbook rather
  // than an error, so probing a slug reveals nothing.
  if (!site || !site.is_public || !site.is_published) {
    return NextResponse.json({
      entries: [],
      totals: { entries: 0, total_hearts: 0, last_entry_at: null },
    });
  }

  const [{ data: entries, error }, { data: totals }] = await Promise.all([
    supabase
      .from('birthday_guest_entries')
      .select('*')
      .eq('site_id', site.id)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.rpc('guestbook_totals', { p_site_slug: slug }),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    entries: entries || [],
    totals: totals?.[0] || { entries: 0, total_hearts: 0, last_entry_at: null },
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slug = typeof body.site === 'string' ? body.site.trim() : '';
  const guestName = typeof body.guest_name === 'string' ? body.guest_name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const photoUrl = typeof body.photo_url === 'string' && body.photo_url.trim()
    ? body.photo_url.trim()
    : null;

  if (!slug || slug.length > SLUG_MAX) return NextResponse.json({ error: 'Missing site slug' }, { status: 400 });
  if (!guestName) return NextResponse.json({ error: 'Please add your name' }, { status: 400 });
  if (guestName.length > GUEST_NAME_MAX) return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Please write a message' }, { status: 400 });
  if (message.length > MESSAGE_MAX) return NextResponse.json({ error: `Message can be at most ${MESSAGE_MAX} characters` }, { status: 400 });
  if (photoUrl && !/^https?:\/\//.test(photoUrl)) return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 });

  // Anonymous heart tokens are random client ids. Only accept ones that can't
  // collide — 16+ hex chars, generated client-side.
  const heartToken = typeof body.heart_token === 'string' && /^[0-9a-f]{16,64}$/i.test(body.heart_token)
    ? body.heart_token
    : null;

  // Entries are attributed by guest_name, not by account. Passing a
  // p_user_id here would be useless: the anon client has no auth.uid(), so
  // add_guest_entry's caller check would null it out anyway. Guests write
  // anonymously by design.
  const { data, error } = await supabase.rpc('add_guest_entry', {
    p_site_slug: slug,
    p_guest_name: guestName,
    p_message: message,
    p_photo_url: photoUrl,
    p_heart_token: heartToken,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data }, { status: 201 });
}
