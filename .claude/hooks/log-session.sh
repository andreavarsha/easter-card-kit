#!/usr/bin/env bash
# Stop hook — session logger
# Appends one line to .claude/card-log.txt on every session end.
# Format: timestamp | session_id | N cards | client name

node - <<'JSEOF'
const fs   = require('fs');
const path = require('path');
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch {}

  const sessionId = input.session_id || 'unknown';
  const timestamp = new Date().toISOString();

  // Count .html files in output/
  let cardCount = 0;
  try {
    cardCount = fs.readdirSync('output').filter(f => f.endsWith('.html')).length;
  } catch {}

  // Read client name from brand.json
  let clientName = 'unknown';
  try {
    const brand = JSON.parse(fs.readFileSync('brand.json', 'utf8'));
    clientName = brand.client_name || 'unknown';
  } catch {}

  const line = `${timestamp} | ${sessionId} | ${cardCount} card${cardCount !== 1 ? 's' : ''} | ${clientName}\n`;

  const logPath = path.join('.claude', 'card-log.txt');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, line);

  process.exit(0);
});
JSEOF
