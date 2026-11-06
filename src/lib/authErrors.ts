/**
 * Supabase throttles auth attempts per IP (defaults: 10 sign-in attempts
 * per 5 minutes). When the throttle trips it returns a raw "Rate limit
 * exceeded." / "Too many sign in attempts..." string. This helper turns
 * that into an actionable message that tells the user WHEN to retry.
 */
export function friendlyAuthError(message: string | null | undefined): string {
  const m = (message || '').toLowerCase();
  if (
    m.includes('rate limit') ||
    m.includes('too many') ||
    m.includes('slow down') ||
    m.includes('try again in')
  ) {
    return 'Too many sign-in attempts from this connection. Please wait about 5 minutes, then try again.';
  }
  return message || 'Something went wrong. Please try again.';
}
