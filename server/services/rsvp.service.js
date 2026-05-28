'use strict';

const mongoose = require('mongoose');
const Rsvp = require('../models/rsvp.model');
const Event = require('../models/event.model');
const { DomainError } = require('../utils/domainError');

const RSVP_ELIGIBLE_STATUSES = ['APPROVED', 'PUBLISHED', 'ONGOING'];

async function rsvpToEvent(eventId, userId) {
  const event = await Event.findById(eventId);
  if (!event) throw new DomainError('NOT_FOUND', 'event not found');
  if (!RSVP_ELIGIBLE_STATUSES.includes(event.status)) {
    throw new DomainError('VALIDATION_ERROR', `cannot RSVP to event in status ${event.status}`);
  }
  if (event.rsvpCount >= event.capacity) {
    throw new DomainError('VALIDATION_ERROR', 'event is at full capacity');
  }

  // Atomic: only create the RSVP if a CONFIRMED one does not already exist.
  const filter = { userId, eventId };
  const update = {
    $setOnInsert: { userId, eventId, status: 'CONFIRMED', confirmedAt: new Date() },
  };

  const existing = await Rsvp.findOne(filter).lean();
  if (existing && existing.status === 'CONFIRMED') {
    throw new DomainError('DUPLICATE_RESOURCE', 'already RSVPed to this event');
  }

  let rsvp;
  if (existing) {
    rsvp = await Rsvp.findOneAndUpdate(
      filter,
      { $set: { status: 'CONFIRMED', confirmedAt: new Date() } },
      { new: true }
    );
  } else {
    rsvp = await Rsvp.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  // Bump counter only if it doesn't overshoot capacity (atomic check).
  const bumped = await Event.findOneAndUpdate(
    { _id: eventId, rsvpCount: { $lt: event.capacity } },
    { $inc: { rsvpCount: 1 } },
    { new: true }
  );
  if (!bumped) {
    // Lost a race against capacity — undo RSVP and report.
    await Rsvp.updateOne({ _id: rsvp._id }, { $set: { status: 'CANCELLED' } });
    throw new DomainError('VALIDATION_ERROR', 'event capacity reached');
  }

  return rsvp;
}

async function cancelRsvp(eventId, userId) {
  const rsvp = await Rsvp.findOneAndUpdate(
    { userId, eventId, status: 'CONFIRMED' },
    { $set: { status: 'CANCELLED' } },
    { new: true }
  );
  if (!rsvp) {
    throw new DomainError('NOT_FOUND', 'no confirmed RSVP to cancel');
  }
  await Event.updateOne(
    { _id: eventId, rsvpCount: { $gt: 0 } },
    { $inc: { rsvpCount: -1 } }
  );
  return rsvp;
}

async function listMyRsvps(userId) {
  return Rsvp.find({ userId, status: { $in: ['CONFIRMED', 'ATTENDED'] } })
    .sort({ confirmedAt: -1 })
    .populate('eventId', 'title startTime endTime venueId status')
    .lean();
}

async function findConfirmedRsvp(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;
  return Rsvp.findOne({ userId, eventId, status: { $in: ['CONFIRMED', 'ATTENDED'] } });
}

module.exports = { rsvpToEvent, cancelRsvp, listMyRsvps, findConfirmedRsvp };
