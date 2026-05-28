'use strict';

const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

async function connect(uri = env.MONGO_URI) {
  await mongoose.connect(uri, { autoIndex: env.NODE_ENV !== 'production' });
  console.log(`[db] connected to ${mongoose.connection.name}`);
  return mongoose.connection;
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

module.exports = { connect, disconnect, mongoose };
