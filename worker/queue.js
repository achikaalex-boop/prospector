// Simple BullMQ worker scaffold. Requires `bullmq` and a Redis server.
// This file is a scaffold to be run separately (node worker/queue.js)
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

const POLL_INTERVAL_MS = Number(process.env.JOB_POLL_INTERVAL_MS || 2000)
const RETELL_API_URL = process.env.RETELL_API_URL || 'https://api.retellai.com/create-batch-call'
const RETELL_API_KEY = process.env.RETELL_API_KEY || process.env.VITE_RETELL_API_KEY

async function getConcurrencyLimitForPlan(planSlug) {
  try {
    if (!supabase || !planSlug) return 20
    // try user_plans or plans table
    const { data: up } = await supabase.from('plans').select('concurrency_limit').eq('slug', planSlug).limit(1).single()
    if (up && up.concurrency_limit) return up.concurrency_limit
  } catch (e) {
    // ignore
  }
  if (!planSlug) return 20
  const s = String(planSlug).toLowerCase()
  if (s === 'free' || s === 'starter') return 20
  if (s === 'pro' || s === 'standard') return 50
  if (s === 'enterprise' || s === 'business') return 200
  return 50
}

async function claimPendingJob(job) {
  // try to atomically claim by updating status from pending -> processing
  const { data, error } = await supabase.from('job_queue').update({ status: 'processing', started_at: new Date().toISOString(), attempts: job.attempts + 1 }).eq('id', job.id).eq('status', 'pending').select().single()
  if (error || !data) return null
  return data
}

async function processCreateBatch(payload, jobId) {
  try {
    if (!RETELL_API_KEY) throw new Error('RETELL_API_KEY not configured for worker')
    const resp = await axios.post(RETELL_API_URL, payload, { headers: { Authorization: `Bearer ${RETELL_API_KEY}` }, timeout: 20000 })
    // update job as completed
    try {
      if (supabase && jobId) await supabase.from('job_queue').update({ status: 'completed', finished_at: new Date().toISOString(), result: resp.data }).eq('id', jobId)
    } catch (e) {
      console.warn('Could not update job result:', e.message || e)
    }
    return { ok: true, resp: resp.data }
  } catch (e) {
    console.error('Worker: forwarding batch to Retell failed:', e?.response?.data || e.message || e)
    // mark job as failed (or requeue depending on attempts)
    try {
      if (supabase && jobId) {
        const attempts = (jobId && await supabase.from('job_queue').select('attempts').eq('id', jobId).maybeSingle) || null
        await supabase.from('job_queue').update({ status: 'failed', last_error: String(e?.message || e), finished_at: new Date().toISOString() }).eq('id', jobId)
      }
    } catch (u) {
      console.warn('Could not mark job failed:', u.message || u)
    }
    throw e
  }
}

async function pollLoop() {
  if (!supabase) {
    console.error('Supabase not configured for worker. Exiting poll loop.')
    return
  }
  while (true) {
    try {
      const { data: jobs } = await supabase.from('job_queue').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(10)
      if (jobs && jobs.length) {
        for (const job of jobs) {
          try {
            const limit = await getConcurrencyLimitForPlan(job.plan_slug)
            const { data: running } = await supabase.from('job_queue').select('id').eq('status', 'processing').eq('plan_slug', job.plan_slug)
            if (running && running.length >= limit) continue

            const claimed = await claimPendingJob(job)
            if (!claimed) continue

            await processCreateBatch(claimed.payload, claimed.id)
          } catch (inner) {
            console.error('Error processing job:', inner)
          }
        }
      }
    } catch (e) {
      console.error('Poll loop error:', e)
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }
}

pollLoop().catch(e => console.error('Worker poll loop crashed:', e))

console.log('Supabase-backed worker started (polling)')
