import { NextResponse, type NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────────
// Simple in-memory rate limiter (per IP, per route prefix).
// Good enough for a small deployment; swap for a shared store
// (Redis) if you run multiple instances, since each instance
// keeps its own counters.
// ─────────────────────────────────────────────────────────────────
const buckets = new Map<string, { count: number; resetAt: number }>();

// Limits: requests per window.
const LIMITS: Record<string, { windowMs: number; max: number }> = {
  // Auth is the most abused surface — tightest limit.
  '/api/auth': { windowMs: 60_000, max: 20 },
  // Email sending can be abused to spam — tight.
  '/api/send-proposal-email': { windowMs: 60_000, max: 5 },
  // Admin routes — tight.
  '/api/admin': { windowMs: 60_000, max: 30 },
  // Everything else under /api — moderate.
  '/api': { windowMs: 60_000, max: 120 },
};

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(req: NextRequest): boolean {
  const url = req.nextUrl.pathname;
  // Longest-prefix match so /api/admin/... hits the admin limit,
  // /api/send-proposal-email hits the email limit, etc.
  let limit: { windowMs: number; max: number } | null = null;
  let matched = 0;
  for (const [prefix, l] of Object.entries(LIMITS)) {
    if (url.startsWith(prefix) && prefix.length > matched) {
      limit = l;
      matched = prefix.length;
    }
  }
  if (!limit) return true; // not a rate-limited path

  const key = `${getClientIp(req)}:${matched}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    // New window (or no bucket yet): start counting from 1.
    buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
  } else if (bucket.count >= limit.max) {
    // Window still open and cap already hit — block.
    return false; // over limit
  } else {
    bucket.count += 1;
  }

  // Avoid unbounded growth: prune stale buckets occasionally.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }
  return true;
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ── Security headers on every response ───────────────────────
  const origin = req.nextUrl.origin;
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CSP: self-hosted fonts, Supabase/Cloudinary images, inline styles
  // (Next injects them), and Google fonts if any are still in use.
  // Dev-only: React's dev build calls eval() to reconstruct component
  // callstacks, so 'unsafe-eval' is required locally. It is baked out
  // of production builds (NODE_ENV is defined at build time).
  const allowUnsafeEval = process.env.NODE_ENV !== 'production';
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${allowUnsafeEval ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in ws://localhost:* wss://localhost:*",
      "frame-src https: http:", // Spotify embeds
      `frame-ancestors 'none'`,
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  );
  res.headers.set('X-Powered-By', '');

  // ── Rate limiting (429 when exceeded) ────────────────────────
  if (req.nextUrl.pathname.startsWith('/api') && !checkRateLimit(req)) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  return res;
}

export const config = {
  // Run on API routes + everything. Exclude static assets for speed.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2?|ttf|eot)).*)',
  ],
};
