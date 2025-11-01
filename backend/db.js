const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error('MONGO_URI not set');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('DB connection error', err);
    throw err;
  }
};
module.exports = connectDB;


const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('MONGO_URI missing');

let cached = global._mongo; // node global
if (!cached) cached = global._mongo = { conn: null, promise: null };

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { /* options */ }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connect;