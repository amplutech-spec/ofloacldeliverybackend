const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String },
  photoUrl: { type: String },
  available: { type: String },
  loginType: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
