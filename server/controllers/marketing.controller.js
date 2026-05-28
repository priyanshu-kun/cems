'use strict';

const asyncHandler = require('../utils/asyncHandler');
const marketingService = require('../services/marketing.service');

const create = asyncHandler(async (req, res) => {
  const announcement = await marketingService.createAnnouncement(req.body, req.principal.userId);
  res.status(201).json({ success: true, data: announcement, error: null });
});

const feed = asyncHandler(async (req, res) => {
  const result = await marketingService.feedFor(req.principal, req.query);
  res.status(200).json({ success: true, data: result, error: null });
});

module.exports = { create, feed };
