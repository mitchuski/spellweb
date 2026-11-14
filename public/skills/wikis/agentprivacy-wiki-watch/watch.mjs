#!/usr/bin/env node
// fedwiki-watch — observe external FedWiki sites for changes.
//
// Polls each site's /system/sitemap.json (public, no auth), diffs the per-page
// `date` (epoch-ms last-modified) against the last stored snapshot, and reports
// new / updated / removed pages. READ-ONLY: never writes to any wiki.
//
//   node watch.mjs                 # poll all sites, update snapshots, write digest
//   node watch.mjs --json          # same, but print a machine summary to stdout
//   node watch.mjs --dry           # detect + report, do NOT advance snapshots
//   node watch.mjs --site david.vision   # one site by name
//   node watch.mjs --external      # only owner:external sites
//   node watch.mjs --detail        # fetch the latest journal entry for each changed page
//
// Flags: --timeout <ms> (default 20000), --quiet (suppress human summary).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE = join(HERE, 'state');
const REPORTS = join(HERE, 'reports');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const asJson = has('--json');
const quiet = has('--quiet');
const dry = has('--dry');
const detail = has('--detail');
const onlySite = val('--site', null);
const onlyExternal = has('--external');
const timeoutMs = Number(val('--timeout', '20000'));

const nowIso = () => new Date().toISOString();
const ts = (ms) => (ms ? new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + 'Z' : '?');
const safe = (name) => name.replace(/[^a-z0-9._-]/gi, '_');

async function jget(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, error: e.name === 'AbortError' ? 'timeout' : (e.message || String(e)) };
  } finally {
    clearTimeout(t);
  }
}

async function fetchSitemap(base) {
  const url = base.replace(/\/$/, '') + '/system/sitemap.json';
  let r = await jget(url);
  if (!r.ok) r = await jget(url); // one retry
  if (r.ok && !Array.isArray(r.data)) return { ok: false, error: 'non-array sitemap' };
  return r;
}

// sitemap array -> { slug: {title,date,synopsis} }
function toMap(sitemap) {
  const m = {};
  for (const p of sitemap) {
    if (p && p.slug) m[p.slug] = { title: p.title || p.slug, date: p.date || 0, synopsis: (p.synopsis || '').slice(0, 240) };
  }
  return m;
}

// latest journal action for a changed page (best-effort, --detail only)
async function lastEdit(base, slug) {
  const r = await jget(base.replace(/\/$/, '') + '/' + slug + '.json');
  if (!r.ok || !r.data || !Array.isArray(r.data.journal)) return null;
  const j = r.data.journal[r.data.journal.length - 1] || {};
  return { type: j.type || '?', date: j.date || 0, item: j.item?.title || j.item?.text?.slice(0, 60) };
}

async function main() {
  await mkdir(STATE, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  const roster = JSON.parse(await readFile(join(HERE, 'roster.json'), 'utf8'));
  let sites = roster.sites;
  if (onlySite) sites = sites.filter((s) => s.name === onlySite);
  if (onlyExternal) sites = sites.filter((s) => s.owner === 'external');
  if (!sites.length) { console.error('No sites matched.'); process.exit(2); }

  const run = { at: nowIso(), sites: [] };

  for (const s of sites) {
    const snapPath = join(STATE, safe(s.name) + '.json');
    const prev = existsSync(snapPath) ? JSON.parse(await readFile(snapPath, 'utf8')) : null;

    const sm = await fetchSitemap(s.url);
    const entry = { ...s, status: sm.ok ? 'ok' : 'unreachable', error: sm.error || null, seeded: false, new: [], updated: [], removed: [], pages: 0 };

    if (!sm.ok) { run.sites.push(entry); continue; }

    const cur = toMap(sm.data);
    entry.pages = Object.keys(cur).length;

    if (!prev) {
      entry.seeded = true; // first sight of this site — baseline, don't flag every page
    } else {
      const prevPages = prev.pages || {};
      for (const [slug, p] of Object.entries(cur)) {
        if (!(slug in prevPages)) entry.new.push({ slug, title: p.title, date: p.date, synopsis: p.synopsis });
        else if ((p.date || 0) > (prevPages[slug].date || 0))
          entry.updated.push({ slug, title: p.title, date: p.date, was: prevPages[slug].date, synopsis: p.synopsis });
      }
      for (const slug of Object.keys(prevPages)) if (!(slug in cur)) entry.removed.push({ slug, title: prevPages[slug].title });
    }

    if (detail && (entry.new.length || entry.updated.length)) {
      for (const c of [...entry.new, ...entry.updated]) c.edit = await lastEdit(s.url, c.slug);
    }

    if (!dry) await writeFile(snapPath, JSON.stringify({ site: s.name, url: s.url, at: run.at, pages: cur }, null, 0));
    run.sites.push(entry);
  }

  // ---- aggregate ----
  const changed = run.sites.filter((s) => s.new.length || s.updated.length || s.removed.length);
  const seeded = run.sites.filter((s) => s.seeded);
  const down = run.sites.filter((s) => s.status !== 'ok');
  run.totals = {
    sites: run.sites.length,
    changedSites: changed.length,
    new: run.sites.reduce((a, s) => a + s.new.length, 0),
    updated: run.sites.reduce((a, s) => a + s.updated.length, 0),
    removed: run.sites.reduce((a, s) => a + s.removed.length, 0),
    unreachable: down.length,
    seeded: seeded.length,
  };

  if (!dry) await writeFile(join(STATE, 'last-run.json'), JSON.stringify(run, null, 2));

  // ---- markdown digest ----
  const md = renderMarkdown(run, changed, seeded, down);
  if (!dry) {
    await writeFile(join(REPORTS, 'latest.md'), md);
    await writeFile(join(REPORTS, safe(run.at).slice(0, 19) + '.md'), md);
  }

  if (asJson) {
    process.stdout.write(JSON.stringify(run, null, 2) + '\n');
  } else if (!quiet) {
    const t = run.totals;
    console.log(`fedwiki-watch @ ${run.at}`);
    console.log(`  ${t.sites} sites · ${t.new} new · ${t.updated} updated · ${t.removed} removed · ${t.unreachable} unreachable${t.seeded ? ` · ${t.seeded} seeded (baseline)` : ''}`);
    for (const s of changed) {
      const badge = s.owner === 'external' ? '★' : ' ';
      console.log(`  ${badge} ${s.name}: +${s.new.length} ~${s.updated.length} -${s.removed.length}`);
      for (const c of s.new) console.log(`       NEW  ${c.title}  (${ts(c.date)})`);
      for (const c of s.updated) console.log(`       UPD  ${c.title}  (${ts(c.was)} -> ${ts(c.date)})`);
      for (const c of s.removed) console.log(`       RM   ${c.title}`);
    }
    for (const s of down) console.log(`  ! ${s.name} unreachable: ${s.error}`);
    if (seeded.length && !changed.length) console.log(`  (baseline recorded for ${seeded.length} site(s); re-run later to see changes)`);
    console.log(`  digest: ${join(REPORTS, 'latest.md')}`);
  }
}

function renderMarkdown(run, changed, seeded, down) {
  const t = run.totals;
  const L = [];
  L.push(`# FedWiki watch — ${run.at}`);
  L.push('');
  L.push(`**${t.new} new · ${t.updated} updated · ${t.removed} removed** across ${t.changedSites}/${t.sites} sites` +
    `${t.unreachable ? ` · ${t.unreachable} unreachable` : ''}${t.seeded ? ` · ${t.seeded} seeded` : ''}.`);
  L.push('');
  const externalFirst = [...changed].sort((a, b) => (a.owner === 'external' ? -1 : 1) - (b.owner === 'external' ? -1 : 1));
  for (const s of externalFirst) {
    L.push(`## ${s.owner === 'external' ? '★ ' : ''}${s.name}  \`${s.url}\``);
    for (const c of s.new) {
      L.push(`- **NEW** [[${c.title}]] · \`${c.slug}\` · ${ts(c.date)}`);
      if (c.synopsis) L.push(`  > ${c.synopsis}`);
      if (c.edit) L.push(`  · last action: _${c.edit.type}_ ${c.edit.item ? '“' + c.edit.item + '”' : ''}`);
    }
    for (const c of s.updated) {
      L.push(`- **UPDATED** [[${c.title}]] · \`${c.slug}\` · ${ts(c.was)} → ${ts(c.date)}`);
      if (c.synopsis) L.push(`  > ${c.synopsis}`);
      if (c.edit) L.push(`  · last action: _${c.edit.type}_ ${c.edit.item ? '“' + c.edit.item + '”' : ''}`);
    }
    for (const c of s.removed) L.push(`- **REMOVED** ${c.title} · \`${c.slug}\``);
    L.push('');
  }
  if (down.length) {
    L.push('## Unreachable');
    for (const s of down) L.push(`- ${s.name} \`${s.url}\` — ${s.error}`);
    L.push('');
  }
  if (seeded.length) {
    L.push('## Seeded (baseline this run — no diff yet)');
    L.push(seeded.map((s) => `${s.name} (${s.pages})`).join(', '));
    L.push('');
  }
  return L.join('\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
