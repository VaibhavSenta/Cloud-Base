/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// Load environment variables from .env.local if present
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.CONNECTION || process.env.MONGO_URI || 'mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase';
    mongoose.set('autoIndex', false);
    await mongoose.connect(mongoURI);
    console.log('✅ [Chat-API] MongoDB Connected successfully.');
  } catch (error) {
    console.error(`❌ [Chat-API] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
