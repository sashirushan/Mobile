const express = require('express');
const router = express.Router();
const SaleVehicle = require('../models/SaleVehicle');

// GET all sale vehicles with filtering and search
router.get('/', async (req, res) => {
  try {
    const { search, vehicleType, make, condition, transmission, maxMileage, minPrice, maxPrice, yearOfManufacture } = req.query;
    
    // Build filter object
    let filter = {};
    
    // General search matching make or model
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Exact match filters
    if (vehicleType) filter.vehicleType = vehicleType;
    if (make) filter.make = make;
    if (condition) filter.condition = condition;
    if (transmission) filter.transmission = transmission;
    if (yearOfManufacture) filter.yearOfManufacture = Number(yearOfManufacture);
    
    // Range filters
    if (maxMileage) {
      filter.mileage = { $lte: Number(maxMileage) };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const vehicles = await SaleVehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sale vehicles' });
  }
});

// GET a single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await SaleVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching vehicle' });
  }
});

// POST a new sale vehicle
router.post('/', async (req, res) => {
  try {
    const newVehicle = new SaleVehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error adding sale vehicle' });
  }
});

// PUT (update) a sale vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await SaleVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(updatedVehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating sale vehicle' });
  }
});

// DELETE a sale vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deletedVehicle = await SaleVehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting sale vehicle' });
  }
});

module.exports = router;
