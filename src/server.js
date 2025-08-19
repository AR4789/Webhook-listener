// src/server.js
require('dotenv').config();
const express = require('express');
const db = require('./db');
const { verifySignature } = require('./utils/signature');
const { parseEvent } = require('./utils/parseEvent');
const Ajv = require("ajv");
const paymentEventSchema = require("./utils/paymentEventSchema");
const ajv = new Ajv();

const app = express();
const validate = ajv.compile(paymentEventSchema);


app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true, db: 'sqlite', message: 'Server is up' });
});

app.post('/webhook/payments', (req, res) => {
  try {

     const validJson = validate(req.body);
  if (!validJson) {
    return res.status(400).json({ 
      error: "Invalid event format", 
      details: validate.errors 
    });
  }

    const signature = req.header('X-Razorpay-Signature');
    const secret = process.env.SHARED_SECRET || 'test_secret';

    const valid = verifySignature({
      secret,
      rawBody: req.rawBody,
      providedSignature: signature
    });
    if (!valid) {
      return res.status(403).json({ error: 'Invalid or missing signature' });
    }

    // Parse fields from payload
    const payload = req.body;
    const { event_type, event_id, payment_id } = parseEvent(payload);

    // Store full payload
    const insert = db.prepare(`
      INSERT INTO payment_events (event_id, payment_id, event_type, payload)
      VALUES (@event_id, @payment_id, @event_type, @payload)
      ON CONFLICT(event_id) DO NOTHING
    `);

    const info = insert.run({
      event_id,
      payment_id,
      event_type,
      payload: JSON.stringify(payload)
    });

    if (info.changes === 0) {
      return res.status(200).json({
        status: 'duplicate_ignored',
        message: 'Event already processed',
        event_id
      });
    }

    return res.status(200).json({
      status: 'processed',
      event_id,
      payment_id,
      event_type
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Bad Request' });
  }
});

app.get('/payments/:payment_id/events', (req, res) => {
  const { payment_id } = req.params;

  const rows = db.prepare(`
    SELECT event_type, received_at
    FROM payment_events
    WHERE payment_id = ?
    ORDER BY datetime(received_at) ASC
  `).all(payment_id);

  return res.json(rows);
});


app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  return res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
