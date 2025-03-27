// routes/appointments.js
// Appointment routes

const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Appointment = require('../models/Appointments');

// Example: If you don't need "Service", remove references to it
// const Service = require('../models/Service'); // <-- Removed if not needed

// @route   POST api/appointments
// @desc    Create a new appointment (Private)
router.post('/', auth, async (req, res) => {
  try {
    // FRONTEND currently sends: { date, time, description }
    // Let's unify them here
    const { date, time, description } = req.body;

    // If you *must* require a service, then you'd do:
    // const { serviceId } = req.body;
    // const service = await Service.findById(serviceId);
    // if (!service) return res.status(404).json({ msg: 'Service not found' });

    // Combine the date & time into one Date object
    // Example: date="2025-04-29", time="11:30"
    // => "2025-04-29T11:30:00"
    const combinedDateTime = new Date(`${date}T${time}:00`);

    // Create new appointment (omitting 'service' if you don't need it)
    const appointment = new Appointment({
      user: req.user.id,
      date: combinedDateTime,
      notes: description, // rename 'description' -> 'notes' in DB
    });

    await appointment.save();
    return res.json(appointment);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// @route   GET api/appointments
// @desc    Get all appointments for the current user (Private)
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      // .populate('service') if you had a service field
      .sort({ date: 1 });
    return res.json(appointments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// ... other routes (GET by ID, PUT, DELETE) ...
module.exports = router;
