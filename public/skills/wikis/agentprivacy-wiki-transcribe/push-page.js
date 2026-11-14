// Push ONE FedWiki page JSON to a wiki via the fork action API.
//   node push-page.js <pageFile.json> <slug>
// env:
//   WIKI_BASE     target wiki origin (e.g. https://<sub>.timeline.ide.earth)
//   WIKI_SESSION  raw session value (sent as wikiSession + wikiTlsSession), OR
//   WIKI_COOKIE   full Cookie header
//   WIKI_SOURCE   fork provenance label (default localhost:3030)
//   DRY=1         print what would be pushed, do not send
const fs = require('fs');
const [pageFile, slug] = process.argv.slice(2);
if (!pageFile || !slug) { console.error('usage: node push-page.js <pageFile.json> <slug>'); process.exit(2); }
const BASE = process.env.WIKI_BASE;
const SOURCE = process.env.WIKI_SOURCE || 'localhost:3030';
const COOKIE = process.env.WIKI_SESSION
  ? ('wikiSession=' + process.env.WIKI_SESSION + '; wikiTlsSession=' + process.env.WIKI_SESSION)
  : (process.env.WIKI_COOKIE || '');
const DRY = !!process.env.DRY;
if (!BASE) { console.error('ERROR: set WIKI_BASE'); process.exit(2); }
const page = JSON.parse(fs.readFileSync(pageFile, 'utf8'));

(async () => {
  console.log('Target: ' + BASE + '/page/' + slug + '   "' + page.title + '"' + (DRY ? '   [DRY RUN]' : ''));
  if (DRY) { console.log('story items: ' + page.story.length + '  (' + page.story.map(s => s.type).join(',') + ')'); return; }
  if (!COOKIE) { console.error('ERROR: set WIKI_SESSION or WIKI_COOKIE'); process.exit(1); }
  const action = { type: 'fork', fork: SOURCE, forkPage: page, date: Date.now() };
  const body = 'action=' + encodeURIComponent(JSON.stringify(action));
  const res = await fetch(BASE + '/page/' + slug + '/action', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': COOKIE },
    body,
  });
  const txt = await res.text();
  console.log(res.ok ? ('ok   ' + slug) : (res.status + '  ' + slug + '   ' + txt.slice(0, 200)));
  process.exit(res.ok ? 0 : 1);
})();
