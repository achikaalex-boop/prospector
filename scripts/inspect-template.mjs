import fs from 'fs';
const s = fs.readFileSync('src/views/Campaign.vue','utf8');
const needle = "Erreur lors de l'appel serveur create-batch";
const idx = s.indexOf(needle);
if (idx === -1) {
  console.error('needle not found');
  process.exit(2);
}
const start = s.lastIndexOf('sendServerLog', idx);
const openBacktick = s.indexOf('`', start);
const closeBacktick = s.indexOf('`', openBacktick+1);
console.log('open', openBacktick, 'close', closeBacktick);
const expr = s.slice(openBacktick, closeBacktick+1);
console.log('expr=');
console.log(expr);
console.log('--- char codes ---');
for (let i=0;i<expr.length;i++){
  const ch = expr.charCodeAt(i);
  if (ch < 32 || ch > 126) console.log(i, expr[i], '0x'+ch.toString(16));
}
console.log('--- surrounding raw (start-40..start+120) ---');
console.log(s.slice(Math.max(0,start-40), Math.min(s.length, start+120)));
