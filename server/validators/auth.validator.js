'use strict';

const { z } = require('zod');

const ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  department: z.string().trim().max(80).optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  // Only honored if the caller is an ADMIN — the controller strips it otherwise.
  roles: z.array(z.enum(ROLES)).nonempty().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
