'use strict';

/**
 * CLI wrapper around the seed service. Same behavior as `POST /api/v1/dev/seed`.
 *
 * Usage:
 *   npm run seed           # seed
 *   npm run seed -- clear  # wipe demo data only
 */

const db = require('../config/db');
const seeder = require('../services/devSeed.service');

async function main() {
  const action = (process.argv[2] || 'seed').toLowerCase();
  await db.connect();
  try {
    if (action === 'clear') {
      await seeder.clearDemoData();
      console.log('[seed] demo data cleared');
    } else if (action === 'seed') {
      const result = await seeder.seedAll();
      console.log('[seed] done');
      console.log(JSON.stringify({ summary: result.summary, credentials: result.credentials }, null, 2));
    } else {
      console.error(`unknown action "${action}" — expected "seed" or "clear"`);
      process.exitCode = 2;
    }
  } finally {
    await db.disconnect();
  }
}

main().catch(async (err) => {
  console.error('[seed] failed:', err.message);
  await db.disconnect().catch(() => {});
  process.exit(1);
});
