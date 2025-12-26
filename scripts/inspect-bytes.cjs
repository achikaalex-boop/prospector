const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'views', 'Campaign.vue');
const src = fs.readFileSync(file, 'utf8');
const match = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!match) { console.error('No script block'); process.exit(2) }
const script = match[1];
const index = 13000;
const start = Math.max(0, index - 40);
const end = Math.min(script.length, index + 40);
const snippet = script.slice(start, end);
console.log('Snippet (visible):');
console.log(snippet.replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
console.log('\nChar codes:');
for (let i = 0; i < snippet.length; i++) {
  const ch = snippet.charAt(i);
  const code = snippet.charCodeAt(i);
  process.stdout.write(`${String(code).padStart(3)} `);
}
console.log('\n');
