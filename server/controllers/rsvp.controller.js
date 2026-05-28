'use strict';

const asyncHandler = require('../utils/asyncHandler');
const rsvpService = require('../services/rsvp.service');

const create = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.rsvpToEvent(req.params.id, req.principal.userId);
  res.status(201).json({ success: true, data: rsvp, error: null });
});

const cancel = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.cancelRsvp(req.params.id, req.principal.userId);
  res.status(200).json({ success: true, data: rsvp, error: null });
});

const listMine = asyncHandler(async (req, res) => {
  const items = await rsvpService.listMyRsvps(req.principal.userId);
  res.status(200).json({ success: true, data: { items }, error: null });
});

module.exports = { create, cancel, listMine };
