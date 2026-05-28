'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/event.controller');
const rsvpCtrl = require('../controllers/rsvp.controller');
const attendeeCtrl = require('../controllers/attendee.controller');
const {
  createEventSchema,
  transitionSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/event.validator');
const {
  eventIdParamSchema,
  addStudentSchema,
  addGuestSchema,
  studentParamsSchema,
  guestParamsSchema,
} = require('../validators/attendee.validator');

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

// RSVP endpoints (student self-service) — nested under /events/:id.
router.post('/:id/rsvp', requireAuth, validate({ params: idParamSchema }), rsvpCtrl.create);
router.delete('/:id/rsvp', requireAuth, validate({ params: idParamSchema }), rsvpCtrl.cancel);

// Attendee management — organizer-owner or admin add/remove students & guests.
const manage = [requireAuth, requireRoles('ORGANIZER', 'ADMIN')];

router.get('/:eventId/attendees', ...manage, validate({ params: eventIdParamSchema }), attendeeCtrl.list);

router.post(
  '/:eventId/attendees/students',
  ...manage,
  validate({ params: eventIdParamSchema, body: addStudentSchema }),
  attendeeCtrl.addStudent
);
router.delete(
  '/:eventId/attendees/students/:userId',
  ...manage,
  validate({ params: studentParamsSchema }),
  attendeeCtrl.removeStudent
);

router.post(
  '/:eventId/attendees/guests',
  ...manage,
  validate({ params: eventIdParamSchema, body: addGuestSchema }),
  attendeeCtrl.addGuest
);
router.delete(
  '/:eventId/attendees/guests/:guestId',
  ...manage,
  validate({ params: guestParamsSchema }),
  attendeeCtrl.removeGuest
);

module.exports = router;
