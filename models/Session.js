const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'canceled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  rescheduledAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
