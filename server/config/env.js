'use strict';

require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().startsWith('/').default('/api/v1'),
  BODY_LIMIT: z.string().default('1mb'),
  CORS_ORIGIN: z.string().default('*'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  JWT_ISSUER: z.string().default('cems-backend'),
  JWT_AUDIENCE: z.string().default('cems-clients'),

  GATE_PASS_HMAC_SECRET: z.string().min(16),
  GATE_PASS_TTL_HOURS: z.coerce.number().int().positive().default(12),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

module.exports = Object.freeze(parsed.data);
