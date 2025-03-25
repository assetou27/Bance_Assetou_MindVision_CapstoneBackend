// models/coachAvailability.js
const mongoose = require('mongoose');

/**
 * Coach Availability Schema
 * Tracks when coaches are available or unavailable for sessions
 * Includes working hours configuration and specific unavailable dates
 */
const coachAvailabilitySchema = new mongoose.Schema({
  // Reference to the Coach user
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: [true, 'Coach ID is required'],
    index: true // Indexing for faster queries
  },
  
  // Array of specific dates when the coach is unavailable (vacation, sick days, etc.)
  unavailableDates: [{
    type: Date,
    validate: {
      validator: function(date) {
        // Prevent setting unavailability for dates in the past
        return date >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Cannot set unavailability for dates in the past'
    }
  }],
  
  // Configuration for regular working schedule, by day of week
  workingHours: {
    // Monday configuration
    monday: {
      isWorking: { type: Boolean, default: true }, // Whether coach works on Mondays
      start: { type: String, default: '09:00' }, // Format: HH:MM in 24h format
      end: { type: String, default: '17:00' }
    },
    // Tuesday configuration
    tuesday: {
      isWorking: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    // Wednesday configuration
    wednesday: {
      isWorking: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    // Thursday configuration
    thursday: {
      isWorking: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    // Friday configuration
    friday: {
      isWorking: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    // Saturday configuration (default: not working)
    saturday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    // Sunday configuration (default: not working)
    sunday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  
  // Coach's timezone for accurate scheduling across different regions
  timeZone: {
    type: String,
    default: 'UTC'
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add index for efficient queries
// This helps MongoDB query coach availability faster
coachAvailabilitySchema.index({ coachId: 1 });

/**
 * Helper method to check if a coach is available at a specific date and time
 * @param {Date|String} dateTime - The date and time to check availability for
 * @returns {Boolean} - Whether the coach is available
 */
coachAvailabilitySchema.methods.isAvailable = function(dateTime) {
  // Convert to Date object if string is provided
  const checkDate = new Date(dateTime);
  
  // Check if date is in unavailable dates
  // Compares year, month, and day to handle timezone differences
  const unavailableMatch = this.unavailableDates.some(date => 
    date.getFullYear() === checkDate.getFullYear() &&
    date.getMonth() === checkDate.getMonth() &&
    date.getDate() === checkDate.getDate()
  );
  
  // If date is marked as unavailable, return false immediately
  if (unavailableMatch) return false;
  
  // Check working hours for the specific day of week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = daysOfWeek[checkDate.getDay()];
  const daySchedule = this.workingHours[dayName];
  
  // If this day is marked as non-working, return false
  if (!daySchedule.isWorking) return false;
  
  // Format the time portion as HH:MM for comparison with working hours
  const timeString = `${checkDate.getHours().toString().padStart(2, '0')}:${checkDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Check if time is within working hours for that day
  return timeString >= daySchedule.start && timeString <= daySchedule.end;
};

module.exports = mongoose.model('CoachAvailability', coachAvailabilitySchema);