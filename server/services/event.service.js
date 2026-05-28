'use strict';

const mongoose = require('mongoose');
const Event = require('../models/event.model');
const Venue = require('../models/venue.model');
const { DomainError } = require('../utils/domainError');

const ACTIVE_STATUSES = ['APPROVED', 'PUBLISHED', 'ONGOING'];

// Legal forward transitions for the event lifecycle state machine.
const TRANSITIONS = Object.freeze({
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
});

async function createEvent(dto, organizerId) {
  const venue = await Venue.findById(dto.venueId).lean();
  if (!venue || venue.isActive === false) {
    throw new DomainError('NOT_FOUND', 'venue not found or inactive');
  }
  if (dto.capacity > venue.capacity) {
    throw new DomainError('VALIDATION_ERROR', 'event capacity exceeds venue capacity');
  }

  // FCFS semantic: drafts/pending events do NOT claim a slot. The slot is only
  // claimed when an event transitions into an ACTIVE status — see transitionEvent.
  return Event.create({ ...dto, organizerId, status: 'PENDING_APPROVAL' });
}

function canUseTransactions() {
  const conn = mongoose.connection;
  if (conn.readyState !== 1) return false;
  const topology = conn.client?.topology?.description?.type;
  return (
    topology === 'ReplicaSetWithPrimary' ||
    topology === 'Sharded' ||
    topology === 'LoadBalanced'
  );
}

async function listEvents(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.venueId) filter.venueId = query.venueId;
  if (query.from || query.to) {
    filter.startTime = {};
    if (query.from) filter.startTime.$gte = query.from;
    if (query.to) filter.startTime.$lte = query.to;
  }

  const [items, total] = await Promise.all([
    Event.find(filter).sort({ startTime: 1 }).skip(query.skip).limit(query.limit).lean(),
    Event.countDocuments(filter),
  ]);

  return { items, total, limit: query.limit, skip: query.skip };
}

async function getEvent(id) {
  const event = await Event.findById(id);
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');
  return event;
}

async function transitionEvent(id, nextStatus, principal) {
  const event = await Event.findById(id);
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');

  const legal = TRANSITIONS[event.status] || [];
  if (!legal.includes(nextStatus)) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `illegal transition: ${event.status} → ${nextStatus}`
    );
  }

  // Organizers may only cancel or push their own draft forward; ADMIN can do anything legal.
  const isAdmin = principal.roles.includes('ADMIN');
  if (!isAdmin) {
    const isOwner = String(event.organizerId) === principal.userId;
    if (!isOwner) {
      throw new DomainError('FORBIDDEN', 'only the organizer or an admin can change this event');
    }
    const organizerAllowed = ['PENDING_APPROVAL', 'CANCELLED', 'DRAFT'];
    if (!organizerAllowed.includes(nextStatus)) {
      throw new DomainError('FORBIDDEN', 'organizers cannot perform this transition');
    }
  }

  const enteringActive =
    ACTIVE_STATUSES.includes(nextStatus) && !ACTIVE_STATUSES.includes(event.status);

  if (enteringActive) {
    return commitActiveTransition(event, nextStatus);
  }

  event.status = nextStatus;
  await event.save();
  return event;
}

async function commitActiveTransition(event, nextStatus) {
  const overlapFilter = {
    _id: { $ne: event._id },
    venueId: event.venueId,
    status: { $in: ACTIVE_STATUSES },
    startTime: { $lt: event.endTime },
    endTime: { $gt: event.startTime },
  };

  // Transactional path (Atlas replica-set / sharded): serialize FCFS claims.
  if (canUseTransactions()) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const conflict = await Event.findOne(overlapFilter, { _id: 1 }, { session }).lean();
        if (conflict) {
          throw new DomainError('VENUE_CONFLICT', 'venue is already booked for this slot');
        }
        event.status = nextStatus;
        await event.save({ session });
      });
      return event;
    } catch (err) {
      if (err?.code === 11000) {
        throw new DomainError('VENUE_CONFLICT', 'venue is already booked for this slot');
      }
      throw err;
    } finally {
      session.endSession();
    }
  }

  // Standalone-mongod fallback: best-effort check + index safety net.
  const conflict = await Event.findOne(overlapFilter).lean();
  if (conflict) {
    throw new DomainError('VENUE_CONFLICT', 'venue is already booked for this slot');
  }
  event.status = nextStatus;
  try {
    await event.save();
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('VENUE_CONFLICT', 'venue is already booked for this slot');
    }
    throw err;
  }
  return event;
}

module.exports = { createEvent, listEvents, getEvent, transitionEvent, ACTIVE_STATUSES };
