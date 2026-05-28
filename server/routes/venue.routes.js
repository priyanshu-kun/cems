'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/venue.controller');
const {
  createVenueSchema,
  updateVenueSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/venue.validator');

const router = express.Router();

// Any authenticated user can read venues (needed by the event-create dropdown).
router.get('/', requireAuth, validate({ query: listQuerySchema }), ctrl.list);
router.get('/:id', requireAuth, validate({ params: idParamSchema }), ctrl.getOne);

// Only admins manage the venue catalogue.
router.post('/', requireAuth, requireRoles('ADMIN'), validate({ body: createVenueSchema }), ctrl.create);
router.patch(
  '/:id',
  requireAuth,
  requireRoles('ADMIN'),
  validate({ params: idParamSchema, body: updateVenueSchema }),
  ctrl.update
);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), validate({ params: idParamSchema }), ctrl.remove);

module.exports = router;
