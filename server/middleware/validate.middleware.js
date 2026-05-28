'use strict';

const { DomainError } = require('../utils/domainError');

function validate(schemas) {
  return function validateMw(req, _res, next) {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) return next(toDomainError(parsed.error, 'body'));
        req.body = parsed.data;
      }
      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) return next(toDomainError(parsed.error, 'params'));
        req.params = parsed.data;
      }
      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) return next(toDomainError(parsed.error, 'query'));
        req.query = parsed.data;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

function toDomainError(zodError, segment) {
  const details = {};
  for (const issue of zodError.issues) {
    const path = issue.path.length ? issue.path.join('.') : '(root)';
    details[`${segment}.${path}`] = issue.message;
  }
  return new DomainError('VALIDATION_ERROR', 'request validation failed', details);
}

module.exports = { validate };
