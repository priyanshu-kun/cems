'use strict';

/**
 * Phase 3 end-to-end smoke: RSVP → gate pass → verify → consume,
 * asset reservation under contention, marketing announcement + feed.
 *
 * Run: node scripts/smoke_phase3.js
 */

const env = require('../config/env');
const db = require('../config/db');
const createApp = require('../app');
const User = require('../models/user.model');
const Venue = require('../models/venue.model');
const Event = require('../models/event.model');
const Rsvp = require('../models/rsvp.model');
const Asset = require('../models/asset.model');
const Announcement = require('../models/announcement.model');
const GatePass = require('../models/gatePass.model');

const SMOKE_TAG = 'phase3-smoke';

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
  await GatePass.deleteMany({});
  await Rsvp.deleteMany({});
  await User.deleteMany({ email: { $regex: /@smoke3\.local$/ } });
  await Event.deleteMany({ tags: SMOKE_TAG });
  await Venue.deleteMany({ name: { $regex: /^SMOKE3 / } });
  await Asset.deleteMany({ name: { $regex: /^SMOKE3 / } });
  await Announcement.deleteMany({ title: { $regex: /^SMOKE3 / } });
}

async function main() {
  await db.connect();
  await cleanup();

  const venue = await Venue.create({ name: `SMOKE3 Hall ${Date.now()}`, capacity: 500 });

  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));

  try {
    // --- Provision two users ---
    const orgReg = await http(server, 'POST', '/auth/register', {
      body: {
        fullName: 'Org P3',
        email: `org-${Date.now()}@smoke3.local`,
        password: 'password123',
        department: 'CSE',
        year: 3,
      },
    });
    await User.updateOne({ _id: orgReg.body.data.user._id }, { $set: { roles: ['ORGANIZER'] } });

    const adminReg = await http(server, 'POST', '/auth/register', {
      body: {
        fullName: 'Admin P3',
        email: `admin-${Date.now()}@smoke3.local`,
        password: 'password123',
        department: 'ADMIN',
        year: 6,
      },
    });
    await User.updateOne({ _id: adminReg.body.data.user._id }, { $set: { roles: ['ADMIN'] } });

    const studentReg = await http(server, 'POST', '/auth/register', {
      body: {
        fullName: 'Student P3',
        email: `student-${Date.now()}@smoke3.local`,
        password: 'password123',
        department: 'CSE',
        year: 3,
      },
    });

    const orgToken = (
      await http(server, 'POST', '/auth/login', {
        body: { email: orgReg.body.data.user.email, password: 'password123' },
      })
    ).body.data.accessToken;

    const adminToken = (
      await http(server, 'POST', '/auth/login', {
        body: { email: adminReg.body.data.user.email, password: 'password123' },
      })
    ).body.data.accessToken;

    const studentToken = (
      await http(server, 'POST', '/auth/login', {
        body: { email: studentReg.body.data.user.email, password: 'password123' },
      })
    ).body.data.accessToken;

    // --- Create and approve an event so it becomes RSVP-eligible ---
    const start = new Date(Date.now() + 24 * 3600 * 1000);
    const end = new Date(start.getTime() + 3 * 3600 * 1000);
    const created = await http(server, 'POST', '/events', {
      token: orgToken,
      body: {
        title: 'P3 Showcase',
        description: 'Smoke event for phase 3',
        venueId: String(venue._id),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: 2, // tiny so we can exercise the capacity guard
        tags: [SMOKE_TAG],
      },
    });
    const eventId = created.body.data._id;
    await http(server, 'PATCH', `/events/${eventId}/status`, {
      token: adminToken,
      body: { status: 'APPROVED' },
    });

    console.log('--- RSVP ---');
    const rsvp1 = await http(server, 'POST', `/events/${eventId}/rsvp`, { token: studentToken });
    log('student RSVPs', rsvp1);
    const rsvpDup = await http(server, 'POST', `/events/${eventId}/rsvp`, { token: studentToken });
    log('duplicate RSVP (expect 409)', rsvpDup);

    // Fill capacity to verify the gate
    const rsvp2 = await http(server, 'POST', `/events/${eventId}/rsvp`, { token: orgToken });
    log('organizer also RSVPs', rsvp2);
    const rsvp3 = await http(server, 'POST', `/events/${eventId}/rsvp`, { token: adminToken });
    log('admin RSVP at capacity (expect 400)', rsvp3);

    console.log('--- GATE PASS ---');
    const passNoRsvpUser = adminToken; // admin has no RSVP
    const noRsvpPass = await http(server, 'POST', '/logistics/gate-pass', {
      token: passNoRsvpUser,
      body: { eventId },
    });
    log('issue without RSVP (expect 403)', noRsvpPass);

    const passIssued = await http(server, 'POST', '/logistics/gate-pass', {
      token: studentToken,
      body: { eventId },
    });
    log('issue with confirmed RSVP', passIssued);
    const qr = passIssued.body.data.qr;

    const verifyOk = await http(server, 'POST', '/logistics/gate-pass/verify', {
      token: adminToken,
      body: qr,
    });
    log('verify valid pass', verifyOk);

    // Tamper with the signature and re-verify
    const tampered = { ...qr, sig: qr.sig.replace(/.$/, qr.sig.endsWith('0') ? '1' : '0') };
    const verifyBad = await http(server, 'POST', '/logistics/gate-pass/verify', {
      token: adminToken,
      body: tampered,
    });
    log('verify tampered pass (expect invalid)', verifyBad);

    const consumed = await http(server, 'POST', '/logistics/gate-pass/consume', {
      token: adminToken,
      body: { passId: qr.passId },
    });
    log('consume pass', consumed);
    const consumeAgain = await http(server, 'POST', '/logistics/gate-pass/consume', {
      token: adminToken,
      body: { passId: qr.passId },
    });
    log('consume already-used pass (expect 400)', consumeAgain);

    console.log('--- ASSETS ---');
    const assetCreated = await http(server, 'POST', '/logistics/assets', {
      token: adminToken,
      body: { name: `SMOKE3 Projector ${Date.now()}`, category: 'PROJECTOR', totalQuantity: 5 },
    });
    log('admin creates asset', assetCreated);
    const assetId = assetCreated.body.data._id;

    // Concurrent reservation race — 10 parallel requests for 1 unit each from stock of 5.
    const reserveResponses = await Promise.all(
      Array.from({ length: 10 }, () =>
        http(server, 'POST', `/logistics/assets/${assetId}/reserve`, {
          token: orgToken,
          body: { quantity: 1 },
        })
      )
    );
    const successes = reserveResponses.filter((r) => r.status === 200).length;
    const failures = reserveResponses.filter((r) => r.status !== 200).length;
    console.log(`  concurrent reserves: ${successes} ok / ${failures} rejected (expect 5/5)`);
    const finalAsset = await Asset.findById(assetId).lean();
    console.log(`  final availableQuantity: ${finalAsset.availableQuantity} (expect 0)`);

    const release = await http(server, 'POST', `/logistics/assets/${assetId}/release`, {
      token: orgToken,
      body: { quantity: 2 },
    });
    log('release 2 units', release);

    console.log('--- MARKETING ---');
    const announce = await http(server, 'POST', '/marketing/announcements', {
      token: orgToken,
      body: {
        title: 'SMOKE3 CSE-only announcement',
        body: 'For CSE year 3 students only.',
        targetAudience: { departments: ['CSE'], years: [3] },
      },
    });
    log('create targeted announcement', announce);

    const allAnnounce = await http(server, 'POST', '/marketing/announcements', {
      token: adminToken,
      body: {
        title: 'SMOKE3 Broadcast for everyone',
        body: 'No targeting — everybody sees this.',
      },
    });
    log('create broadcast announcement', allAnnounce);

    const feedCse = await http(server, 'GET', '/marketing/feed', { token: studentToken });
    log('CSE student feed', feedCse);
    console.log(`  → received ${feedCse.body.data.items.length} items (expect 2)`);

    const feedAdmin = await http(server, 'GET', '/marketing/feed', { token: adminToken });
    log('admin (dept=ADMIN) feed', feedAdmin);
    console.log(
      `  → received ${feedAdmin.body.data.items.length} items (expect 1, broadcast only)`
    );

    console.log('\nPHASE 3 SMOKE OK');
  } finally {
    await new Promise((r) => server.close(r));
    await cleanup();
    await Venue.deleteOne({ _id: venue._id });
    await db.disconnect();
  }
}

main().catch(async (err) => {
  console.error('SMOKE FAIL:', err);
  await db.disconnect().catch(() => {});
  process.exit(1);
});
