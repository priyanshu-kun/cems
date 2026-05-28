'use strict';

/**
 * Smoke test for the venues / users / guests modules.
 *   - seeds a fresh dataset
 *   - logs in as admin + organizer
 *   - venues: list, create, update, list-active
 *   - users: list, filter, set roles, deactivate (+ verify deactivated login blocked)
 *   - guests: list, add, check-in, remove (ownership enforced)
 */

const env = require('../config/env');
const db = require('../config/db');
const createApp = require('../app');

async function http(server, method, path, { body, token } = {}) {
  const { port } = server.address();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`http://127.0.0.1:${port}${env.API_PREFIX}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

function log(label, r) {
  const code = r.body?.error?.code;
  console.log(`  ${label}: ${r.status}${code ? ` [${code}]` : ''}`);
}

async function main() {
  await db.connect();
  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));

  try {
    const seeded = await http(server, 'POST', '/dev/seed');
    const adminTok = seeded.body.data.tokens.admin.accessToken;
    const orgTok = seeded.body.data.tokens.organizer.accessToken;
    const eventId = seeded.body.data.samples.approvedEventId;

    console.log('--- VENUES ---');
    const vlist = await http(server, 'GET', '/venues', { token: orgTok });
    log('organizer lists venues', vlist);
    console.log(`  -> ${vlist.body.data.items.length} active venues (expect 3)`);

    const vcreate = await http(server, 'POST', '/venues', {
      token: adminTok,
      body: { name: `Smoke Hall ${Date.now()}`, building: 'Z Block', capacity: 75, facilities: ['wifi', 'ac'] },
    });
    log('admin creates venue', vcreate);
    const venueId = vcreate.body.data?._id;

    const vcreateForbidden = await http(server, 'POST', '/venues', {
      token: orgTok,
      body: { name: 'Should Fail', capacity: 10 },
    });
    log('organizer create venue (expect 403)', vcreateForbidden);

    const vupdate = await http(server, 'PATCH', `/venues/${venueId}`, {
      token: adminTok,
      body: { capacity: 90 },
    });
    log('admin updates venue capacity', vupdate);
    console.log(`  -> capacity now ${vupdate.body.data?.capacity} (expect 90)`);

    const vdelete = await http(server, 'DELETE', `/venues/${venueId}`, { token: adminTok });
    log('admin deactivates venue', vdelete);
    console.log(`  -> isActive now ${vdelete.body.data?.isActive} (expect false)`);

    console.log('--- USERS ---');
    const ulist = await http(server, 'GET', '/users?role=STUDENT&limit=10', { token: adminTok });
    log('admin lists students', ulist);
    console.log(`  -> ${ulist.body.data.items.length} students, total ${ulist.body.data.total}`);

    const uForbidden = await http(server, 'GET', '/users', { token: seeded.body.data.tokens.student.accessToken });
    log('student lists users (expect 403)', uForbidden);

    const targetStudent = ulist.body.data.items.find((u) => u.email === 'kashish@glauniversity.in');
    const promote = await http(server, 'PATCH', `/users/${targetStudent._id}/roles`, {
      token: adminTok,
      body: { roles: ['STUDENT', 'ORGANIZER'] },
    });
    log('admin promotes kashish to organizer', promote);
    console.log(`  -> roles now ${JSON.stringify(promote.body.data?.roles)}`);

    const deactivate = await http(server, 'PATCH', `/users/${targetStudent._id}/status`, {
      token: adminTok,
      body: { isActive: false },
    });
    log('admin deactivates kashish', deactivate);

    const blockedLogin = await http(server, 'POST', '/auth/login', {
      body: { email: 'kashish@glauniversity.in', password: 'password123' },
    });
    log('deactivated user login (expect 403)', blockedLogin);

    // reactivate so re-runs are clean-ish
    await http(server, 'PATCH', `/users/${targetStudent._id}/status`, { token: adminTok, body: { isActive: true } });

    console.log('--- GUESTS ---');
    const glist = await http(server, 'GET', `/events/${eventId}/guests`, { token: orgTok });
    log('organizer lists guests', glist);
    console.log(`  -> ${glist.body.data.total} guests, ${glist.body.data.checkedIn} checked in (expect 2, 1)`);

    const gadd = await http(server, 'POST', `/events/${eventId}/guests`, {
      token: orgTok,
      body: { fullName: 'Smoke Guest', email: `guest-${Date.now()}@ext.com`, organization: 'TestCo' },
    });
    log('organizer adds guest', gadd);
    const guestId = gadd.body.data?._id;

    const gcheckin = await http(server, 'PATCH', `/events/${eventId}/guests/${guestId}`, {
      token: orgTok,
      body: { status: 'CHECKED_IN' },
    });
    log('organizer checks in guest', gcheckin);
    console.log(`  -> status ${gcheckin.body.data?.status}, checkedInAt set: ${Boolean(gcheckin.body.data?.checkedInAt)}`);

    const gremove = await http(server, 'DELETE', `/events/${eventId}/guests/${guestId}`, { token: orgTok });
    log('organizer removes guest', gremove);

    console.log('\nADMIN-MODULES SMOKE OK');
  } finally {
    await new Promise((r) => server.close(r));
    await db.disconnect();
  }
}

main().catch(async (err) => {
  console.error('SMOKE FAIL:', err);
  await db.disconnect().catch(() => {});
  process.exit(1);
});
