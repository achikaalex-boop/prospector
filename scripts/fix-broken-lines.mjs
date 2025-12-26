import fs from 'fs'
const p = 'src/views/Campaign.vue'
let s = fs.readFileSync(p, 'utf8')
const patterns = [
  // Join '.' with the next identifier when a newline was accidentally inserted
  [/\.\s*\r?\n\s*([A-Za-z_$])/g, '.$1'],
  // common broken words split across newlines
  [/e\.\s*\r?\n\s*message/g, 'e.message'],
  [/err\.\s*\r?\n\s*message/g, 'err.message'],
  [/resp\s*\r?\n\s*\.\s*data/g, 'resp.data'],
  [/tasks\s*\r?\n\s*\.\s*slice/g, 'tasks.slice'],
  [/tasksResp\s*\r?\n\s*\.\s*data/g, 'tasksResp.data'],
]
let changed = false
for (const [re, repl] of patterns) {
  if (re.test(s)) {
    s = s.replace(re, repl)
    changed = true
  }
}
if (changed) {
  fs.writeFileSync(p, s, 'utf8')
  console.log('Applied fixes to', p)
} else {
  console.log('No patterns matched')
}
