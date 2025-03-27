// models/Appointments.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Make 'service' optional or remove it entirely
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Keep or remove the index as you wish
AppointmentSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
