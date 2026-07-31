const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB Warning]: MONGODB_URI is not set. Running without persistent database.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    console.warn(`[MongoDB Notice]: Could not connect to Atlas (${error.message}). Services will use in-memory fallback.`);
    // Do NOT re-throw — server should still start and use in-memory cache fallbacks
  }
}

module.exports = connectDB;
