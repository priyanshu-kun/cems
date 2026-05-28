'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const idParamSchema = z.object({ id: objectId });

const listQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

const createGuestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().max(20).optional(),
  organization: z.string().trim().max(120).optional(),
});

const updateGuestSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: z.string().trim().max(20).optional(),
    organization: z.string().trim().max(120).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'no fields to update' });

module.exports = { idParamSchema, listQuerySchema, createGuestSchema, updateGuestSchema };
