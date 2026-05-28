'use strict';

const express = require('express');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', uptime: process.uptime() },
    error: null,
  });
});

module.exports = router;
