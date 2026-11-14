// validate-creds.js — check ~/.wiki/.creds/cookies.json syntax WITHOUT exposing secrets.
// Prints the parse error and the surrounding lines with every long string masked.
const fs = require('fs');
const path = require('path');
const FILE = path.join(process.env.USERPROFILE || process.env.HOME, '.wiki', '.creds', 'cookies.json');
const raw = fs.readFileSync(FILE, 'utf8');
const masked = raw.replace(/"([^"\n]{30,})"/g, (m, s) => '"***' + s.length + 'chars***"');
try {
  JSON.parse(raw);
  console.log('OK: cookies.json parses. Owners:',
    JSON.parse(raw).owners.map(o => o.label + ' -> ' + (o.hosts || []).join(',')).join(' | '));
} catch (e) {
  console.log('PARSE ERROR:', e.message);
  const m = e.message.match(/line (\d+)/);
  const line = m ? Number(m[1]) : null;
  const lines = masked.split(/\r?\n/);
  const from = line ? Math.max(0, line - 4) : 0, to = line ? Math.min(lines.length, line + 3) : Math.min(lines.length, 20);
  for (let i = from; i < to; i++) console.log(String(i + 1).padStart(3) + (i + 1 === line ? ' >> ' : '    ') + lines[i]);
}
