module.exports = {
  type: "object",
  required: ["event", "payload", "created_at", "id"],
  properties: {
    event: {
      type: "string",
      enum: ["payment.authorized", "payment.captured", "payment.failed"]
    },
    id: { type: "string" },
    created_at: { type: "integer" },
    payload: {
      type: "object",
      required: ["payment"],
      properties: {
        payment: {
          type: "object",
          required: ["entity"],
          properties: {
            entity: {
              type: "object",
              required: ["id", "status", "amount", "currency"],
              properties: {
                id: { type: "string" },
                status: { 
                  type: "string", 
                  enum: ["authorized", "captured", "failed"] 
                },
                amount: { type: "integer" },
                currency: { type: "string" }
              }
            }
          }
        }
      }
    }
  },
  additionalProperties: false
};
