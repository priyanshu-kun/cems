'use strict';

const asyncHandler = require('../utils/asyncHandler');
const logisticsService = require('../services/logistics.service');
const assetService = require('../services/asset.service');

const issuePass = asyncHandler(async (req, res) => {
  const result = await logisticsService.issueGatePass(req.body.eventId, req.principal.userId);
  res.status(201).json({ success: true, data: result, error: null });
});

const verifyPass = asyncHandler(async (req, res) => {
  const result = await logisticsService.verifyGatePass(req.body);
  res.status(200).json({
    success: result.valid,
    data: result,
    error: result.valid ? null : { code: 'INVALID_PASS', message: result.reason },
  });
});

const consumePass = asyncHandler(async (req, res) => {
  const pass = await logisticsService.consumeGatePass(req.body.passId);
  res.status(200).json({ success: true, data: pass, error: null });
});

const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body);
  res.status(201).json({ success: true, data: asset, error: null });
});

const listAssets = asyncHandler(async (req, res) => {
  const items = await assetService.listAssets();
  res.status(200).json({ success: true, data: { items }, error: null });
});

const reserveAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.reserveAsset(req.params.id, req.body.quantity);
  res.status(200).json({ success: true, data: asset, error: null });
});

const releaseAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.releaseAsset(req.params.id, req.body.quantity);
  res.status(200).json({ success: true, data: asset, error: null });
});

module.exports = {
  issuePass,
  verifyPass,
  consumePass,
  createAsset,
  listAssets,
  reserveAsset,
  releaseAsset,
};
