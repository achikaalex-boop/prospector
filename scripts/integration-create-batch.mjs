import { handleCreateBatch } from '../webhook-server.mjs'
import axios from 'axios'
import fs from 'fs'

// Ensure RETELL_API_KEY is set so handler doesn't error
process.env.RETELL_API_KEY = process.env.RETELL_API_KEY || 'test-retell-key'

// Mock axios.post used by the handler to forward to Retell
axios.post = async (url, payload, opts) => {
  console.log('MOCK axios.post called:', url)
  // Minimal fake response similar to Retell
  return { status: 200, data: { batch_call_id: 'mock-batch-123', tasks_url: 'https://example.com/mock-tasks.json' } }
}

// Load sample payload
const payload = JSON.parse(fs.readFileSync(new URL('./test-payload.json', import.meta.url)))

// Create minimal Express-like req/res mocks
const req = { body: payload, headers: {}, socket: {} }

let resStatus = null
let resBody = null
const res = {
  status(code) { resStatus = code; return this },
  json(obj) { resBody = obj; return this },
  send(obj) { resBody = obj; return this }
}

async function run() {
  console.log('Invoking handleCreateBatch with mocked axios...')
  await handleCreateBatch(req, res)
  console.log('Result status:', resStatus)
  console.log('Result body:', resBody)
}

run().catch(err => { console.error('Test failed:', err); process.exit(1) })
