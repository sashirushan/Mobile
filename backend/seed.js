require('dotenv').config();
const mongoose = require('mongoose');
const SaleVehicle = require('./models/SaleVehicle');
const RentVehicle = require('./models/RentVehicle');
const User = require('./models/User');

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sashirushan_db_user:Ru3n0PLqFdoMLxOi@xuizmhs.mongodb.net/SamarasingheMotors?retryWrites=true&w=majority&appName=SASH';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error in seed.js:', err.message));

const saleVehicles = [
  {
    vehicleType: 'Car',
    make: 'Toyota',
    model: 'Premio',
    yearOfManufacture: 2018,
    condition: 'Used',
    mileage: 45000,
    price: 18500000,
    registeredYear: 2019,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80',
    description: 'Excellent condition Toyota Premio. Very well maintained.'
  },
  {
    vehicleType: 'Car',
    make: 'Honda',
    model: 'Vezel',
    yearOfManufacture: 2021,
    condition: 'Reconditioned',
    mileage: 15000,
    price: 15000000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    description: 'Honda Vezel hybrid with sporty look and advanced features.'
  },
  {
    vehicleType: 'SUV',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    yearOfManufacture: 2023,
    condition: 'Brand New',
    mileage: 100,
    price: 85000000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    description: 'Brand new Land Cruiser Prado TXL. Fully loaded.'
  },
  {
    vehicleType: 'Van',
    make: 'Toyota',
    model: 'Hiace',
    yearOfManufacture: 2015,
    condition: 'Used',
    mileage: 120000,
    price: 12500000,
    registeredYear: 2015,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: 'Reliable Toyota Hiace KDH passenger van.'
  }
];

const rentVehicles = [
  {
    vehicleType: 'Car',
    make: 'Toyota',
    model: 'Corolla Axio',
    yearOfManufacture: 2022,
    fuelType: 'Petrol',
    fuelConsumption: 16,
    seats: 5,
    pricePerDay: 8000,
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    description: 'Comfortable and economical daily driver.'
  },
  {
    vehicleType: 'SUV',
    make: 'Nissan',
    model: 'X-Trail',
    yearOfManufacture: 2021,
    fuelType: 'Hybrid',
    fuelConsumption: 14,
    seats: 7,
    pricePerDay: 15000,
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    description: 'Spacious 7-seater SUV, perfect for family trips.'
  },
  {
    vehicleType: 'Van',
    make: 'Toyota',
    model: 'KDH',
    yearOfManufacture: 2018,
    fuelType: 'Diesel',
    fuelConsumption: 10,
    seats: 12,
    pricePerDay: 12000,
    transmission: 'Manual',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: '12 seater passenger van for group travels.'
  }
];

async function seedDB() {
  try {
    await SaleVehicle.deleteMany({});
    await RentVehicle.deleteMany({});
    
    await SaleVehicle.insertMany(saleVehicles);
    await RentVehicle.insertMany(rentVehicles);
    
    // Create admin user if not exists
    await User.deleteOne({ username: 'admin' });
    const adminUser = new User({
      username: 'admin',
      password: 'admin',
      fullName: 'System Administrator',
      email: 'admin@samarasinghemotors.com',
      role: 'admin'
    });
    await adminUser.save();
    
    console.log('Database seeded successfully with admin user');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDB();
