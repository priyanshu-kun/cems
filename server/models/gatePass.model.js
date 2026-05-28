'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const PASS_STATUS = Object.freeze(['ISSUED', 'CONSUMED', 'REVOKED', 'EXPIRED']);
const HOLDER_TYPES = Object.freeze(['STUDENT', 'GUEST']);

const gatePassSchema = new mongoose.Schema(
  {
    passId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },
    txnTrackId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    // A pass belongs to either a registered student (userId) or an external
    // guest (guestId), distinguished by holderType. Exactly one id is set.
    holderType: { type: String, enum: HOLDER_TYPES, default: 'STUDENT', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', index: true },

    issuedAt: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: PASS_STATUS,
      default: 'ISSUED',
      required: true,
      index: true,
    },
    signature: { type: String, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

// Exactly one holder reference, matching holderType.
gatePassSchema.pre('validate', function ensureHolder(next) {
  if (this.holderType === 'STUDENT' && !this.userId) {
    return next(new Error('student pass requires userId'));
  }
  if (this.holderType === 'GUEST' && !this.guestId) {
    return next(new Error('guest pass requires guestId'));
  }
  if (this.userId && this.guestId) {
    return next(new Error('a pass cannot reference both a user and a guest'));
  }
  next();
});

// One active pass per (holder, event), enforced separately for each holder type
// via partial indexes so multiple null userId/guestId values never collide.
gatePassSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } }
);
gatePassSchema.index(
  { guestId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { guestId: { $type: 'objectId' } } }
);

// Convenience: the holder id regardless of type, as a string.
gatePassSchema.virtual('holderId').get(function getHolderId() {
  return String(this.holderType === 'GUEST' ? this.guestId : this.userId);
});

const GatePass = mongoose.model('GatePass', gatePassSchema);

module.exports = GatePass;
module.exports.PASS_STATUS = PASS_STATUS;
module.exports.HOLDER_TYPES = HOLDER_TYPES;
