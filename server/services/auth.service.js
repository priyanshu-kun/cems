'use strict';

const User = require('../models/user.model');
const { DomainError } = require('../utils/domainError');
const { issueTokenPair, verifyRefresh } = require('../utils/jwt');

async function register({ fullName, email, password, department, year, roles }) {
  const existing = await User.exists({ email });
  if (existing) {
    throw new DomainError('DUPLICATE_RESOURCE', 'email already registered');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    department,
    year,
    roles: roles && roles.length ? roles : ['STUDENT'],
  });

  const tokens = issueTokenPair(user);
  return { user: sanitize(user), ...tokens };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new DomainError('UNAUTHENTICATED', 'invalid credentials');
  }
  const ok = await user.verifyPassword(password);
  if (!ok) {
    throw new DomainError('UNAUTHENTICATED', 'invalid credentials');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueTokenPair(user);
  return { user: sanitize(user), ...tokens };
}

async function refresh({ refreshToken }) {
  const claims = verifyRefresh(refreshToken);
  const user = await User.findById(claims.sub);
  if (!user) {
    throw new DomainError('UNAUTHENTICATED', 'user no longer exists');
  }
  return issueTokenPair(user);
}

function sanitize(user) {
  const obj = user.toJSON();
  delete obj.passwordHash;
  return obj;
}

module.exports = { register, login, refresh };
