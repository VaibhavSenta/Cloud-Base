const mongoose = require('mongoose');
const connString = "mongodb+srv://VaibhavSenta:y3B9ZjzSsWhyE425@senta.xuitg.mongodb.net/cloudbase";

console.log("Connecting to MongoDB Atlas...");
mongoose.connect(connString, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log("✅ Connected successfully!");
    const db = mongoose.connection.db;
    console.log("Querying users collection for 6a2db64ef7f560356871f867...");
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId("6a2db64ef7f560356871f867") });
    console.log("User found:", user);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });
