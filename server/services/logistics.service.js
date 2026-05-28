'use strict';

const env = require('../config/env');
const GatePass = require('../models/gatePass.model');
const Event = require('../models/event.model');
const { DomainError } = require('../utils/domainError');
const { findConfirmedRsvp } = require('./rsvp.service');
const { sign, verifySignature, toQrPayload } = require('../utils/gatePassSigner');

const PASS_ISSUABLE_EVENT_STATUSES = ['APPROVED', 'PUBLISHED', 'ONGOING'];

async function issueGatePass(eventId, userId) {
  const event = await Event.findById(eventId).lean();
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');
  if (!PASS_ISSUABLE_EVENT_STATUSES.includes(event.status)) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `gate pass cannot be issued for event in status ${event.status}`
    );
  }

  const rsvp = await findConfirmedRsvp(userId, eventId);
  if (!rsvp) {
    throw new DomainError(
      'FORBIDDEN',
      'a confirmed RSVP is required before a gate pass can be issued'
    );
  }

  const existing = await GatePass.findOne({ userId, eventId });
  if (existing && existing.status === 'ISSUED' && existing.expiresAt > new Date()) {
    return { pass: existing, qr: toQrPayload(existing) };
  }

  const issuedAt = new Date();
  const expiresAt = new Date(event.endTime);
  // Cap expiry — never more than GATE_PASS_TTL_HOURS past event start.
  const ttlExpiry = new Date(
    new Date(event.startTime).getTime() + env.GATE_PASS_TTL_HOURS * 3600 * 1000
  );
  if (ttlExpiry < expiresAt) expiresAt.setTime(ttlExpiry.getTime());

  // Build the document and sign its canonical projection.
  const draft = new GatePass({ eventId, userId, issuedAt, expiresAt, signature: 'pending' });
  draft.signature = sign({
    passId: draft.passId,
    eventId: draft.eventId,
    userId: draft.userId,
    issuedAt: draft.issuedAt,
    expiresAt: draft.expiresAt,
  });

  try {
    if (existing) {
      // Refresh the existing record (revoked/expired) instead of inserting a new one.
      existing.passId = draft.passId;
      existing.txnTrackId = draft.txnTrackId;
      existing.issuedAt = draft.issuedAt;
      existing.expiresAt = draft.expiresAt;
      existing.signature = draft.signature;
      existing.status = 'ISSUED';
      existing.consumedAt = undefined;
      await existing.save();
      return { pass: existing, qr: toQrPayload(existing) };
    }
    const saved = await draft.save();
    return { pass: saved, qr: toQrPayload(saved) };
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'gate pass already exists for this user/event');
    }
    throw err;
  }
}

/**
 * Offline verification. The QR payload is self-contained; this function
 * checks (a) signature validity, (b) expiry. It does NOT require a DB read
 * — useful at the venue gate where connectivity may be flaky.
 *
 * `withRecord = true` cross-references the DB for live status (REVOKED, CONSUMED).
 */
async function verifyGatePass(qr, { withRecord = true } = {}) {
  const sigOk = verifySignature(
    {
      passId: qr.passId,
      eventId: qr.eventId,
      userId: qr.userId,
      issuedAt: qr.issuedAt,
      expiresAt: qr.expiresAt,
    },
    qr.sig
  );
  if (!sigOk) {
    return { valid: false, reason: 'invalid signature' };
  }

  const now = new Date();
  if (new Date(qr.expiresAt) <= now) {
    return { valid: false, reason: 'pass expired' };
  }

  if (!withRecord) {
    return { valid: true, reason: 'signature ok (offline)', pass: null };
  }

  const pass = await GatePass.findOne({ passId: qr.passId });
  if (!pass) return { valid: false, reason: 'pass not found' };
  if (pass.status !== 'ISSUED') {
    return { valid: false, reason: `pass status is ${pass.status}` };
  }
  return { valid: true, reason: 'ok', pass };
}

async function consumeGatePass(passId) {
  const pass = await GatePass.findOneAndUpdate(
    { passId, status: 'ISSUED', expiresAt: { $gt: new Date() } },
    { $set: { status: 'CONSUMED', consumedAt: new Date() } },
    { new: true }
  );
  if (!pass) {
    throw new DomainError('VALIDATION_ERROR', 'pass not consumable (missing, expired, or already used)');
  }
  return pass;
}

module.exports = { issueGatePass, verifyGatePass, consumeGatePass };
