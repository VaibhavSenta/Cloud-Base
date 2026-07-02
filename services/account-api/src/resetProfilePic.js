const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

mongoose.connect(connString)
  .then(async () => {
    const db = mongoose.connection.db;
    console.log("Connected to Atlas. Resetting profilePic to default for all users to clear potential massive Base64 payloads...");
    
    const result = await db.collection('users').updateMany(
      {},
      { $set: { profilePic: "/icons/person.svg" } }
    );
    
    console.log(`✅ Update completed. Modified count: ${result.modifiedCount}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
