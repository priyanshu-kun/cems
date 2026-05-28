'use strict';

const mongoose = require('mongoose');

const RSVP_STATUS = Object.freeze(['CONFIRMED', 'CANCELLED', 'ATTENDED']);

const rsvpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    status: { type: String, enum: RSVP_STATUS, default: 'CONFIRMED', required: true },
    confirmedAt: { type: Date, default: Date.now },
    attendedAt: { type: Date },
  },
  { timestamps: true }
);

// One RSVP record per (user, event) pair.
rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Rsvp = mongoose.model('Rsvp', rsvpSchema);

module.exports = Rsvp;
module.exports.RSVP_STATUS = RSVP_STATUS;
