const mongoose = require('mongoose');

const rentVehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true, enum: ['Car', 'Van', 'SUV'] },
  make: { type: String, required: true },
  model: { type: String, required: true },
  yearOfManufacture: { type: Number, required: true },
  fuelType: { type: String, required: true },
  fuelConsumption: { type: Number, required: true }, // in km/l
  seats: { type: Number, required: true },
  pricePerDay: { type: Number, required: true }, // in Rs
  transmission: { type: String, required: true },
  dailyMileageLimit: { type: Number, default: 100 }, // Default 100km
  extraKmCharge: { type: Number, default: 50 }, // Default Rs 50/km
  image: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'Available', enum: ['Available', 'Booked', 'Maintenance'] },
  averageRating: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('RentVehicle', rentVehicleSchema);
