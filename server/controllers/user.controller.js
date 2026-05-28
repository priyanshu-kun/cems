'use strict';

const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json({ success: true, data: result, error: null });
});

const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.status(200).json({ success: true, data: user, error: null });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user, error: null });
});

const remove = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.principal.userId);
  res.status(200).json({ success: true, data: result, error: null });
});

const setRoles = asyncHandler(async (req, res) => {
  const user = await userService.setRoles(req.params.id, req.body.roles, req.principal.userId);
  res.status(200).json({ success: true, data: user, error: null });
});

const setStatus = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.params.id, req.body.isActive, req.principal.userId);
  res.status(200).json({ success: true, data: user, error: null });
});

module.exports = { list, getOne, create, remove, setRoles, setStatus };
