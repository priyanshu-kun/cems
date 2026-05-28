'use strict';

const Guest = require('../models/guest.model');
const GatePass = require('../models/gatePass.model');
const { DomainError } = require('../utils/domainError');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listGuests(query) {
  const filter = {};
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { organization: rx }];
  }
  const [items, total] = await Promise.all([
    Guest.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit).lean(),
    Guest.countDocuments(filter),
  ]);
  return { items, total, limit: query.limit, skip: query.skip };
}

async function getGuest(id) {
  const guest = await Guest.findById(id).lean();
  if (!guest) throw new DomainError('NOT_FOUND', 'guest not found');
  return guest;
}

async function createGuest(dto, createdBy) {
  try {
    return await Guest.create({ ...dto, createdBy });
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'a guest with this email already exists');
    }
    throw err;
  }
}

async function updateGuest(id, dto) {
  try {
    const guest = await Guest.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true });
    if (!guest) throw new DomainError('NOT_FOUND', 'guest not found');
    return guest;
  } catch (err) {
    if (err?.code === 11000) {
      throw new DomainError('DUPLICATE_RESOURCE', 'a guest with this email already exists');
    }
    throw err;
  }
}

/**
 * Delete a guest from the registry. Refuses if the guest is currently an
 * attendee somewhere (has gate passes) — they must be removed from those
 * events first, to avoid orphaned passes.
 */
async function deleteGuest(id) {
  const guest = await Guest.findById(id);
  if (!guest) throw new DomainError('NOT_FOUND', 'guest not found');

  const passCount = await GatePass.countDocuments({ guestId: id });
  if (passCount > 0) {
    throw new DomainError(
      'VALIDATION_ERROR',
      'this guest is still attending one or more events — remove them from those events first'
    );
  }

  await guest.deleteOne();
  return { removed: true, guestId: id };
}

module.exports = { listGuests, getGuest, createGuest, updateGuest, deleteGuest };
