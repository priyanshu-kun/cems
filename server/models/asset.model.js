'use strict';

const mongoose = require('mongoose');

const ASSET_CATEGORIES = Object.freeze([
  'PROJECTOR',
  'MICROPHONE',
  'SPEAKER',
  'CHAIR',
  'TABLE',
  'OTHER',
]);

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, unique: true, index: true },
    category: { type: String, enum: ASSET_CATEGORIES, required: true, index: true },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: '__v' }
);

assetSchema.pre('validate', function ensureCapacity(next) {
  if (this.availableQuantity > this.totalQuantity) {
    return next(new Error('availableQuantity cannot exceed totalQuantity'));
  }
  next();
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
module.exports.ASSET_CATEGORIES = ASSET_CATEGORIES;
