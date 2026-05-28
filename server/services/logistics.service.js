'use strict';

const crypto = require('crypto');
const env = require('../config/env');
const GatePass = require('../models/gatePass.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const Guest = require('../models/guest.model');
const { DomainError } = require('../utils/domainError');
const { findConfirmedRsvp } = require('./rsvp.service');
const { sign, verifySignature, toQrPayload } = require('../utils/gatePassSigner');

const PASS_ISSUABLE_EVENT_STATUSES = ['APPROVED', 'PUBLISHED', 'ONGOING'];
const HOUR_MS = 3600 * 1000;

function passExpiry(event) {
  const expiresAt = new Date(event.endTime);
  const ttlExpiry = new Date(new Date(event.startTime).getTime() + env.GATE_PASS_TTL_HOURS * HOUR_MS);
  if (ttlExpiry < expiresAt) expiresAt.setTime(ttlExpiry.getTime());
  return expiresAt;
}

async function loadIssuableEvent(eventId) {
  const event = await Event.findById(eventId).lean();
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');
  if (!PASS_ISSUABLE_EVENT_STATUSES.includes(event.status)) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `gate pass cannot be issued for event in status ${event.status}`
    );
  }
  return event;
}

/**
 * Core signer/persister shared by student and guest passes. `holder` is
 * { holderType, userId | guestId }. Reuses an existing record for the same
 * (holder, event) by refreshing it, so re-issuing is idempotent.
 */
async function upsertPass(event, holder) {
  const filter =
    holder.holderType === 'GUEST'
      ? { guestId: holder.guestId, eventId: event._id }
      : { userId: holder.userId, eventId: event._id };

  const existing = await GatePass.findOne(filter);
  if (existing && existing.status === 'ISSUED' && existing.expiresAt > new Date()) {
    return { pass: existing, qr: toQrPayload(existing) };
  }

  const issuedAt = new Date();
  const expiresAt = passExpiry(event);
  const draft = existing || new GatePass({ eventId: event._id, ...holder });

  draft.holderType = holder.holderType;
  draft.userId = holder.userId;
  draft.guestId = holder.guestId;
  draft.issuedAt = issuedAt;
  draft.expiresAt = expiresAt;
  draft.status = 'ISSUED';
  draft.consumedAt = undefined;
  if (existing) {
    // fresh ids on re-issue
    draft.passId = crypto.randomUUID();
    draft.txnTrackId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }
  draft.signature = sign({
    passId: draft.passId,
    eventId: draft.eventId,
    holderType: draft.holderType,
    holderId: holder.holderType === 'GUEST' ? holder.guestId : holder.userId,
    issuedAt: draft.issuedAt,
    expiresAt: draft.expiresAt,
  });

  try {
    const saved = await draft.save();
    return { pass: saved, qr: toQrPayload(saved) };
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'a gate pass already exists for this holder/event');
    }
    throw err;
  }
}

/**
 * Student self-issue (or organizer-on-behalf): requires a confirmed RSVP.
 */
async function issueGatePass(eventId, userId) {
  const event = await loadIssuableEvent(eventId);
  const rsvp = await findConfirmedRsvp(userId, eventId);
  if (!rsvp) {
    throw new DomainError('FORBIDDEN', 'a confirmed RSVP is required before a gate pass can be issued');
  }
  return upsertPass(event, { holderType: 'STUDENT', userId });
}

/**
 * Guest pass — issued by an organizer/admin who has added the guest to the event.
 */
async function issueGuestPass(eventId, guestId) {
  const event = await loadIssuableEvent(eventId);
  const guest = await Guest.findById(guestId).lean();
  if (!guest) throw new DomainError('NOT_FOUND', 'guest not found');
  return upsertPass(event, { holderType: 'GUEST', guestId });
}

/**
 * Revoke a holder's pass for an event (used when removing them from the event).
 */
async function revokePassFor(eventId, { userId, guestId } = {}) {
  const filter = guestId ? { guestId, eventId } : { userId, eventId };
  return GatePass.deleteOne(filter);
}

/**
 * Offline-capable verification. Checks signature + expiry from the QR alone;
 * with `withRecord` also confirms live DB status and resolves the holder name.
 */
async function verifyGatePass(qr, { withRecord = true } = {}) {
  const sigOk = verifySignature(
    {
      passId: qr.passId,
      eventId: qr.eventId,
      holderType: qr.holderType,
      holderId: qr.holderId,
      issuedAt: qr.issuedAt,
      expiresAt: qr.expiresAt,
    },
    qr.sig
  );
  if (!sigOk) return { valid: false, reason: 'invalid signature' };

  if (new Date(qr.expiresAt) <= new Date()) {
    return { valid: false, reason: 'pass expired' };
  }

  if (!withRecord) {
    return { valid: true, reason: 'signature ok (offline)', pass: null };
  }

  const pass = await GatePass.findOne({ passId: qr.passId });
  if (!pass) return { valid: false, reason: 'pass not found' };
  if (pass.status !== 'ISSUED') return { valid: false, reason: `pass status is ${pass.status}` };

  const holder = await resolveHolder(pass);
  return { valid: true, reason: 'ok', pass, holder };
}

async function resolveHolder(pass) {
  if (pass.holderType === 'GUEST') {
    const g = await Guest.findById(pass.guestId).select('fullName email organization').lean();
    return g ? { type: 'GUEST', name: g.fullName, detail: g.organization || g.email || '' } : null;
  }
  const u = await User.findById(pass.userId).select('fullName email department year').lean();
  return u
    ? { type: 'STUDENT', name: u.fullName, detail: [u.department, u.year && `Year ${u.year}`].filter(Boolean).join(' · ') }
    : null;
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

module.exports = {
  issueGatePass,
  issueGuestPass,
  revokePassFor,
  verifyGatePass,
  consumeGatePass,
};
