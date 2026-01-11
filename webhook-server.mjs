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

app.use(express.json());

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

    // Return the order data to the client (client will redirect to approval link)
    return res.json(order);
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

    const frontendBase = process.env.FRONTEND_URL || process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 5173}`
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

// Convenience top-up endpoint that accepts amount and current user and proxies to create-order
app.post('/api/topup', async (req, res) => {
  try {
    const { amount_cents, currency = 'USD', user_id, description } = req.body || {};
    if (!amount_cents || Number(amount_cents) <= 0) return res.status(400).json({ error: 'amount_cents required and must be > 0' });

    // Determine return/cancel URLs
    const frontendBase = process.env.FRONTEND_URL || process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 5173}`
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
    const capture = await capturePayPalOrder(orderID);

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
    // Best-effort: if `user_id` provided and a `user_credits` table exists, insert credit row.
    try {
      if (supabase && user_id) {
        const amount = (capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value) || null;
        const currency = (capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code) || null;
        if (amount) {
          const creditRow = {
            user_id,
            amount: Number(amount),
            currency: currency || 'USD',
            source: 'paypal',
            meta: capture
          };
          try {
            await supabase.from('user_credits').insert([creditRow]);
          } catch (e) {
            // ignore if table doesn't exist
          }
        }

        // If this capture was for a subscription activation, update user_plans
        if (plan_slug) {
          try {
            const startsAt = new Date().toISOString()
            const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
            // upsert into user_plans: if row exists, update; else insert
            const { data: existing } = await supabase.from('user_plans').select('*').eq('user_id', user_id).limit(1).single().catch(() => ({ data: null }))
            if (existing) {
              await supabase.from('user_plans').update({ plan_slug, started_at: startsAt, expires_at: expiresAt }).eq('id', existing.id)
            } else {
              await supabase.from('user_plans').insert([{ user_id, plan_slug, started_at: startsAt, expires_at: expiresAt }])
            }
          } catch (e) {
            console.warn('Could not update user_plans after subscription capture:', e.message || e)
          }
        }
      }
    } catch (e) {
      console.warn('Non-fatal: could not apply credit to user or set plan:', e.message || e);
    }

    return res.json(capture);
  } catch (err) {
    console.error('Error capturing PayPal order:', err?.response?.data || err.message || err);
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
          for (const tbl of tableCandidates) {
            try {
              if (orderId) {
                const { data: existing } = await supabase.from(tbl).select('*').eq('order_id', orderId).limit(1).single();
                if (existing) {
                  await supabase.from(tbl).update({ status: 'captured', raw_response: event }).eq('id', existing.id);
                  break;
                }
              }
            } catch (e) {
              // try next
            }
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

  // Toujours répondre rapidement (204) pour ne pas faire timeout Retell
  try {
    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`WEBHOOK RECEIVED: event=${event || 'unknown'} call_id=${call?.call_id || 'n/a'} ip=${remoteIp} ts=${new Date().toISOString()}`);
  } catch (e) {
    console.log('WEBHOOK RECEIVED (logging failed)')
  }
  res.status(204).send();

  // Traitement asynchrone après la réponse
  try {
    switch (event) {
      case "call_started":
        console.log("Call started event received", call?.call_id);
        // Optionnel : mettre à jour le statut de la campagne en "running"
        break;

      case "call_ended":
        console.log("Call ended event received", call?.call_id);
        // call_ended contient toutes les données SAUF call_analysis
        // On attend call_analyzed pour avoir les données complètes
        break;

      case "call_analyzed":
        console.log("Call analyzed event received", call?.call_id);
        // call_analyzed contient TOUTES les données, y compris call_analysis
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

