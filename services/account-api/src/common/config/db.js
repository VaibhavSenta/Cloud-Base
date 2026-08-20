/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  const connString = process.env.CONNECTION || "mongodb://localhost:27017/cloudbase";
  try {
    mongoose.set('autoIndex', false);
    const conn = await mongoose.connect(connString);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
// Trigger restart
