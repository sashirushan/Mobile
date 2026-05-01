const express = require('express');
const router = express.Router();
const RentVehicle = require('../models/RentVehicle');
const Booking = require('../models/Booking');

// GET all rent vehicles with filtering and search
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      vehicleType, 
      make, 
      yearOfManufacture, 
      transmission,
      fuelType, 
      minFuelConsumption, 
      maxFuelConsumption,
      minSeats,
      maxSeats,
      minPrice, 
      maxPrice 
    } = req.query;
    
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
    if (yearOfManufacture) filter.yearOfManufacture = Number(yearOfManufacture);
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    
    // Range filters
    if (minFuelConsumption || maxFuelConsumption) {
      filter.fuelConsumption = {};
      if (minFuelConsumption) filter.fuelConsumption.$gte = Number(minFuelConsumption);
      if (maxFuelConsumption) filter.fuelConsumption.$lte = Number(maxFuelConsumption);
    }

    if (minSeats || maxSeats) {
      filter.seats = {};
      if (minSeats) filter.seats.$gte = Number(minSeats);
      if (maxSeats) filter.seats.$lte = Number(maxSeats);
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    
    const vehicles = await RentVehicle.find(filter).sort({ createdAt: -1 });
    
    // Dynamically update status based on active bookings (Pending or Confirmed)
    const activeBookings = await Booking.find({
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const bookedVehicleIds = activeBookings.map(b => b.vehicle.toString());
    
    const vehiclesWithDynamicStatus = vehicles.map(v => {
      let vehicleObj = v.toObject();
      if (bookedVehicleIds.includes(vehicleObj._id.toString())) {
        vehicleObj.status = 'Booked';
      }
      return vehicleObj;
    });

    res.json(vehiclesWithDynamicStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching rent vehicles' });
  }
});

// GET a single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await RentVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    let vehicleObj = vehicle.toObject();
    
    // Dynamically update status if there's an active booking
    const activeBooking = await Booking.findOne({
      vehicle: vehicle._id,
      status: { $in: ['Pending', 'Confirmed'] }
    });
    
    if (activeBooking && vehicleObj.status !== 'Maintenance') {
      vehicleObj.status = 'Booked';
    }

    res.json(vehicleObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching vehicle' });
  }
});

// PUT change vehicle status manually (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Available', 'Booked', 'Maintenance'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const vehicle = await RentVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.status = status;
    const updatedVehicle = await vehicle.save();
    
    res.json(updatedVehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// POST a new rent vehicle
router.post('/', async (req, res) => {
  try {
    const newVehicle = new RentVehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error adding rent vehicle' });
  }
});

// PUT (update) a rent vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await RentVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(updatedVehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating rent vehicle' });
  }
});

// DELETE a rent vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deletedVehicle = await RentVehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting rent vehicle' });
  }
});

// POST a review for a rent vehicle
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userId, username, rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const vehicle = await RentVehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Add new review
    const review = {
      userId,
      username: username || 'Anonymous User',
      rating: Number(rating),
      feedback,
      date: new Date()
    };
    
    vehicle.reviews.push(review);

    // Recalculate average rating
    const totalRatings = vehicle.reviews.reduce((acc, item) => acc + item.rating, 0);
    vehicle.averageRating = totalRatings / vehicle.reviews.length;

    await vehicle.save();
    
    res.status(201).json({ message: 'Review added successfully', vehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// DELETE a review
router.delete('/:vehicleId/reviews/:reviewId', async (req, res) => {
  try {
    const vehicle = await RentVehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Filter out the review to delete
    vehicle.reviews = vehicle.reviews.filter(review => review._id.toString() !== req.params.reviewId);

    // Recalculate average rating
    if (vehicle.reviews.length > 0) {
      const totalRatings = vehicle.reviews.reduce((acc, item) => acc + item.rating, 0);
      vehicle.averageRating = totalRatings / vehicle.reviews.length;
    } else {
      vehicle.averageRating = 0;
    }

    await vehicle.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
