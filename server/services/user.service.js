'use strict';

const User = require('../models/user.model');
const Rsvp = require('../models/rsvp.model');
const GatePass = require('../models/gatePass.model');
const Event = require('../models/event.model');
const { DomainError } = require('../utils/domainError');

// Fields safe to project to organizers/admins — never the password hash.
const PUBLIC_FIELDS = 'fullName email roles department year isActive isEmailVerified lastLoginAt createdAt';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listUsers(query) {
  const filter = {};
  if (query.role) filter.roles = query.role;
  if (query.department) filter.department = query.department;
  if (query.year) filter.year = query.year;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { items, total, limit: query.limit, skip: query.skip };
}

async function getUser(id) {
  const user = await User.findById(id).select(PUBLIC_FIELDS).lean();
  if (!user) throw new DomainError('NOT_FOUND', 'user not found');
  return user;
}

async function setRoles(id, roles, actingUserId) {
  const user = await User.findById(id);
  if (!user) throw new DomainError('NOT_FOUND', 'user not found');

  // Guard: an admin must not strip their own ADMIN role and lock themselves out.
  if (String(user._id) === String(actingUserId) && !roles.includes('ADMIN')) {
    throw new DomainError('VALIDATION_ERROR', 'you cannot remove your own admin role');
  }

  user.roles = Array.from(new Set(roles));
  await user.save();
  return getUser(id);
}

async function createUser(dto) {
  const exists = await User.exists({ email: dto.email });
  if (exists) throw new DomainError('DUPLICATE_RESOURCE', 'an account with this email already exists');

  const passwordHash = await User.hashPassword(dto.password);
  const user = await User.create({
    fullName: dto.fullName,
    email: dto.email,
    passwordHash,
    department: dto.department,
    year: dto.year,
    roles: dto.roles && dto.roles.length ? dto.roles : ['STUDENT'],
    isEmailVerified: true, // admin-created accounts are trusted
    isActive: true,
  });
  return getUser(user._id);
}

/**
 * Remove an account from the college. Cleans up the user's confirmed RSVPs
 * (decrementing each event's counter) and deletes their gate passes, so no
 * orphaned references remain.
 */
async function deleteUser(id, actingUserId) {
  if (String(id) === String(actingUserId)) {
    throw new DomainError('VALIDATION_ERROR', 'you cannot delete your own account');
  }
  const user = await User.findById(id);
  if (!user) throw new DomainError('NOT_FOUND', 'user not found');

  const activeRsvps = await Rsvp.find({ userId: id, status: { $in: ['CONFIRMED', 'ATTENDED'] } })
    .select({ eventId: 1 })
    .lean();
  if (activeRsvps.length) {
    const eventIds = activeRsvps.map((r) => r.eventId);
    await Event.updateMany(
      { _id: { $in: eventIds }, rsvpCount: { $gt: 0 } },
      { $inc: { rsvpCount: -1 } }
    );
  }
  await Promise.all([
    Rsvp.deleteMany({ userId: id }),
    GatePass.deleteMany({ userId: id }),
  ]);
  await user.deleteOne();
  return { removed: true, userId: String(id) };
}

async function setStatus(id, isActive, actingUserId) {
  if (String(id) === String(actingUserId) && isActive === false) {
    throw new DomainError('VALIDATION_ERROR', 'you cannot deactivate your own account');
  }
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { isActive } },
    { new: true }
  ).select(PUBLIC_FIELDS);
  if (!user) throw new DomainError('NOT_FOUND', 'user not found');
  return user;
}

module.exports = { listUsers, getUser, createUser, deleteUser, setRoles, setStatus };
