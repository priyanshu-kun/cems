'use strict';

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    targetAudience: {
      departments: [{ type: String, trim: true }],
      years: [{ type: Number, min: 1, max: 6 }],
      roles: [{ type: String, enum: ['STUDENT', 'ORGANIZER', 'ADMIN'] }],
    },
    publishedAt: { type: Date, default: Date.now, index: true },
    isPinned: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

announcementSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
