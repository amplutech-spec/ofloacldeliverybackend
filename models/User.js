const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: function () { return this.loginType !== 'Google'; } }, // only required if not Google login
  password: { type: String, required: function () { return this.loginType !== 'Google'; } }, // skip for Google
  token: { type: String },
  photoUrl: { type: String },
  available: { type: String, default: "No" },
  loginType: { type: String, enum: ["Normal", "Google"], default: "Normal" }
});

module.exports = mongoose.model("User", userSchema);
