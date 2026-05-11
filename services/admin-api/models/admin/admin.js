const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, unique: false },
    lastname: { type: String, required: false, unique: false }, // Yahan lastname aayega
    loginid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const ADMIN = mongoose.model("ADMIN", adminSchema);

module.exports = {
  ADMIN,
};
