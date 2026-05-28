'use strict';

const asyncHandler = require('../utils/asyncHandler');
const eventService = require('../services/event.service');

const create = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.principal.userId);
  res.status(201).json({ success: true, data: event, error: null });
});

const list = asyncHandler(async (req, res) => {
  const result = await eventService.listEvents(req.query);
  res.status(200).json({ success: true, data: result, error: null });
});

const getOne = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  res.status(200).json({ success: true, data: event, error: null });
});

const transition = asyncHandler(async (req, res) => {
  const event = await eventService.transitionEvent(
    req.params.id,
    req.body.status,
    req.principal
  );
  res.status(200).json({ success: true, data: event, error: null });
});

module.exports = { create, list, getOne, transition };
