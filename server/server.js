'use strict';

const env = require('./config/env');
const db = require('./config/db');
const createApp = require('./app');

async function start() {
  await db.connect();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
}

start().catch((err) => {
  console.error('[fatal] failed to start:', err);
  process.exit(1);
});
