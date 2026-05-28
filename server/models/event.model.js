'use strict';

const mongoose = require('mongoose');

const EVENT_STATUS = Object.freeze([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PUBLISHED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
]);

const ACTIVE_STATUSES = Object.freeze(['APPROVED', 'PUBLISHED', 'ONGOING']);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 4000 },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: EVENT_STATUS,
      default: 'DRAFT',
      required: true,
      index: true,
    },
    capacity: { type: Number, required: true, min: 1, max: 10000 },
    rsvpCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    targetAudience: {
      departments: [{ type: String, trim: true }],
      years: [{ type: Number, min: 1, max: 6 }],
      roles: [{ type: String, enum: ['STUDENT', 'ORGANIZER'] }],
    },
  },
  { timestamps: true }
);

eventSchema.pre('validate', function ensureTimeRange(next) {
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    return next(new Error('endTime must be strictly after startTime'));
  }
  next();
});

// Defense-in-depth: exact-triple duplicate guard for ACTIVE events.
// True overlap-FCFS is enforced transactionally in the event service (Phase 2).
eventSchema.index(
  { venueId: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['APPROVED', 'PUBLISHED', 'ONGOING'] } },
    name: 'uniq_active_venue_slot',
  }
);

eventSchema.index({ status: 1, startTime: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
module.exports.EVENT_STATUS = EVENT_STATUS;
module.exports.ACTIVE_STATUSES = ACTIVE_STATUSES;
