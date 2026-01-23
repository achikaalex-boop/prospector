# Job Queue Fix - user_id Insertion

## Problem
The `job_queue` table was not receiving the `user_id` when jobs were enqueued through the primary `/create-batch` endpoint. This meant that background job processing couldn't properly track which user submitted each job, and couldn't correctly apply per-user plan concurrency limits.

## Root Cause
In the `handleCreateBatch` function (webhook-server.mjs line ~1838), the code was calling:
```javascript
const enqueueResp = await enqueueBatchJob(payload)
```

Without passing the `user_id` parameter. While the `enqueueBatchJob` function was correctly defined to accept and use `user_id`:
```javascript
async function enqueueBatchJob(payload, opts = {}) {
  const userId = payload.user_id || opts.user_id || null
  // ... inserts job with user_id
}
```

The caller wasn't extracting the user_id from the authentication context and passing it.

## Solution
Modified `handleCreateBatch` to:

1. **Extract user from auth token** - Read the `Authorization: Bearer <token>` header
2. **Get user ID from Supabase auth** - Use `supabase.auth.getUser(token)` to verify the token and extract the authenticated user's ID
3. **Pass user_id to enqueueBatchJob** - Updated the function call to: 
   ```javascript
   await enqueueBatchJob(payload, { user_id: userId })
   ```

## Changes Made

### File: webhook-server.mjs

**Modified:** `handleCreateBatch()` function (lines 1798-1883)

**Before:**
```javascript
export async function handleCreateBatch(req, res) {
  const payload = req.body || {}
  // ... validation ...
  try {
    const enqueueResp = await enqueueBatchJob(payload)  // ❌ No user_id!
    // ...
  }
}
```

**After:**
```javascript
export async function handleCreateBatch(req, res) {
  const payload = req.body || {}
  // ... validation ...
  
  // Extract user_id from auth token
  let userId = null
  try {
    const auth = req.headers['authorization'] || null
    if (auth) {
      const token = String(auth).split(' ')[1]
      if (token && supabase) {
        const { data: userResp, error: userErr } = await supabase.auth.getUser(token)
        const user = userResp?.user || null
        if (user && !userErr) {
          userId = user.id
          console.log(`handleCreateBatch: authenticated as user ${userId}`)
        }
      }
    }
  } catch (e) {
    console.warn('Failed to extract user from auth token:', e?.message)
  }

  // ... validation & setup ...
  try {
    const enqueueResp = await enqueueBatchJob(payload, { user_id: userId })  // ✅ Pass user_id!
    // ...
  }
}
```

## Verification

### Database Schema
The `job_queue` table already has the correct schema:
```sql
CREATE TABLE job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  plan_slug text NULL,
  status text NOT NULL DEFAULT 'pending',
  -- ... other fields
);
```

### enqueueBatchJob Function
Already correctly implemented to use user_id:
```javascript
async function enqueueBatchJob(payload, opts = {}) {
  if (!supabase) throw new Error('Supabase not configured')
  const userId = payload.user_id || opts.user_id || null
  const planSlug = await getUserPlanSlug(userId)
  const jobRow = {
    user_id: userId,           // ✅ Correctly included
    plan_slug: planSlug,
    status: 'pending',
    attempts: 0,
    payload
  }
  const { data, error } = await supabase.from('job_queue').insert([jobRow]).select().single()
  // ...
}
```

### worker/queue.js
Already uses user_id correctly:
- Fetches pending jobs
- For each job with `user_id`, looks up user's current plan
- Applies plan-specific concurrency limits
- Processes with Retell API
- Updates job status/result with correct user context

## Testing

Run the test script to verify the fix:
```bash
# Test with your auth token
node scripts/test-job-queue.mjs "your-supabase-jwt-token"
```

The script will:
1. Send a batch create request with authentication
2. Verify the job was created in `job_queue` table
3. Confirm `user_id` field is populated (not NULL)
4. Display job details including plan_slug and status

## Impact

- ✅ Jobs now correctly track which user submitted them
- ✅ Background worker can apply per-user concurrency limits
- ✅ Job status can be queried by user_id
- ✅ Analytics and audit logs can track user activity
- ✅ Billing/usage tracking is now possible

## Fallback Behavior

If auth extraction fails:
- `userId` will be `null`
- Job will still be created with `user_id = NULL`
- Job will be processed with default concurrency limits
- This maintains backward compatibility while fixing the normal case

## Related Files

- `webhook-server.mjs` - Contains handleCreateBatch and enqueueBatchJob
- `worker/queue.js` - Background job processor
- `migrations/004_job_queue.sql` - Table schema
- `scripts/test-job-queue.mjs` - Test script (NEW)
