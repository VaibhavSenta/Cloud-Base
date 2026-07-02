const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

mongoose.connect(connString)
  .then(async () => {
    const admin = mongoose.connection.db.admin();
    console.log("Fetching active database operations...");
    try {
      const ops = await admin.command({ currentOp: 1, active: true });
      console.log("Active operations:", JSON.stringify(ops, null, 2));
    } catch (e) {
      console.error("Error fetching current ops:", e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
