'use strict';

const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  // Only ADMINs may self-assign elevated roles during register.
  const isAdmin = req.principal?.roles?.includes('ADMIN');
  const payload = { ...req.body };
  if (!isAdmin) delete payload.roles;

  const result = await authService.register(payload);
  res.status(201).json({ success: true, data: result, error: null });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result, error: null });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  res.status(200).json({ success: true, data: result, error: null });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { principal: req.principal },
    error: null,
  });
});

module.exports = { register, login, refresh, me };
