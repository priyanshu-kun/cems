'use strict';

const asyncHandler = require('../utils/asyncHandler');
const guestService = require('../services/guest.service');

const list = asyncHandler(async (req, res) => {
  const result = await guestService.listGuests(req.query);
  res.status(200).json({ success: true, data: result, error: null });
});

const getOne = asyncHandler(async (req, res) => {
  const guest = await guestService.getGuest(req.params.id);
  res.status(200).json({ success: true, data: guest, error: null });
});

const create = asyncHandler(async (req, res) => {
  const guest = await guestService.createGuest(req.body, req.principal.userId);
  res.status(201).json({ success: true, data: guest, error: null });
});

const update = asyncHandler(async (req, res) => {
  const guest = await guestService.updateGuest(req.params.id, req.body);
  res.status(200).json({ success: true, data: guest, error: null });
});

const remove = asyncHandler(async (req, res) => {
  const result = await guestService.deleteGuest(req.params.id);
  res.status(200).json({ success: true, data: result, error: null });
});

module.exports = { list, getOne, create, update, remove };
