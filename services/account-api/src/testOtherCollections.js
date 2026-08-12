/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

console.log("Connecting to MongoDB Atlas...");
mongoose.connect(connString, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log("✅ Connected successfully!");
    const db = mongoose.connection.db;
    
    console.log("1. Querying sessions collection...");
    try {
      const session = await db.collection('sessions').findOne({});
      console.log("Session resolved:", !!session);
    } catch (e) {
      console.error("Session query error:", e.message);
    }

    console.log("2. Querying users collection (limit 1)...");
    try {
      const users = await db.collection('users').find({}).limit(1).toArray();
      console.log("Users resolved, count:", users.length);
    } catch (e) {
      console.error("Users query error:", e.message);
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
