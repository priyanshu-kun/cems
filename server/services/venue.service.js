'use strict';

const Venue = require('../models/venue.model');
const Event = require('../models/event.model');
const { DomainError } = require('../utils/domainError');

async function listVenues({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { isActive: true };
  return Venue.find(filter).sort({ name: 1 }).lean();
}

async function getVenue(id) {
  const venue = await Venue.findById(id).lean();
  if (!venue) throw new DomainError('NOT_FOUND', 'venue not found');
  return venue;
}

async function createVenue(dto) {
  try {
    return await Venue.create(dto);
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'a venue with this name already exists');
    }
    throw err;
  }
}

async function updateVenue(id, dto) {
  try {
    const venue = await Venue.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true });
    if (!venue) throw new DomainError('NOT_FOUND', 'venue not found');
    return venue;
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'a venue with this name already exists');
    }
    throw err;
  }
}

/**
 * Soft delete: mark inactive instead of removing the document, so historical
 * events that reference this venue keep a valid pointer. Refuses if the venue
 * still has active (APPROVED/PUBLISHED/ONGOING) events booked.
 */
async function deactivateVenue(id) {
  const venue = await Venue.findById(id);
  if (!venue) throw new DomainError('NOT_FOUND', 'venue not found');

  const activeBooking = await Event.findOne({
    venueId: id,
    status: { $in: ['APPROVED', 'PUBLISHED', 'ONGOING'] },
  })
    .select({ _id: 1 })
    .lean();
  if (activeBooking) {
    throw new DomainError(
      'VALIDATION_ERROR',
      'cannot deactivate a venue with active events booked'
    );
  }

  venue.isActive = false;
  await venue.save();
  return venue;
}

module.exports = { listVenues, getVenue, createVenue, updateVenue, deactivateVenue };
