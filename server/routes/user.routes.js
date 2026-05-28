'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/user.controller');
const {
  idParamSchema,
  listQuerySchema,
  setRolesSchema,
  setStatusSchema,
  createUserSchema,
} = require('../validators/user.validator');

const router = express.Router();

// Admins and organizers can view the directory (e.g. to find students to invite).
router.get('/', requireAuth, requireRoles('ADMIN', 'ORGANIZER'), validate({ query: listQuerySchema }), ctrl.list);
router.get('/:id', requireAuth, requireRoles('ADMIN', 'ORGANIZER'), validate({ params: idParamSchema }), ctrl.getOne);

// Only admins create or remove accounts (college enrolment / removal).
router.post('/', requireAuth, requireRoles('ADMIN'), validate({ body: createUserSchema }), ctrl.create);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), validate({ params: idParamSchema }), ctrl.remove);

// Only admins change roles or activation status.
router.patch(
  '/:id/roles',
  requireAuth,
  requireRoles('ADMIN'),
  validate({ params: idParamSchema, body: setRolesSchema }),
  ctrl.setRoles
);
router.patch(
  '/:id/status',
  requireAuth,
  requireRoles('ADMIN'),
  validate({ params: idParamSchema, body: setStatusSchema }),
  ctrl.setStatus
);

module.exports = router;
