const mongoose = require('mongoose');

const connectDB = async () => {
  const connString = process.env.CONNECTION || "mongodb://localhost:27017/cloudbase";
  try {
    const conn = await mongoose.connect(connString);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
