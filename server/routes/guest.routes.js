'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/guest.controller');
const {
  idParamSchema,
  listQuerySchema,
  createGuestSchema,
  updateGuestSchema,
} = require('../validators/guest.validator');

const router = express.Router();

// College-wide guest registry — managed by admins and organizers.
const manage = [requireAuth, requireRoles('ADMIN', 'ORGANIZER')];

router.get('/', ...manage, validate({ query: listQuerySchema }), ctrl.list);
router.get('/:id', ...manage, validate({ params: idParamSchema }), ctrl.getOne);
router.post('/', ...manage, validate({ body: createGuestSchema }), ctrl.create);
router.patch('/:id', ...manage, validate({ params: idParamSchema, body: updateGuestSchema }), ctrl.update);
router.delete('/:id', ...manage, validate({ params: idParamSchema }), ctrl.remove);

module.exports = router;
