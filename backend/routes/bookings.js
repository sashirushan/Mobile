const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { userId, vehicleId, receipt, startDate, endDate, totalPrice } = req.body;
    
    if (!userId || !vehicleId) {
      return res.status(400).json({ message: 'User ID and Vehicle ID are required' });
    }

    const newBooking = new Booking({
      user: userId,
      vehicle: vehicleId,
      receipt: receipt || '',
      startDate: startDate ? new Date(startDate) : Date.now(),
      endDate: endDate ? new Date(endDate) : undefined,
      totalPrice: totalPrice || 0,
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    const savedBooking = await newBooking.save();

    // Send email using Nodemailer
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && user.email) {
        const nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Samarasinghe Motors" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Booking Received",
          text: "Thank you for your booking. We will confirm it soon.",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Booking Received</h2>
              <p>Dear ${user.fullName || user.username},</p>
              <p>Thank you for your booking. We have received your payment receipt and will confirm your booking soon.</p>
              <br/>
              <p>Best regards,<br/>Samarasinghe Motors Team</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Error sending confirmation email:', emailErr);
    }

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Get user's rental history
router.get('/user/:userId', async (req, res) => {
  try {
    // Populate the vehicle details so we can display them in the history
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('vehicle')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching booking history' });
  }
});

// Get all bookings (for admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email phone fullName')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Update payment status (admin)
router.put('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['Pending', 'Accepted', 'Rejected'];
    
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = paymentStatus;
    // Optionally update booking status based on payment
    if (paymentStatus === 'Accepted') {
      booking.status = 'Confirmed';
    } else if (paymentStatus === 'Rejected') {
      booking.status = 'Cancelled';
    }
    
    await booking.save();
    
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('user', 'username email phone fullName')
      .populate('vehicle');
      
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

// Cancel booking (user)
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Send cancellation email
    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Samarasinghe Motors" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: "Booking Cancellation Notice",
      text: "Your booking has been canceled. We will contact you soon for the refund.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Booking Cancellation</h2>
          <p>Dear ${booking.user.fullName || booking.user.username},</p>
          <p>Your booking has been successfully canceled.</p>
          <p><strong>We will contact you soon for the refund.</strong></p>
          <br/>
          <p>Best regards,<br/>Samarasinghe Motors Team</p>
        </div>
      `,
    });
    
    console.log("Cancellation email sent: %s", info.messageId);

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// End booking (User or Admin)
router.put('/:id/end', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be ended' });
    }

    booking.status = 'Completed';
    await booking.save();

    res.json({ message: 'Booking completed successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error ending booking' });
  }
});

// DELETE booking (admin)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

module.exports = router;
