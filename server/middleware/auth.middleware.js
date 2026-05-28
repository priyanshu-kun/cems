'use strict';

const { verifyAccess } = require('../utils/jwt');
const { DomainError } = require('../utils/domainError');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new DomainError('UNAUTHENTICATED', 'missing or malformed Authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new DomainError('UNAUTHENTICATED', 'empty bearer token'));
  }

  try {
    const claims = verifyAccess(token);
    req.principal = {
      userId: claims.sub,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };
