'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/logistics.controller');
const {
  issueGatePassSchema,
  verifyGatePassSchema,
  createAssetSchema,
  reserveAssetSchema,
  assetIdParamSchema,
} = require('../validators/logistics.validator');

const router = express.Router();

// Gate passes
router.post(
  '/gate-pass',
  requireAuth,
  validate({ body: issueGatePassSchema }),
  ctrl.issuePass
);
router.post(
  '/gate-pass/verify',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ body: verifyGatePassSchema }),
  ctrl.verifyPass
);
router.post(
  '/gate-pass/consume',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ body: verifyGatePassSchema.pick({ passId: true }) }),
  ctrl.consumePass
);

// Assets
router.get('/assets', requireAuth, ctrl.listAssets);
router.post(
  '/assets',
  requireAuth,
  requireRoles('ADMIN'),
  validate({ body: createAssetSchema }),
  ctrl.createAsset
);
router.post(
  '/assets/:id/reserve',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ params: assetIdParamSchema, body: reserveAssetSchema }),
  ctrl.reserveAsset
);
router.post(
  '/assets/:id/release',
  requireAuth,
  requireRoles('ORGANIZER', 'ADMIN'),
  validate({ params: assetIdParamSchema, body: reserveAssetSchema }),
  ctrl.releaseAsset
);

module.exports = router;
