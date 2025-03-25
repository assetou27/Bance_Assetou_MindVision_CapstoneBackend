// Appointment routes
const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Appointment = require('../models/Appointments');
const Service = require('../models/Service');

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, date, notes } = req.body;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    // Create new appointment
    const appointment = new Appointment({
      user: req.user.id,
      service: serviceId,
      date,
      notes
    });
    
    // Save appointment to database
    await appointment.save();
    
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/appointments
// @desc    Get all appointments for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('service', 'title duration price')
      .sort({ date: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/appointments/all
// @desc    Get all appointments (admin only)
// @access  Private/Admin
router.get('/all', [auth, admin], async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name email')
      .populate('service', 'title duration price')
      .sort({ date: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'title duration price');
    
    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to user or user is admin
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { serviceId, date, status, notes } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);
    
    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to user or user is admin
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update appointment
    if (serviceId) appointment.service = serviceId;
    if (date) appointment.date = date;
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    
    await appointment.save();
    
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to user or user is admin
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await appointment.deleteOne(); // Using deleteOne instead of remove (deprecated)
    
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;