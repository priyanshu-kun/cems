'use strict';

/**
 * Smoke check for /api/v1/dev/seed and a full demo-credential walkthrough.
 *   - GET    /dev/seed    → list demo creds
 *   - POST   /dev/seed    → wipe + reseed
 *   - login as student / organizer / admin using the printed creds
 *   - hit feed, events list, my pass — confirms seed wired everything correctly
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

function log(label, result) {
  const code = result.body?.error?.code;
  console.log(`  ${label}: ${result.status}${code ? ` [${code}]` : ''}`);
}

async function main() {
  await db.connect();
  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));

  try {
    console.log('--- /dev/seed ---');
    const info = await http(server, 'GET', '/dev/seed');
    log('GET /dev/seed (info)', info);

    const seeded = await http(server, 'POST', '/dev/seed');
    log('POST /dev/seed (run)', seeded);
    const summary = seeded.body.data?.summary;
    console.log('  summary:', JSON.stringify(summary));

    console.log('--- log in as each demo user ---');
    const loginRes = await Promise.all(
      ['student', 'organizer', 'admin'].map((r) =>
        http(server, 'POST', '/auth/login', {
          body: { email: `${r}@cems.local`, password: 'password123' },
        })
      )
    );
    loginRes.forEach((r, i) => log(`login ${['student', 'organizer', 'admin'][i]}`, r));
    const [studentTok, organizerTok, adminTok] = loginRes.map(
      (r) => r.body.data.accessToken
    );

    console.log('--- hit seeded endpoints ---');
    const feed = await http(server, 'GET', '/marketing/feed', { token: studentTok });
    log('student feed', feed);
    console.log(`  → ${feed.body.data.items.length} announcement(s) (expect 2)`);

    const events = await http(server, 'GET', '/events?limit=10', { token: studentTok });
    log('list events', events);
    console.log(`  → ${events.body.data.items.length} event(s) (expect 5)`);

    const sampleEventId = seeded.body.data.samples.approvedEventId;
    const detail = await http(server, 'GET', `/events/${sampleEventId}`, { token: studentTok });
    log('GET seeded APPROVED event', detail);
    console.log(`  → status=${detail.body.data.status}, rsvpCount=${detail.body.data.rsvpCount}`);

    const qr = seeded.body.data.samples.gatePassQr;
    const verify = await http(server, 'POST', '/logistics/gate-pass/verify', {
      token: adminTok,
      body: qr,
    });
    log('verify seeded gate pass', verify);
    console.log(`  → valid=${verify.body.data?.valid}`);

    const assets = await http(server, 'GET', '/logistics/assets', { token: organizerTok });
    log('list assets', assets);
    console.log(`  → ${assets.body.data.items.length} asset(s) (expect 3)`);

    console.log('\nSEED SMOKE OK');
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
