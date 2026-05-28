'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');
const { ASSET_CATEGORIES } = require('../models/asset.model');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'invalid ObjectId' });

const issueGatePassSchema = z.object({
  eventId: objectId,
});

const verifyGatePassSchema = z.object({
  passId: z.string().min(1),
  eventId: objectId,
  userId: objectId,
  issuedAt: z.string().min(1),
  expiresAt: z.string().min(1),
  sig: z.string().min(1),
  v: z.number().int().optional(),
});

const createAssetSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(ASSET_CATEGORIES),
  totalQuantity: z.coerce.number().int().min(0),
  availableQuantity: z.coerce.number().int().min(0).optional(),
  notes: z.string().trim().max(500).optional(),
});

const reserveAssetSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

const assetIdParamSchema = z.object({ id: objectId });

module.exports = {
  issueGatePassSchema,
  verifyGatePassSchema,
  createAssetSchema,
  reserveAssetSchema,
  assetIdParamSchema,
};
