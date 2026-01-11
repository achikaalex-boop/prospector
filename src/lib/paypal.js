// Client helper (browser) to call server endpoints for PayPal top-up flow
import axios from 'axios';

export async function createOrder(amountCents, currency = 'USD', description = 'Top-up') {
  const resp = await axios.post('/api/topup', { amount_cents: amountCents, currency, description });
  return resp.data;
}

export async function captureOrder(orderID, userId, planSlug = null) {
  const body = { orderID, user_id: userId }
  if (planSlug) body.plan_slug = planSlug
  const resp = await axios.post('/api/paypal/capture', body).catch(err => { throw err })
  return resp.data;
}

export default { createOrder, captureOrder };
