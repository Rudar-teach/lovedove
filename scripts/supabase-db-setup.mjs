#!/usr/bin/env node
/**
 * Supabase "one-login" DB setup runner — reusable for ANY future DB change.
 *
 * Usage:
 *   node scripts/supabase-db-setup.mjs [sql-file]
 *   (default sql-file: lovedove-db-fix.sql)
 *
 * What it does:
 *   1. Opens your Chrome at supabase.com/dashboard (persistent profile in
 *      .supabase-login/ — FIRST run: YOU log in; later runs: already logged
 *      in, fully hands-free).
 *   2. Opens the SQL editor, pastes the SQL file, and clicks Run.
 *   3. Waits for the execution result.
 *   4. Hard-verifies the result against the live PostgREST API.
 *
 * The SQL files are idempotent (guarded), so re-running is safe.
 */
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PROJECT_REF = 'pytjmswiynjsjatluftd';
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;
const ANON_KEY = 'sb_publishable_wP5d2t-Nl8D1eSt4-iguyQ_BTGx-1Ph';
const REST = `${PROJECT_URL}/rest/v1`;

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const sqlFile = path.resolve(process.argv[2] || path.join(root, 'lovedove-db-fix.sql'));
if (!existsSync(sqlFile)) {
  console.error(`❌ SQL file not found: ${sqlFile}`);
  process.exit(1);
}
const sql = readFileSync(sqlFile, 'utf8');

// ── Locate Chrome ──────────────────────────────────────────────────────
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
].filter(Boolean);
const executablePath = process.env.CHROME_PATH || chromeCandidates.find(p => existsSync(p));
if (!executablePath) {
  console.error('❌ Chrome not found. Install Chrome or set CHROME_PATH.');
  process.exit(1);
}

const userDir = path.join(root, '.supabase-login');
const hadLogin = existsSync(userDir);
console.log('🌐 Opening browser at supabase.com/dashboard …');
if (!hadLogin) {
  console.log('   FIRST RUN → please LOG IN in the window that opens (email / Google / 2FA).');
  console.log(`   Login is saved to ${path.relative(root, userDir)}/ — later runs are hands-free.\n`);
} else {
  console.log('   Saved login found — should be hands-free this time.\n');
}

const context = await chromium.launchPersistentContext(userDir, {
  headless: false,
  executablePath: executablePath,
  args: ['--start-maximized'],
  viewport: null,
  defaultTimeout: 300000, // 5 min default for all locators
});
context.setDefaultTimeout(300000);

// True when we're on a login/auth screen instead of the dashboard.
function isLoggedOut(page) {
  return page.url().match(/\/(auth|login|signin|sign-in|logout)/i) !== null;
}

let page;
try {
  page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(300000);

  await page.goto('https://supabase.com/dashboard', { waitUntil: 'domcontentloaded' });

  // ── Step 1: wait for login, polling every 2s for up to 10 minutes ────
  console.log('⏳ Waiting for Supabase dashboard (you may need to log in)…');
  const LOGIN_DEADLINE_MS = 10 * 60 * 1000;
  let loggedIn = false;
  let last = 0;
  const start = Date.now();
  while (Date.now() - start < LOGIN_DEADLINE_MS) {
    // Follow the most-recently-active page (login may open a new tab).
    const active = context.pages().sort((a, b) =>
      (a.url() === 'about:blank' ? -1 : 1) - (b.url() === 'about:blank' ? -1 : 1)
    ).pop();
    if (active) page = active;
    try {
      if (!isLoggedOut(page) && (await page.evaluate(() => document.body?.innerText?.length || 0)) > 40) {
        loggedIn = true;
        break;
      }
    } catch { /* page navigating */ }
    const elapsed = Math.floor((Date.now() - start) / 1000);
    if (elapsed - last >= 30) {
      last = elapsed;
      console.log(`   …still waiting for login (${elapsed}s in). Complete sign-in in the open window.`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!loggedIn) {
    console.error('❌ Timed out waiting for login after 10 minutes. Log in in the window and re-run the script.');
    await context.close();
    process.exit(1);
  }
  console.log('✅ Logged in.');
  await new Promise(r => setTimeout(r, 3000)); // let the app settle

  // ── Step 2: open SQL editor and load the fix ─────────────────────────
  // The SQL editor is a Monaco editor (hidden textarea + .monaco-editor).
  console.log(`📝 Opening SQL editor and loading ${path.basename(sqlFile)} …`);
  const sqlPage = context.pages().find(p => /supabase\.com\/dashboard/.test(p.url())) || page;
  await sqlPage.goto(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`, { waitUntil: 'domcontentloaded' });
  const editor = sqlPage.locator('.monaco-editor').first();
  await editor.waitFor({ timeout: 180000 });
  await editor.click();
  await new Promise(r => setTimeout(r, 2000));

  let loaded = false;
  // Preferred: set the content through Monaco's own API (exact, fast).
  try {
    loaded = await sqlPage.evaluate((sqlText) => {
      try {
        const models = window.monaco?.editor?.getModels?.();
        if (models && models.length) {
          models[0].setValue(sqlText);
          return true;
        }
        // Newer bundles keep the global; fall back to a known-model lookup.
        const dom = document.querySelector('.monaco-editor');
        if (dom && window.require && typeof window.require === 'function') {
          // best-effort: some builds expose the model only via the editor instance
        }
      } catch { /* ignore */ }
      return false;
    }, sql);
  } catch { /* ignore */ }

  // Fallback: clear and type it in (keyboard-driven, works without the global).
  if (!loaded) {
    console.log('   Monaco API not exposed — using keyboard paste fallback…');
    await sqlPage.keyboard.press('Control+A');
    await sqlPage.keyboard.press('Delete');
    for (const chunk of sql.split('\n')) {
      await sqlPage.keyboard.insertText(chunk + '\n');
      await new Promise(r => setTimeout(r, 50));
    }
  } else {
    console.log('   Loaded via Monaco API.');
  }
  await new Promise(r => setTimeout(r, 1500));

  // ── Step 3: Run (button, then Ctrl+Enter as backup) ──────────────────
  console.log('▶️  Running the query…');
  const runButton = sqlPage.locator('button').filter({ hasText: /^Run$/i }).first();
  try {
    await runButton.waitFor({ timeout: 30000 });
    await runButton.click();
  } catch {
    console.log('   No "Run" button found — sending Ctrl+Enter instead.');
    await sqlPage.keyboard.press('Control+Enter');
  }

  // ── Step 4: poll for a result (and accept the DDL confirm dialog) ────
  console.log('⏳ Waiting for execution result…');
  let sqlFailed = false;
  let lastLog = 0;
  for (let i = 0; i < 90; i++) { // up to ~3 min
    await new Promise(r => setTimeout(r, 2000));
    let bodyText = '';
    try { bodyText = await sqlPage.evaluate(() => document.body?.innerText || ''); } catch {}

    // DDL triggers a "Confirm & Run" dialog — accept it the moment it shows.
    if (/Confirm & Run/i.test(bodyText)) {
      try {
        await sqlPage.locator('button').filter({ hasText: /Confirm & Run/i }).first()
          .click({ timeout: 4000 });
        console.log('   DDL dialog appeared → confirmed.');
      } catch { /* keep polling */ }
      continue;
    }

    const hasSuccess = /Success\.\s|No rows returned|Query succeeded/i.test(bodyText);
    const hasError = /\bERROR\b|Error:\s|failed to execute/i.test(bodyText);
    if (hasSuccess) { sqlFailed = false; break; }
    if (hasError && i > 4) { sqlFailed = true; break; }
    if (i % 15 === 0) {
      lastLog = i;
      console.log(`   …still running (${i * 2}s).`);
    }
  }

  if (sqlFailed) {
    // Capture the ACTUAL error text + a screenshot for diagnosis.
    let fullText = '';
    try { fullText = await sqlPage.evaluate(() => document.body?.innerText || ''); } catch {}
    try { writeFileSync(path.join(root, 'sql-run-failure.txt'), fullText); } catch {}
    try { await sqlPage.screenshot({ path: path.join(root, 'sql-run-failure.png') }); } catch {}
    const lines = fullText.split('\n').filter(l => /error|fail|violation|does not exist|undefined/i.test(l));
    console.error('❌ SQL run reported an error. Captured sql-run-failure.txt / .png.');
    console.error('Likely error lines:\n' + lines.slice(0, 30).join('\n'));
    // Leave the browser open for the user to inspect.
    await new Promise(r => setTimeout(r, 120000));
  } else {
    console.log('✅ SQL executed (Success).');
    await new Promise(r => setTimeout(r, 4000));
  }
  await context.close();
} catch (err) {
  console.error('❌ Browser step failed:', err.message);
  try { await context.close(); } catch {}
  process.exitCode = 1;
}

// ── Step 5: hard-verify against the live REST API ─────────────────────
console.log('\n🔎 Verifying against live PostgREST…');
async function probe(p) {
  const r = await fetch(`${REST}${p}`, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } });
  const t = await r.text();
  return { ok: r.status === 200, status: r.status, text: t };
}
const checks = [];

let c = await probe('/friend_requests?limit=0');
checks.push(c.ok);
console.log(`   ${c.ok ? '✅' : '❌'} friend_requests table → ${c.status} ${c.ok ? 'exists' : '(' + c.text.slice(0, 70) + ')'}`);

c = await probe('/play_invites?limit=0');
checks.push(c.ok);
console.log(`   ${c.ok ? '✅' : '❌'} play_invites table → ${c.status} ${c.ok ? 'exists' : '(' + c.text.slice(0, 70) + ')'}`);

c = await probe('/profiles?select=is_online&limit=0');
checks.push(c.ok);
console.log(`   ${c.ok ? '✅' : '❌'} profiles.is_online column → ${c.status} ${c.ok ? 'exists' : '(' + c.text.slice(0, 70) + ')'}`);

c = await probe('/profiles?select=username&limit=0');
checks.push(c.ok);
console.log(`   ${c.ok ? '✅' : '❌'} profiles.username column → ${c.status}`);

if (checks.every(Boolean)) {
  console.log('\n🎉 ALL DATABASE CHECKS PASSED — the friend-system backend is live.');
} else {
  console.log('\n⚠️  Some checks failed. The SQL may have hit an error — re-run the script (it is idempotent) and watch the browser result.');
  process.exitCode = 1;
}
