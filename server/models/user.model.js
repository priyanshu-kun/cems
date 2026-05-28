'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../config/env');

const ROLES = Object.freeze(['STUDENT', 'ORGANIZER', 'ADMIN']);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'fullName is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    roles: {
      type: [{ type: String, enum: ROLES }],
      default: ['STUDENT'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'user must have at least one role',
      },
    },
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    rsvpedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
    ],
    lastLoginAt: { type: Date },
  },
  { timestamps: true, versionKey: '__v' }
);

userSchema.index({ roles: 1 });

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, env.BCRYPT_COST);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
