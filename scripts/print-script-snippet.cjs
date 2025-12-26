const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'src', 'views', 'Campaign.vue');
const src = fs.readFileSync(file, 'utf8');
const match = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!match) { console.error('No script block'); process.exit(2) }
const script = match[1];
const lines = script.split(/\r?\n/);
const target = 346;
const start = Math.max(1, target - 6);
const end = Math.min(lines.length, target + 6);
for (let i = start; i <= end; i++) {
  const prefix = (i === target) ? '>> ' : '   ';
  console.log(prefix + String(i).padStart(4) + ': ' + lines[i-1]);
}
