'use strict';

const STATUS_BY_CODE = Object.freeze({
  VALIDATION_ERROR: 400,
  INVALID_TIME_RANGE: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VENUE_CONFLICT: 409,
  DUPLICATE_RESOURCE: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
});

class DomainError extends Error {
  constructor(code, message, details = undefined) {
    super(message || code);
    this.name = 'DomainError';
    this.code = code;
    this.httpStatus = STATUS_BY_CODE[code] || 500;
    if (details !== undefined) this.details = details;
    Error.captureStackTrace?.(this, DomainError);
  }
}

module.exports = { DomainError, STATUS_BY_CODE };
