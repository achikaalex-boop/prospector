import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import axios from 'axios'

const app = express();
const PORT = process.env.PORT || 8080;

// __dirname en mode ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import crypto from 'crypto';

// capture raw body for webhook HMAC verification
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf } }));

// --- Billing endpoints --------------------------------------------------
// Get available plans
app.get('/api/plans', async (_req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
  try {
    const { data, error } = await supabase.from('plans').select('*').order('monthly_price_cents', { ascending: true })
    if (error) return res.status(500).json({ error })
    return res.json(data || [])
  } catch (e) {
    console.error('Error fetching plans:', e)
    return res.status(500).json({ error: 'internal' })
  }
})

// Preview estimated cost for a campaign
// Body: { contacts_count: number, estimated_avg_call_seconds: number, plan_slug?: string }
app.post('/api/preview-cost', async (req, res) => {
  try {
    const body = req.body || {}
    const contactsCount = Number(body.contacts_count) || 0
    const avgCallSec = Number(body.estimated_avg_call_seconds) || 60
    const planSlug = body.plan_slug || 'starter'

    // Basic pricing rules: provider cost $0.17/min -> 17 cents per minute
    const providerCentsPerMin = 17
    const minutes = Math.ceil((contactsCount * avgCallSec) / 60)

    // get plan
    const { data: plans, error: planErr } = await supabase.from('plans').select('*').eq('slug', planSlug).limit(1).single()
    let plan = null
    if (!planErr && plans) plan = plans

    // Determine per-minute price for the plan (simple model)
    // default: add 30% margin
    const margin = 1.30
    const perMinCents = Math.ceil(providerCentsPerMin * margin)

    const totalCents = perMinCents * minutes

    return res.json({ contacts: contactsCount, minutes, per_min_cents: perMinCents, total_cents: totalCents, plan: plan || null })
  } catch (e) {
    console.error('Error in preview-cost:', e)
    return res.status(500).json({ error: 'internal' })
  }
})
// --- end billing endpoints ----------------------------------------------

// Client Supabase pour le webhook (côté serveur)
// Prioriser la clé `SERVICE_ROLE` (doit être définie dans les variables d'env de Render)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = serviceRoleKey || anonKey;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (supabase) {
  if (serviceRoleKey) {
    console.log('Supabase client: using SERVICE_ROLE key (server, RLS bypass)');
  } else {
    console.warn('Supabase client: using ANON key on server — RLS may block inserts. Set SUPABASE_SERVICE_ROLE_KEY in env.');
  }
}

async function getUserPlanSlug(userId) {
  try {
    if (!userId || !supabase) return 'free'
    const { data, error } = await supabase.from('user_plans').select('plan_slug').eq('user_id', userId).limit(1).single()
    if (error || !data) return 'free'
    return data.plan_slug || 'free'
  } catch (e) {
    return 'free'
  }
}

function planIsFree(slug) {
  if (!slug) return true
  return String(slug).toLowerCase() === 'free' || String(slug).toLowerCase() === 'starter'
}

// Enqueue a job into Supabase job_queue table
async function enqueueBatchJob(payload, opts = {}) {
  if (!supabase) throw new Error('Supabase not configured')
  const userId = payload.user_id || opts.user_id || null
  const planSlug = await getUserPlanSlug(userId)
  const jobRow = {
    user_id: userId,
    plan_slug: planSlug,
    status: 'pending',
    attempts: 0,
    payload
  }
  const { data, error } = await supabase.from('job_queue').insert([jobRow]).select().single()
  if (error) throw error
  return { jobId: data.id, queued: true, plan: planSlug }
}

// ----------------------- PayPal helpers & endpoints --------------------
const PAYPAL_API_HOST = (process.env.PAYPAL_ENV === 'live') ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET_KEY || process.env.VITE_PAYPAL_SECRET_KEY;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || null;

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) throw new Error('PayPal credentials not configured');
  const tokenUrl = `${PAYPAL_API_HOST}/v1/oauth2/token`;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const resp = await axios.post(tokenUrl, params.toString(), {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return resp.data.access_token;
}

async function createPayPalOrder(amountCents, currency = 'USD', description = 'Top-up', returnUrl = null, cancelUrl = null) {
  const accessToken = await getPayPalAccessToken();
  const url = `${PAYPAL_API_HOST}/v2/checkout/orders`;
  const body = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: currency, value: (amountCents / 100).toFixed(2) },
      description
    }]
  };
  if (returnUrl || cancelUrl) {
    body.application_context = {}
    if (returnUrl) body.application_context.return_url = returnUrl
    if (cancelUrl) body.application_context.cancel_url = cancelUrl
  }
  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;
}

async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const url = `${PAYPAL_API_HOST}/v2/checkout/orders/${orderId}/capture`;
  const resp = await axios.post(url, {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;
}

async function getPayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const url = `${PAYPAL_API_HOST}/v2/checkout/orders/${orderId}`;
  const resp = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  return resp.data;
}

// Create an order and (optionally) store a pending transaction in Supabase
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return res.status(500).json({ error: 'PayPal not configured on server' });
    const { amount_cents, currency = 'USD', user_id, description } = req.body || {};
    if (!amount_cents || Number(amount_cents) <= 0) return res.status(400).json({ error: 'amount_cents required and must be > 0' });

    const order = await createPayPalOrder(Number(amount_cents), currency, description || 'Top-up');

    // attempt to insert a pending transaction record (best-effort)
    try {
      if (supabase) {
        const tx = {
          user_id: user_id || null,
          order_id: order.id,
          amount_cents: Number(amount_cents),
          currency: currency,
          status: 'pending',
          raw_response: order
        };
        // try a few likely table names
        const tableCandidates = ['billing_transactions', 'transactions', 'billing.transactions'];
        for (const tbl of tableCandidates) {
          try {
            const { data, error } = await supabase.from(tbl).insert([tx]).select().maybeSingle ? await supabase.from(tbl).insert([tx]).select().single() : await supabase.from(tbl).insert([tx]);
            // if insert succeeded, break
            if (!error) break;
          } catch (e) {
            // ignore and try next candidate
          }
        }
      }
    } catch (e) {
      console.warn('Non-fatal: could not write pending transaction to Supabase:', e.message || e);
    }

    // Ensure the PayPal order contains an approval link. If not, fetch the order again
    let approvalLink = null
    if (order && Array.isArray(order.links)) {
      const l = order.links.find(x => x.rel === 'approve')
      if (l && l.href) approvalLink = l.href
    }
    if (!approvalLink && order && order.id) {
      try {
        const fresh = await getPayPalOrder(order.id)
        if (fresh && Array.isArray(fresh.links)) {
          const l2 = fresh.links.find(x => x.rel === 'approve')
          if (l2 && l2.href) approvalLink = l2.href
          // merge fresh links/status into order for returning to client
          order.links = fresh.links || order.links
          order.status = fresh.status || order.status
        }
      } catch (e) {
        console.warn('Could not refetch PayPal order for approval link:', e?.message || e)
      }
    }

    if (!approvalLink) {
      console.error('No approval link found in PayPal order', { orderId: order?.id })
      return res.status(500).json({ error: 'No approval link returned by PayPal', raw: order })
    }

    const normalized = {
      id: order.id,
      status: order.status,
      links: order.links || [],
      approve_link: approvalLink,
      raw: order
    }

    return res.json(normalized)
  } catch (err) {
    console.error('Error creating PayPal order:', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: err?.response?.data || err.message });
  }
});

// Create a subscription purchase order (one-time charge for subscription activation)
app.post('/api/subscribe', async (req, res) => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return res.status(500).json({ error: 'PayPal not configured on server' });
    const { plan_slug, amount_cents, user_id } = req.body || {}
    if (!plan_slug) return res.status(400).json({ error: 'plan_slug required' })
    if (!amount_cents || Number(amount_cents) <= 0) return res.status(400).json({ error: 'amount_cents required and must be > 0' })

    const frontendBase = (req && (req.headers && req.headers.origin)) || process.env.FRONTEND_URL || process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 5173}`
    const returnUrl = `${frontendBase}/topup/complete?plan_slug=${encodeURIComponent(plan_slug)}`
    const cancelUrl = `${frontendBase}/pricing`

    const order = await createPayPalOrder(Number(amount_cents), 'USD', `Subscription: ${plan_slug}`, returnUrl, cancelUrl)

    // Insert a pending transaction record if possible (best-effort)
    if (supabase) {
      try {
        await supabase.from('billing_transactions').insert([{
          user_id: user_id || null,
          order_id: order.id,
          amount_cents: Number(amount_cents),
          currency: 'USD',
          status: 'pending',
          meta: { plan_slug },
          raw_response: order
        }])
      } catch (e) {
        // ignore if table doesn't exist
      }
    }

    return res.json(order)
  } catch (e) {
    console.error('Error in /api/subscribe:', e?.response?.data || e.message || e)
    return res.status(500).json({ error: e?.message || 'internal' })
  }
})

// Create campaign via server: checks billing/plan before inserting and enqueuing batch
app.post('/api/create-campaign', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
    const payload = req.body || {}
    const userId = payload.user_id || null
    if (!userId) return res.status(400).json({ error: 'user_id required' })

    const contactsCount = Number(payload.contacts_count || (Array.isArray(payload.contacts) ? payload.contacts.length : 0))
    const avgCallSec = Number(payload.estimated_avg_call_seconds || 60)
    const planSlug = payload.plan_slug || null

    // Fetch active plan for user (join to plans table)
    let plan = null
    try {
      let up = null
      try {
        const resp = await supabase.from('user_plans').select('plan_id, started_at, expires_at, active').eq('user_id', userId).limit(1).single()
        up = resp?.data || null
      } catch (e) {
        up = null
      }
      if (up && up.plan_id) {
        try {
          const resp2 = await supabase.from('plans').select('*').eq('id', up.plan_id).limit(1).single()
          const p = resp2?.data || null
          if (p) plan = p
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback: if plan_slug provided, try to load it
    if (!plan && planSlug) {
      try {
        try {
          const resp = await supabase.from('plans').select('*').eq('slug', planSlug).limit(1).single()
          const p = resp?.data || null
          if (p) plan = p
        } catch (e) {
          // ignore
        }
      } catch (e) {}
    }

    // Ensure plan is an object and apply defaults for free plan to force upgrade
    plan = plan || { slug: planSlug || 'free' }
    if (planIsFree(plan.slug)) {
      // conservative but forcing limits for free tier
      plan.max_contacts_per_campaign = Number(plan.max_contacts_per_campaign || 10)
      plan.max_concurrency = Number(plan.max_concurrency || 1)
      plan.monthly_campaign_limit = Number(plan.monthly_campaign_limit || 5)
      plan.included_minutes = Number(plan.included_minutes || 0)
    }

    // Default plan values if none
    const providerCentsPerMin = 15
    const margin = 2.0
    const perMinCents = Math.ceil(providerCentsPerMin * margin)

    const minutes = Math.ceil((contactsCount * avgCallSec) / 60)
    const includedMinutes = plan && plan.included_minutes ? Number(plan.included_minutes) : 0
    const maxContacts = plan && plan.max_contacts_per_campaign ? Number(plan.max_contacts_per_campaign) : 1000

    // Enforce monthly campaign limit (for free tier mainly)
    try {
      const startOfMonth = new Date()
      startOfMonth.setUTCDate(1); startOfMonth.setUTCHours(0,0,0,0)
      const { data: monthCampaigns, error: monthErr } = await supabase.from('campaigns').select('id').eq('user_id', userId).gte('created_at', startOfMonth.toISOString())
      const createdThisMonth = Array.isArray(monthCampaigns) ? monthCampaigns.length : 0
      const monthlyLimit = plan && Number(plan.monthly_campaign_limit) ? Number(plan.monthly_campaign_limit) : 0
      if (monthlyLimit > 0 && createdThisMonth >= monthlyLimit) {
        return res.status(403).json({ error: `Vous avez atteint la limite de ${monthlyLimit} campagnes pour ce mois. Passez à un plan payant pour supprimer cette limite.` })
      }
    } catch (e) {
      // if counting fails, allow creation (best-effort)
      console.warn('Could not check monthly campaign count:', e?.message || e)
    }

    if (maxContacts > 0 && contactsCount > maxContacts) {
      return res.status(400).json({ error: `Le plan courant limite à ${maxContacts} contacts par campagne.`, max_contacts: maxContacts })
    }

    // compute used minutes this month for user
    let usedMinutes = 0
    try {
      const startOfMonth = new Date()
      startOfMonth.setUTCDate(1); startOfMonth.setUTCHours(0,0,0,0)
      const { data: usage } = await supabase.from('usage_records').select('billed_minutes').eq('user_id', userId).gte('created_at', startOfMonth.toISOString())
      if (Array.isArray(usage)) usedMinutes = usage.reduce((s, r) => s + (Number(r.billed_minutes) || 0), 0)
    } catch (e) {}

    const remainingIncluded = Math.max(0, includedMinutes - usedMinutes)

    let overageMinutes = 0
    if (minutes > remainingIncluded) overageMinutes = minutes - remainingIncluded
    const overageCostCents = overageMinutes * perMinCents

    // sum user credits
    let creditCents = 0
    try {
      const { data: credits } = await supabase.from('user_credits').select('amount').eq('user_id', userId)
      if (Array.isArray(credits)) {
        const sum = credits.reduce((s, r) => s + (Number(r.amount) || 0), 0)
        creditCents = Math.round(sum * 100)
      }
    } catch (e) {}

    // If overage cost > available credits and plan has no included minutes covering it, reject
    if (overageCostCents > 0 && creditCents < overageCostCents) {
      const needCents = overageCostCents - creditCents
      return res.status(402).json({ error: 'Solde insuffisant pour couvrir le coût estimé de la campagne.', required_topup_cents: needCents, required_topup_usd: (needCents/100).toFixed(2) })
    }

    // Otherwise, allowed. Insert campaign and forward to create-batch (enqueue)
    const campaignRow = {
      user_id: userId,
      company_name: payload.company_name || null,
      domain: payload.domain || null,
      value_proposition: payload.promesse_de_valeur || null,
      confidence_threshold: payload.confidence_threshold || 0.7,
      agent_name: payload.agent_name || 'Agent',
      referral_name: payload.referral_name || null,
      infos: payload.infos || null,
      objectifs: payload.objectifs || null,
      contacts_count: contactsCount,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const { data: campaign, error: insertErr } = await supabase.from('campaigns').insert([campaignRow]).select().single()
    if (insertErr || !campaign) return res.status(500).json({ error: 'Could not insert campaign', details: insertErr })

    // build tasks and forward to create-batch endpoint
    const tasks = (payload.contacts || []).filter(c => c.telephone).map(c => ({
      to_number: c.telephone,
      ignore_e164_validation: false,
      retell_llm_dynamic_variables: {
        campaign_id: campaign.id,
        customer_name: c.nom || payload.contact_first_name || 'Monsieur/Madame',
        contact_company: c.entreprise || null,
        contact_email: c.email || null,
        agent_name: campaignRow.agent_name,
        company_name: campaignRow.company_name
      }
    }))

    const planMaxConcurrency = plan && plan.max_concurrency ? Number(plan.max_concurrency) : 1
    const requestedConcurrency = Math.max(1, Number(payload.reserved_concurrency || planMaxConcurrency || 1))
    const reservedConcurrency = Math.min(planMaxConcurrency, requestedConcurrency)

    const batchBody = {
      name: `Campagne ${campaignRow.company_name} - ${new Date().toISOString()}`,
      from_number: payload.from_number || process.env.VITE_RETELL_FROM_NUMBER || null,
      tasks,
      send_now: true,
      reserved_concurrency: reservedConcurrency,
      call_time_window: payload.call_time_window || { windows: [{ start: 0, end: 1440 }], timezone: payload.timezone || 'UTC' }
    }

    try {
      const resp = await axios.post(process.env.RETELL_API_URL || 'https://api.retellai.com/create-batch-call', batchBody, { headers: { Authorization: `Bearer ${process.env.RETELL_API_KEY || process.env.VITE_RETELL_API_KEY}` }, timeout: 20000 })
      // mark campaign as running or store batch id
      try { await supabase.from('campaigns').update({ status: 'running' }).eq('id', campaign.id) } catch (e) {}
      return res.status(201).json({ ok: true, campaign: campaign, retell: resp.data })
    } catch (e) {
      // enqueue fallback: insert into job_queue
      try {
        await supabase.from('job_queue').insert([{ user_id: userId, plan_slug: plan ? plan.slug : null, status: 'pending', attempts: 0, payload: batchBody }])
      } catch (qErr) {}
      return res.status(202).json({ ok: true, campaign: campaign, queued: true })
    }

  } catch (e) {
    console.error('Error in /api/create-campaign:', e)
    return res.status(500).json({ error: 'internal' })
  }
})

// Convenience top-up endpoint that accepts amount and current user and proxies to create-order
app.post('/api/topup', async (req, res) => {
  try {
    const { amount_cents, currency = 'USD', user_id, description } = req.body || {};
    if (!amount_cents || Number(amount_cents) <= 0) return res.status(400).json({ error: 'amount_cents required and must be > 0' });

    // Determine return/cancel URLs
    const frontendBase = (req && (req.headers && req.headers.origin)) || process.env.FRONTEND_URL || process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 5173}`
    const returnUrl = req.body.return_url || `${frontendBase}/topup/complete`
    const cancelUrl = req.body.cancel_url || `${frontendBase}/topup`

    // Reuse createPayPalOrder helper and include return/cancel urls
    const order = await createPayPalOrder(Number(amount_cents), currency, description || 'Top-up', returnUrl, cancelUrl);

    // Insert transaction record in billing_transactions if table exists
    if (supabase) {
      try {
        await supabase.from('billing_transactions').insert([{
          user_id: user_id || null,
          order_id: order.id,
          amount_cents: Number(amount_cents),
          currency,
          status: 'pending',
          raw_response: order
        }]);
      } catch (e) {
        console.warn('Could not insert billing_transactions record:', e.message || e);
      }
    }

    return res.json(order);
  } catch (e) {
    console.error('Error in /api/topup:', e?.response?.data || e.message || e);
    return res.status(500).json({ error: e?.message || 'internal' });
  }
});

// Return active plan for a user. Accepts ?user_id= or JSON body { user_id }
app.get('/api/user-plan', async (req, res) => {
  try {
    const userId = req.query.user_id || (req.body && req.body.user_id) || null
    if (!userId) return res.status(400).json({ error: 'user_id required' })
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
    try {
      const resp = await supabase.from('user_plans').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(1).single()
      if (resp.error) return res.status(500).json({ error: resp.error })
      return res.json({ plan: resp.data || null })
    } catch (e) {
      console.error('Error in /api/user-plan:', e)
      return res.status(500).json({ error: 'internal' })
    }
  } catch (e) {
    console.error('Error in /api/user-plan:', e)
    return res.status(500).json({ error: 'internal' })
  }
})

// Admin endpoints to list call_webhooks (audit) and link a payload to a campaign
app.get('/api/admin/call-webhooks', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
  try {
    const q = req.query.q || null
    let query = supabase.from('call_webhooks').select('*').order('created_at', { ascending: false }).limit(200)
    if (q) {
      query = supabase.from('call_webhooks').select('*').or(`call_id.ilike.%${q}%,to_number.ilike.%${q}%`).order('created_at', { ascending: false }).limit(200)
    }
    const { data, error } = await query
    if (error) return res.status(500).json({ error })
    return res.json(data || [])
  } catch (e) {
    console.error('Error listing call_webhooks:', e)
    return res.status(500).json({ error: 'internal' })
  }
})

app.post('/api/admin/link-payload', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
  try {
    const { id, campaign_id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })

    const { data: row, error: fetchErr } = await supabase.from('call_webhooks').select('*').eq('id', id).limit(1).single()
    if (fetchErr || !row) return res.status(404).json({ error: 'not found' })

    // If campaign_id provided, set it and attempt to re-process via saveCallResults
    if (campaign_id) {
      // update the row with campaign_id and then try to process
      await supabase.from('call_webhooks').update({ campaign_id }).eq('id', id)
    }

    // Attempt to re-run saveCallResults using the stored raw_payload if present
    try {
      if (row && row.raw_payload) {
        await saveCallResults(row.raw_payload)
      }
    } catch (e) {
      console.warn('Reprocessing webhook payload failed:', e.message || e)
    }

    return res.json({ ok: true })
  } catch (e) {
    console.error('Error linking payload:', e)
    return res.status(500).json({ error: 'internal' })
  }
})

// Capture an order after buyer approval
app.post('/api/paypal/capture', async (req, res) => {
  try {
    const { orderID, user_id, plan_slug } = req.body || {};
    if (!orderID) return res.status(400).json({ error: 'orderID required' });
    // Attempt capture with short retry/backoff for transient errors
    let lastErr = null
    let capture = null
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        capture = await capturePayPalOrder(orderID)
        lastErr = null
        break
      } catch (e) {
        lastErr = e
        // If the error is ORDER_NOT_APPROVED, stop retrying and return approval link
        const details = e?.response?.data?.details || []
        const hasNotApproved = Array.isArray(details) && details.some(d => d.issue === 'ORDER_NOT_APPROVED')
        if (hasNotApproved) {
          // fetch order to extract approval link
          try {
            const order = await getPayPalOrder(orderID)
            const link = (order?.links || []).find(l => l.rel === 'approve')
            console.warn('PayPal capture attempted before approval', { orderID, debug_id: e?.response?.data?.debug_id })
            return res.status(409).json({ error: 'ORDER_NOT_APPROVED', approval_link: link ? link.href : null, debug_id: e?.response?.data?.debug_id || null })
          } catch (fetchErr) {
            console.warn('Failed to fetch PayPal order for approval link', fetchErr)
            return res.status(409).json({ error: 'ORDER_NOT_APPROVED', approval_link: null, debug_id: e?.response?.data?.debug_id || null })
          }
        }

        // For other errors, wait and retry (exponential backoff)
        if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
    if (lastErr && !capture) {
      console.error('Failed to capture PayPal order after retries:', lastErr?.response?.data || lastErr?.message || lastErr)
      const status = lastErr?.response?.status || 500
      return res.status(status).json({ error: lastErr?.response?.data || lastErr?.message || 'capture_failed' })
    }

    // Update supabase transaction if present (best-effort)
    try {
      if (supabase) {
        const tableCandidates = ['billing_transactions', 'transactions', 'billing.transactions'];
        for (const tbl of tableCandidates) {
          try {
            const { data: existing } = await supabase.from(tbl).select('*').eq('order_id', orderID).limit(1).single();
            if (existing) {
              await supabase.from(tbl).update({ status: 'captured', raw_response: capture }).eq('id', existing.id);
              break;
            }
          } catch (e) {
            // try next
          }
        }
      }
    } catch (e) {
      console.warn('Non-fatal: could not update transaction after capture:', e.message || e);
    }

    // Optionally, credit the user's account here (implementation depends on schema)
    // Track whether we successfully applied a credit row so the client can know
    let credited = false
    let creditError = null
    // Track plan update
    let planUpdated = false
    let planUpdateError = null
    // Track whether we deducted subscription fee
    let deductionApplied = false
    let deductionError = null
    // If `user_id` not provided by client, attempt to look it up from a pending transaction record
    try {
      let resolvedUserId = user_id || null
      let resolvedPlanSlug = plan_slug || null
      if (supabase && !resolvedUserId) {
        try {
          let tx = null
          try {
            const resp = await supabase.from('billing_transactions').select('*').eq('order_id', orderID).limit(1).single()
            tx = resp?.data || null
          } catch (e) {
            tx = null
          }
          if (tx) {
            resolvedUserId = tx.user_id || resolvedUserId
            if (!resolvedPlanSlug && tx.meta && tx.meta.plan_slug) resolvedPlanSlug = tx.meta.plan_slug
          }
        } catch (e) {
          // ignore
        }
      }

        if (supabase && resolvedUserId) {
        const captureObj = capture?.purchase_units?.[0]?.payments?.captures?.[0] || null;
        const amount = (captureObj?.amount?.value) || null;
        const currency = (captureObj?.amount?.currency_code) || null;
        const captureId = captureObj?.id || null;
        // Prevent duplicate crediting: fetch recent credits for this user and inspect meta for order_id/capture_id
        try {
          let recentCredits = null
          try {
            const resp = await supabase.from('user_credits').select('*').eq('user_id', resolvedUserId).order('created_at', { ascending: false }).limit(50)
            recentCredits = resp?.data || null
          } catch (qe) {
            recentCredits = null
          }
          let alreadyExists = false
          if (Array.isArray(recentCredits)) {
            alreadyExists = recentCredits.some(r => {
              try {
                if (!r.meta) return false
                if (orderID && r.meta.order_id && String(r.meta.order_id) === String(orderID)) return true
                if (captureId && r.meta.capture_id && String(r.meta.capture_id) === String(captureId)) return true
                return false
              } catch (e) { return false }
            })
          }
          if (alreadyExists) {
            console.log('Skipping credit insertion: already credited for order/capture', { orderID, captureId })
          } else if (amount) {
            // If this capture is for a subscription activation (we resolved a plan slug),
            // do NOT credit `user_credits` (that would erroneously increase the user's balance).
            if (resolvedPlanSlug) {
              console.log('Capture is for subscription activation; skipping credit insert for user', resolvedUserId)
            } else {
            const creditRow = {
              user_id: resolvedUserId,
              amount: Number(amount),
              currency: currency || 'USD',
              source: 'paypal',
              meta: Object.assign({}, capture, { order_id: orderID, capture_id: captureId })
            };
            try {
              // If Supabase client is present but running with ANON key (no service role), inserts may be blocked by RLS.
              // Attempt insert and capture any error to report back to client.
              await supabase.from('user_credits').insert([creditRow]);
              credited = true
            } catch (e) {
              creditError = e.message || e
              console.warn('Could not insert user_credits row:', creditError)
            }
            }
          }
        } catch (e) {
          console.warn('Error checking/inserting user_credits idempotently:', e.message || e)
        }

        // If this capture was for a subscription activation, update user_plans
        if (resolvedPlanSlug) {
          try {
            const startsAt = new Date().toISOString()
            const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
            // upsert into user_plans: if row exists, update; else insert
            let existing = null
            try {
              const resp = await supabase.from('user_plans').select('*').eq('user_id', resolvedUserId).limit(1).single()
              existing = resp?.data || null
            } catch (e) {
              existing = null
            }
            try {
              if (existing) {
                await supabase.from('user_plans').update({ plan_slug: resolvedPlanSlug, started_at: startsAt, expires_at: expiresAt }).eq('id', existing.id)
              } else {
                await supabase.from('user_plans').insert([{ user_id: resolvedUserId, plan_slug: resolvedPlanSlug, started_at: startsAt, expires_at: expiresAt }])
              }
              planUpdated = true
            } catch (pe) {
              planUpdated = false
              planUpdateError = pe?.message || pe
              console.warn('Could not upsert user_plans after subscription capture:', planUpdateError)
            }
            // After activating subscription, attempt to deduct the subscription amount from user_credits
              try {
                // idempotent: check recent credits/charges for this order/capture
              let recent = null
              try {
                const resp = await supabase.from('user_credits').select('*').eq('user_id', resolvedUserId).order('created_at', { ascending: false }).limit(100)
                recent = resp?.data || null
              } catch (e) {
                recent = null
              }
              const alreadyDeducted = Array.isArray(recent) && recent.some(r => {
                try {
                  if (!r.meta) return false
                  if (orderID && r.meta.order_id && String(r.meta.order_id) === String(orderID) && r.source === 'subscription_charge') return true
                  if (captureId && r.meta.capture_id && String(r.meta.capture_id) === String(captureId) && r.source === 'subscription_charge') return true
                  return false
                } catch (e) { return false }
              })
                if (!alreadyDeducted && amount) {
                const deductionRow = {
                  user_id: resolvedUserId,
                  amount: -Math.abs(Number(amount)),
                  currency: currency || 'USD',
                  source: 'subscription_charge',
                  meta: Object.assign({}, capture, { order_id: orderID, capture_id: captureId })
                }
                try {
                  await supabase.from('user_credits').insert([deductionRow])
                  deductionApplied = true
                  console.log('Inserted subscription_charge (deduction) for user', resolvedUserId)
                } catch (e) {
                  deductionError = e?.message || e
                  console.warn('Could not insert subscription_charge row:', deductionError)
                }
              }
            } catch (e) {
              console.warn('Error while attempting to deduct subscription amount:', e?.message || e)
            }
          } catch (e) {
            console.warn('Could not update user_plans after subscription capture:', e.message || e)
          }
        }
      }
    } catch (e) {
      console.warn('Non-fatal: could not apply credit to user or set plan:', e.message || e);
    }

    // Return capture payload plus a small status indicating whether we applied a credit row
    return res.json({ capture, credited, credit_error: creditError, deduction_applied: deductionApplied, deduction_error: deductionError, plan_updated: planUpdated })
  } catch (err) {
    console.error('Error capturing PayPal order (unexpected):', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: err?.response?.data || err.message });
  }
});

// PayPal webhook receiver (best-effort verification)
app.post('/api/paypal/webhook', async (req, res) => {
  // Always respond quickly to PayPal
  res.status(204).send();
  try {
    const event = req.body || {};
    console.log('PayPal webhook received:', event.event_type || 'unknown');

    // Basic verification using PayPal verify-webhook-signature API if webhook id is configured
    if (PAYPAL_WEBHOOK_ID) {
      try {
        const accessToken = await getPayPalAccessToken();
        const verifyUrl = `${PAYPAL_API_HOST}/v1/notifications/verify-webhook-signature`;
        const verificationPayload = {
          auth_algo: req.headers['paypal-auth-algo'] || null,
          cert_url: req.headers['paypal-cert-url'] || null,
          transmission_id: req.headers['paypal-transmission-id'] || null,
          transmission_sig: req.headers['paypal-transmission-sig'] || null,
          transmission_time: req.headers['paypal-transmission-time'] || null,
          webhook_id: PAYPAL_WEBHOOK_ID,
          webhook_event: event
        };
        const verifyResp = await axios.post(verifyUrl, verificationPayload, { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
        if (verifyResp.data && verifyResp.data.verification_status === 'SUCCESS') {
          // proceed
        } else {
          console.warn('PayPal webhook signature could not be verified:', verifyResp.data);
        }
      } catch (e) {
        console.warn('PayPal webhook verification failed (continuing processing):', e.message || e);
      }
    }

    // Handle capture completed events to update transactions
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      try {
        const capture = event.resource;
        // Try to update transaction in supabase by capture id or order id
        if (supabase) {
          const orderId = capture?.supplementary_data?.related_ids?.order_id || capture?.invoice_id || capture?.id || null;
          const tableCandidates = ['billing_transactions', 'transactions', 'billing.transactions'];
          let resolvedTx = null
          for (const tbl of tableCandidates) {
            try {
              if (orderId) {
                const { data: existing } = await supabase.from(tbl).select('*').eq('order_id', orderId).limit(1).single();
                if (existing) {
                  resolvedTx = existing
                  await supabase.from(tbl).update({ status: 'captured', raw_response: event }).eq('id', existing.id);
                  break;
                }
              }
            } catch (e) {
              // try next
            }
          }

          // If we resolved a transaction or can extract a user, attempt to credit user_credits idempotently
          try {
            let resolvedUserId = resolvedTx?.user_id || null
            // fallback: try to find a tx in billing_transactions by order id if not resolved above
            if (!resolvedUserId && orderId) {
              try {
                const { data: row } = await supabase.from('billing_transactions').select('*').eq('order_id', orderId).limit(1).single()
                if (row) resolvedUserId = row.user_id || resolvedUserId
              } catch (e) {}
            }

            if (resolvedUserId) {
              const captureObj = capture?.purchase_units?.[0]?.payments?.captures?.[0] || capture || null;
              const amount = (captureObj?.amount?.value) || captureObj?.amount?.value || null;
              const currency = (captureObj?.amount?.currency_code) || null;
              const captureId = captureObj?.id || captureObj?.capture_id || null;

              // idempotent check
              try {
                const { data: recentCredits } = await supabase.from('user_credits').select('*').eq('user_id', resolvedUserId).order('created_at', { ascending: false }).limit(100)
                let alreadyExists = false
                if (Array.isArray(recentCredits)) {
                  alreadyExists = recentCredits.some(r => {
                    try {
                      if (!r.meta) return false
                      if (orderId && r.meta.order_id && String(r.meta.order_id) === String(orderId)) return true
                      if (captureId && r.meta.capture_id && String(r.meta.capture_id) === String(captureId)) return true
                      return false
                    } catch (e) { return false }
                  })
                }

                // determine if this transaction is for a subscription (plan meta)
                const planSlug = resolvedTx?.meta?.plan_slug || resolvedTx?.meta?.plan || null

                if (!alreadyExists && amount) {
                  if (planSlug) {
                    // Subscription activation: insert a negative deduction (idempotent)
                    const alreadyDeducted = Array.isArray(recentCredits) && recentCredits.some(r => {
                      try {
                        if (!r.meta) return false
                        if (orderId && r.meta.order_id && String(r.meta.order_id) === String(orderId) && r.source === 'subscription_charge') return true
                        if (captureId && r.meta.capture_id && String(r.meta.capture_id) === String(captureId) && r.source === 'subscription_charge') return true
                        return false
                      } catch (e) { return false }
                    })
                    if (!alreadyDeducted) {
                      const deductionRow = {
                        user_id: resolvedUserId,
                        amount: -Math.abs(Number(amount)),
                        currency: currency || 'USD',
                        source: 'subscription_charge',
                        meta: Object.assign({}, capture, { order_id: orderId, capture_id: captureId })
                      }
                      try {
                        await supabase.from('user_credits').insert([deductionRow])
                        console.log('Inserted subscription_charge (deduction) via webhook', { user: resolvedUserId, orderId, captureId })
                      } catch (e) {
                        console.warn('Could not insert subscription_charge from webhook:', e?.message || e)
                      }
                    }
                  } else {
                    const creditRow = {
                      user_id: resolvedUserId,
                      amount: Number(amount),
                      currency: currency || 'USD',
                      source: 'paypal_webhook',
                      meta: Object.assign({}, capture, { order_id: orderId, capture_id: captureId })
                    }
                    try {
                      await supabase.from('user_credits').insert([creditRow])
                      console.log('Inserted user_credits via PayPal webhook', { user: resolvedUserId, orderId, captureId })
                    } catch (e) {
                      console.warn('Could not insert user_credits from webhook:', e?.message || e)
                    }
                  }
                }
              } catch (e) {
                console.warn('Error checking/inserting user_credits from webhook:', e?.message || e)
              }

              // If transaction contained plan_meta, update user_plans
              try {
                const planSlug = resolvedTx?.meta?.plan_slug || resolvedTx?.meta?.plan || null
                if (planSlug) {
                  const startsAt = new Date().toISOString()
                  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
                  let existing = null
                  try {
                    const resp = await supabase.from('user_plans').select('*').eq('user_id', resolvedUserId).limit(1).single()
                    existing = resp?.data || null
                  } catch (e) { existing = null }
                  if (existing) {
                    await supabase.from('user_plans').update({ plan_slug: planSlug, started_at: startsAt, expires_at: expiresAt }).eq('id', existing.id)
                  } else {
                    await supabase.from('user_plans').insert([{ user_id: resolvedUserId, plan_slug: planSlug, started_at: startsAt, expires_at: expiresAt }])
                  }
                }
              } catch (e) {
                console.warn('Could not update user_plans from webhook:', e?.message || e)
              }
            }
          } catch (e) {
            console.warn('Non-fatal: could not apply credits from PayPal webhook:', e?.message || e)
          }
        }
      } catch (e) {
        console.error('Error handling PayPal webhook processing:', e);
      }
    }
  } catch (e) {
    console.error('Unhandled error in PayPal webhook handler:', e);
  }
});

// --------------------- end PayPal helpers & endpoints ------------------

// 1) Endpoint Webhook Retell
app.post("/webhook", async (req, res) => {
  const { event, call } = req.body || {};

  // Always respond quickly
  res.status(204).send();

  try {
    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!event) {
      console.warn(`WEBHOOK RECEIVED with no event field. Ignoring. ip=${remoteIp} ts=${new Date().toISOString()}`)
      return
    }
    console.log(`WEBHOOK RECEIVED: event=${event} call_id=${call?.call_id || 'n/a'} ip=${remoteIp} ts=${new Date().toISOString()}`);

    // If a RETELL_WEBHOOK_SECRET is configured, verify HMAC signature (header: x-retell-signature or x-signature)
    const secret = process.env.RETELL_WEBHOOK_SECRET || null
    if (secret) {
      try {
        const signature = req.headers['x-retell-signature'] || req.headers['x-signature'] || req.headers['x-hub-signature']
        if (!signature) {
          console.warn('Missing webhook signature header; rejecting processing')
          return
        }
        const h = crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex')
        // allow both hex and prefixed formats
        if (!(signature === h || signature.endsWith(h))) {
          console.warn('Webhook HMAC verification failed; ignoring payload')
          return
        }
      } catch (e) {
        console.warn('Webhook HMAC verification error; ignoring payload', e.message || e)
        return
      }
    }

    // Handle known events
    switch (event) {
      case "call_started":
        console.log("Call started event received", call?.call_id);
        break;
      case "call_ended":
        console.log("Call ended event received", call?.call_id);
        break;
      case "call_analyzed":
        console.log("Call analyzed event received", call?.call_id);
        await saveCallResults(call);
        break;
      default:
        console.log("Received an unknown event:", event);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
  }
});

// Server-side proxy endpoint to create a batch call on Retell
// Exportable handler for create-batch to allow in-process testing
export async function handleCreateBatch(req, res) {
  const payload = req.body || {}

  // Basic validation
  if (!payload.from_number || !Array.isArray(payload.tasks) || payload.tasks.length === 0) {
    console.warn('Invalid /create-batch payload received:', {
      from_number: !!payload.from_number,
      tasks_count: Array.isArray(payload.tasks) ? payload.tasks.length : 0
    })
    return res.status(400).json({ error: 'Missing required fields: from_number and non-empty tasks' })
  }

  const retellKey = process.env.RETELL_API_KEY || process.env.VITE_RETELL_API_KEY
// Wire the exported handler into the app for normal operation
  if (!retellKey) {
    console.error('RETELL_API_KEY is not configured on the server')
    return res.status(500).json({ error: 'Server misconfiguration: RETELL_API_KEY not set' })
  }

  // Log a sanitized summary of the request for debugging (no sensitive data)
  try {
    const taskPreview = payload.tasks.slice(0, 5).map(t => ({ to: t.to_number }))
    console.log(`Forwarding batch to Retell: name=${payload.name || '<unnamed>'} tasks=${payload.tasks.length} send_now=${payload.send_now || false} preview=${JSON.stringify(taskPreview)}`)
  } catch (e) {
    console.log('Forwarding batch (could not build preview)')
  }

  // Apply server-side defaults if missing
  if (!payload.from_number && (process.env.RETELL_FROM_NUMBER || process.env.VITE_RETELL_FROM_NUMBER)) {
    payload.from_number = process.env.VITE_RETELL_FROM_NUMBER
    console.log('Applied server default from_number')
  }
  // Fill missing override_agent_id from server env if present
  // Note: we intentionally do NOT inject override_agent_id automatically.
  // The client should provide task-level overrides when necessary. For security
  // reasons we avoid forcing an agent override here.
  // Default send_now to true if not set
  if (typeof payload.send_now === 'undefined') payload.send_now = true
  // Enqueue the batch into the queue system to respect concurrency limits
  try {
    const enqueueResp = await enqueueBatchJob(payload)
    console.log('Enqueued batch job:', enqueueResp)
    return res.status(202).json({ queued: true, job: enqueueResp })
  } catch (e) {
    console.error('Failed to enqueue batch job, falling back to direct forward:', e?.message || e)
    // Fallback to direct forwarding if enqueue fails
    try {
      const resp = await axios.post(process.env.RETELL_API_URL || 'https://api.retellai.com/create-batch-call', payload, {
        headers: {
          Authorization: `Bearer ${retellKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      })
      console.log('Retell responded (fallback):', { status: resp.status, batch_call_id: resp.data?.batch_call_id })
      return res.status(resp.status).json(resp.data)
    } catch (err) {
      console.error('Error calling Retell create-batch-call (fallback):', err?.response?.status, err?.response?.data || err.message)
      const status = err?.response?.status || 500
      const data = err?.response?.data || { error: err.message }
      return res.status(status).json(data)
    }
  }
}

// Expose create-batch endpoint so clients (and `scripts/test-create-batch.js`) can call it
app.post('/create-batch', handleCreateBatch)

// Endpoint pour recevoir les logs clients (envoyés depuis le front)
app.post('/client-log', (req, res) => {
  try {
    const payload = req.body || {}
    // Afficher les logs côté serveur (render.com / stdout)
    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const ts = new Date().toISOString()
    // Log a short summary to avoid huge bodies flooding the logs
    const short = {
      ts,
      ip: remoteIp,
      message: payload.message || null,
      meta: payload.meta || null
    }
    console.log('CLIENT-LOG:', JSON.stringify(short))
  } catch (e) {
    console.error('Erreur lors du traitement du client-log:', e)
  }
  // Répondre rapidement
  res.status(204).send()
})

// Simple ping endpoint to verify the server is reachable and logs are visible
app.get('/client-log-ping', (_req, res) => {
  const ts = new Date().toISOString()
  console.log(`CLIENT-LOG-PING: received at ${ts}`)
  res.status(204).send()
})

// Fonction pour sauvegarder les résultats d'appel dans Supabase
async function saveCallResults(call) {
  if (!supabase || !call) {
    console.warn("Supabase not configured or call data missing");
    return;
  }

  try {
    // Extraire les données du call
    const {
      call_id,
      to_number,
      from_number,
      start_timestamp,
      end_timestamp,
      duration_ms,
      transcript,
      disconnection_reason,
      retell_llm_dynamic_variables = {},
      call_analysis = {}
    } = call || {};

    // Calculer la durée en secondes
    const callDuration = duration_ms ? Math.floor(duration_ms / 1000) : null;
    const durationFromTimestamps = start_timestamp && end_timestamp
      ? Math.floor((end_timestamp - start_timestamp) / 1000)
      : null;
    const finalDuration = callDuration || durationFromTimestamps || 0;

    // Déterminer le statut basé sur call_analysis ou disconnection_reason
    let status = "contacted";
    if (call_analysis.call_successful === true) {
      status = "interested";
    } else if (call_analysis.call_successful === false) {
      status = "not_interested";
    } else if (disconnection_reason === "dial_failed" || disconnection_reason === "dial_no_answer") {
      status = "failed";
    }

    // Extraire les notes depuis call_analysis
    const notes = call_analysis.call_summary || transcript?.substring(0, 500) || null;

    // Récupérer les infos du contact depuis retell_llm_dynamic_variables
    const contactName = retell_llm_dynamic_variables.customer_name || 
                        retell_llm_dynamic_variables.contact_first_name || 
                        null;
    const contactEmail = retell_llm_dynamic_variables.contact_email || null;
    const contactCompany = retell_llm_dynamic_variables.contact_company || null;
    const campaignId = retell_llm_dynamic_variables.campaign_id || null;

    // Insérer ou mettre à jour le résultat dans campaign_results
    const resultData = {
      campaign_id: campaignId,
      call_id: call_id || null,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: to_number,
      contact_company: contactCompany,
      status: status,
      notes: notes,
      call_duration: finalDuration,
      confidence_score: call_analysis.call_successful ? 0.8 : 0.3,
      raw_payload: call // store full payload (jsonb)
    };

    // If campaignId is missing, store the full payload in a fallback audit table
    if (!campaignId) {
      try {
        const { data: auditData, error: auditErr } = await supabase
          .from('call_webhooks')
          .insert([{
            call_id: call_id || null,
            to_number: to_number || null,
            from_number: from_number || null,
            event_type: 'call_analyzed',
            raw_payload: call
          }])
          .select()
          .single();

        if (auditErr) {
          console.error('Error saving to call_webhooks audit table:', auditErr);
        } else {
          console.log('Saved webhook payload to call_webhooks (no campaign_id):', auditData.id);
        }
      } catch (e) {
        console.error('Exception while saving to call_webhooks:', e);
      }

      // Do not attempt to insert into campaign_results without campaignId
      return;
    }

    // Vérifier si un résultat existe déjà pour ce call_id (via contact_phone + campaign_id)
    // Si oui, on met à jour, sinon on insère
    // Try to find an existing result by call_id first (if available), otherwise fallback to phone+campaign
    let existingResult = null
    if (call_id) {
      const { data: byCall, error: byCallErr } = await supabase
        .from('campaign_results')
        .select('id')
        .eq('call_id', call_id)
        .single()
      if (!byCallErr && byCall) existingResult = byCall
    }
    if (!existingResult) {
      const { data: byPhone } = await supabase
        .from('campaign_results')
        .select('id')
        .eq('contact_phone', to_number)
        .eq('campaign_id', campaignId)
        .single()
      if (byPhone) existingResult = byPhone
    }

    let data, error;
    if (existingResult) {
      // Mettre à jour le résultat existant
      ({ data, error } = await supabase
        .from('campaign_results')
        .update(resultData)
        .eq('id', existingResult.id)
        .select()
        .single());
    } else {
      // Insérer un nouveau résultat
      ({ data, error } = await supabase
        .from('campaign_results')
        .insert([resultData])
        .select()
        .single());
    }

    if (error) {
      console.error("Error saving call results:", error);
    } else {
      console.log("Call results saved successfully:", data.id);
      try {
        // After successfully saving a call result, record usage for billing and attempt to auto-complete the campaign
        let campaignRow = null
        if (campaignId) {
          const { data: cRow, error: cErr } = await supabase
            .from('campaigns')
            .select('id, contacts_count, status, user_id')
            .eq('id', campaignId)
            .single();
          if (!cErr && cRow) campaignRow = cRow

          // Create a usage_records entry for billing
          try {
            const billedMinutes = Math.ceil((finalDuration || 0) / 60)
            const providerCentsPerMin = 17
            const margin = 1.30
            const perMinCents = Math.ceil(providerCentsPerMin * margin)
            const costCents = billedMinutes * perMinCents

            const usageRow = {
              user_id: campaignRow ? campaignRow.user_id : null,
              campaign_id: campaignId,
              call_id: call_id || null,
              duration_seconds: finalDuration || 0,
              billed_minutes: billedMinutes,
              cost_cents: costCents
            }

            const { data: urData, error: urErr } = await supabase
              .from('usage_records')
              .insert([usageRow])
              .select()
              .single()

            if (urErr) console.error('Error inserting usage_record:', urErr)
            else console.log('Inserted usage_record:', urData.id)
          } catch (e) {
            console.error('Exception while inserting usage_record:', e)
          }

          // Now check campaign completion
          if (campaignRow) {
            const { data: resultsCountData } = await supabase
              .from('campaign_results')
              .select('id')
              .eq('campaign_id', campaignId)

            const resultsCount = Array.isArray(resultsCountData) ? resultsCountData.length : 0;
            const contactsCount = campaignRow.contacts_count || 0;

            if (contactsCount > 0 && resultsCount >= contactsCount && campaignRow.status !== 'completed') {
              const { error: updateErr } = await supabase
                .from('campaigns')
                .update({ status: 'completed' })
                .eq('id', campaignId);

              if (updateErr) console.error('Error auto-updating campaign status:', updateErr);
              else console.log('Campaign auto-marked as completed:', campaignId);
            }
          }
        }
      } catch (e) {
        console.error('Error while attempting to record usage / auto-complete campaign:', e);
      }
    }
  } catch (error) {
    console.error("Error in saveCallResults:", error);
  }
}

// 2) Servir le front Vite buildé (dossier dist)
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// 3) Fallback SPA : toutes les routes front renvoient index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Webhook endpoint available at http://localhost:${PORT}/webhook`);
});

