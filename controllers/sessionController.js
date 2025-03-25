const Session = require('../models/Session');
const CoachAvailability = require('../models/CoachAvailability');

/**
 * Create a new coaching session
 * Checks coach availability and conflicts before booking
 */
exports.createSession = async (req, res) => {
  const { coachId, clientId, date, duration = 60, notes } = req.body;

  // Validate required fields
  if (!coachId || !clientId || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Coach ID, client ID, and date are required' 
    });
  }

  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + duration * 60000); // Convert to milliseconds

    // Step 1: Check if coach is unavailable on this date
    const availability = await CoachAvailability.findOne({ coachId });
    if (availability) {
      const isUnavailable = availability.unavailableDates.some(
        (d) => new Date(d).toISOString().split('T')[0] === startDate.toISOString().split('T')[0]
      );

      if (isUnavailable) {
        return res.status(400).json({ 
          success: false, 
          message: 'Coach is unavailable on this date' 
        });
      }
    }

    // Step 2: Check for overlapping sessions
    const overlappingSession = await Session.findOne({
      coachId,
      status: { $ne: 'canceled' }, // Ignore canceled sessions
      date: { $lt: endDate },
      $expr: { 
        $gte: [
          { $add: ['$date', { $multiply: ['$duration', 60000] }] }, 
          startDate
        ] 
      }
    });

    if (overlappingSession) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot conflicts with another session' 
      });
    }

    // Step 3: Create the session
    const session = await Session.create({
      coachId,
      clientId,
      date: startDate,
      duration,
      notes,
      status: 'scheduled'
    });

    // Return success with created session
    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      session
    });
  } catch (err) {
    console.error('Session creation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get a specific session by ID
 * Populates coach and client details
 */
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('coachId', 'name email')
      .populate('clientId', 'name email');
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get all sessions for a specific coach
 */
exports.getSessionsByCoach = async (req, res) => {
  try {
    const sessions = await Session.find({ 
      coachId: req.params.coachId 
    }).populate('clientId', 'name');
    
    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    console.error('Get coach sessions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving coach sessions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get all sessions for a specific client
 */
exports.getSessionsByClient = async (req, res) => {
  try {
    const sessions = await Session.find({ 
      clientId: req.params.clientId 
    }).populate('coachId', 'name');
    
    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    console.error('Get client sessions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving client sessions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Cancel an existing session
 */
exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Update session status
    session.status = 'canceled';
    session.canceledBy = req.body.canceledBy; // Optional: track who canceled
    session.cancelReason = req.body.reason; // Optional: store reason
    
    await session.save();

    res.json({ 
      success: true, 
      message: 'Session canceled successfully', 
      session 
    });
  } catch (err) {
    console.error('Cancel session error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error canceling session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Reschedule an existing session
 */
exports.rescheduleSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Store original date and update
    const previousDate = new Date(session.date);
    session.date = new Date(req.body.date) || session.date;
    session.previousDate = previousDate;
    session.status = 'scheduled'; // Reset if previously canceled
    session.rescheduledAt = new Date();

    await session.save();
    
    res.json({ 
      success: true, 
      message: 'Session rescheduled successfully', 
      session 
    });
  } catch (err) {
    console.error('Reschedule session error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error rescheduling session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};