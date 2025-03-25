// models/session.js
const mongoose = require('mongoose');

/**
 * Session Schema
 * Represents coaching sessions between coaches and clients
 * Tracks session details, status, and modifications
 */
const sessionSchema = new mongoose.Schema({
  // Reference to the coach providing the session
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: [true, 'Coach ID is required']
  },
  
  // Reference to the client receiving the session
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: [true, 'Client ID is required']
  },
  
  // Date and time when the session is scheduled
  date: {
    type: Date,
    required: [true, 'Session date is required'],
    validate: {
      validator: function(value) {
        // Ensure sessions can only be scheduled in the future
        return value > new Date();
      },
      message: 'Session date must be in the future'
    }
  },
  
  // Duration of the session in minutes
  duration: {
    type: Number,
    default: 60, // Default: 1 hour (60 minutes)
    min: [15, 'Session must be at least 15 minutes'],
    max: [240, 'Session cannot exceed 4 hours']
  },
  
  // Current status of the session
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'completed', 'canceled', 'pending', 'rescheduled'],
      message: '{VALUE} is not a valid session status'
    },
    default: 'scheduled'
  },
  
  // Optional notes about the session
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // User who canceled the session (if applicable)
  canceledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Reason for cancellation (if applicable)
  cancelReason: {
    type: String
  },
  
  // Date when the session was rescheduled (if applicable)
  rescheduledAt: {
    type: Date
  },
  
  // Original date before rescheduling (if applicable)
  previousDate: {
    type: Date
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtual properties when converting to JSON
  toObject: { virtuals: true } // Include virtual properties when converting to object
});

// Add indexes for common queries to improve performance
sessionSchema.index({ coachId: 1, date: 1 }); // For finding coach's sessions
sessionSchema.index({ clientId: 1, date: 1 }); // For finding client's sessions
sessionSchema.index({ status: 1 }); // For filtering by status

/**
 * Virtual property to calculate session end time
 * This doesn't exist in the database but is calculated on-the-fly
 */
sessionSchema.virtual('endTime').get(function() {
  if (!this.date) return null;
  
  // Create a new date object to avoid modifying the original
  let endTime = new Date(this.date);
  
  // Add duration minutes to get the end time
  endTime.setMinutes(endTime.getMinutes() + (this.duration || 60));
  
  return endTime;
});

/**
 * Check if a session is upcoming (in the future)
 */
sessionSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

/**
 * Check if a session can be canceled (is in the future and not already canceled)
 */
sessionSchema.virtual('canBeCanceled').get(function() {
  return this.isUpcoming && this.status !== 'canceled';
});

module.exports = mongoose.model('Session', sessionSchema);