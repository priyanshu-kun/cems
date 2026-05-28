'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { DomainError } = require('./domainError');

const COMMON = Object.freeze({
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
});

function signAccess(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    ...COMMON,
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

function signRefresh(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    ...COMMON,
    expiresIn: env.JWT_REFRESH_TTL,
  });
}

function verifyAccess(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, COMMON);
  } catch (err) {
    throw new DomainError('UNAUTHENTICATED', mapJwtError(err));
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, COMMON);
  } catch (err) {
    throw new DomainError('UNAUTHENTICATED', mapJwtError(err));
  }
}

function mapJwtError(err) {
  if (err.name === 'TokenExpiredError') return 'token expired';
  if (err.name === 'JsonWebTokenError') return 'invalid token';
  return 'token verification failed';
}

function issueTokenPair(user) {
  const subject = String(user._id);
  const payload = { sub: subject, roles: user.roles };
  return {
    accessToken: signAccess(payload),
    refreshToken: signRefresh({ sub: subject }),
  };
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, issueTokenPair };
