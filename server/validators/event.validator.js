'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const EVENT_STATUS = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PUBLISHED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
];

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const isoDateTime = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .transform((v) => new Date(v));

const createEventSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(3).max(4000),
    venueId: objectId,
    startTime: isoDateTime,
    endTime: isoDateTime,
    capacity: z.coerce.number().int().min(1).max(10000),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    targetAudience: z
      .object({
        departments: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
        years: z.array(z.coerce.number().int().min(1).max(6)).max(6).optional(),
        roles: z.array(z.enum(['STUDENT', 'ORGANIZER'])).max(3).optional(),
      })
      .optional(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

const transitionSchema = z.object({
  status: z.enum(EVENT_STATUS),
});

const idParamSchema = z.object({ id: objectId });

const listQuerySchema = z.object({
  status: z.enum(EVENT_STATUS).optional(),
  venueId: objectId.optional(),
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

module.exports = {
  createEventSchema,
  transitionSchema,
  idParamSchema,
  listQuerySchema,
  EVENT_STATUS,
};
