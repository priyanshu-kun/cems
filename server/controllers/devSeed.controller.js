'use strict';

const asyncHandler = require('../utils/asyncHandler');
const seeder = require('../services/devSeed.service');

const info = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message:
        'Demo credentials. POST this endpoint to wipe and re-seed the database with the cohort below.',
      credentials: seeder.credentialsOnly(),
    },
    error: null,
  });
});

const run = asyncHandler(async (_req, res) => {
  const result = await seeder.seedAll();
  res.status(201).json({ success: true, data: result, error: null });
});

const clear = asyncHandler(async (_req, res) => {
  const result = await seeder.clearDemoData();
  res.status(200).json({ success: true, data: result, error: null });
});

module.exports = { info, run, clear };
