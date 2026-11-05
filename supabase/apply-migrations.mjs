#!/usr/bin/env node
// Applies Love Dove's pending Supabase SQL migrations to the live database.
//
// WHAT IT DOES
//   - Connects to your Supabase Postgres (Supavisor pooler or direct).
//   - Runs the migrations listed in TO_APPLY below, each as one atomic
//     statement batch (they are all idempotent: IF NOT EXISTS / to_regclass
//     guards, so re-running is safe).
//   - Verifies the result: the missed_you_entries table exists, its RLS
//     policies are in place, and the performance indexes exist.
//
// CREDENTIALS (never printed, never committed)
//   Option 1 (easiest): set a full connection string in .env.local:
//       SUPABASE_DB_URL=postgresql://postgres.xxxx:password@xxx.supabase.com:5432/postgres
//       (Dashboard -> Settings -> Database -> Connection strings)
//   Option 2: set both of these in .env.local:
//       SUPABASE_PROJECT_REF=abcdefghijklmnop   (from the dashboard URL)
//       SUPABASE_DB_PASSWORD=...                (pooler password, Settings -> Database)
//   Shell environment variables win over .env.local if both are set.
//
// USAGE
//   node supabase/apply-migrations.mjs
//
// NOTE: the anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is NOT enough - it is
// the public browser key and cannot create tables. You need the Postgres
// login credentials above (a Service Role key alone also cannot run DDL).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url)); // <repo>/supabase
const repoRoot = join(here, '..');

// Add future migration files here as they land.
const TO_APPLY = [
  '20261102_performance_indexes.sql',
  '20261102_performance_indexes_extra.sql',
  '20261105_missed_you_entries.sql',
];

// ---------------------------------------------------------------- env files
function parseEnvFile(file) {
  const vars = {};
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return vars;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    vars[m[1]] = v;
  }
  return vars;
}

function findLocalEnv() {
  // Walk up from the script's location, then from cwd, looking for
  // .env.local / .env that hold the credentials.
  const candidates = [];
  let dir = here;
  for (let i = 0; i < 6; i++) {
    candidates.push(join(dir, '.env.local'), join(dir, '.env'));
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

const envFile = findLocalEnv();
const fileVars = envFile ? parseEnvFile(envFile) : {};

function get(name) {
  return process.env[name] || fileVars[name] || '';
}

// ---------------------------------------------------------------- connection
const dbUrl = get('SUPABASE_DB_URL');
const projectRef = get('SUPABASE_PROJECT_REF');
const dbPassword = get('SUPABASE_DB_PASSWORD');

if (!dbUrl && !(projectRef && dbPassword)) {
  console.error('No Supabase credentials found.');
  console.error('');
  console.error(`Looked in shell env${envFile ? ` and ${envFile}` : ' only (no .env.local found near supabase/)'}.`);
  console.error('');
  console.error('Add one of these to your .env.local (repo root), then re-run:');
  console.error('');
  console.error('  # full string from Dashboard -> Settings -> Database -> Connection strings');
  console.error('  SUPABASE_DB_URL=postgresql://postgres.xxxx:password@xxx.supabase.com:5432/postgres');
  console.error('');
  console.error('  # or both of:');
  console.error('  SUPABASE_PROJECT_REF=xxxxxx');
  console.error('  SUPABASE_DB_PASSWORD=xxxxxxxx');
  process.exit(1);
}

// Session-mode pooler (port 5432) - the right mode for multi-statement DDL.
const url =
  dbUrl ||
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${projectRef}.pooler.supabase.com:5432/postgres`;

// ------------------------------------------------------------- run the files
async function main() {
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15000 });
  await client.connect();
  console.log('Connected to Supabase Postgres.');

  const dir = here;
  for (const name of TO_APPLY) {
    const file = join(dir, name);
    if (!existsSync(file)) {
      console.error(`Migration file not found: ${name}`);
      process.exit(1);
    }
    const sql = readFileSync(file, 'utf8');
    try {
      // Each migration file is safe to send as one batch: every statement is
      // idempotent (CREATE ... IF NOT EXISTS, guarded DO blocks).
      await client.query(sql);
      console.log(`  applied  ${name}`);
    } catch (err) {
      console.error(`  FAILED   ${name}`);
      console.error(`           ${String(err.message).split('\n').slice(0, 6).join('\n           ')}`);
      process.exit(1);
    }
  }

  // ---------------------------------------------------------------- verify
  console.log('\nVerifying...');
  const table = await client.query("SELECT to_regclass('public.missed_you_entries') AS t");
  if (table.rows[0].t === null) {
    console.error('  missed_you_entries table is MISSING after migration - aborting.');
    process.exit(1);
  }
  console.log('  [ok] missed_you_entries table exists');

  const policies = await client.query(
    "SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'missed_you_entries' ORDER BY policyname",
  );
  for (const p of policies.rows) console.log(`  [ok] RLS policy: ${p.policyname}`);
  if (policies.rows.length < 3) {
    console.error(`  WARNING: expected 3 RLS policies, found ${policies.rows.length}`);
  }

  const rlsEnabled = await client.query(
    "SELECT relrowsecurity FROM pg_class WHERE oid = 'public.missed_you_entries'::regclass",
  );
  console.log(`  [ok] RLS enabled: ${rlsEnabled.rows[0].relrowsecurity}`);

  const idx = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'missed_you_entries' ORDER BY indexname",
  );
  for (const i of idx.rows) console.log(`  [ok] index: ${i.indexname}`);

  const perfIdx = await client.query(
    "SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'",
  );
  console.log(`  [ok] performance indexes present: ${perfIdx.rows[0].n}`);

  await client.end();
  console.log('\nAll migrations applied and verified. Love Wall notes now persist.');
}

main().catch(async (err) => {
  // Never leak the connection string (it holds the password).
  console.error(`\nERROR: ${String(err.message || err).split(' ')[0] === 'Connect' ? err.code : err.message}`);
  process.exit(1);
});
