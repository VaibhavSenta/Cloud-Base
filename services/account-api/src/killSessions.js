const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

mongoose.connect(connString)
  .then(async () => {
    const admin = mongoose.connection.db.admin();
    console.log("Attempting to kill all database sessions to release uncommitted transaction locks...");
    try {
      const res = await admin.command({ killAllSessions: [] });
      console.log("✅ killAllSessions response:", JSON.stringify(res, null, 2));
    } catch (e) {
      console.error("❌ Error running killAllSessions:", e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
