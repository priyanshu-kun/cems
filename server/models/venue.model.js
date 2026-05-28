'use strict';

const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    building: { type: String, trim: true, maxlength: 120 },
    capacity: { type: Number, required: true, min: 1, max: 20000 },
    facilities: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
