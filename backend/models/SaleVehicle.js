const mongoose = require('mongoose');

const saleVehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true, enum: ['Car', 'Van', 'SUV'] },
  make: { type: String, required: true },
  model: { type: String, required: true },
  yearOfManufacture: { type: Number, required: true },
  condition: { type: String, required: true, enum: ['Brand New', 'Reconditioned', 'Used'] },
  mileage: { type: Number, required: true }, // in km
  price: { type: Number, required: true }, // in Rs
  registeredYear: { type: Number }, // Optional, for Used condition
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  trimEdition: { type: String },
  engineCapacity: { type: String }, // e.g. "1500cc"
  image: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'Available', enum: ['Available', 'Sold'] }
}, { timestamps: true });

module.exports = mongoose.model('SaleVehicle', saleVehicleSchema);
