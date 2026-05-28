'use strict';

const express = require('express');
const env = require('../config/env');
const ctrl = require('../controllers/devSeed.controller');
const { DomainError } = require('../utils/domainError');

const router = express.Router();

// Hard guard: production never exposes these routes — even if mounted by mistake.
router.use((req, _res, next) => {
  if (env.NODE_ENV === 'production') {
    return next(new DomainError('FORBIDDEN', 'dev seeding is disabled in production'));
  }
  next();
});

router.get('/seed', ctrl.info);
router.post('/seed', ctrl.run);
router.delete('/seed', ctrl.clear);

module.exports = router;
