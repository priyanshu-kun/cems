'use strict';

/**
 * Phase 2 end-to-end smoke check against the configured Atlas/Mongo cluster.
 *
 *   - boots the app in-process on a random port
 *   - registers an organizer and an admin
 *   - logs in, exercises /events create + conflict + transition
 *   - cleans up the demo users/events/venue it created (idempotent by tag)
 *
 * Run:  node scripts/smoke_phase2.js
 */

const mongoose = require('mongoose');
const env = require('../config/env');
const db = require('../config/db');
const createApp = require('../app');
const User = require('../models/user.model');
const Venue = require('../models/venue.model');
const Event = require('../models/event.model');

const SMOKE_TAG = 'phase2-smoke';

async function http(server, method, path, { body, token } = {}) {
  const { port } = server.address();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`http://127.0.0.1:${port}${env.API_PREFIX}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

function log(label, result) {
  const code = result.body?.error?.code;
  console.log(`  ${label}: ${result.status}${code ? ` [${code}]` : ''}`);
}

async function cleanup() {
  await User.deleteMany({ email: { $regex: /@smoke\.local$/ } });
  await Event.deleteMany({ tags: SMOKE_TAG });
  await Venue.deleteMany({ name: { $regex: /^SMOKE / } });
}

async function main() {
  await db.connect();
  await cleanup();

  const venue = await Venue.create({ name: `SMOKE Auditorium ${Date.now()}`, capacity: 300 });

  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));

  try {
    console.log('--- AUTH ---');
    const reg1 = await http(server, 'POST', '/auth/register', {
      body: {
        fullName: 'Org Smoke',
        email: `org-${Date.now()}@smoke.local`,
        password: 'password123',
      },
    });
    log('register student', reg1);

    // Promote the test user to ORGANIZER for the create flow.
    await User.updateOne({ _id: reg1.body.data.user._id }, { $set: { roles: ['ORGANIZER'] } });

    const adminEmail = `admin-${Date.now()}@smoke.local`;
    const adminReg = await http(server, 'POST', '/auth/register', {
      body: { fullName: 'Admin Smoke', email: adminEmail, password: 'password123' },
    });
    log('register admin (pre-promotion)', adminReg);
    await User.updateOne({ _id: adminReg.body.data.user._id }, { $set: { roles: ['ADMIN'] } });

    const loginOrg = await http(server, 'POST', '/auth/login', {
      body: { email: reg1.body.data.user.email, password: 'password123' },
    });
    log('login organizer', loginOrg);
    const orgToken = loginOrg.body.data.accessToken;

    const loginAdmin = await http(server, 'POST', '/auth/login', {
      body: { email: adminEmail, password: 'password123' },
    });
    log('login admin', loginAdmin);
    const adminToken = loginAdmin.body.data.accessToken;

    const me = await http(server, 'GET', '/auth/me', { token: orgToken });
    log('GET /auth/me', me);

    const badLogin = await http(server, 'POST', '/auth/login', {
      body: { email: reg1.body.data.user.email, password: 'WRONG' },
    });
    log('login wrong password (expect 401)', badLogin);

    console.log('--- EVENTS ---');
    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);

    const noAuth = await http(server, 'POST', '/events', {
      body: {
        title: 'no auth attempt',
        description: 'should fail',
        venueId: String(venue._id),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: 100,
        tags: [SMOKE_TAG],
      },
    });
    log('create without token (expect 401)', noAuth);

    const created = await http(server, 'POST', '/events', {
      token: orgToken,
      body: {
        title: 'Annual Tech Fest',
        description: 'Smoke event',
        venueId: String(venue._id),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: 200,
        tags: [SMOKE_TAG],
      },
    });
    log('organizer creates event', created);
    const eventId = created.body.data?._id;

    // Push into ACTIVE state so the FCFS overlap guard becomes load-bearing.
    const approve = await http(server, 'PATCH', `/events/${eventId}/status`, {
      token: adminToken,
      body: { status: 'APPROVED' },
    });
    log('admin APPROVE', approve);

    const overlapStart = new Date(start.getTime() + 30 * 60 * 1000);
    const overlapEnd = new Date(end.getTime() + 30 * 60 * 1000);
    const conflictDraft = await http(server, 'POST', '/events', {
      token: orgToken,
      body: {
        title: 'Conflicting overlap',
        description: 'overlaps the approved one',
        venueId: String(venue._id),
        startTime: overlapStart.toISOString(),
        endTime: overlapEnd.toISOString(),
        capacity: 50,
        tags: [SMOKE_TAG],
      },
    });
    // Draft creation itself doesn't conflict (DRAFT is non-active); transition will.
    log('organizer creates overlapping draft', conflictDraft);
    const conflictId = conflictDraft.body.data?._id;

    const pendingForConflict = await http(server, 'PATCH', `/events/${conflictId}/status`, {
      token: orgToken,
      body: { status: 'PENDING_APPROVAL' },
    });
    log('organizer → PENDING_APPROVAL', pendingForConflict);

    const conflictApprove = await http(server, 'PATCH', `/events/${conflictId}/status`, {
      token: adminToken,
      body: { status: 'APPROVED' },
    });
    log('admin tries to APPROVE overlap (expect 409)', conflictApprove);

    const illegalJump = await http(server, 'PATCH', `/events/${eventId}/status`, {
      token: adminToken,
      body: { status: 'DRAFT' },
    });
    log('illegal transition APPROVED → DRAFT (expect 400)', illegalJump);

    const list = await http(server, 'GET', '/events?status=APPROVED&limit=5', { token: orgToken });
    log('list APPROVED events', list);

    console.log('\nSMOKE OK');
  } finally {
    await new Promise((r) => server.close(r));
    await cleanup();
    await Venue.deleteOne({ _id: venue._id });
    await db.disconnect();
  }
}

main().catch((err) => {
  console.error('SMOKE FAIL:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
