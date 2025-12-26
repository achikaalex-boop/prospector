const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const file = path.resolve(__dirname, '..', 'src', 'views', 'Campaign.vue');
const src = fs.readFileSync(file, 'utf8');

const match = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!match) {
  console.error('No <script> block found');
  process.exit(2);
}
const script = match[1];
console.log('=== Extracted script length:', script.length);

try {
  const ast = parser.parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties', 'optionalChaining']
  });
  console.log('Parse OK');
} catch (e) {
  console.error('Parse error:');
  console.error(e.message);
  console.error(e.loc);
  console.error(e.codeFrame || 'no codeFrame');
  process.exit(1);
}
