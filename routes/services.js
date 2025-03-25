// routes/services.js - Service routes
const express = require('express');
const router = express.Router();  // This line is missing in your file
const { auth, admin } = require('../middleware/auth');
const Service = require('../models/Service');

// @route   POST api/services
// @desc    Create a new service
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { title, description, duration, price, image } = req.body;
    
    // Create new service
    const service = new Service({
      title,
      description,
      duration,
      price,
      image
    });
    
    // Save service to database
    await service.save();
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ price: 1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    // Check if service exists
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/services/:id
// @desc    Update service
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { title, description, duration, price, image } = req.body;
    
    // Build service object
    const serviceFields = {};
    if (title) serviceFields.title = title;
    if (description) serviceFields.description = description;
    if (duration) serviceFields.duration = duration;
    if (price) serviceFields.price = price;
    if (image) serviceFields.image = image;
    
    let service = await Service.findById(req.params.id);
    
    // Check if service exists
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    // Update service
    service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: serviceFields },
      { new: true }
    );
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/services/:id
// @desc    Delete service
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    // Check if service exists
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    await service.deleteOne(); // Using deleteOne instead of remove (deprecated)
    
    res.json({ msg: 'Service removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;