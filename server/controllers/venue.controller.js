'use strict';

const asyncHandler = require('../utils/asyncHandler');
const venueService = require('../services/venue.service');

const list = asyncHandler(async (req, res) => {
  const items = await venueService.listVenues(req.query);
  res.status(200).json({ success: true, data: { items }, error: null });
});

const getOne = asyncHandler(async (req, res) => {
  const venue = await venueService.getVenue(req.params.id);
  res.status(200).json({ success: true, data: venue, error: null });
});

const create = asyncHandler(async (req, res) => {
  const venue = await venueService.createVenue(req.body);
  res.status(201).json({ success: true, data: venue, error: null });
});

const update = asyncHandler(async (req, res) => {
  const venue = await venueService.updateVenue(req.params.id, req.body);
  res.status(200).json({ success: true, data: venue, error: null });
});

const remove = asyncHandler(async (req, res) => {
  const venue = await venueService.deactivateVenue(req.params.id);
  res.status(200).json({ success: true, data: venue, error: null });
});

module.exports = { list, getOne, create, update, remove };
