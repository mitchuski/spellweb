// Coherence-checked sync: per-session answer pages from a source-of-truth FedWiki
// OUT to each milestone subdomain, where the "real wiki lives per session".
//
// Source (farm host, source of truth):  ~/.wiki/<SRC_HOST>/pages/<card>-<session>
// Target:  https://<sub>.<DOMAIN>/page/<canonical-slug>/action  (fork action)
//
// Per session it: reads the 5 compact source answer pages, rewrites each into the
// canonical SUBDOMAIN shape [intro -> two slots verbatim -> # See nav], runs a
// COHERENCE CHECK on every page (right session, both slots, no leftover hub list,
// correct See block), and refuses to push anything that FAILS.
//
// Pushing:
//   - DRY (default): stage to ~/.wiki/_sync_staging/<sub>/ and print the report
//   - WIKI_SESSION=... PUSH=1 : push directly (cookie on the command line — ad-hoc only)
//   - BROKER=1 PUSH=1         : push through broker.js (cookie stays on disk, host-scoped) ** preferred
//
// Usage:
//   node sync.js                                  # default session, DRY + check + stage
//   SESSION='Game Jam' node sync.js               # one session, DRY
//   SESSION=all node sync.js                      # every mapped session, DRY
//   BROKER=1 PUSH=1 SESSION=all node sync.js      # delegated push of all (needs creds + WIKI_GRANT)
//
// EDIT THE CONFIG BLOCK (MAP / CARDS / pagesDir) to retarget this to another project.

const fs = require('fs');
const os = require('os');
const path = require('path');

// ============================ CONFIG (edit per project) ============================
const SRC_HOST = process.env.SRC_HOST || 'source.localhost';     // local source-of-truth farm host
const pagesDir = path.join(os.homedir(), '.wiki', SRC_HOST, 'pages') + path.sep;
const SOURCE   = process.env.WIKI_SOURCE || 'local-source';  // fork provenance recorded on target

const MAP = {   // session display name -> { subdomain, on-site video page title the See block points at }
  'AGM 2027':                    { sub: 'agm',           video: 'AGM 2027' },
  'Declaration & Brand Launch':  { sub: 'launch',        video: 'Declaration Launch' },
  'Deep Thought Questions':      { sub: 'deep',          video: 'Deep Thought Realized' },
  "Don't Panic Festival":        { sub: 'panic',         video: "Don't Panic Festival" },
  "Don't Panic Tour":            { sub: 'tour',          video: "Don't Panic Tour" },
  'Game Jam':                    { sub: 'gamejam',       video: 'Game Jam' },
  'Groundhog Day':               { sub: 'groundhog',     video: 'Groundhog Day' },
  'Sovereign Compute':           { sub: 'sovereign',     video: 'Sovereign Compute' },
  'Time Bank & Trust Graph':     { sub: 'building',      video: 'Infrastructure Build' },
  'Unsingularity Voices':        { sub: 'unsingularity', video: 'The Unsingularity' },
  'Web Summit':                  { sub: 'web',           video: 'Web Summit' },
  'Myspace Rewilded':            { sub: 'myspace',       video: 'Myspace Rewilded' },
};
// (Timeline Massacre is intentionally not a session here. Myspace Rewilded's source
//  pages were seeded into the local farm from its live answers.)
const DOMAIN = process.env.DOMAIN || 'timeline.ide.earth';

// "## In brief" — a quote-free clarifying summary placed at the TOP of each answer
// (under the intro line). Keyed "<card.src>-<session-slug>" in ~/.wiki/_summaries.json.
// Optional + back-compatible: if the file or a given key is absent, the page builds
// without an In brief.
const SUMMARIES_FILE = process.env.SUMMARIES_FILE || path.join(os.homedir(), '.wiki', '_summaries.json');
const SUMMARIES = fs.existsSync(SUMMARIES_FILE) ? JSON.parse(fs.readFileSync(SUMMARIES_FILE, 'utf8')) : {};

// ASCII-normalise before pushing: the action endpoint mojibakes UTF-8 multibyte chars,
// so fold the few non-ASCII chars (em/en dash, curly quotes, accents) down to ASCII.
function asciify(s){
  if (s == null) return s;
  const t = String(s)
    .replace(/[—–]/g, '-').replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"').replace(/…/g, '...')
    .replace(/[·•]/g, '-').replace(/ /g, ' ');
  return t.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\x00-\x7F]/g, '');
}

const CARDS = [   // source-prefix -> target slug/title, intro grammar, required slot markers
  { src: 'who-cares',           slug: 'who-cares',       title: 'Who Cares?',        label: 'Who cares',        verb: 'about', slots: ['**Constituencies.**', '**Nuance or tension.**'] },
  { src: 'who-is-involved',     slug: 'who-is-involved', title: 'Who is Involved?',  label: 'Who is involved',  verb: 'in',    slots: ['**Active cast.**', '**Being invited or network activated.**'] },
  { src: 'what-changes',        slug: 'what-changes',    title: 'What Changes?',     label: 'What changes',     verb: 'with',  slots: ['**Stated changes.**', '**Hedged or possible.**'] },
  { src: 'proof--realness',     slug: 'proof--realness', title: 'Proof & Realness?', label: 'Proof & Realness', verb: 'for',   slots: ['Legend:', '**Headline metric.**'] },
  { src: 'how-it-becomes-real', slug: 'becoming-real',   title: 'Becoming Real?',    label: 'Becoming real',    verb: 'for',   slots: ['**Asked directly.**', '**Texture from elsewhere.**'] },
];
// ===================================================================================

const HUB_TITLES = CARDS.map(c => c.title);
const ALL_VIDEOS = Object.values(MAP).map(m => m.video);
const stagingDir = path.join(os.homedir(), '.wiki', '_sync_staging') + path.sep;
const PUSH = !!process.env.PUSH && !process.env.DRY;
const USE_BROKER = !!process.env.BROKER;
const COOKIE = process.env.WIKI_SESSION
  ? ('wikiSession=' + process.env.WIKI_SESSION + '; wikiTlsSession=' + process.env.WIKI_SESSION)
  : (process.env.WIKI_COOKIE || '');
const now = Date.now();
const broker = USE_BROKER ? require('./broker.js') : null;

function asSlug(t){ return t.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase(); }
let _c = 0;
function genId(){ const a = (now + _c * 7919).toString(16).padStart(12, '0'); const b = ((++_c * 2654435761) >>> 0).toString(16).padStart(8, '0'); return (a + b).slice(0, 16); }
function seeBlock(video){
  return ['# See', '', '- [[Who Cares?]] and [[Who is Involved?]]', '- [[What Changes?]] and [[Proof & Realness?]]', '- [[Becoming Real?]]', `- Full video [[${video}]] and [[${video} Transcript]]`].join('\n');
}
function stripHeader(text){ return text.replace(/^#[^\n]*\n+/, '').trim(); }

function buildPage(card, session, video){
  const srcFile = pagesDir + card.src + '-' + asSlug(session);
  if (!fs.existsSync(srcFile)) return { error: 'MISSING source ' + card.src + '-' + asSlug(session) };
  const src = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
  const body = asciify(stripHeader((src.story[0] && src.story[0].text) || ''));
  const brief = asciify(SUMMARIES[card.src + '-' + asSlug(session)] || '');
  const intro = { type: 'markdown', id: genId(), text: `[[${card.label}]] ${card.verb} [[${video}]]? Below we summarise the discussion:` };
  const slot  = { type: 'markdown', id: genId(), text: body };
  const see   = { type: 'markdown', id: genId(), text: seeBlock(video) };
  // shape: intro -> ## In brief (if any) -> answer slot -> # See
  const story = brief ? [intro, { type: 'markdown', id: genId(), text: brief }, slot, see] : [intro, slot, see];
  const page = { title: card.title, story, journal: [{ type: 'create', item: { title: card.title, story: [] }, date: now }, ...story.map(it => ({ type: 'add', id: it.id, item: it, date: now }))] };
  return { page, body, brief, intro: intro.text, see: see.text };
}

function check(card, video, built){
  const out = [];
  if (built.error) { out.push({ level: 'FAIL', msg: built.error }); return out; }
  const { page, body, intro, see } = built;
  if (page.title !== card.title) out.push({ level: 'FAIL', msg: `title "${page.title}" != "${card.title}"` });
  if (!intro.includes(`[[${video}]]`)) out.push({ level: 'FAIL', msg: `intro does not link [[${video}]]` });
  for (const other of ALL_VIDEOS) if (other !== video && (intro.includes(`[[${other}]]`) || see.includes(`[[${other}]]`))) out.push({ level: 'FAIL', msg: `references foreign session [[${other}]]` });
  for (const s of card.slots) if (!body.includes(s)) out.push({ level: 'FAIL', msg: `missing slot marker ${s}` });
  if (body.includes('## Answers across the timeline') || see.includes('## Answers across the timeline')) out.push({ level: 'FAIL', msg: 'leftover hub list "## Answers across the timeline"' });
  for (const h of HUB_TITLES) if (!see.includes(`[[${h}]]`)) out.push({ level: 'WARN', msg: `See block missing [[${h}]]` });
  if (!see.includes(`[[${video} Transcript]]`)) out.push({ level: 'WARN', msg: 'See block missing transcript link' });
  if (body.length < 80) out.push({ level: 'WARN', msg: `body short (${body.length} chars)` });
  if (Object.keys(SUMMARIES).length && !built.brief) out.push({ level: 'WARN', msg: 'no ## In brief summary for this card' });
  else if (built.brief && !/^##\s*In brief/.test(built.brief)) out.push({ level: 'WARN', msg: 'In brief missing "## In brief" heading' });
  return out;
}

async function pushOne(sub, slug, page){
  const host = sub + '.' + DOMAIN;
  if (USE_BROKER) return broker.pushPage(host, slug, page);
  const action = { type: 'fork', fork: SOURCE, forkPage: page, date: now };
  const res = await fetch('https://' + host + '/page/' + slug + '/action', { method: 'PUT', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': COOKIE }, body: 'action=' + encodeURIComponent(JSON.stringify(action)) });
  return { ok: res.ok, status: res.status, txt: (await res.text()).slice(0, 100) };
}

(async () => {
  const want = process.env.SESSION || Object.keys(MAP)[0];
  const sessions = want === 'all' ? Object.keys(MAP) : [want];
  if (want !== 'all' && !MAP[want]) { console.error('Unknown SESSION "' + want + '". Mapped: ' + Object.keys(MAP).join(', ')); process.exit(1); }
  console.log(`\nMode: ${PUSH ? (USE_BROKER ? 'PUSH via broker' : 'PUSH direct') : 'DRY (stage + check)'}   source=${SOURCE}\n`);
  if (PUSH && !USE_BROKER && !COOKIE) { console.error('PUSH set, no broker, no WIKI_SESSION. Aborting.'); process.exit(1); }

  let totalFail = 0, totalOk = 0;
  for (const session of sessions) {
    const { sub, video } = MAP[session];
    console.log(`=== ${session}  ->  ${sub}.${DOMAIN}   (video: ${video}) ===`);
    const dir = stagingDir + sub + path.sep;
    if (!PUSH) fs.mkdirSync(dir, { recursive: true });
    for (const card of CARDS) {
      const built = buildPage(card, session, video);
      const issues = check(card, video, built);
      const fails = issues.filter(i => i.level === 'FAIL');
      console.log(`  [${fails.length ? 'FAIL' : (issues.length ? 'warn' : ' ok ')}] ${card.slug}`);
      for (const i of issues) console.log(`         ${i.level}: ${i.msg}`);
      if (fails.length) { totalFail++; continue; }
      if (!PUSH) { fs.writeFileSync(dir + card.slug, JSON.stringify(built.page, null, 2), 'utf8'); }
      else { try { const r = await pushOne(sub, card.slug, built.page); console.log(`         push -> ${r.ok ? 'ok' : r.status + ' ' + r.txt}`); r.ok ? totalOk++ : totalFail++; } catch (e) { console.log('         push -> ERR ' + e.message); totalFail++; } }
    }
    console.log('');
  }
  if (!PUSH) console.log(`Staged under ${stagingDir}.`);
  console.log(`Done. ${PUSH ? 'pushed=' + totalOk + '  ' : ''}failures=${totalFail}`);
  process.exit(totalFail ? 1 : 0);
})();
