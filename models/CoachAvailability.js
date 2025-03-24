const mongoose = require('mongoose');

const coachAvailabilitySchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unavailableDates: [Date], // e.g. ["2025-04-01", "2025-04-04"]
  workingHours: {
    start: { type: String, default: '09:00' }, // HH:mm
    end: { type: String, default: '17:00' }
  }
});

module.exports = mongoose.model('CoachAvailability', coachAvailabilitySchema);
