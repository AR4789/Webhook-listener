# Payment Webhook Listener

A Node.js + Express app that listens to payment webhooks, validates them, and stores events in SQLite.

## Setup
```bash
git clone https://github.com/AR4789/Webhook-listener.git
cd payment-webhook-listener
npm install
npm start
```

Server runs on `http://localhost:8000`.

## Testing

### Get a Valid SIgnature
```bash
node -e "const fs=require('fs');const crypto=require('crypto');const b=fs.readFileSync('mock_payloads/payment_authorized.json');const s=crypto.createHmac('sha256','test_secret').update(b).digest('hex');console.log(s)"
```


### Send an event
```bash
curl -X POST http://localhost:8000/webhook/payments   -H "Content-Type: application/json"   -H "X-Razorpay-Signature: <VALID_SIGNATURE>"   --data-binary @mock_payloads/payment_authorized.json
```

### Fetch events
```bash
curl http://localhost:8000/payments/pay_001/events
```

## Optional: Seeding Mock Data

For convenience, a `seed.js` script is provided.  
It will automatically read all JSON files(Single or Array of events) in `mock_payloads/`, generate valid signatures, and send them through the `/webhook/payments` endpoint so they are stored in the database.

Run:
```bash
npm run seed
```

## Project Structure
```
mock_payloads/   # sample payloads for testing
src/             # express app code
src/utils        # utilities used 
README.md        # setup instructions
DOCS.md          # api documentation
```


## Notes
- Uses SQLite for easy local setup; can switch to PostgreSQL by changing DB config.
- Use Postman or curl to simulate webhook events.
- Replace payload file name according to data being processed.
- Idempotency is enforced by `UNIQUE(event_id)`.
- Shared secret for signature validation is `test_secret`.
- Invalid signatures or invalid event formats are rejected.
