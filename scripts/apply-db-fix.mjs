#!/usr/bin/env node
/**
 * One-shot applier for lovedove-db-fix.sql against the LIVE Supabase Postgres.
 *
 * Usage:
 *   node scripts/apply-db-fix.mjs <DB_PASSWORD>
 *
 * Get the DB password from the Supabase dashboard:
 *   Settings → Database → "Edit Database Password" (or "Direct connection" section)
 *
 * The project is hardcoded here on purpose — this script belongs to this
 * project only. It connects to the private Postgres host (db.<ref>.supabase.co:5432),
 * which is NOT reachable via the REST anon key; only the real DB password works.
 *
 * Idempotent: the SQL file guards every statement (IF NOT EXISTS / DROP IF
 * EXISTS / exception catches), so re-running after a partial failure is safe.
 */
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PROJECT_REF = 'pytjmswiynjsjatluftd'; // Supabase project id
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('Usage: node scripts/apply-db-fix.mjs <DB_PASSWORD>');
  console.error('Dashboard → Settings → Database → "Direct connection" password.');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(here, '..', 'lovedove-db-fix.sql'), 'utf8');

const client = new pg.Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  user: `postgres.${PROJECT_REF}`,
  password: DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  console.log('Connected to live Postgres — running fix…');
  // Simple (multi-statement) query protocol: sends the whole file as-is.
  await client.query(sql);
  console.log('✅ Fix applied.');

  // Quick verification reads
  const fr = await client.query(
    `SELECT to_regclass('public.friend_requests') AS friend_requests,
            to_regclass('public.play_invites') AS play_invites,
            (SELECT count(*) FROM profiles) AS profile_rows,
            (SELECT count(*) FROM profiles WHERE username IS NOT NULL) AS profiles_with_username`
  );
  console.log('Verification:', fr.rows[0]);
} catch (err) {
  console.error('❌ Apply failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
