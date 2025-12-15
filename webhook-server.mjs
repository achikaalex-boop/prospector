import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Optionnel : si tu utilises réellement le SDK Retell plus tard
// import { Retell } from "retell-sdk";

const app = express();
const PORT = process.env.PORT || 8080;

// __dirname en mode ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// 1) Endpoint Webhook Retell
app.post("/webhook", (req, res) => {
  const { event, call } = req.body || {};

  switch (event) {
    case "call_started":
      console.log("Call started event received", call?.call_id);
      break;
    case "call_ended":
      console.log("Call ended event received", call?.call_id);
      break;
    case "call_analyzed":
      console.log("Call analyzed event received", call?.call_id);
      break;
    default:
      console.log("Received an unknown event:", event);
  }

  // Accuser réception de l'événement (comme dans la doc Retell)
  res.status(204).send();
});

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

