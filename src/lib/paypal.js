// Client helper (browser) to call server endpoints for PayPal top-up flow
import axios from 'axios';

export async function createOrder(amountCents, currency = 'USD', description = 'Top-up') {
  const resp = await axios.post('/api/topup', { amount_cents: amountCents, currency, description });
  return resp.data;
}

export async function captureOrder(orderID, userId) {
  const resp = await axios.post('/api/paypal/capture', { orderID, user_id: userId });
  return resp.data;
}

export default { createOrder, captureOrder };
