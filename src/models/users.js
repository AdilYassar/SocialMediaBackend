const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '' }, // Profile Picture URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
