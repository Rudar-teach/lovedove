import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * POST /api/guestbook/heart
 *
 * Toggle a heart on a guestbook entry, keyed by a browser-local token so an
 * anonymous visitor can heart too. Idempotent: pressing again removes it.
 * One (entry, token) can hold exactly one heart, enforced in Postgres by a
 * unique index on the token.
 */

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const entryId = typeof body.entry_id === 'string' ? body.entry_id.trim() : '';
  const heartToken = typeof body.heart_token === 'string' ? body.heart_token.trim() : '';

  if (!entryId) return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
  if (!/^[0-9a-f]{16,64}$/i.test(heartToken)) {
    return NextResponse.json({ error: 'Invalid heart token' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('toggle_guest_entry_heart', {
    p_entry_id: entryId,
    p_heart_token: heartToken,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Postgres returns the new count as a scalar. Older versions of the
  // PostgREST client surface that as a bare number.
  return NextResponse.json({ hearts: typeof data === 'number' ? data : Number(data) || 0 });
}
