// Local FedWiki cookie broker — delegated, host-scoped write permission for agents.
//
// The problem it solves: a FedWiki `wikiSession` cookie is FARM-WIDE owner access,
// all-or-nothing, and pasting it into an agent's context leaks a live credential.
// The broker keeps the cookie on disk (local, gitignored) and exposes only a
// scoped push: an agent asks to write a host, the broker picks the owning cookie,
// enforces the caller's grant, checks expiry, injects the cookie, and logs it.
// The agent never sees the secret.
//
// Creds:  ~/.wiki/.creds/cookies.json   (gitignored, chmod 600)
//   { "owners": [ { "label": "owner@timeline", "hosts": ["*.timeline.ide.earth"], "cookie": "<wikiSession>" } ] }
//   expiry is DERIVED from the cookie itself (issuedMs + ttlMs), so you never hand-enter it.
//
// Grant:  env WIKI_GRANT = comma list of host globs this caller may write (default '*').
//   Scope an agent with e.g.  WIKI_GRANT='agm.timeline.ide.earth'  — it then physically
//   cannot push anything else, even though the cookie could.
//
// CLI:
//   node broker.js list                                   # owners, coverage, expiry — no secrets printed
//   node broker.js check  --host agm.timeline.ide.earth   # may I write it? which owner? expired?
//   node broker.js push   --host <h> --slug <s> --file <page.json>
//   node broker.js push-dir --host <h> --dir <dir>        # push every file in dir, filename == slug
//
// Also exports { resolve, pushPage } for use by sync.js.
//
// ---------------------------------------------------------------------------
// NOTE — relationship to MyTerms (IEEE P7012)
// ---------------------------------------------------------------------------
// This broker is a miniature of the MyTerms pattern: a principal delegates a
// scoped capability to an agent rather than handing over full authority.
//
//   - WIKI_GRANT (host-scoped permission)  = delegation inside an agreed scope:
//     the agent acts only within what it was granted, never the full authority
//     the cookie actually carries. Least-privilege by construction.
//   - the owner cookie held off-agent on disk = the principal's retained
//     authority; the agent gets a capability, not the credential.
//   - the push-audit.log                    = the record that the delegated
//     action happened within scope (who / where / when).
//
// What it does NOT yet do, and where MyTerms would slot in: there is no SIGNED
// AGREEMENT gating the delegation — today the grant is just an env var the
// operator sets. The IEEE 7012 version: the site owner publishes machine-readable
// terms, the agent presents an agreement to them, and the broker honours a push
// ONLY against a valid signed agreement, deriving the allowed scope FROM that
// agreement instead of from WIKI_GRANT. So WIKI_GRANT is the hand-rolled
// stand-in for a MyTerms-negotiated scope.
//
// If you extend this: keep the seam in resolve()/granted() so the "is this
// delegation permitted?" check can swap from env-var to signed-terms without
// touching the push path.
// ---------------------------------------------------------------------------

const fs = require('fs');
const os = require('os');
const path = require('path');

const CREDS = path.join(os.homedir(), '.wiki', '.creds', 'cookies.json');
const AUDIT = path.join(os.homedir(), '.wiki', '.creds', 'push-audit.log');
const SOURCE = process.env.WIKI_SOURCE || 'local-source';

function loadOwners(){
  if (!fs.existsSync(CREDS)) throw new Error('no creds at ' + CREDS + ' (copy cookies.example.json and fill it in)');
  return JSON.parse(fs.readFileSync(CREDS, 'utf8')).owners || [];
}
function globMatch(glob, host){
  const re = new RegExp('^' + glob.replace(/\./g, '\\.').replace(/\*/g, '[^.]*') + '$');
  return re.test(host);
}
function cookieExpiry(cookie){           // wikiSession = id.payload.issuedMs.ttlMs.sig
  const p = String(cookie).split('.');
  if (p.length < 3) return null;
  const issued = Number(p[p.length - 3]), ttl = Number(p[p.length - 2]);
  if (!Number.isFinite(issued) || !Number.isFinite(ttl)) return null;
  return issued + ttl;
}
function grants(){ return (process.env.WIKI_GRANT || '*').split(',').map(s => s.trim()).filter(Boolean); }
function granted(host){ return grants().some(g => g === '*' || globMatch(g, host)); }

// resolve a host -> { owner, expiry, expired, allowed } ; never returns the cookie to callers that log it
function resolve(host){
  const allowed = granted(host);
  const owner = loadOwners().find(o => (o.hosts || []).some(h => globMatch(h, host)));
  if (!owner) return { allowed, owner: null, reason: 'no owner cookie covers ' + host };
  const expiry = cookieExpiry(owner.cookie);
  const expired = expiry != null && Date.now() > expiry;
  return { allowed, owner, expiry, expired };
}
function audit(line){ try { fs.appendFileSync(AUDIT, line + '\n'); } catch (e) {} }

async function pushPage(host, slug, pageObj){
  const r = resolve(host);
  if (!r.allowed) throw new Error('GRANT DENIED: WIKI_GRANT does not cover ' + host);
  if (!r.owner)   throw new Error(r.reason);
  if (r.expired)  throw new Error('cookie for ' + r.owner.label + ' EXPIRED (' + new Date(r.expiry).toISOString() + ') — re-login');
  const action = { type: 'fork', fork: SOURCE, forkPage: pageObj, date: Date.now() };
  const body = 'action=' + encodeURIComponent(JSON.stringify(action));
  const res = await fetch('https://' + host + '/page/' + slug + '/action', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': 'wikiSession=' + r.owner.cookie + '; wikiTlsSession=' + r.owner.cookie },
    body,
  });
  const txt = (await res.text()).slice(0, 120);
  audit([new Date().toISOString(), res.ok ? 'OK' : ('ERR' + res.status), host, slug, r.owner.label].join('\t'));
  return { ok: res.ok, status: res.status, txt };
}

// upload a file into a host's assets/<folder>/ via the assets plugin (owner-auth, cookie stays here)
async function uploadAsset(host, folder, filePath){
  const r = resolve(host);
  if (!r.allowed) throw new Error('GRANT DENIED: WIKI_GRANT does not cover ' + host);
  if (!r.owner)   throw new Error(r.reason);
  if (r.expired)  throw new Error('cookie for ' + r.owner.label + ' EXPIRED — re-login');
  const data = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const boundary = '----wikiasset' + Date.now();
  const pre = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="assets"\r\n\r\n${folder}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`);
  const body = Buffer.concat([pre, data, Buffer.from(`\r\n--${boundary}--\r\n`)]);
  const res = await fetch('https://' + host + '/plugin/assets/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary,
               'Cookie': 'wikiSession=' + r.owner.cookie + '; wikiTlsSession=' + r.owner.cookie },
    body,
  });
  const txt = (await res.text()).slice(0, 120);
  audit([new Date().toISOString(), res.ok ? 'ASSET-OK' : ('ASSET-ERR' + res.status), host, folder + '/' + name, r.owner.label].join('\t'));
  return { ok: res.ok, status: res.status, txt };
}

// ---- CLI ----
if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = (k) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : undefined; };
  (async () => {
    if (cmd === 'list') {
      for (const o of loadOwners()) {
        const exp = cookieExpiry(o.cookie);
        console.log(`${o.label.padEnd(18)} hosts=${(o.hosts||[]).join(',')}   expires=${exp ? new Date(exp).toISOString() : '?'}${exp && Date.now()>exp ? '  [EXPIRED]' : ''}`);
      }
      console.log('\ngrant (WIKI_GRANT) = ' + grants().join(','));
    } else if (cmd === 'check') {
      const host = arg('host'); const r = resolve(host);
      console.log(JSON.stringify({ host, allowed: r.allowed, owner: r.owner ? r.owner.label : null, expired: r.expired || false, reason: r.reason }, null, 2));
    } else if (cmd === 'push') {
      const host = arg('host'), slug = arg('slug'), file = arg('file');
      const page = JSON.parse(fs.readFileSync(file, 'utf8'));
      const r = await pushPage(host, slug, page);
      console.log(`${r.ok ? 'ok' : r.status} ${host}/${slug}${r.ok ? '' : '  ' + r.txt}`);
      process.exit(r.ok ? 0 : 1);
    } else if (cmd === 'upload-asset') {
      const host = arg('host'), folder = arg('folder') || '', file = arg('file');
      const r = await uploadAsset(host, folder, file);
      console.log(`${r.ok ? 'ok' : r.status} ${host}/assets/${folder}/${path.basename(file)}${r.ok ? '' : '  ' + r.txt}`);
      process.exit(r.ok ? 0 : 1);
    } else if (cmd === 'push-dir') {
      const host = arg('host'), dir = arg('dir');
      let ok = 0, fail = 0;
      for (const f of fs.readdirSync(dir)) {
        const page = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        try { const r = await pushPage(host, f, page); console.log(`  ${r.ok ? 'ok ' : r.status} ${f}`); r.ok ? ok++ : fail++; }
        catch (e) { console.log(`  ERR ${f}  ${e.message}`); fail++; }
      }
      console.log(`Done. ok=${ok} fail=${fail}`);
      process.exit(fail ? 1 : 0);
    } else {
      console.log('usage: node broker.js <list|check|push|push-dir> [--host h] [--slug s] [--file f] [--dir d]');
    }
  })().catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
}

module.exports = { resolve, pushPage, uploadAsset, cookieExpiry, granted };
