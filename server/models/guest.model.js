'use strict';

const mongoose = require('mongoose');

// Guests are external (non-student) people in a COLLEGE-WIDE registry — alumni,
// industry speakers, partner-org visitors, etc. They are not tied to one event;
// an organizer/admin adds an existing guest to an event (which issues a guest
// gate pass). Managed by admins and organizers.
const guestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'invalid email format'],
    },
    phone: { type: String, trim: true, maxlength: 20 },
    organization: { type: String, trim: true, maxlength: 120 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// At most one registry entry per email (when an email is provided).
guestSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
