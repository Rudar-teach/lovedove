/**
 * Supabase throttles auth attempts per IP (e.g. "Rate limit exceeded." /
 * "Too many sign in attempts..."). These helpers turn that into clear,
 * actionable messages and let the UI switch into auto-retry mode.
 */
export function friendlyAuthError(message: string | null | undefined): string {
  if (isRateLimited(message)) {
    return 'Too many sign-in attempts from this connection right now.';
  }
  return message || 'Something went wrong. Please try again.';
}

export function isRateLimited(message: string | null | undefined): boolean {
  const m = (message || '').toLowerCase();
  return (
    m.includes('rate limit') ||
    m.includes('too many') ||
    m.includes('slow down')
  );
}
