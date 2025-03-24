const CoachAvailability = require('../models/CoachAvailability');

// ✅ Create or update availability for a coach
exports.setAvailability = async (req, res) => {
  const { coachId, unavailableDates, workingHours } = req.body;

  try {
    const existing = await CoachAvailability.findOne({ coachId });

    if (existing) {
      // Update existing availability
      existing.unavailableDates = unavailableDates || existing.unavailableDates;
      existing.workingHours = workingHours || existing.workingHours;
      await existing.save();
      res.json({ message: 'Availability updated', availability: existing });
    } else {
      // Create new availability
      const availability = await CoachAvailability.create({
        coachId,
        unavailableDates,
        workingHours
      });
      res.status(201).json({ message: 'Availability created', availability });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error setting availability', error: err.message });
  }
};

// ✅ Get availability for a coach
exports.getAvailability = async (req, res) => {
  try {
    const availability = await CoachAvailability.findOne({ coachId: req.params.coachId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving availability', error: err.message });
  }
};

// ✅ Remove a specific date from unavailableDates
exports.removeUnavailableDate = async (req, res) => {
  const { coachId, dateToRemove } = req.body;

  try {
    const availability = await CoachAvailability.findOne({ coachId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    availability.unavailableDates = availability.unavailableDates.filter(
      (date) => date.toISOString().split('T')[0] !== dateToRemove
    );

    await availability.save();
    res.json({ message: 'Unavailable date removed', availability });
  } catch (err) {
    res.status(500).json({ message: 'Error removing unavailable date', error: err.message });
  }
};
