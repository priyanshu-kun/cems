'use strict';

const mongoose = require('mongoose');
const { DomainError } = require('../utils/domainError');

function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const t = translate(err);
  if (t.httpStatus >= 500) {
    console.error('[error]', err);
  }
  res.status(t.httpStatus).json({
    success: false,
    data: null,
    error: {
      code: t.code,
      message: t.message,
      ...(t.details ? { details: t.details } : {}),
    },
  });
}

function translate(err) {
  if (err instanceof DomainError) {
    return { code: err.code, message: err.message, httpStatus: err.httpStatus, details: err.details };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Request payload failed schema validation',
      httpStatus: 400,
      details: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { code: 'VALIDATION_ERROR', message: `Invalid ${err.path}: ${err.value}`, httpStatus: 400 };
  }
  if (err && err.code === 11000) {
    return {
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
      httpStatus: 409,
      details: err.keyValue,
    };
  }
  return { code: 'INTERNAL', message: 'Internal server error', httpStatus: 500 };
}

module.exports = { errorHandler, notFoundHandler };
