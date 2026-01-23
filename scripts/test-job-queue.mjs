#!/usr/bin/env node

/**
 * Test script to verify job_queue functionality with user_id
 * 
 * Usage:
 *   node test-job-queue.mjs [auth-token]
 * 
 * Example:
 *   node test-job-queue.mjs "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Parse arguments
const authToken = process.argv[2]

if (!authToken) {
  console.error('ERROR: Auth token is required')
  console.error('Usage: node test-job-queue.mjs <auth-token>')
  console.error('')
  console.error('Example:')
  console.error('  node test-job-queue.mjs "your-supabase-auth-token"')
  process.exit(1)
}

// Test payload
const testPayload = {
  from_number: '+1234567890',
  send_now: true,
  tasks: [
    {
      to_number: '+9876543210',
      override_agent_id: 'test-agent',
      custom_analysis_instruction: 'This is a test call for job queue verification'
    }
  ]
}

async function main() {
  console.log('🚀 Testing job_queue with user_id...')
  console.log('')

  try {
    // 1. Test the /create-batch endpoint with auth token
    console.log('📤 Step 1: Sending batch create request to /create-batch')
    console.log('   Payload:', JSON.stringify(testPayload, null, 2))
    console.log('   Authorization: Bearer <token>')

    const createResp = await axios.post(`${SERVER_URL}/create-batch`, testPayload, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    const jobId = createResp.data?.job?.jobId
    console.log(`✅ Batch request succeeded!`)
    console.log(`   Status: ${createResp.status}`)
    console.log(`   Job ID: ${jobId}`)
    console.log('')

    // 2. Verify job_queue entry has user_id
    if (SUPABASE_URL && SUPABASE_KEY && jobId) {
      console.log('📋 Step 2: Verifying job_queue entry in Supabase')
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

      const { data: job, error } = await supabase
        .from('job_queue')
        .select('id, user_id, plan_slug, status, created_at')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error(`❌ Database error:`, error.message)
      } else if (!job) {
        console.error(`❌ Job not found in job_queue table`)
      } else {
        console.log(`✅ Job found in database!`)
        console.log(`   ID: ${job.id}`)
        console.log(`   user_id: ${job.user_id || '(NULL - ❌ BUG!)'}`)
        console.log(`   plan_slug: ${job.plan_slug || '(NULL)'}`)
        console.log(`   status: ${job.status}`)
        console.log(`   created_at: ${job.created_at}`)

        if (!job.user_id) {
          console.log('')
          console.warn('⚠️  WARNING: user_id is NULL in job_queue!')
          console.warn('   This indicates the fix may not be working properly.')
        } else {
          console.log('')
          console.log('✅ user_id is correctly set in job_queue!')
        }
      }
    } else {
      console.log('⏭️  Skipping database verification (SUPABASE_URL or SUPABASE_KEY not set)')
    }

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
