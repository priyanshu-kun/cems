'use strict';

const Event = require('../models/event.model');
const User = require('../models/user.model');
const Guest = require('../models/guest.model');
const Rsvp = require('../models/rsvp.model');
const GatePass = require('../models/gatePass.model');
const { DomainError } = require('../utils/domainError');
const rsvpService = require('./rsvp.service');
const logisticsService = require('./logistics.service');

/**
 * The acting principal must be the event's organizer or an admin.
 */
async function authorizeManage(eventId, principal) {
  const event = await Event.findById(eventId);
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');
  const isAdmin = principal.roles.includes('ADMIN');
  const isOwner = String(event.organizerId) === principal.userId;
  if (!isAdmin && !isOwner) {
    throw new DomainError('FORBIDDEN', 'only the event organizer or an admin can manage attendees');
  }
  return event;
}

/**
 * Unified attendee list for an event: confirmed student RSVPs + guests holding
 * a pass for this event. Each row carries a `type` and pass status when present.
 */
async function listAttendees(eventId, principal) {
  await authorizeManage(eventId, principal);

  const [rsvps, guestPasses] = await Promise.all([
    Rsvp.find({ eventId, status: { $in: ['CONFIRMED', 'ATTENDED'] } })
      .populate('userId', 'fullName email department year')
      .lean(),
    GatePass.find({ eventId, holderType: 'GUEST' }).populate('guestId', 'fullName email organization').lean(),
  ]);

  // Map passes by holder so we can attach pass status to each row.
  const studentPasses = await GatePass.find({ eventId, holderType: 'STUDENT' }).lean();
  const passByUser = new Map(studentPasses.map((p) => [String(p.userId), p]));

  const students = rsvps
    .filter((r) => r.userId)
    .map((r) => {
      const pass = passByUser.get(String(r.userId._id));
      return {
        type: 'STUDENT',
        id: String(r.userId._id),
        name: r.userId.fullName,
        detail: [r.userId.department, r.userId.year && `Year ${r.userId.year}`].filter(Boolean).join(' · '),
        email: r.userId.email,
        passStatus: pass ? pass.status : null,
      };
    });

  const guests = guestPasses
    .filter((p) => p.guestId)
    .map((p) => ({
      type: 'GUEST',
      id: String(p.guestId._id),
      name: p.guestId.fullName,
      detail: p.guestId.organization || p.guestId.email || '',
      email: p.guestId.email || null,
      passStatus: p.status,
    }));

  const items = [...students, ...guests];
  return {
    items,
    total: items.length,
    students: students.length,
    guests: guests.length,
    checkedIn: items.filter((x) => x.passStatus === 'CONSUMED').length,
  };
}

/**
 * Add an enrolled student to the event: creates a confirmed RSVP on their
 * behalf (counts toward capacity, shows in their My Events) and issues a
 * student gate pass.
 */
async function addStudent(eventId, userId, principal) {
  await authorizeManage(eventId, principal);

  const user = await User.findById(userId).select('_id roles isActive').lean();
  if (!user) throw new DomainError('NOT_FOUND', 'student not found');
  if (user.isActive === false) {
    throw new DomainError('VALIDATION_ERROR', 'this account is deactivated');
  }
  if (!user.roles.includes('STUDENT')) {
    throw new DomainError('VALIDATION_ERROR', 'only students can be added as student attendees');
  }

  // Reuse the RSVP flow (idempotent-ish: throws DUPLICATE if already confirmed).
  try {
    await rsvpService.rsvpToEvent(eventId, userId);
  } catch (err) {
    if (err instanceof DomainError && err.code === 'DUPLICATE_RESOURCE') {
      // already attending — fall through to (re)issue the pass
    } else {
      throw err;
    }
  }

  const { pass, qr } = await logisticsService.issueGatePass(eventId, userId);
  return { type: 'STUDENT', userId, pass, qr };
}

async function removeStudent(eventId, userId, principal) {
  await authorizeManage(eventId, principal);
  await rsvpService.cancelRsvp(eventId, userId).catch((err) => {
    if (!(err instanceof DomainError && err.code === 'NOT_FOUND')) throw err;
  });
  await logisticsService.revokePassFor(eventId, { userId });
  return { removed: true, type: 'STUDENT', userId };
}

/**
 * Add a registry guest to the event and issue them a guest gate pass.
 */
async function addGuest(eventId, guestId, principal) {
  await authorizeManage(eventId, principal);
  const guest = await Guest.findById(guestId).select('_id isActive').lean();
  if (!guest) throw new DomainError('NOT_FOUND', 'guest not found');
  if (guest.isActive === false) {
    throw new DomainError('VALIDATION_ERROR', 'this guest is deactivated');
  }
  const { pass, qr } = await logisticsService.issueGuestPass(eventId, guestId);
  return { type: 'GUEST', guestId, pass, qr };
}

async function removeGuest(eventId, guestId, principal) {
  await authorizeManage(eventId, principal);
  await logisticsService.revokePassFor(eventId, { guestId });
  return { removed: true, type: 'GUEST', guestId };
}

module.exports = { listAttendees, addStudent, removeStudent, addGuest, removeGuest };
