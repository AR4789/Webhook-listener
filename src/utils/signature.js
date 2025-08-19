// src/utils/signature.js
const crypto = require('crypto');

function computeHmacSha256(secret, rawBuffer) {
  return crypto.createHmac('sha256', secret).update(rawBuffer).digest('hex');
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifySignature({ secret, rawBody, providedSignature }) {
  if (!providedSignature) return false;
  const expected = computeHmacSha256(secret, rawBody || Buffer.from(''));
  return timingSafeEqual(providedSignature, expected);
}

module.exports = { verifySignature, computeHmacSha256 };
