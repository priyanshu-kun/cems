'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/event.controller');
const rsvpCtrl = require('../controllers/rsvp.controller');
const {
  createEventSchema,
  transitionSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/event.validator');

const router = express.Router();

router.get('/', requireAuth, validate({ query: listQuerySchema }), ctrl.list);

router.get('/:id', requireAuth, validate({ params: idParamSchema }), ctrl.getOne);

router.post(
  '/',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ body: createEventSchema }),
  ctrl.create
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ params: idParamSchema, body: transitionSchema }),
  ctrl.transition
);

// RSVP endpoints — nested under /events/:id for clarity.
router.post('/:id/rsvp', requireAuth, validate({ params: idParamSchema }), rsvpCtrl.create);
router.delete('/:id/rsvp', requireAuth, validate({ params: idParamSchema }), rsvpCtrl.cancel);

module.exports = router;
