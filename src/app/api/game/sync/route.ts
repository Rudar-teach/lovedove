import { NextResponse } from 'next/server';

const store = new Map<string, { state: unknown; updatedAt: number }>();
const TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const matchId = url.searchParams.get('matchId');
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const entry = store.get(matchId);
  if (!entry) return NextResponse.json({ state: null });
  if (Date.now() - entry.updatedAt > TTL_MS) {
    store.delete(matchId);
    return NextResponse.json({ state: null });
  }
  return NextResponse.json({ state: entry.state });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, state } = body as { matchId?: string; state?: unknown };
    if (!matchId || state === undefined) {
      return NextResponse.json({ error: 'matchId + state required' }, { status: 400 });
    }
    store.set(matchId, { state, updatedAt: Date.now() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
