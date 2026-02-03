#!/usr/bin/env node
// Lightweight check to detect potentially sensitive variables accidentally prefixed with VITE_
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.log('.env not found, skipping checks.')
  process.exit(0)
}

const txt = fs.readFileSync(envPath, 'utf8')
const warnings = []
if (/\bVITE_SUPABASE_SERVICE_ROLE_KEY\b/.test(txt)) warnings.push('VITE_SUPABASE_SERVICE_ROLE_KEY is present - this key should be set as SUPABASE_SERVICE_ROLE_KEY (server-side only)')
if (/\bVITE_PAYPAL_SECRET_KEY\b/.test(txt)) warnings.push('VITE_PAYPAL_SECRET_KEY is present - move to PAYPAL_SECRET (server-side)')
if (/\bVITE_RETELL_API_KEY\b/.test(txt)) warnings.push('VITE_RETELL_API_KEY is present - consider using RETELL_API_KEY for server-side only')

if (warnings.length) {
  console.log('WARNING: Potential sensitive variables detected in .env that may be exposed to the client:')
  warnings.forEach(w => console.log(' - ' + w))
  console.log('\nPlease move these keys to server-side environment variables (no VITE_ prefix) and remove them from the client-bundled .env to avoid leaking secrets.')
  process.exit(1)
}

console.log('No obvious VITE_ secrets found in .env')
process.exit(0)
