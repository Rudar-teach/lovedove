/**
 * Live games_catalog overlay, cached for 5 minutes.
 *
 * /games re-mounts on every navigation back to it — without a cache the
 * whole table is re-fetched each time (and the 150+ row merge re-runs).
 * The overlay only changes when an admin adds a row, so a short TTL is
 * plenty; admin edits surface within 5 minutes.
 */

import { supabase } from './supabase';

let cached: { t: number; rows: any[] } | null = null;
const CATALOG_TTL_MS = 5 * 60 * 1000;

export async function getGameCatalog(): Promise<any[]> {
  if (cached && Date.now() - cached.t < CATALOG_TTL_MS) return cached.rows;
  const { data, error } = await supabase
    .from('games_catalog')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('play_count', { ascending: false });
  if (!error) {
    cached = { t: Date.now(), rows: data || [] };
  }
  return cached?.rows ?? (data || []);
}

/** Force the next read to hit the DB (after an admin edit, e.g.). */
export function invalidateGameCatalog(): void {
  cached = null;
}
