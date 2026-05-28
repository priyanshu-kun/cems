'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const routes = require('./routes');

function parseCorsOrigin(value) {
  if (!value || value === '*') return true;
  const list = value.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length === 1 ? list[0] : list;
}

function createApp() {
  const app = express();

  app.disable('x-powered-by');

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(helmet());
  app.use(cors({ origin: parseCorsOrigin(env.CORS_ORIGIN), credentials: true }));
  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.BODY_LIMIT }));

  app.use(env.API_PREFIX, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
