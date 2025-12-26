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

// Client Supabase pour le webhook (utilise les mêmes variables d'env que le front)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 1) Endpoint Webhook Retell
app.post("/webhook", async (req, res) => {
  const { event, call } = req.body || {};

  // Toujours répondre rapidement (204) pour ne pas faire timeout Retell
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

  // Forward request to Retell API
  try {
    const resp = await axios.post(process.env.RETELL_API_URL || 'https://api.retellai.com/create-batch-call', payload, {
      headers: {
        Authorization: `Bearer ${retellKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    })

    // Log the response summary
    console.log('Retell responded:', { status: resp.status, batch_call_id: resp.data?.batch_call_id, tasks_url: resp.data?.tasks_url })

    // Pass through the Retell response body and status
    return res.status(resp.status).json(resp.data)
  } catch (err) {
    console.error('Error calling Retell create-batch-call:', err?.response?.status, err?.response?.data || err.message)
    const status = err?.response?.status || 500
    const data = err?.response?.data || { error: err.message }
    return res.status(status).json(data)
  }
}

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
    } = call;

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
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: to_number,
      contact_company: contactCompany,
      status: status,
      notes: notes,
      call_duration: finalDuration,
      confidence_score: call_analysis.call_successful ? 0.8 : 0.3,
    };

    // Vérifier si un résultat existe déjà pour ce call_id (via contact_phone + campaign_id)
    // Si oui, on met à jour, sinon on insère
    const { data: existingResult } = await supabase
      .from("campaign_results")
      .select("id")
      .eq("contact_phone", to_number)
      .eq("campaign_id", campaignId)
      .single();

    let data, error;
    if (existingResult) {
      // Mettre à jour le résultat existant
      ({ data, error } = await supabase
        .from("campaign_results")
        .update(resultData)
        .eq("id", existingResult.id)
        .select()
        .single());
    } else {
      // Insérer un nouveau résultat
      ({ data, error } = await supabase
        .from("campaign_results")
        .insert([resultData])
        .select()
        .single());
    }

    if (error) {
      console.error("Error saving call results:", error);
    } else {
      console.log("Call results saved successfully:", data.id);
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

