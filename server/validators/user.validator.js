'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const idParamSchema = z.object({ id: objectId });

const listQuerySchema = z.object({
  role: z.enum(ROLES).optional(),
  department: z.string().trim().max(80).optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  search: z.string().trim().max(80).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

const setRolesSchema = z.object({
  roles: z.array(z.enum(ROLES)).nonempty('at least one role is required'),
});

const setStatusSchema = z.object({
  isActive: z.boolean(),
});

const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  department: z.string().trim().max(80).optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  roles: z.array(z.enum(ROLES)).nonempty().optional(), // defaults to ['STUDENT']
});

module.exports = {
  idParamSchema,
  listQuerySchema,
  setRolesSchema,
  setStatusSchema,
  createUserSchema,
  ROLES,
};
