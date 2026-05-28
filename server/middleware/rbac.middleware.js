'use strict';

const { DomainError } = require('../utils/domainError');

function requireRoles(...allowed) {
  if (allowed.length === 0) {
    throw new Error('requireRoles() needs at least one role');
  }
  const allowedSet = new Set(allowed);

  return function rbacGuard(req, _res, next) {
    const principal = req.principal;
    if (!principal) {
      return next(new DomainError('UNAUTHENTICATED', 'authentication required'));
    }
    const hasRole = principal.roles.some((r) => allowedSet.has(r));
    if (!hasRole) {
      return next(
        new DomainError('FORBIDDEN', `requires one of: ${allowed.join(', ')}`)
      );
    }
    return next();
  };
}

module.exports = { requireRoles };
