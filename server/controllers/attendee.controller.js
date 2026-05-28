'use strict';

const asyncHandler = require('../utils/asyncHandler');
const attendeeService = require('../services/attendee.service');

const list = asyncHandler(async (req, res) => {
  const result = await attendeeService.listAttendees(req.params.eventId, req.principal);
  res.status(200).json({ success: true, data: result, error: null });
});

const addStudent = asyncHandler(async (req, res) => {
  const result = await attendeeService.addStudent(req.params.eventId, req.body.userId, req.principal);
  res.status(201).json({ success: true, data: result, error: null });
});

const removeStudent = asyncHandler(async (req, res) => {
  const result = await attendeeService.removeStudent(req.params.eventId, req.params.userId, req.principal);
  res.status(200).json({ success: true, data: result, error: null });
});

const addGuest = asyncHandler(async (req, res) => {
  const result = await attendeeService.addGuest(req.params.eventId, req.body.guestId, req.principal);
  res.status(201).json({ success: true, data: result, error: null });
});

const removeGuest = asyncHandler(async (req, res) => {
  const result = await attendeeService.removeGuest(req.params.eventId, req.params.guestId, req.principal);
  res.status(200).json({ success: true, data: result, error: null });
});

module.exports = { list, addStudent, removeStudent, addGuest, removeGuest };
