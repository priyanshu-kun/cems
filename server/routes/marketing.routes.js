'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/marketing.controller');
const {
  createAnnouncementSchema,
  feedQuerySchema,
} = require('../validators/marketing.validator');

const router = express.Router();

router.get('/feed', requireAuth, validate({ query: feedQuerySchema }), ctrl.feed);

router.post(
  '/announcements',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ body: createAnnouncementSchema }),
  ctrl.create
);

module.exports = router;
