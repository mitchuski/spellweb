// Faithful backup: PULL each live milestone subdomain DOWN into a local farm twin.
// Inverse of sync.js. Now that the *.timeline.ide.earth subdomains are the source of
// truth (edited live), this mirrors them verbatim into ~/.wiki/<sub>.timeline.localhost/
// so the local "vision" side is an exact, browsable backup. Read-only on the remote
// (public GET) — no cookie/broker needed.
//
//   node pull.js                       # back up every subdomain + the base roster
//   SUBS=web,myspace node pull.js      # only these
//   NOBASE=1 node pull.js              # skip the base timeline.ide.earth roster
const fs = require('fs');
const os = require('os');
const path = require('path');

const DOMAIN = process.env.DOMAIN || 'timeline.ide.earth';
const SUBS = (process.env.SUBS || 'agm,launch,deep,panic,tour,gamejam,groundhog,sovereign,building,unsingularity,web,myspace').split(',').map(s => s.trim()).filter(Boolean);
const INCLUDE_BASE = !process.env.NOBASE;
const root = path.join(os.homedir(), '.wiki');

async function pullSite(host, destHost){
  const dir = path.join(root, destHost, 'pages') + path.sep;
  fs.mkdirSync(dir, { recursive: true });
  let slugs = [];
  try { const r = await fetch('https://' + host + '/system/sitemap.json'); if (r.ok) slugs = (await r.json()).map(p => p.slug); } catch {}
  let n = 0, fail = 0;
  for (const s of slugs) {
    try {
      const r = await fetch('https://' + host + '/' + s + '.json');
      if (!r.ok) { fail++; continue; }
      fs.writeFileSync(dir + s, await r.text(), 'utf8'); // verbatim JSON = faithful
      n++;
    } catch { fail++; }
  }
  return { n, fail, total: slugs.length };
}

(async () => {
  console.log('Faithful backup  *.' + DOMAIN + '  ->  ~/.wiki/<sub>.timeline.localhost/pages/\n');
  let grand = 0;
  for (const sub of SUBS) {
    const r = await pullSite(sub + '.' + DOMAIN, sub + '.timeline.localhost');
    grand += r.n;
    console.log('  ' + sub.padEnd(14) + r.n + '/' + r.total + ' pages' + (r.fail ? '  (' + r.fail + ' fail)' : ''));
  }
  if (INCLUDE_BASE) { const r = await pullSite(DOMAIN, 'timeline.localhost'); grand += r.n; console.log('  ' + '(base)'.padEnd(14) + r.n + '/' + r.total + ' pages'); }
  console.log('\nDone. ' + grand + ' pages mirrored locally.');
})();
