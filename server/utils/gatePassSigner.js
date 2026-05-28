'use strict';

const crypto = require('crypto');
const env = require('../config/env');

/**
 * Canonical projection used for HMAC computation. ALL fields must be
 * stable across machines (no insertion order, no implicit number→string).
 * Any field added here must also be added on the verify side and the
 * QR payload — otherwise existing passes stop verifying.
 *
 * `holder` works for both pass kinds: { holderType, holderId }.
 */
function canonicalPayload(p) {
  return JSON.stringify({
    passId: p.passId,
    eventId: String(p.eventId),
    holderType: p.holderType,
    holderId: String(p.holderId),
    issuedAt: new Date(p.issuedAt).toISOString(),
    expiresAt: new Date(p.expiresAt).toISOString(),
  });
}

function sign(p, secret = env.GATE_PASS_HMAC_SECRET) {
  return crypto.createHmac('sha256', secret).update(canonicalPayload(p)).digest('hex');
}

function verifySignature(p, signature, secret = env.GATE_PASS_HMAC_SECRET) {
  if (typeof signature !== 'string' || signature.length === 0) return false;
  const expected = sign(p, secret);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * QR payload — exactly what a scanner reads. Self-contained so verification
 * can succeed offline against a known HMAC secret.
 */
function toQrPayload(pass) {
  const holderId = String(pass.holderType === 'GUEST' ? pass.guestId : pass.userId);
  return {
    v: 1,
    passId: pass.passId,
    eventId: String(pass.eventId),
    holderType: pass.holderType,
    holderId,
    issuedAt: new Date(pass.issuedAt).toISOString(),
    expiresAt: new Date(pass.expiresAt).toISOString(),
    sig: pass.signature,
  };
}

module.exports = { sign, verifySignature, toQrPayload, canonicalPayload };
