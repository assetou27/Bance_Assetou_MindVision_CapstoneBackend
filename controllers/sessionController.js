const Session = require('../models/Session');
const CoachAvailability = require('../models/CoachAvailability');

// ✅ Create a new session (with unavailability and conflict check)
exports.createSession = async (req, res) => {
  const { coachId, clientId, date, duration = 60, notes } = req.body;

  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + duration * 60000); // duration in ms

    // 🔒 1. Check if coach is unavailable
    const availability = await CoachAvailability.findOne({ coachId });
    if (availability) {
      const isUnavailable = availability.unavailableDates.some(
        (d) => new Date(d).toISOString().split('T')[0] === startDate.toISOString().split('T')[0]
      );

      if (isUnavailable) {
        return res.status(400).json({ message: 'Coach is unavailable on this date' });
      }
    }

    // ⛔ 2. Check if time slot is already booked
    const overlappingSession = await Session.findOne({
      coachId,
      date: {
        $lt: endDate,
        $gte: startDate
      }
    });

    if (overlappingSession) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    // ✅ 3. Create the session
    const session = await Session.create({
      coachId,
      clientId,
      date: startDate,
      duration,
      notes,
      status: 'scheduled'
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Error creating session', error: err.message });
  }
};

// 🔍 Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('coachId clientId', 'name email');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving session' });
  }
};

// 📅 Get all sessions for a coach
exports.getSessionsByCoach = async (req, res) => {
  try {
    const sessions = await Session.find({ coachId: req.params.coachId }).populate('clientId', 'name email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving coach sessions' });
  }
};

// 👤 Get all sessions for a client
exports.getSessionsByClient = async (req, res) => {
  try {
    const sessions = await Session.find({ clientId: req.params.clientId }).populate('coachId', 'name email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving client sessions' });
  }
};

// ❌ Cancel a session
exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'canceled';
    await session.save();

    res.json({ message: 'Session canceled', session });
  } catch (err) {
    res.status(500).json({ message: 'Error canceling session' });
  }
};

// 🔁 Reschedule a session
exports.rescheduleSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.date = req.body.date || session.date;
    session.status = 'scheduled'; // Reset status if previously canceled
    session.rescheduledAt = new Date();

    await session.save();
    res.json({ message: 'Session rescheduled', session });
  } catch (err) {
    res.status(500).json({ message: 'Error rescheduling session' });
  }
};
