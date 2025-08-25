const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  dob: Date,
  phone: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
