// Build the 5 FedWiki question-answer pages for one (or many) sessions, in the
// same format as the structured timeline wikis.
//   node build-answer-pages.js <answersFile> <outDir>
// answersFile: a single {session, who-cares, who-will-be-involved, what-changes,
//   what-is-the-proof, how-it-becomes-real} object, OR an array of them.
// Writes one file per answer, named by slug ("<prefix>: <session>" slugified).
const fs = require('fs');
const [ansFile, outDir] = process.argv.slice(2);
if (!ansFile || !outDir) { console.error('usage: node build-answer-pages.js <answersFile> <outDir>'); process.exit(2); }
const dir = outDir.endsWith('/') || outDir.endsWith('\\') ? outDir : outDir + '/';
const now = Date.now();
let c = 0;
function id() { const a = (now + c * 7919).toString(16).padStart(12, '0'); const b = ((++c * 2654435761) >>> 0).toString(16).padStart(8, '0'); return (a + b).slice(0, 16); }
function asSlug(t) { return t.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase(); }
// question key -> [answer-page label prefix, Question Card hub title]
const Q = {
  'who-cares': ['Who cares', 'Who Cares?'],
  'who-will-be-involved': ['Who is involved', 'Who is Involved?'],
  'what-changes': ['What changes', 'What Changes?'],
  'what-is-the-proof': ['Proof & Realness', 'Proof & Realness?'],
  "how-it-becomes-real": ["How it 'becomes real'", 'Becoming Real?'],
};
let all = JSON.parse(fs.readFileSync(ansFile, 'utf8'));
if (!Array.isArray(all)) all = [all];
let written = 0; const slugs = [];
for (const data of all) {
  const session = data.session;
  if (!session) throw new Error('missing session');
  for (const key of Object.keys(Q)) {
    let body = data[key];
    if (!body) { console.log('WARN missing ' + key + ' in ' + session); continue; }
    const [prefix, hub] = Q[key];
    body = body.replace(/^#[^\n]*/, '# ' + prefix);
    const title = `${prefix}: ${session}`;
    const slug = asSlug(title);
    const page = {
      title,
      story: [
        { type: 'markdown', id: id(), text: body },
        { type: 'markdown', id: id(), text: `See [[${session}]]  ·  hub: [[${hub}]]` },
      ],
      journal: [{ type: 'create', id: id(), item: { title, story: [] }, date: now }],
    };
    fs.writeFileSync(dir + slug, JSON.stringify(page, null, 2), 'utf8');
    slugs.push(slug); written++;
  }
}
console.log('Wrote ' + written + ' answer pages:');
slugs.forEach(s => console.log('  ' + s));
