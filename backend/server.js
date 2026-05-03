require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const saleVehiclesRoutes = require('./routes/saleVehicles');
const rentVehiclesRoutes = require('./routes/rentVehicles');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const bookingsRoutes = require('./routes/bookings');
const inquiriesRoutes = require('./routes/inquiries');
const promotionsRoutes = require('./routes/promotions');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', saleVehiclesRoutes);
app.use('/api/rentals', rentVehiclesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/promotions', promotionsRoutes);

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sashirushan_db_user:Ru3n0PLqFdoMLxOi@xuizmhs.mongodb.net/SamarasingheMotors?retryWrites=true&w=majority&appName=SASH';

// Optional: MongoDB Connection
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error (App will still run for UI testing):', err.message));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
