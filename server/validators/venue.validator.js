'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const createVenueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  building: z.string().trim().max(120).optional(),
  capacity: z.coerce.number().int().min(1).max(20000),
  facilities: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
});

// Every field optional for PATCH, but at least one must be present.
const updateVenueSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    building: z.string().trim().max(120).optional(),
    capacity: z.coerce.number().int().min(1).max(20000).optional(),
    facilities: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'no fields to update' });

const idParamSchema = z.object({ id: objectId });

const listQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

module.exports = { createVenueSchema, updateVenueSchema, idParamSchema, listQuerySchema };
