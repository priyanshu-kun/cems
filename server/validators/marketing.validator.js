'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(3).max(4000),
  eventId: objectId.optional(),
  isPinned: z.boolean().optional(),
  targetAudience: z
    .object({
      departments: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
      years: z.array(z.coerce.number().int().min(1).max(6)).max(6).optional(),
      roles: z.array(z.enum(['STUDENT', 'ORGANIZER', 'ADMIN'])).max(3).optional(),
    })
    .optional(),
});

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

module.exports = { createAnnouncementSchema, feedQuerySchema };
