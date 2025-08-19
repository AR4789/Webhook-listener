// src/utils/parseEvent.js
function safeGet(obj, path, fallback = undefined) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
}

function parseEvent(payload) {
  if (payload && typeof payload === 'object' && payload.event && payload.payload) {
    const event_type = payload.event; // e.g., "payment.captured"
    const event_id = payload.id;
    const payment_id = safeGet(payload, 'payload.payment.entity.id');
    if (!event_type || !event_id || !payment_id) {
      throw new Error('Missing required fields in Razorpay payload');
    }
    return { event_type, event_id, payment_id };
  }

  if (payload && typeof payload === 'object' && payload.event_type && payload.id) {
    const event_type = payload.event_type;
    const event_id = payload.id;
    const payment_id =
      safeGet(payload, 'resource.id') ||
      safeGet(payload, 'resource.supplementary_data.related_ids.payment_id');
    if (!payment_id) throw new Error('Missing payment_id in PayPal payload');
    return { event_type, event_id, payment_id };
  }

  throw new Error('Unsupported payload format');
}

module.exports = { parseEvent };
