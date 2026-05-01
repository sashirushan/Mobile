const express = require('express');
const router = express.Router();
const SaleVehicle = require('../models/SaleVehicle');
const RentVehicle = require('../models/RentVehicle');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');
const Promotion = require('../models/Promotion');
const { generateWeeklyReport } = require('../utils/reportGenerator');

router.get('/stats', async (req, res) => {
  try {
    // Basic stats
    const saleCount = await SaleVehicle.countDocuments();
    const rentCount = await RentVehicle.countDocuments();
    const totalVehicles = saleCount + rentCount;
    const userCount = await User.countDocuments();
    
    // Detailed Stats
    const activeRentalsCount = await Booking.countDocuments({ status: 'Confirmed' });
    const allBookings = await Booking.find({ paymentStatus: 'Accepted' });
    const totalIncome = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    // Promotions Stats
    const totalPromotions = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({ isActive: true });

    // Revenue Data for Chart (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const revenueByDay = await Booking.aggregate([
      { $match: { paymentStatus: 'Accepted', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill in missing days with 0 for the chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = revenueByDay.find(r => r._id === dateStr);
      chartData.push({
        date: dateStr,
        amount: dayData ? dayData.amount : 0
      });
    }

    // Recent Activity (combine recent vehicles and users)
    const recentSaleVehicles = await SaleVehicle.find().sort({ createdAt: -1 }).limit(3);
    const recentRentVehicles = await RentVehicle.find().sort({ createdAt: -1 }).limit(3);
    const recentUsers = await User.find().sort({ _id: -1 }).limit(3); // _id has timestamp if createdAt isn't set

    let activity = [];

    recentSaleVehicles.forEach(v => {
      activity.push({
        id: v._id,
        action: `New Sale Vehicle Added (${v.make} ${v.model})`,
        user: 'Admin',
        date: v.createdAt || new Date(),
        status: 'Completed',
        type: 'vehicle_sale'
      });
    });

    recentRentVehicles.forEach(v => {
      activity.push({
        id: v._id,
        action: `New Rent Vehicle Added (${v.make} ${v.model})`,
        user: 'Admin',
        date: v.createdAt || new Date(),
        status: 'Completed',
        type: 'vehicle_rent'
      });
    });

    recentUsers.forEach(u => {
      activity.push({
        id: u._id,
        action: 'New User Registration',
        user: u.username,
        date: u._id.getTimestamp(),
        status: 'Completed',
        type: 'user'
      });
    });

    // Sort by date descending and limit to 5
    activity.sort((a, b) => b.date - a.date);
    activity = activity.slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalVehicles,
        saleVehicles: saleCount,
        rentVehicles: rentCount,
        activeRentals: activeRentalsCount,
        registeredUsers: userCount,
        totalIncome,
        totalPromotions,
        activePromotions,
        revenueData: chartData
      },
      recentActivity: activity
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all reviews across all vehicles
router.get('/reviews', async (req, res) => {
  try {
    const vehiclesWithReviews = await RentVehicle.find({ 'reviews.0': { $exists: true } });
    
    let allReviews = [];
    vehiclesWithReviews.forEach(vehicle => {
      vehicle.reviews.forEach(review => {
        allReviews.push({
          ...review.toObject(),
          vehicleId: vehicle._id,
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          vehicleImage: vehicle.image
        });
      });
    });

    // Sort by newest first
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(allReviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// GET Weekly Report PDF (Specialized)
router.get('/report/weekly/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let reportData = {
      startDate: oneWeekAgo.toLocaleDateString(),
      endDate: new Date().toLocaleDateString()
    };

    if (type === 'overview') {
      const newSales = await SaleVehicle.find({ createdAt: { $gte: oneWeekAgo } });
      const newRentals = await RentVehicle.find({ createdAt: { $gte: oneWeekAgo } });
      const newUsers = await User.find({ createdAt: { $gte: oneWeekAgo } });
      const newBookings = await Booking.find({ createdAt: { $gte: oneWeekAgo } }).populate('vehicle user');
      const newInquiries = await Inquiry.find({ createdAt: { $gte: oneWeekAgo } });

      reportData.summary = {
        newVehicles: newSales.length + newRentals.length,
        newUsers: newUsers.length,
        newBookings: newBookings.length,
        newInquiries: newInquiries.length,
        totalRevenue: newBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
      };
      reportData.vehicles = [
        ...newSales.map(v => ({ type: 'Sale', name: `${v.make} ${v.model}`, price: `Rs. ${v.price.toLocaleString()}`, date: v.createdAt.toLocaleDateString() })),
        ...newRentals.map(v => ({ type: 'Rent', name: `${v.make} ${v.model}`, price: `Rs. ${v.pricePerDay.toLocaleString()}/day`, date: v.createdAt.toLocaleDateString() }))
      ];
      reportData.bookings = newBookings.map(b => ({
        id: b._id.toString().substring(b._id.toString().length - 6),
        vehicle: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : 'N/A',
        user: b.user ? b.user.username : 'N/A',
        amount: `Rs. ${b.totalPrice?.toLocaleString() || 0}`
      }));

    } else if (type === 'sales') {
      const sales = await SaleVehicle.find({ createdAt: { $gte: oneWeekAgo } });
      reportData.items = sales.map(v => ({
        make: v.make,
        model: v.model,
        year: v.yearOfManufacture,
        condition: v.condition,
        price: `Rs. ${v.price.toLocaleString()}`,
        mileage: `${v.mileage?.toLocaleString() || 0} km`
      }));

    } else if (type === 'rentals') {
      const rentals = await RentVehicle.find({ createdAt: { $gte: oneWeekAgo } });
      reportData.items = rentals.map(v => ({
        make: v.make,
        model: v.model,
        type: v.vehicleType,
        seats: v.seats,
        price: `Rs. ${v.pricePerDay.toLocaleString()}`,
        status: v.status
      }));

    } else if (type === 'users') {
      const users = await User.find({ createdAt: { $gte: oneWeekAgo } });
      reportData.items = users.map(u => ({
        username: u.username,
        fullName: u.fullName || 'N/A',
        email: u.email,
        role: u.role
      }));

    } else if (type === 'inquiries') {
      const inquiries = await Inquiry.find({ createdAt: { $gte: oneWeekAgo } }).populate('vehicleId');
      reportData.items = inquiries.map(i => ({
        name: i.name,
        contact: `${i.email} / ${i.phone}`,
        vehicle: i.vehicleId ? `${i.vehicleId.make} ${i.vehicleId.model}` : 'Deleted Vehicle',
        message: i.message.substring(0, 50) + '...'
      }));

    } else if (type === 'reviews') {
      const vehicles = await RentVehicle.find({ 'reviews.date': { $gte: oneWeekAgo } });
      reportData.items = [];
      vehicles.forEach(v => {
        v.reviews.forEach(r => {
          if (r.date >= oneWeekAgo) {
            reportData.items.push({
              vehicle: `${v.make} ${v.model}`,
              user: r.username,
              rating: r.rating,
              feedback: r.feedback
            });
          }
        });
      });

    } else if (type === 'payments') {
      const bookings = await Booking.find({ createdAt: { $gte: oneWeekAgo } }).populate('vehicle user');
      reportData.totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      reportData.items = bookings.map(b => ({
        id: b._id.toString().substring(b._id.toString().length - 6),
        vehicle: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : 'N/A',
        user: b.user ? b.user.username : 'N/A',
        start: b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A',
        amount: `Rs. ${b.totalPrice?.toLocaleString() || 0}`,
        status: b.status
      }));

    } else if (type === 'promotions') {
      const promos = await Promotion.find({ createdAt: { $gte: oneWeekAgo } });
      const activePromos = await Promotion.find({ isActive: true });
      // Combine new promos and currently active ones for the report
      const allPromos = [...new Map([...promos, ...activePromos].map(item => [item['_id'].toString(), item])).values()];
      reportData.items = allPromos.map(p => ({
        title: p.title,
        type: p.type,
        discount: `${p.discountPercentage}%`,
        code: p.promoCode || 'N/A',
        status: p.isActive ? 'Active' : 'Inactive'
      }));
    }

    generateWeeklyReport(reportData, res, type);

  } catch (error) {
    console.error(`Error generating ${req.params.type} report:`, error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

module.exports = router;
