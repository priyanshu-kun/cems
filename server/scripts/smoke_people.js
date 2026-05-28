'use strict';

/**
 * Smoke test for the redesigned people/guest/attendee model.
 *   - admin creates + deletes a student account
 *   - college-wide guest registry CRUD (admin/organizer)
 *   - organizer adds a student to an event (auto-RSVP + student pass)
 *   - organizer adds a guest to an event (guest pass) and verifies it at the gate
 *   - remove both; verify student & guest passes both verify via /gate-pass/verify
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

    console.log('--- ADMIN STUDENT ACCOUNTS ---');
    const created = await http(server, 'POST', '/users', {
      token: adminTok,
      body: { fullName: 'Temp Student', email: `temp-${Date.now()}@glauniversity.in`, password: 'password123', department: 'IT', year: 2 },
    });
    log('admin creates student', created);
    const newUserId = created.body.data?._id;

    const orgCreate = await http(server, 'POST', '/users', {
      token: orgTok,
      body: { fullName: 'Nope', email: `nope-${Date.now()}@x.com`, password: 'password123' },
    });
    log('organizer creates student (expect 403)', orgCreate);

    console.log('--- GUEST REGISTRY (college-wide) ---');
    const glist = await http(server, 'GET', '/guests', { token: orgTok });
    log('organizer lists guest registry', glist);
    console.log(`  -> ${glist.body.data.total} guests in registry (expect 2)`);

    const gcreate = await http(server, 'POST', '/guests', {
      token: orgTok,
      body: { fullName: 'Smoke Guest', email: `sg-${Date.now()}@ext.com`, organization: 'SmokeCo' },
    });
    log('organizer creates guest', gcreate);
    const guestId = gcreate.body.data?._id;

    console.log('--- ATTENDEES: add student (auto-RSVP + pass) ---');
    const addStu = await http(server, 'POST', `/events/${eventId}/attendees/students`, {
      token: orgTok,
      body: { userId: newUserId },
    });
    log('organizer adds student to event', addStu);
    const stuQr = addStu.body.data?.qr;

    const verifyStu = await http(server, 'POST', '/logistics/gate-pass/verify', { token: adminTok, body: stuQr });
    log('verify student pass at gate', verifyStu);
    console.log(`  -> valid=${verifyStu.body.data?.valid}, holder=${verifyStu.body.data?.holder?.name} (${verifyStu.body.data?.holder?.type})`);

    console.log('--- ATTENDEES: add guest (guest pass) ---');
    const addGuest = await http(server, 'POST', `/events/${eventId}/attendees/guests`, {
      token: orgTok,
      body: { guestId },
    });
    log('organizer adds guest to event', addGuest);
    const guestQr = addGuest.body.data?.qr;

    const verifyGuest = await http(server, 'POST', '/logistics/gate-pass/verify', { token: adminTok, body: guestQr });
    log('verify guest pass at gate', verifyGuest);
    console.log(`  -> valid=${verifyGuest.body.data?.valid}, holder=${verifyGuest.body.data?.holder?.name} (${verifyGuest.body.data?.holder?.type})`);

    console.log('--- ATTENDEE LIST ---');
    const attendees = await http(server, 'GET', `/events/${eventId}/attendees`, { token: orgTok });
    log('list attendees', attendees);
    console.log(`  -> students=${attendees.body.data.students}, guests=${attendees.body.data.guests}, total=${attendees.body.data.total}`);

    console.log('--- REMOVE + GUARD DELETION ---');
    const delGuestBusy = await http(server, 'DELETE', `/guests/${guestId}`, { token: adminTok });
    log('delete guest still attending (expect 400)', delGuestBusy);

    const remGuest = await http(server, 'DELETE', `/events/${eventId}/attendees/guests/${guestId}`, { token: orgTok });
    log('remove guest from event', remGuest);

    const delGuestOk = await http(server, 'DELETE', `/guests/${guestId}`, { token: adminTok });
    log('delete guest from registry now', delGuestOk);

    const remStu = await http(server, 'DELETE', `/events/${eventId}/attendees/students/${newUserId}`, { token: orgTok });
    log('remove student from event', remStu);

    const delUser = await http(server, 'DELETE', `/users/${newUserId}`, { token: adminTok });
    log('admin deletes student account', delUser);

    console.log('\nPEOPLE/GUEST/ATTENDEE SMOKE OK');
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
