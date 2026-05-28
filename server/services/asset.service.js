'use strict';

const Asset = require('../models/asset.model');
const { DomainError } = require('../utils/domainError');

async function createAsset(dto) {
  if (dto.availableQuantity === undefined) dto.availableQuantity = dto.totalQuantity;
  return Asset.create(dto);
}

async function listAssets({ category, activeOnly = true } = {}) {
  const filter = {};
  if (activeOnly) filter.isActive = true;
  if (category) filter.category = category;
  return Asset.find(filter).sort({ name: 1 }).lean();
}

/**
 * Atomically reserve `quantity` units from `assetId`.
 *
 * Uses a conditional $inc — the update only matches when there is enough
 * available stock, so concurrent reservers can never oversubscribe.
 * Returns the updated asset document on success.
 */
async function reserveAsset(assetId, quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new DomainError('VALIDATION_ERROR', 'quantity must be a positive integer');
  }

  const updated = await Asset.findOneAndUpdate(
    { _id: assetId, isActive: true, availableQuantity: { $gte: quantity } },
    { $inc: { availableQuantity: -quantity } },
    { new: true }
  );

  if (!updated) {
    const exists = await Asset.findById(assetId).lean();
    if (!exists) throw new DomainError('NOT_FOUND', 'asset not found');
    if (!exists.isActive) throw new DomainError('VALIDATION_ERROR', 'asset is inactive');
    throw new DomainError(
      'VALIDATION_ERROR',
      `insufficient stock (requested ${quantity}, available ${exists.availableQuantity})`
    );
  }
  return updated;
}

async function releaseAsset(assetId, quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new DomainError('VALIDATION_ERROR', 'quantity must be a positive integer');
  }
  // Conditional $inc capped by totalQuantity to prevent over-release.
  const asset = await Asset.findById(assetId);
  if (!asset) throw new DomainError('NOT_FOUND', 'asset not found');
  const headroom = asset.totalQuantity - asset.availableQuantity;
  if (quantity > headroom) {
    throw new DomainError(
      'VALIDATION_ERROR',
      `cannot release ${quantity}; only ${headroom} units are out`
    );
  }
  const updated = await Asset.findOneAndUpdate(
    { _id: assetId },
    { $inc: { availableQuantity: quantity } },
    { new: true }
  );
  return updated;
}

module.exports = { createAsset, listAssets, reserveAsset, releaseAsset };
