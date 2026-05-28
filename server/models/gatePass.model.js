'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const PASS_STATUS = Object.freeze(['ISSUED', 'CONSUMED', 'REVOKED', 'EXPIRED']);

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    allocatedAssets: [
      {
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
        quantity: { type: Number, min: 1 },
      },
    ],
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

// One active pass per user per event.
gatePassSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const GatePass = mongoose.model('GatePass', gatePassSchema);

module.exports = GatePass;
module.exports.PASS_STATUS = PASS_STATUS;
