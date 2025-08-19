# API Documentation

This service listens for payment webhooks and stores them in SQLite.  
All requests are JSON-based.

---

## POST /webhook/payments

Accepts a single payment event (authorized, captured, failed).

### Headers
- `Content-Type: application/json`
- `X-Razorpay-Signature: <HMAC signature>`

### Body (example)
```json
{
  "event": "payment.captured",
  "id": "evt_cap_004",
  "created_at": 1751886985,
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_004",
        "status": "captured",
        "amount": 4000,
        "currency": "INR"
      }
    }
  }
}
```

### Responses
- **200 OK**
```json
{ "status":"processed","event_id":"evt_cap_004","payment_id":"pay_004","event_type":"payment.captured" }
```

- **400 Bad Request**
```json
{ "error": "Invalid event format", "details": [...] }
```

- **401 Unauthorized**
```json
{ "error": "Invalid or missing signature" }
```

- **409 Conflict**
```json
{ "status":"duplicate_ignored","event_id":"evt_cap_004" }
```

---

## GET /payments/:payment_id/events

Fetches all events for a given payment, sorted by time.

### Example
```bash
curl http://localhost:8000/payments/pay_004/events
```

### Response
```json
[
  { "event_type":"payment.authorized","received_at":"2025-08-18T12:00:00Z" },
  { "event_type":"payment.captured","received_at":"2025-08-18T12:01:30Z" }
]
```

If no events exist:
```json
[]
```