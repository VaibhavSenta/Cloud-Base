/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const mongoose = require('mongoose');
const connectDB = require('./src/common/config/db');
const { USER } = require('./src/features/auth/auth.model');

async function run() {
  await connectDB();
  try {
    const user = await USER.findOne({ email: 'vaibhavsenta999@gmail.com' });
    console.log('👤 Current User State in MongoDB:');
    console.log(JSON.stringify({
      id: user._id,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorPrimary: user.twoFactorPrimary,
      twoFactorMethods: user.twoFactorMethods,
      authenticatorSecret: user.authenticatorSecret
    }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}
run();
