const CoachAvailability = require('../models/CoachAvailability');

/**
 * Set or update a coach's availability
 * POST /api/availability
 */
exports.setAvailability = async (req, res) => {
  const { coachId, unavailableDates, workingHours } = req.body;
  
  // Validate required fields
  if (!coachId) {
    return res.status(400).json({ success: false, message: 'Coach ID is required' });
  }
  
  try {
    // Check for existing availability record
    const existing = await CoachAvailability.findOne({ coachId });
    
    let result;
    if (existing) {
      // Update existing availability
      existing.unavailableDates = unavailableDates || existing.unavailableDates;
      existing.workingHours = workingHours || existing.workingHours;
      result = await existing.save();
      
      res.json({ 
        success: true,
        message: 'Availability updated', 
        availability: result 
      });
    } else {
      // Create new availability record
      result = await CoachAvailability.create({
        coachId,
        unavailableDates: unavailableDates || [],
        workingHours: workingHours || {
          start: '09:00',
          end: '17:00'
        }
      });
      
      res.status(201).json({ 
        success: true,
        message: 'Availability created', 
        availability: result 
      });
    }
  } catch (err) {
    console.error('Error setting availability:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error setting availability', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

/**
 * Get availability for a specific coach
 * GET /api/availability/:coachId
 */
exports.getAvailability = async (req, res) => {
  try {
    // Find availability by coach ID
    const availability = await CoachAvailability.findOne({ 
      coachId: req.params.coachId 
    });
    
    // Return 404 if not found
    if (!availability) {
      return res.status(404).json({ 
        success: false,
        message: 'Availability not found for this coach' 
      });
    }
    
    // Return availability data
    res.json({
      success: true,
      availability
    });
  } catch (err) {
    console.error('Error retrieving availability:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving availability', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};

/**
 * Remove a specific date from a coach's unavailable dates
 * PATCH /api/availability/remove
 */
exports.removeUnavailableDate = async (req, res) => {
  const { coachId, dateToRemove } = req.body;
  
  // Validate required fields
  if (!coachId || !dateToRemove) {
    return res.status(400).json({ 
      success: false,
      message: 'Coach ID and date to remove are required' 
    });
  }
  
  try {
    // Find availability by coach ID
    const availability = await CoachAvailability.findOne({ coachId });
    
    // Return 404 if not found
    if (!availability) {
      return res.status(404).json({ 
        success: false,
        message: 'Availability not found for this coach' 
      });
    }
    
    // Remove the specified date from unavailableDates array
    // Convert to YYYY-MM-DD format for consistent comparison
    availability.unavailableDates = availability.unavailableDates.filter(
      (date) => date.toISOString().split('T')[0] !== dateToRemove
    );
    
    // Save the updated availability
    await availability.save();
    
    // Return success with updated availability
    res.json({ 
      success: true,
      message: 'Unavailable date removed', 
      availability 
    });
  } catch (err) {
    console.error('Error removing unavailable date:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error removing unavailable date', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
  }
};