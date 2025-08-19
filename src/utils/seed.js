const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");

const SECRET = "test_secret";

const mockDir = path.join(__dirname, "../../mock_payloads");

const files = fs.readdirSync(mockDir).filter(f => f.endsWith(".json"));

function generateSignature(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

async function seed() {
  for (const file of files) {
    const filePath = path.join(mockDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // handle arrays vs single objects
    const events = Array.isArray(data) ? data : [data];

    for (const evt of events) {
      const payload = JSON.stringify(evt);
      const signature = generateSignature(payload);

      try {
        const res = await axios.post("http://localhost:8000/webhook/payments", payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Razorpay-Signature": signature
          }
        });
        console.log(`✅ Seeded via API [${file}] →`, res.data);
      } catch (err) {
        console.error(`❌ Failed seeding [${file}]`, err.response?.data || err.message);
      }
    }
  }
}


seed();
