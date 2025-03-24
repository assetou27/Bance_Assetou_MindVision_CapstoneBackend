// User schema with password encryption
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for coach and client accounts
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Required field
  },
  email: {
    type: String,
    required: true,
    unique: true, // Must be unique
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['coach', 'client'],
    default: 'client',
  },
}, { timestamps: true });

// Encrypt password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new/changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add method to validate login password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
