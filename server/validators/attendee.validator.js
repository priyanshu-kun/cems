'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const eventIdParamSchema = z.object({ eventId: objectId });
const studentParamsSchema = z.object({ eventId: objectId, userId: objectId });
const guestParamsSchema = z.object({ eventId: objectId, guestId: objectId });

const addStudentSchema = z.object({ userId: objectId });
const addGuestSchema = z.object({ guestId: objectId });

module.exports = {
  eventIdParamSchema,
  studentParamsSchema,
  guestParamsSchema,
  addStudentSchema,
  addGuestSchema,
};
