// Build the 5 Question-Card hub pages for a wiki, tailored to a session list.
//   node build-hub-cards.js <outDir> <sessionsCsv> <srcBase>
// Reuses the canonical card definition text (story[0]) from an existing wiki
// (srcBase: any wiki that already carries the five card pages) and rewrites the "Answers across the
// timeline" list for the given sessions (colon-convention links).
const fs = require('fs');
const [outDir, sessionsCsv, srcBaseArg] = process.argv.slice(2);
if (!outDir || !sessionsCsv) { console.error('usage: node build-hub-cards.js <outDir> <sessionsCsv> <srcBase>'); process.exit(2); }
const srcBase = srcBaseArg;
if (!srcBase) { console.error('usage: node build-hub-cards.js <outDir> <sessionsCsv> <srcBase>  (srcBase = a wiki that already carries the five card pages)'); process.exit(2); }
const dir = outDir.endsWith('/') || outDir.endsWith('\\') ? outDir : outDir + '/';
const sessions = sessionsCsv.split('|').map(s => s.trim()).filter(Boolean);
const now = Date.now();
let c = 0;
function id() { const a = (now + c * 7919).toString(16).padStart(12, '0'); const b = ((++c * 2654435761) >>> 0).toString(16).padStart(8, '0'); return (a + b).slice(0, 16); }
// slug -> [card title, answer-link label]
const cards = [
  ['who-cares', 'Who Cares?', 'Who cares'],
  ['who-is-involved', 'Who is Involved?', 'Who is involved'],
  ['what-changes', 'What Changes?', 'What changes'],
  ['proof--realness', 'Proof & Realness?', 'Proof & Realness'],
  ['becoming-real', 'Becoming Real?', "How it 'becomes real'"],
];
(async () => {
  for (const [slug, title, label] of cards) {
    const r = await fetch(srcBase + '/' + slug + '.json');
    if (!r.ok) throw new Error('fetch ' + slug + ' ' + r.status);
    const j = await r.json();
    const def = (j.story.find(i => i.type === 'markdown') || {}).text || ('# ' + title);
    const list = sessions.map(s => `- [[${label}: ${s}]]`).join('\n');
    const defItem = { type: 'markdown', id: id(), text: def };
    const listItem = { type: 'markdown', id: id(), text: '## Answers across the timeline\n\n' + list };
    const page = {
      title,
      story: [defItem, listItem],
      journal: [
        { type: 'create', id: id(), item: { title, story: [] }, date: now },
        { type: 'add', id: defItem.id, item: defItem, date: now },
        { type: 'add', id: listItem.id, item: listItem, date: now },
      ],
    };
    fs.writeFileSync(dir + slug, JSON.stringify(page, null, 2), 'utf8');
    console.log('hub: ' + slug + '  "' + title + '"  (' + sessions.length + ' answer link(s))');
  }
})();
