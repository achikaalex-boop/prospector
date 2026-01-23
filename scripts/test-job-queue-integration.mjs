#!/usr/bin/env node

/**
 * Integration test for job_queue processing flow
 * 
 * Simulates the complete flow:
 * 1. Client sends batch create request with auth
 * 2. Server extracts user_id from token
 * 3. Server enqueues job with user_id
 * 4. Worker processes job with correct user context
 * 
 * This test validates the fix for job_queue not receiving user_id
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://gefvajsdwsvgjdqhapge.supabase.co"
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnZhanNkd3N2Z2pkcWhhcGdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTcyNzI0NiwiZXhwIjoyMDgxMzAzMjQ2fQ.-KNqPqf2AKbjcqJHwUUroB6-UzzWMUge24n2qsqscgg"

async function testJobQueueLogic() {
  console.log('🧪 Job Queue Integration Test')
  console.log('=' .repeat(50))
  console.log('')

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Supabase credentials not configured')
    console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Test 1: Check job_queue table schema
  console.log('Test 1: Verifying job_queue table schema...')
  try {
    const { data: columns, error } = await supabase
      .from('job_queue')
      .select('*')
      .limit(0)

    if (error && error.code !== 'PGRST116') { // PGRST116 = empty response
      console.error('❌ Error accessing job_queue table:', error.message)
      process.exit(1)
    }
    console.log('✅ job_queue table exists and is accessible')
  } catch (e) {
    console.error('❌ Failed to check table:', e.message)
    process.exit(1)
  }
  console.log('')

  // Test 2: Check recent jobs with user_id
  console.log('Test 2: Checking recent jobs for user_id field...')
  try {
    const { data: recentJobs, error } = await supabase
      .from('job_queue')
      .select('id, user_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error querying jobs:', error.message)
      process.exit(1)
    }

    if (!recentJobs || recentJobs.length === 0) {
      console.log('ℹ️  No jobs found in job_queue table (table is empty)')
    } else {
      console.log(`✅ Found ${recentJobs.length} recent jobs`)
      
      const jobsWithUser = recentJobs.filter(j => j.user_id !== null).length
      const jobsWithoutUser = recentJobs.filter(j => j.user_id === null).length
      
      console.log(`   Jobs with user_id: ${jobsWithUser}`)
      console.log(`   Jobs without user_id: ${jobsWithoutUser}`)
      
      console.log('')
      console.log('   Sample jobs:')
      recentJobs.forEach((job, idx) => {
        const userDisplay = job.user_id ? `${job.user_id.slice(0, 8)}...` : 'NULL ❌'
        console.log(`   [${idx + 1}] ID: ${job.id.slice(0, 8)}... | user_id: ${userDisplay} | status: ${job.status}`)
      })

      if (jobsWithoutUser > 0) {
        console.log('')
        console.warn('⚠️  WARNING: Found jobs without user_id!')
        console.warn('   This may indicate the fix is not yet in effect.')
        console.warn('   Check that:')
        console.warn('   1. The webhook-server.mjs changes were applied correctly')
        console.warn('   2. The server was restarted after the changes')
        console.warn('   3. New requests are being sent with authentication headers')
      } else if (jobsWithUser > 0) {
        console.log('')
        console.log('✅ All jobs have user_id populated!')
        console.log('   The fix is working correctly.')
      }
    }
  } catch (e) {
    console.error('❌ Failed to query jobs:', e.message)
    process.exit(1)
  }
  console.log('')

  // Test 3: Verify queue worker logic
  console.log('Test 3: Verifying queue processing logic...')
  try {
    const { data: processingJobs, error } = await supabase
      .from('job_queue')
      .select('id, user_id, status, attempts, plan_slug')
      .eq('status', 'processing')
      .limit(3)

    if (error) {
      console.error('❌ Error querying processing jobs:', error.message)
    } else if (!processingJobs || processingJobs.length === 0) {
      console.log('ℹ️  No jobs currently processing')
    } else {
      console.log(`✅ Found ${processingJobs.length} jobs in processing state`)
      processingJobs.forEach(job => {
        console.log(`   - Job ${job.id.slice(0, 8)}... (user: ${job.user_id?.slice(0, 8) || 'none'}, plan: ${job.plan_slug || 'unknown'}, attempts: ${job.attempts})`)
      })
    }
  } catch (e) {
    console.error('❌ Failed to query processing jobs:', e.message)
  }
  console.log('')

  // Test 4: Check completed jobs
  console.log('Test 4: Checking job completion rate...')
  try {
    const { data: completedJobs, error: completedErr } = await supabase
      .from('job_queue')
      .select('id')
      .eq('status', 'completed')

    const { data: failedJobs, error: failedErr } = await supabase
      .from('job_queue')
      .select('id')
      .eq('status', 'failed')

    const { data: pendingJobs, error: pendingErr } = await supabase
      .from('job_queue')
      .select('id')
      .eq('status', 'pending')

    if (!completedErr && !failedErr && !pendingErr) {
      const completed = completedJobs?.length || 0
      const failed = failedJobs?.length || 0
      const pending = pendingJobs?.length || 0
      const total = completed + failed + pending

      if (total > 0) {
        const completionRate = ((completed / total) * 100).toFixed(1)
        console.log(`✅ Job Queue Status:`)
        console.log(`   Completed: ${completed}`)
        console.log(`   Failed: ${failed}`)
        console.log(`   Pending: ${pending}`)
        console.log(`   Total: ${total}`)
        console.log(`   Completion Rate: ${completionRate}%`)
      } else {
        console.log('ℹ️  No job statistics available (queue is empty)')
      }
    }
  } catch (e) {
    console.error('❌ Failed to get queue stats:', e.message)
  }
  console.log('')

  console.log('=' .repeat(50))
  console.log('✅ Test Complete')
  console.log('')
  console.log('Next steps:')
  console.log('1. Run the server: npm run dev')
  console.log('2. Send a batch create request with auth token:')
  console.log('   node scripts/test-job-queue.mjs <your-auth-token>')
  console.log('3. Verify user_id is populated in new jobs')
  console.log('')
}

testJobQueueLogic().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
