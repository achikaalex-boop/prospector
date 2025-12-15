import express from "express";
// Optionnel : si tu utilises réellement le SDK Retell plus tard
// import { Retell } from "retell-sdk";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Endpoint Webhook Retell
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

app.listen(PORT, () => {
  console.log(`Retell webhook listening on http://localhost:${PORT}/webhook`);
});


