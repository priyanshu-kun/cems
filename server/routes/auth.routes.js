'use strict';

const express = require('express');
const { validate } = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), ctrl.register);
router.post('/login', validate({ body: loginSchema }), ctrl.login);
router.post('/refresh', validate({ body: refreshSchema }), ctrl.refresh);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
