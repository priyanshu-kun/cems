'use strict';

const Announcement = require('../models/announcement.model');
const User = require('../models/user.model');
const { DomainError } = require('../utils/domainError');

async function createAnnouncement(dto, authorId) {
  return Announcement.create({ ...dto, authorId, publishedAt: new Date() });
}

/**
 * Audience-targeted notice-board feed.
 *
 * An announcement matches the principal if EVERY declared audience facet
 * (departments / years / roles) is either empty (meaning "everyone")
 * or contains a value the principal possesses.
 */
async function feedFor(principal, { limit, skip }) {
  const user = await User.findById(principal.userId).lean();
  if (!user) throw new DomainError('UNAUTHENTICATED', 'principal not found');

  const userRoles = user.roles || [];
  const userYear = user.year;
  const userDept = user.department;

  const audienceMatch = {
    $and: [
      {
        $or: [
          { 'targetAudience.roles': { $exists: false } },
          { 'targetAudience.roles': { $size: 0 } },
          { 'targetAudience.roles': { $in: userRoles } },
        ],
      },
      {
        $or: [
          { 'targetAudience.departments': { $exists: false } },
          { 'targetAudience.departments': { $size: 0 } },
          ...(userDept ? [{ 'targetAudience.departments': userDept }] : []),
        ],
      },
      {
        $or: [
          { 'targetAudience.years': { $exists: false } },
          { 'targetAudience.years': { $size: 0 } },
          ...(userYear ? [{ 'targetAudience.years': userYear }] : []),
        ],
      },
    ],
  };

  const [items, total] = await Promise.all([
    Announcement.find(audienceMatch)
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(audienceMatch),
  ]);

  return { items, total, limit, skip };
}

async function bumpViewCount(announcementId) {
  await Announcement.updateOne({ _id: announcementId }, { $inc: { viewCount: 1 } });
}

module.exports = { createAnnouncement, feedFor, bumpViewCount };
