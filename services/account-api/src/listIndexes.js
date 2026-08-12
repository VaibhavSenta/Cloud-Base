/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

mongoose.connect(connString)
  .then(async () => {
    const db = mongoose.connection.db;
    console.log("Fetching indexes for users collection...");
    try {
      const indexes = await db.collection('users').indexes();
      console.log("Indexes on users collection:", JSON.stringify(indexes, null, 2));
    } catch (e) {
      console.error("Error fetching indexes:", e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
