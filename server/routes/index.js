'use strict';

const express = require('express');
const env = require('../config/env');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const marketingRoutes = require('./marketing.routes');
const logisticsRoutes = require('./logistics.routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/marketing', marketingRoutes);
router.use('/logistics', logisticsRoutes);

// Dev-only seeding endpoints. NOT mounted in production.
if (env.NODE_ENV !== 'production') {
  // Lazy-required so a production deploy never even loads the seed code path.
  router.use('/dev', require('./devSeed.routes'));
}

module.exports = router;
